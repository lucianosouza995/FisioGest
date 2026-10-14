import React, { useState } from 'react';
import { Plus, Users, Calendar, Receipt, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Button } from '../ui/Button.tsx';
import { useData } from '../../contexts/DataContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getTodayDateISO } from '../../utils/formatters.ts';
import type { Patient, Appointment, Invoice } from '../../services/collections.ts';

type ModalType = 'none' | 'menu' | 'patient' | 'appointment' | 'invoice';

export const GlobalActions: React.FC = () => {
    const { userProfile } = useAuth();
    const { patients, addPatient, addAppointment, addInvoice } = useData();

    const [activeModal, setActiveModal] = useState<ModalType>('none');
    const [preSelectedPatientId, setPreSelectedPatientId] = useState<string>('');

    // Estados do Formulário de Paciente
    const [patName, setPatName] = useState('');
    const [patPhone, setPatPhone] = useState('');
    const [patCondition, setPatCondition] = useState('');
    const [patSessions, setPatSessions] = useState(10);
    const [patPrice, setPatPrice] = useState(150);

    // Estados do Formulário de Agenda
    const [aptPatientId, setAptPatientId] = useState('');
    const [aptDate, setAptDate] = useState(getTodayDateISO());
    const [aptTime, setAptTime] = useState('08:00');
    const [aptType, setAptType] = useState('Fisioterapia Ortopédica');

    // Estados do Formulário de Fatura
    const [invPatientId, setInvPatientId] = useState('');
    const [invSessions, setInvSessions] = useState(5);
    const [invAmount, setInvAmount] = useState(750);
    const [invDueDate, setInvDueDate] = useState(getTodayDateISO());

    const resetForms = () => {
        setPatName(''); setPatPhone(''); setPatCondition('');
        setAptPatientId(''); setPreSelectedPatientId('');
        setInvPatientId('');
        setActiveModal('none');
    };

    const handlePatientSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `pat_${Date.now()}`;

        const newPatient: Patient = {
            id: newId,
            name: patName,
            phone: patPhone || '11999999999',
            condition: patCondition || 'Fisioterapia Geral',
            totalSessions: patSessions,
            completedSessions: 0,
            sessionPrice: patPrice,
            paymentStatus: 'em_dia',
            createdAt: getTodayDateISO()
        };

        addPatient(newPatient);

        // CORREÇÃO 1: Cria automaticamente a cobrança total do pacote para o Faturamento
        const valorTotalPacote = patSessions * patPrice;

        const newInv: Invoice = {
            id: `inv_${Date.now()}`,
            patientId: newId,
            patientName: patName,
            patientPhone: patPhone || '11999999999',
            sessionsCount: patSessions,
            amount: valorTotalPacote, // Valor multiplicado corretamente
            pixKey: userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br',
            status: 'pendente',
            dueDate: getTodayDateISO(),
            createdAt: getTodayDateISO()
        };

        addInvoice(newInv);

        // Fluxo Contínuo: Pergunta se quer agendar agora
        if (window.confirm('Paciente registado com sucesso! Deseja agendar a primeira sessão agora?')) {
            setPreSelectedPatientId(newId);
            setAptPatientId(newId);
            setActiveModal('appointment');
        } else {
            resetForms();
        }
    };

    const handleAppointmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const targetPatientId = preSelectedPatientId || aptPatientId;
        const patient = patients.find(p => p.id === targetPatientId);
        if (!patient) return alert('Selecione um paciente!');

        const newApt: Appointment = {
            id: `apt_${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            patientPhone: patient.phone,
            time: aptTime,
            date: aptDate,
            type: aptType,
            status: 'agendado',
            sessionNumber: patient.completedSessions + 1,
            totalSessions: patient.totalSessions,
        };

        addAppointment(newApt);
        resetForms();
    };

    const handleInvoiceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const patient = patients.find(p => p.id === invPatientId);
        if (!patient) return alert('Selecione um paciente!');

        const newInv: Invoice = {
            id: `inv_${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            patientPhone: patient.phone,
            sessionsCount: invSessions,
            amount: invAmount,
            pixKey: userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br',
            status: 'pendente',
            dueDate: invDueDate,
            createdAt: getTodayDateISO()
        };

        addInvoice(newInv);
        resetForms();
    };

    return (
        <>
            {/* Botão Flutuante (FAB) */}
            <button
                onClick={() => setActiveModal('menu')}
                className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/40 flex items-center justify-center hover:bg-teal-700 active:scale-95 transition-all z-40"
                aria-label="Nova Ação"
            >
                <Plus size={28} className="stroke-[2.5px]" />
            </button>

            {/* Modal 1: Menu Rápido */}
            <Modal isOpen={activeModal === 'menu'} onClose={resetForms} title="Ação Rápida">
                <div className="space-y-3">
                    <button onClick={() => setActiveModal('patient')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-left">
                        <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Novo Paciente</p>
                            <p className="text-xs text-slate-500">Registar na base de dados</p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-slate-400" />
                    </button>

                    <button onClick={() => setActiveModal('appointment')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-left">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Agendar Sessão</p>
                            <p className="text-xs text-slate-500">Marcar horário para paciente</p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-slate-400" />
                    </button>

                    <button onClick={() => setActiveModal('invoice')} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-left">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Lançar Cobrança</p>
                            <p className="text-xs text-slate-500">Gerar fatura PIX pendente</p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-slate-400" />
                    </button>
                </div>
            </Modal>

            {/* Modal 2: Novo Paciente */}
            <Modal isOpen={activeModal === 'patient'} onClose={resetForms} title="Novo Paciente">
                <form onSubmit={handlePatientSubmit} className="space-y-4">
                    <Input label="Nome" value={patName} onChange={(e) => setPatName(e.target.value)} required />
                    <Input label="Telefone" value={patPhone} onChange={(e) => setPatPhone(e.target.value)} required />
                    <Input label="Queixa/Diagnóstico" value={patCondition} onChange={(e) => setPatCondition(e.target.value)} required />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Sessões (Pacote)" type="number" value={patSessions} onChange={(e) => setPatSessions(Number(e.target.value))} min={1} required />
                        <Input label="Valor/Sessão" type="number" value={patPrice} onChange={(e) => setPatPrice(Number(e.target.value))} required />
                    </div>
                    <Button type="submit" fullWidth>Salvar e Continuar</Button>
                </form>
            </Modal>

            {/* Modal 3: Agendar Sessão */}
            <Modal isOpen={activeModal === 'appointment'} onClose={resetForms} title="Agendar Sessão">
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                    <div className="w-full">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">Selecionar Paciente</label>
                        <select
                            value={preSelectedPatientId || aptPatientId}
                            onChange={(e) => setAptPatientId(e.target.value)}
                            disabled={!!preSelectedPatientId}
                            className="w-full min-h-[46px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-teal-600 disabled:bg-slate-50"
                            required
                        >
                            <option value="">Selecione...</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Data" type="date" value={aptDate} onChange={(e) => setAptDate(e.target.value)} required />
                        <Input label="Hora" type="time" value={aptTime} onChange={(e) => setAptTime(e.target.value)} required />
                    </div>
                    <Button type="submit" fullWidth>Confirmar Agendamento</Button>
                </form>
            </Modal>

            {/* Modal 4: Lançar Cobrança */}
            <Modal isOpen={activeModal === 'invoice'} onClose={resetForms} title="Lançar Cobrança">
                <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                    <div className="w-full">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">Selecionar Paciente</label>
                        <select
                            value={invPatientId}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                setInvPatientId(selectedId);
                                const p = patients.find(pt => pt.id === selectedId);
                                if (p) {
                                    setInvAmount(p.sessionPrice * invSessions);
                                }
                            }}
                            className="w-full min-h-[46px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-teal-600"
                            required
                        >
                            <option value="">Selecione...</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Qtd Sessões"
                            type="number"
                            value={invSessions}
                            onChange={(e) => {
                                const qtd = Number(e.target.value);
                                setInvSessions(qtd);

                                // CORREÇÃO 2: Atualiza o valor dinamicamente ao digitar a Qtd de Sessões
                                const p = patients.find(pt => pt.id === invPatientId);
                                if (p) {
                                    setInvAmount(p.sessionPrice * qtd);
                                }
                            }}
                            min={1}
                            required
                        />
                        <Input
                            label="Valor Total (R\$)"
                            type="number"
                            value={invAmount}
                            onChange={(e) => setInvAmount(Number(e.target.value))}
                            required
                        />
                    </div>
                    <Input label="Data de Vencimento" type="date" value={invDueDate} onChange={(e) => setInvDueDate(e.target.value)} required />
                    <Button type="submit" fullWidth>Gerar Fatura Pendente</Button>
                </form>
            </Modal>
        </>
    );
};