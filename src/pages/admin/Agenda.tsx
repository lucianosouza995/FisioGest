import React, { useState } from 'react';
import {
  Check,
  X,
  Calendar as CalendarIcon,
  Clock,
  MessageCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { getTodayDateISO } from '../../utils/formatters.ts';
import { useData } from '../../contexts/DataContext.tsx';

export const Agenda: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(getTodayDateISO());
  const { appointments, updateAppointmentStatus } = useData();

  const handleMarkStatus = (id: string, newStatus: 'realizado' | 'faltou' | 'agendado') => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    const isDone = newStatus === 'realizado';
    const updatedSessionNumber = isDone && apt.status !== 'realizado'
      ? Math.min(apt.sessionNumber + 1, apt.totalSessions)
      : apt.sessionNumber;

    updateAppointmentStatus(id, newStatus, updatedSessionNumber);
  };

  const openPatientWhatsApp = (phone: string, name: string, time: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Olá, ${name}! Confirmando o seu atendimento de Fisioterapia hoje às ${time}. Qualquer imprevisto avise-me, por favor! Até logo.`
    );
    window.open(`https://wa.me/${phoneWithDDI}?text=${msg}`, '_blank');
  };

  const concluidosHoje = appointments.filter(a => a.status === 'realizado').length;
  const faltasHoje = appointments.filter(a => a.status === 'faltou').length;

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

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700">Data:</span>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-teal-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {concluidosHoje} realizados
            </span>
            {faltasHoje > 0 && (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                {faltasHoje} faltas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Atendimentos do Dia */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
            <CalendarIcon size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">Nenhum atendimento agendado para hoje.</p>
            <p className="text-xs text-slate-400 mt-2">Utilize o botão flutuante para agendar.</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const isDone = apt.status === 'realizado';
            const isMissed = apt.status === 'faltou';
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
                {/* Paciente Info */}
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

                      {/* Sessão Progress Bar */}
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

                {/* Touch-Friendly Action Buttons (Touch targets >= 44px) */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Botão Realizado */}
                  <button
                    type="button"
                    onClick={() => handleMarkStatus(apt.id, isDone ? 'agendado' : 'realizado')}
                    className={`flex-1 min-h-[46px] px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer ${isDone
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    aria-label="Marcar como Realizado"
                  >
                    <Check size={18} className="stroke-[3px]" />
                    <span>{isDone ? 'Concluído' : 'Realizado'}</span>
                  </button>

                  {/* Botão Faltou */}
                  <button
                    type="button"
                    onClick={() => handleMarkStatus(apt.id, isMissed ? 'agendado' : 'faltou')}
                    className={`flex-1 min-h-[46px] px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-97 cursor-pointer ${isMissed
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                      }`}
                    aria-label="Marcar como Faltou"
                  >
                    <X size={18} className="stroke-[3px]" />
                    <span>{isMissed ? 'Falta Registrada' : 'Faltou'}</span>
                  </button>

                  {/* Botão WhatsApp Rápido */}
                  <button
                    type="button"
                    onClick={() => openPatientWhatsApp(apt.patientPhone, apt.patientName, apt.time)}
                    className="min-h-[46px] min-w-[46px] px-3 rounded-xl border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                    title="Avisar paciente no WhatsApp"
                    aria-label="Enviar mensagem no WhatsApp"
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
    </div>
  );
};

export default Agenda;