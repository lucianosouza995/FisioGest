import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useData } from '../../contexts/DataContext.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { formatCurrency, formatPhone } from '../../utils/formatters.ts';
import { gerarLinkCobrancaWhatsApp } from '../../utils/whatsappGenerator.ts';

export const Dashboard: React.FC = () => {
  const { userProfile, role } = useAuth();

  // A MÁGICA ACONTECE AQUI: Puxando os dados reais do estado global!
  const { appointments, invoices } = useData();

  const [quickCobrançaModal, setQuickCobrançaModal] = useState(false);

  // Form para disparo de WhatsApp avulso
  const [pacienteNome, setPacienteNome] = useState('');
  const [pacienteTelefone, setPacienteTelefone] = useState('');
  const [sessoesQtd, setSessoesQtd] = useState(5);
  const [valorSessoes, setValorSessoes] = useState(750);

  // Cálculos financeiros (agora com os dados reais)
  const totalRecebido = invoices
    .filter(i => i.status === 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPendente = invoices
    .filter(i => i.status === 'pendente' || i.status === 'atrasado')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Estatísticas de hoje
  const sessoesHoje = appointments.length;
  const concluidasHoje = appointments.filter(a => a.status === 'realizado').length;
  const taxaPresenca = sessoesHoje > 0 ? Math.round((concluidasHoje / sessoesHoje) * 100) : 0;

  const handleOpenWhatsAppCobrança = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteTelefone || !pacienteNome) return;
    const url = gerarLinkCobrancaWhatsApp(
      pacienteTelefone,
      pacienteNome,
      sessoesQtd,
      valorSessoes,
      userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br'
    );
    window.open(url, '_blank');
    setQuickCobrançaModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Boas-vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-teal-700 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-200 text-xs font-semibold mb-1.5">
            <span>● Hoje</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Olá, {userProfile?.name?.split(' ')[0]}!
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-0.5">
            Você tem <strong>{sessoesHoje} atendimentos</strong> programados para hoje.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setQuickCobrançaModal(true)}
            icon={<MessageCircle size={16} className="text-emerald-600" />}
            className="bg-white hover:bg-teal-50 text-teal-950 font-bold w-full sm:w-auto"
          >
            Cobrança WhatsApp
          </Button>
          <Link to="/agenda"> {/* Corrigido de /app/agenda para /agenda */}
            <Button
              variant="outline"
              size="sm"
              className="bg-teal-800/60 border-teal-500/40 text-white hover:bg-teal-800 w-full sm:w-auto"
            >
              Ver Agenda
            </Button>
          </Link>
        </div>
      </div>

      {/* Resumo Financeiro (Visível para Admin e adaptado para Secretária) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">
            Resumo Financeiro do Mês
          </h2>
          {role === 'admin' ? (
            <Link to="/faturamento" className="text-xs text-teal-600 font-bold hover:underline flex items-center"> {/* Corrigido de /app/faturamento para /faturamento */}
              Detalhes <ChevronRight size={14} />
            </Link>
          ) : (
            <span className="text-[11px] text-slate-400">Modo Secretária</span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Recebido</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-800">
              {formatCurrency(totalRecebido)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Sessões pagas</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">A Receber</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-amber-600">
              {formatCurrency(totalPendente)}
            </p>
            <p className="text-[11px] text-amber-700/80 font-medium mt-0.5">Cobranças abertas</p>
          </Card>

          <Card className="p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Taxa de Presença</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-teal-700">
              {taxaPresenca}%
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {concluidasHoje} de {sessoesHoje} realizadas
            </p>
          </Card>
        </div>
      </section>

      {/* Sessões do Dia (Mobile First Touch Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Atendimentos de Hoje</h2>
            <p className="text-xs text-slate-500">Toque para ver a agenda completa</p>
          </div>
          <Link to="/agenda"> {/* Corrigido de /app/agenda para /agenda */}
            <Button variant="ghost" size="sm" className="text-teal-700 font-bold">
              Abrir Agenda <ChevronRight size={14} />
            </Button>
          </Link>
        </div>

        <div className="space-y-2.5">
          {appointments.map((apt) => (
            <Card key={apt.id} className="p-3.5 sm:p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex flex-col items-center justify-center shrink-0 border border-teal-100 font-bold">
                    <span className="text-xs leading-none">{apt.time}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{apt.patientName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{apt.type}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Sessão {apt.sessionNumber}/{apt.totalSessions}</span>
                      <span>•</span>
                      <span>{formatPhone(apt.patientPhone)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <Badge variant={apt.status} size="sm" />
                  {apt.sessionNumber === apt.totalSessions && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      Fim de Ciclo
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Modal de Disparo Rápido de WhatsApp */}
      <Modal
        isOpen={quickCobrançaModal}
        onClose={() => setQuickCobrançaModal(false)}
        title="Disparar Cobrança no WhatsApp"
      >
        <form onSubmit={handleOpenWhatsAppCobrança} className="space-y-4">
          <p className="text-xs text-slate-600">
            Gera automaticamente o link oficial do WhatsApp com a mensagem cordial de cobrança e sua chave PIX configurada.
          </p>

          <Input
            label="Nome do Paciente"
            value={pacienteNome}
            onChange={(e) => setPacienteNome(e.target.value)}
            placeholder="Ex: Camila Rodrigues"
            required
          />

          <Input
            label="WhatsApp (com DDD)"
            value={pacienteTelefone}
            onChange={(e) => setPacienteTelefone(e.target.value)}
            placeholder="Ex: 11987654321"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Qtd. de Sessões"
              type="number"
              value={sessoesQtd}
              onChange={(e) => setSessoesQtd(Number(e.target.value))}
              min={1}
              required
            />
            <Input
              label="Valor Total (R$)"
              type="number"
              value={valorSessoes}
              onChange={(e) => setValorSessoes(Number(e.target.value))}
              step={10}
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Chave PIX a ser enviada:</span>
            <p className="text-teal-700 font-mono mt-0.5">{userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br'}</p>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            variant="success"
            icon={<MessageCircle size={18} />}
          >
            Abrir Mensagem no WhatsApp
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard; 