import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CheckCircle2,
  MessageCircle,
  Key,
  FileDown
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { formatCurrency, formatPhone, formatDateBR } from '../../utils/formatters.ts';
import { gerarLinkCobrancaWhatsApp } from '../../utils/whatsappGenerator.ts';
import { useData } from '../../contexts/DataContext.tsx';
import type { Invoice } from '../../services/collections.ts';
import { fetchBillingReport, BillingSummary } from '../../services/reportService.ts';
import { exportReportPDF } from '../../utils/pdfGenerator.ts';
import { startOfWeek, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

export const Faturamento: React.FC = () => {
  // 1. O hook useAuth fica AQUI NO TOPO, fora do useEffect
  const { userProfile, tenantId } = useAuth();
  const { invoices, updateInvoiceStatus, patients } = useData();
  const [filter, setFilter] = useState<'todos' | 'pendente' | 'pago' | 'atrasado'>('todos');
  const [period, setPeriod] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [summaries, setSummaries] = useState<BillingSummary[]>([]);

  // 2. O useEffect reage às mudanças do tenantId e do period
  useEffect(() => {
    // Trava de segurança: Se o usuário ainda não logou ou não tem tenantId, não faz nada.
    if (!tenantId) return;

    const loadReport = async () => {
      try {
        console.log("🔎 Buscando dados reais da clínica:", tenantId, "| Período:", period);

        // Passa o tenantId dinâmico do usuário logado
        const summaryData = await fetchBillingReport(tenantId, period);
        setSummaries(summaryData);

      } catch (error) {
        console.error("🚨 ERRO AO BUSCAR NO FIREBASE:", error);
      }
    };

    loadReport();
  }, [tenantId, period]);

  const getPeriodDates = () => {
    const now = new Date();
    let start: Date;
    let end: Date = now;
    if (period === 'weekly') {
      start = startOfWeek(now, { weekStartsOn: 1 });
    } else if (period === 'biweekly') {
      start = subDays(now, 14);
    } else {
      start = startOfMonth(now);
      end = endOfMonth(now);
    }
    return { startStr: format(start, 'yyyy-MM-dd'), endStr: format(end, 'yyyy-MM-dd') };
  };

  const { startStr, endStr } = getPeriodDates();

  const periodInvoices = invoices.filter(inv => inv.dueDate >= startStr && inv.dueDate <= endStr);

  const filteredInvoices = periodInvoices.filter((inv) => {
    if (filter === 'todos') return true;
    return inv.status === filter;
  });

  const totalPago = periodInvoices
    .filter((i) => i.status === 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalAberto = periodInvoices
    .filter((i) => i.status !== 'pago')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleTogglePaymentStatus = (id: string, currentStatus: Invoice['status']) => {
    const isNowPaid = currentStatus !== 'pago';
    updateInvoiceStatus(id, isNowPaid ? 'pago' : 'pendente');
  };

  const handleSendReportWhatsApp = (patientSummary: BillingSummary, pixKey: string) => {
    const datesStr = patientSummary.sessionDates.map(d => formatDateBR(d)).join(', ');
    const message = `Olá ${patientSummary.patientName}! 👋\n\n` +
      `Aqui está o resumo dos seus atendimentos no período:\n` +
      `*Total de sessões:* ${patientSummary.totalSessions}\n` +
      `*Datas:* ${datesStr}\n\n` +
      `*Valor Total:* ${formatCurrency(patientSummary.totalAmount)}\n\n` +
      `A chave PIX para pagamento é:\n*${pixKey}*\n\n` +
      `Qualquer dúvida, estou à disposição!`;

    const encodedMessage = encodeURIComponent(message);
    let phone = patientSummary.patientPhone.replace(/\D/g, '');
    if (phone.length === 10 || phone.length === 11) {
      phone = `55${phone}`;
    }
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const handleSendWhatsApp = (inv: Invoice) => {
    const summary = summaries.find(s => s.patientId === inv.patientId);
    const pixKey = userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br';

    if (summary && summary.totalSessions > 0) {
      handleSendReportWhatsApp(summary, pixKey);
    } else {
      const url = gerarLinkCobrancaWhatsApp(
        inv.patientPhone,
        inv.patientName,
        inv.sessionsCount,
        inv.amount,
        pixKey
      );
      window.open(url, '_blank');
    }
  };

  // 3. NOVA FUNÇÃO DE EXPORTAÇÃO ASSÍNCRONA
  // NOVA FUNÇÃO DE EXPORTAÇÃO (Síncrona e baseada no filtro da tela)
  const handleExportPDF = () => {
    if (filteredInvoices.length === 0) {
      alert("Não há dados para exportar neste filtro.");
      return;
    }

    // 1. Agrupa as faturas que estão aparecendo na tela por paciente
    const summaryMap = new Map<string, BillingSummary>();

    filteredInvoices.forEach(inv => {
      if (!summaryMap.has(inv.patientId)) {
        summaryMap.set(inv.patientId, {
          patientId: inv.patientId,
          patientName: inv.patientName,
          patientPhone: inv.patientPhone,
          totalSessions: 0,
          totalAmount: 0,
          sessionDates: []
        });
      }

      const summary = summaryMap.get(inv.patientId)!;
      // Soma as sessões e os valores baseados apenas no filtro atual da tela
      summary.totalSessions += inv.sessionsCount;
      summary.totalAmount += inv.amount;

      // Adiciona as datas para aparecerem no PDF (evitando duplicatas)
      if (inv.dueDate && !summary.sessionDates.includes(inv.dueDate)) {
        summary.sessionDates.push(inv.dueDate);
      }
    });

    const dadosParaPDF = Array.from(summaryMap.values());

    // 2. Monta o título do PDF indicando o Filtro selecionado
    const periodTitles = {
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal'
    };

    let tituloFiltro = "";
    if (filter === 'pago') tituloFiltro = " - Recebidos";
    else if (filter === 'pendente') tituloFiltro = " - A Receber";
    else if (filter === 'atrasado') tituloFiltro = " - Em Atraso";

    const tituloFinal = `${periodTitles[period]}${tituloFiltro}`;

    // 3. Envia os dados perfeitamente agregados para o gerador
    exportReportPDF(dadosParaPDF, tituloFinal);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt size={20} className="text-teal-600" />
              Faturamento & Cobranças PIX
            </h1>
            <p className="text-xs text-slate-500">
              Controle de recebimentos e lembretes amigáveis via WhatsApp
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            icon={<FileDown size={16} className="text-teal-600" />}
            className="hidden sm:flex border-teal-200 hover:bg-teal-50 text-teal-700"
          >
            Exportar PDF
          </Button>
        </div>

        {/* Chave PIX Card Indicator */}
        <div className="flex items-center justify-between p-3 bg-teal-50/70 border border-teal-200/70 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-teal-700 shrink-0" />
            <div>
              <span className="font-bold text-teal-900">Sua Chave PIX Ativa: </span>
              <span className="font-mono text-teal-800">{userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br'}</span>
            </div>
          </div>
          <span className="text-[10px] text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
            Injetada no WhatsApp
          </span>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500">Total Recebido (Período)</p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
            {formatCurrency(totalPago)}
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500">A Receber / Pendente</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">
            {formatCurrency(totalAberto)}
          </p>
        </Card>
      </div>

      {/* Período Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-2">
        <span className="text-xs font-bold text-slate-500 mr-2">Período:</span>
        <button
          onClick={() => setPeriod('weekly')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === 'weekly' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Semanal
        </button>
        <button
          onClick={() => setPeriod('biweekly')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === 'biweekly' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Quinzenal
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === 'monthly' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Mensal
        </button>
      </div>

      {/* Filtros em Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['todos', 'pendente', 'atrasado', 'pago'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all capitalize select-none cursor-pointer ${filter === tab
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {tab === 'todos' ? 'Todos' : tab === 'pendente' ? 'Pendentes' : tab === 'atrasado' ? 'Em Atraso' : 'Pagos'}
          </button>
        ))}
      </div>

      {/* Lista de Faturas */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Nenhuma cobrança encontrada neste filtro ou período.</p>
            <p className="text-xs text-slate-400 mt-2">Utilize o botão flutuante para lançar cobranças.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'pago';

            return (
              <Card key={inv.id} className="hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{inv.patientName}</h3>
                      <Badge variant={inv.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{inv.sessionsCount} sessões</span>
                      <span>•</span>
                      <span>{formatPhone(inv.patientPhone)}</span>
                      <span>•</span>
                      <span>Vencimento: {formatDateBR(inv.dueDate)}</span>
                    </div>

                    <p className="text-lg font-extrabold text-slate-800 pt-1">
                      {formatCurrency(inv.amount)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {!isPaid && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleSendWhatsApp(inv)}
                        icon={<MessageCircle size={16} />}
                        className="flex-1 sm:flex-initial"
                      >
                        Cobrar WhatsApp
                      </Button>
                    )}

                    <Button
                      variant={isPaid ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleTogglePaymentStatus(inv.id, inv.status)}
                      icon={isPaid ? <CheckCircle2 size={16} className="text-emerald-600" /> : undefined}
                      className="flex-1 sm:flex-initial"
                    >
                      {isPaid ? 'Pago' : 'Marcar Pago'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="sm:hidden flex justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          icon={<FileDown size={16} className="text-teal-600" />}
          className="w-full border-teal-200 hover:bg-teal-50 text-teal-700"
        >
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};

export default Faturamento;