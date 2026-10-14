import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDateBR } from './formatters.ts';
import { BillingSummary } from '../services/reportService.ts';

export const exportReportPDF = (summaryData: BillingSummary[], periodTitle: string) => {
  // SUGESTÃO DE DEBUG: Imprime os dados recebidos no console do navegador
  console.log("Debug PDF - Dados recebidos para exportação:", summaryData);

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Relatório de Faturamento - ${periodTitle}`, 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

  const tableColumn = ["Paciente", "Sessões", "Datas", "Valor Devido"];
  const tableRows: any[][] = [];

  // Se summaryData estiver vazio, este loop não executa, resultando na tabela vazia
  summaryData.forEach(summary => {
    // É importante garantir também que sessionDates seja um array válido para não dar erro no .map
    const datesFormatted = (summary.sessionDates || [])
      .map(date => formatDateBR(date))
      .join(', ');

    const rowData = [
      summary.patientName || "N/A",
      summary.totalSessions ? summary.totalSessions.toString() : "0",
      datesFormatted,
      formatCurrency(summary.totalAmount || 0),
    ];
    tableRows.push(rowData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [13, 148, 136] }, // Tailwind teal-600 approx
  });

  const fileName = `relatorio_fisiogest_${periodTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};