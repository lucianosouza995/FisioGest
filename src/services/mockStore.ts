import { Patient, Appointment, Invoice } from './collections.ts';
import { getTodayDateISO } from '../utils/formatters.ts';

const today = getTodayDateISO();

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat_1',
    name: 'Camila Rodrigues',
    phone: '11987654321',
    condition: 'Reabilitação de Joelho (Pós-LCA)',
    totalSessions: 10,
    completedSessions: 8,
    sessionPrice: 150,
    paymentStatus: 'pendente',
    observations: 'Foco em fortalecimento de quadríceps e ganho de ADM.',
    createdAt: '2026-09-15',
  },
  {
    id: 'pat_2',
    name: 'Carlos Eduardo Mendes',
    phone: '11971234567',
    condition: 'Lombalgia Crônica & Hérnia Discal',
    totalSessions: 12,
    completedSessions: 12,
    sessionPrice: 160,
    paymentStatus: 'atrasado',
    observations: 'Pilates clínico + terapia manual.',
    createdAt: '2026-08-20',
  },
  {
    id: 'pat_3',
    name: 'Beatriz Almeida Costa',
    phone: '21998877665',
    condition: 'Fisioterapia Respiratória',
    totalSessions: 8,
    completedSessions: 5,
    sessionPrice: 180,
    paymentStatus: 'em_dia',
    observations: 'Excelente evolução em capacidade pulmonar.',
    createdAt: '2026-09-28',
  },
  {
    id: 'pat_4',
    name: 'Marcos Vinicius Santos',
    phone: '11993456789',
    condition: 'Tendinite Patelar / Esporte',
    totalSessions: 6,
    completedSessions: 2,
    sessionPrice: 140,
    paymentStatus: 'em_dia',
    observations: 'Crioterapia + liberação miofascial.',
    createdAt: '2026-10-01',
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    patientId: 'pat_1',
    patientName: 'Camila Rodrigues',
    patientPhone: '11987654321',
    time: '08:30',
    date: today,
    type: 'Reabilitação Joelho (LCA)',
    status: 'realizado',
    sessionNumber: 8,
    totalSessions: 10,
    notes: 'Exercícios proprioceptivos sem dor relatada.'
  },
  {
    id: 'apt_2',
    patientId: 'pat_2',
    patientName: 'Carlos Eduardo Mendes',
    patientPhone: '11971234567',
    time: '10:00',
    date: today,
    type: 'Lombalgia & RPG',
    status: 'agendado',
    sessionNumber: 12,
    totalSessions: 12,
    notes: 'Avaliar alta do ciclo de 12 sessões.'
  },
  {
    id: 'apt_3',
    patientId: 'pat_3',
    patientName: 'Beatriz Almeida Costa',
    patientPhone: '21998877665',
    time: '14:00',
    date: today,
    type: 'Fisioterapia Respiratória',
    status: 'agendado',
    sessionNumber: 6,
    totalSessions: 8,
    notes: 'Manobras de higiene brônquica.'
  },
  {
    id: 'apt_4',
    patientId: 'pat_4',
    patientName: 'Marcos Vinicius Santos',
    patientPhone: '11993456789',
    time: '16:30',
    date: today,
    type: 'Tendinite Patelar',
    status: 'agendado',
    sessionNumber: 3,
    totalSessions: 6,
    notes: 'Treino excêntrico.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    patientId: 'pat_1',
    patientName: 'Camila Rodrigues',
    patientPhone: '11987654321',
    sessionsCount: 5,
    amount: 750,
    pixKey: 'lucas.fisio@fisiogest.com.br',
    status: 'pendente',
    dueDate: '2026-10-08',
    createdAt: '2026-10-01'
  },
  {
    id: 'inv_2',
    patientId: 'pat_2',
    patientName: 'Carlos Eduardo Mendes',
    patientPhone: '11971234567',
    sessionsCount: 12,
    amount: 1920,
    pixKey: 'lucas.fisio@fisiogest.com.br',
    status: 'atrasado',
    dueDate: '2026-09-30',
    createdAt: '2026-09-20'
  },
  {
    id: 'inv_3',
    patientId: 'pat_3',
    patientName: 'Beatriz Almeida Costa',
    patientPhone: '21998877665',
    sessionsCount: 4,
    amount: 720,
    pixKey: 'lucas.fisio@fisiogest.com.br',
    status: 'pago',
    dueDate: '2026-10-02',
    createdAt: '2026-09-25',
    paidAt: '2026-10-02'
  }
];
