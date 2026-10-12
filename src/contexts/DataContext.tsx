import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.tsx';
import { onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase.ts';
import {
    COLLECTIONS,
    getTenantCollectionRef,
    getTenantDocumentRef,
    type Patient,
    type Appointment,
    type Invoice
} from '../services/collections.ts';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_INVOICES } from '../services/mockStore.ts';

interface DataContextType {
    patients: Patient[];
    appointments: Appointment[];
    invoices: Invoice[];
    addPatient: (patient: Patient) => Promise<void>;
    addAppointment: (appointment: Appointment) => Promise<void>;
    addInvoice: (invoice: Invoice) => Promise<void>;
    updateAppointmentStatus: (id: string, status: Appointment['status'], sessionNumber: number) => Promise<void>;
    updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { tenantId, isFirebaseActive } = useAuth();

    const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
    const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
    const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

    // Escuta ativa (Real-time) do Firebase Firestore
    useEffect(() => {
        if (!isFirebaseActive || !tenantId || !db) {
            // Se o Firebase não estiver ativo, carrega os dados de teste (Mock)
            setPatients(INITIAL_PATIENTS);
            setAppointments(INITIAL_APPOINTMENTS);
            setInvoices(INITIAL_INVOICES);
            return;
        }

        const patientsRef = getTenantCollectionRef(tenantId, COLLECTIONS.PATIENTS);
        const appointmentsRef = getTenantCollectionRef(tenantId, COLLECTIONS.APPOINTMENTS);
        const invoicesRef = getTenantCollectionRef(tenantId, COLLECTIONS.INVOICES);

        if (!patientsRef || !appointmentsRef || !invoicesRef) return;

        // Escuta Pacientes
        const unsubPatients = onSnapshot(patientsRef, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as Patient);
            setPatients(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        });

        // Escuta Agendamentos
        const unsubAppointments = onSnapshot(appointmentsRef, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as Appointment);
            setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
        });

        // Escuta Faturas
        const unsubInvoices = onSnapshot(invoicesRef, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as Invoice);
            setInvoices(data.sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
        });

        // Limpa os listeners quando o componente é desmontado ou o tenantId muda
        return () => {
            unsubPatients();
            unsubAppointments();
            unsubInvoices();
        };
    }, [tenantId, isFirebaseActive]);

    const addPatient = async (patient: Patient) => {
        if (isFirebaseActive && tenantId) {
            const docRef = getTenantDocumentRef(tenantId, COLLECTIONS.PATIENTS, patient.id);
            if (docRef) await setDoc(docRef, patient);
        } else {
            setPatients(prev => [patient, ...prev]);
        }
    };

    const addAppointment = async (appointment: Appointment) => {
        if (isFirebaseActive && tenantId) {
            const docRef = getTenantDocumentRef(tenantId, COLLECTIONS.APPOINTMENTS, appointment.id);
            if (docRef) await setDoc(docRef, appointment);
        } else {
            setAppointments(prev => [...prev, appointment]);
        }
    };

    const addInvoice = async (invoice: Invoice) => {
        if (isFirebaseActive && tenantId) {
            const docRef = getTenantDocumentRef(tenantId, COLLECTIONS.INVOICES, invoice.id);
            if (docRef) await setDoc(docRef, invoice);
        } else {
            setInvoices(prev => [invoice, ...prev]);
        }
    };

    const updateAppointmentStatus = async (id: string, status: Appointment['status'], sessionNumber: number) => {
        if (isFirebaseActive && tenantId) {
            const docRef = getTenantDocumentRef(tenantId, COLLECTIONS.APPOINTMENTS, id);
            if (docRef) await updateDoc(docRef, { status, sessionNumber });
        } else {
            setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status, sessionNumber } : apt));
        }
    };

    const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
        const paidAtDate = status === 'pago' ? new Date().toISOString().split('T')[0] : null;

        if (isFirebaseActive && tenantId) {
            const docRef = getTenantDocumentRef(tenantId, COLLECTIONS.INVOICES, id);
            if (docRef) await updateDoc(docRef, { status, paidAt: paidAtDate });
        } else {
            setInvoices(prev => prev.map(inv => inv.id === id ? {
                ...inv,
                status,
                paidAt: paidAtDate || undefined
            } : inv));
        }
    };

    return (
        <DataContext.Provider value={{
            patients, appointments, invoices,
            addPatient, addAppointment, addInvoice,
            updateAppointmentStatus, updateInvoiceStatus
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData deve ser usado dentro de um DataProvider');
    return context;
};