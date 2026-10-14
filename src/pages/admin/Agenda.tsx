import React, { useState } from 'react';
import {
  Check,
  X,
  Calendar as CalendarIcon,
  Clock,
  MessageCircle,
  Undo2
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { getTodayDateISO } from '../../utils/formatters.ts';
import { useData } from '../../contexts/DataContext.tsx';
import type { Appointment } from '../../services/collections.ts';

export const Agenda: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(getTodayDateISO());
  const [statusFilter, setStatusFilter] = useState<'todos' | 'realizado' | 'faltou'>('todos');
  const { appointments, updateAppointmentStatus, addAppointment } = useData();

  // Estados para o Modal de Próxima Sessão
  const [nextSessionModal, setNextSessionModal] = useState<{ isOpen: boolean; apt: Appointment | null }>({ isOpen: false, apt: null });
  const [nextDate, setNextDate] = useState(getTodayDateISO());
  const [nextTime, setNextTime] = useState('');

  // 1. Filtra os agendamentos pela DATA selecionada
  const appointmentsForDate = appointments.filter(apt => apt.date === currentDate);

  // 2. Calcula as estatísticas baseado APENAS na data selecionada
  const concluidosHoje = appointmentsForDate.filter(a => a.status === 'realizado').length;
  const faltasHoje = appointmentsForDate.filter(a => a.status === 'faltou').length;

  // 3. Aplica o filtro de STATUS (se houver algum ativo clicando nas badges)
  const displayAppointments = appointmentsForDate.filter(apt => {
    if (statusFilter === 'todos') return true;
    return apt.status === statusFilter;
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(e.target.value);
    setStatusFilter('todos'); // Reseta o filtro de status ao mudar de dia
  };

  const handleToggleFilter = (filterStatus: 'realizado' | 'faltou') => {
    setStatusFilter(prev => prev === filterStatus ? 'todos' : filterStatus);
  };

  const handleMarkStatus = async (id: string, newStatus: 'realizado' | 'faltou' | 'agendado') => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    await updateAppointmentStatus(id, newStatus, apt.sessionNumber);

    if ((newStatus === 'realizado' || newStatus === 'faltou') && apt.sessionNumber < apt.totalSessions) {
      setNextSessionModal({ isOpen: true, apt });
      setNextTime(apt.time);
    }
  };

  const handleScheduleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextSessionModal.apt) return;

    const prevApt = nextSessionModal.apt;
    const nextSessionNum = prevApt.sessionNumber + 1;

    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: prevApt.patientId,
      patientName: prevApt.patientName,
      patientPhone: prevApt.patientPhone,
      time: nextTime,
      date: nextDate,
      type: prevApt.type,
      status: 'agendado',
      sessionNumber: nextSessionNum,
      totalSessions: prevApt.totalSessions,
    };

    await addAppointment(newApt);

    setNextSessionModal({ isOpen: false, apt: null });
    setNextTime('');
  };

  const openPatientWhatsApp = (phone: string, name: string, time: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Olá, ${name}! Confirmando o seu atendimento de Fisioterapia hoje às ${time}. Qualquer imprevisto avise-me, por favor! Até logo.`
    );
    window.open(`https://wa.me/${phoneWithDDI}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Date Navigation */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon size={20} className="text-teal-600" />
              Agenda de Atendimentos
            </h1>
            <p className="text-xs text-slate-500">
              Gerencie a presença com toques rápidos no smartphone
            </p>
          </div>
        </div>

        {/* Date Selector & Filters */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700">Data:</span>
            <input
              type="date"
              value={currentDate}
              onChange={handleDateChange}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-teal-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {concluidosHoje > 0 && (
              <button
                onClick={() => handleToggleFilter('realizado')}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all cursor-pointer ${statusFilter === 'realizado'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'
                  }`}
              >
                {concluidosHoje} {concluidosHoje === 1 ? 'realizado' : 'realizados'}
              </button>
            )}
            {faltasHoje > 0 && (
              <button
                onClick={() => handleToggleFilter('faltou')}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all cursor-pointer ${statusFilter === 'faltou'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'text-rose-700 bg-rose-50 border-rose-100 hover:bg-rose-100'
                  }`}
              >
                {faltasHoje} {faltasHoje === 1 ? 'falta' : 'faltas'}
              </button>
            )}
            {statusFilter !== 'todos' && (
              <button
                onClick={() => setStatusFilter('todos')}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline ml-1"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      <div className="space-y-3">
        {appointmentsForDate.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
            <CalendarIcon size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Nenhum atendimento para esta data.</p>
            <p className="text-xs text-slate-400 mt-2">Utilize o botão flutuante para agendar.</p>
          </div>
        ) : displayAppointments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
            <p className="text-sm font-semibold text-slate-600">Nenhum atendimento com o status "{statusFilter}".</p>
          </div>
        ) : (
          displayAppointments.map((apt) => {
            const isDone = apt.status === 'realizado';
            const isMissed = apt.status === 'faltou';
            const isScheduled = apt.status === 'agendado';
            const progressPercent = Math.round((apt.sessionNumber / apt.totalSessions) * 100);

            return (
              <Card
                key={apt.id}
                className={`transition-all duration-150 ${isDone
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isMissed
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'hover:border-slate-300'
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex flex-col items-center justify-center shrink-0 font-bold">
                      <Clock size={14} className="text-teal-600 mb-0.5" />
                      <span className="text-xs leading-none">{apt.time}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {apt.patientName}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{apt.type}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600">
                          Sessão {apt.sessionNumber} de {apt.totalSessions}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Badge variant={apt.status} size="md" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {isScheduled ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(apt.id, 'realizado')}
                        className="flex-1 min-h-[46px] px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      >
                        <Check size={18} className="stroke-[3px]" />
                        <span>Realizado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkStatus(apt.id, 'faltou')}
                        className="flex-1 min-h-[46px] px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                      >
                        <X size={18} className="stroke-[3px]" />
                        <span>Faltou</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkStatus(apt.id, 'agendado')}
                      className="flex-1 min-h-[46px] px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    >
                      <Undo2 size={16} />
                      <span>Desfazer {isDone ? 'Conclusão' : 'Falta'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openPatientWhatsApp(apt.patientPhone, apt.patientName, apt.time)}
                    className="min-h-[46px] min-w-[46px] px-3 rounded-xl border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                    title="Avisar paciente no WhatsApp"
                  >
                    <MessageCircle size={18} className="text-emerald-600" />
                    <span className="hidden sm:inline">Lembrar</span>
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Agendamento Contínuo */}
      <Modal
        isOpen={nextSessionModal.isOpen}
        onClose={() => setNextSessionModal({ isOpen: false, apt: null })}
        title="Agendar Próxima Sessão"
      >
        {nextSessionModal.apt && (
          <form onSubmit={handleScheduleNext} className="space-y-4">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-teal-900">Paciente: {nextSessionModal.apt.patientName}</p>
              <p className="text-teal-800">
                Sessão atual concluída. Vamos agendar a sessão {nextSessionModal.apt.sessionNumber + 1} de {nextSessionModal.apt.totalSessions}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Data"
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                required
              />
              <Input
                label="Hora"
                type="time"
                value={nextTime}
                onChange={(e) => setNextTime(e.target.value)}
                required
              />
            </div>

            <Button type="submit" fullWidth variant="success">
              Confirmar Agendamento
            </Button>

            <Button
              type="button"
              fullWidth
              variant="outline"
              onClick={() => setNextSessionModal({ isOpen: false, apt: null })}
            >
              Agendar depois
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Agenda;