import { startOfWeek, subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import { query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from './firebase.ts';
import { COLLECTIONS, getTenantCollectionRef, getTenantDocumentRef, Appointment } from './collections.ts';

export interface BillingSummary {
  patientId: string;
  patientName: string;
  patientPhone: string;
  totalSessions: number;
  totalAmount: number;
  sessionDates: string[];
}

export const fetchBillingReport = async (
  tenantId: string,
  period: 'weekly' | 'biweekly' | 'monthly'
): Promise<BillingSummary[]> => {
  if (!db) return [];

  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (period) {
    case 'weekly': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
    case 'biweekly': startDate = subDays(now, 14); break;
    case 'monthly': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
  }

  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  // 1. Busca os atendimentos realizados
  const appointmentsRef = getTenantCollectionRef(tenantId, COLLECTIONS.APPOINTMENTS);
  if (!appointmentsRef) return [];

  const q = query(
    appointmentsRef,
    where('status', '==', 'realizado'),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr)
  );

  const querySnapshot = await getDocs(q);
  const sessions = querySnapshot.docs.map(doc => doc.data() as Appointment);

  // 2. Agrupa e procura o preço da sessão de cada paciente diretamente no Firestore
  const summaryMap: Record<string, BillingSummary> = {};

  for (const session of sessions) {
    if (!summaryMap[session.patientId]) {
      let sessionPrice = 0;

      // Busca o documento do paciente no Firebase para garantir que temos o preço correto
      const patientRef = getTenantDocumentRef(tenantId, COLLECTIONS.PATIENTS, session.patientId);
      if (patientRef) {
        const pSnap = await getDoc(patientRef);
        if (pSnap.exists() && pSnap.data().sessionPrice) {
          sessionPrice = pSnap.data().sessionPrice;
        }
      }

      summaryMap[session.patientId] = {
        patientId: session.patientId,
        patientName: session.patientName,
        patientPhone: session.patientPhone,
        totalSessions: 0,
        totalAmount: 0,
        sessionDates: [],
      };
      // Guarda o preço temporariamente para o cálculo
      (summaryMap[session.patientId] as any)._price = sessionPrice;
    }

    const summary = summaryMap[session.patientId];
    summary.totalSessions += 1;
    summary.totalAmount += (summary as any)._price;
    summary.sessionDates.push(session.date);
  }

  // 3. Devolve os dados limpos e formatados para o PDF
  return Object.values(summaryMap).map(summary => {
    delete (summary as any)._price;
    summary.sessionDates.sort();
    return summary;
  });
};