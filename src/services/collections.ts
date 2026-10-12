import { db } from './firebase.ts';
import { collection, doc } from 'firebase/firestore';

export const COLLECTIONS = {
  USERS: 'users',
  CLINICS: 'clinics',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  INVOICES: 'invoices',
} as const;

// Tipagens do Multi-tenant
export interface Clinic {
  id: string; // tenantId
  name: string;
  pixKey: string;
  plan: 'free' | 'pro';
  active: boolean;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  tenantId: string; // O elo de ligação do usuário com a clínica
  name: string;
  email: string;
  role: 'admin' | 'secretary';
  phone?: string;
  pixKey?: string;     // <-- Adicione esta linha
  clinicName?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  condition: string;
  totalSessions: number;
  completedSessions: number;
  sessionPrice: number;
  paymentStatus: 'em_dia' | 'pendente' | 'atrasado';
  observations?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  time: string;
  date: string;
  type: string;
  status: 'agendado' | 'realizado' | 'faltou' | 'cancelado';
  sessionNumber: number;
  totalSessions: number;
  notes?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  sessionsCount: number;
  amount: number;
  pixKey: string;
  status: 'pendente' | 'pago' | 'atrasado';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

// Helpers dinâmicos baseados no Tenant (Inquilino)
export const getTenantCollectionRef = (tenantId: string, collectionName: string) => {
  if (!db) return null;
  // Caminho: clinics/{tenantId}/{collectionName}
  return collection(db, COLLECTIONS.CLINICS, tenantId, collectionName);
};

export const getTenantDocumentRef = (tenantId: string, collectionName: string, docId: string) => {
  if (!db) return null;
  // Caminho: clinics/{tenantId}/{collectionName}/{docId}
  return doc(db, COLLECTIONS.CLINICS, tenantId, collectionName, docId);
};