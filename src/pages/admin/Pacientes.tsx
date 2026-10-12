import React, { useState } from 'react';
import {
  Users,
  Search,
  MessageCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge, type BadgeVariant } from '../../components/ui/Badge.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { formatPhone, formatCurrency } from '../../utils/formatters.ts';
import { gerarLinkCobrancaWhatsApp } from '../../utils/whatsappGenerator.ts';
import type { Patient } from '../../services/collections.ts';
import { useData } from '../../contexts/DataContext.tsx';

export const Pacientes: React.FC = () => {
  const { userProfile } = useAuth();
  const { patients } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Cobrança WhatsApp
  const [selectedPatientForBilling, setSelectedPatientForBilling] = useState<Patient | null>(null);
  const [billingSessions, setBillingSessions] = useState(1);
  const [billingAmount, setBillingAmount] = useState(150);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenBilling = (patient: Patient) => {
    setSelectedPatientForBilling(patient);
    const unbilledSessions = Math.max(1, patient.completedSessions);
    setBillingSessions(unbilledSessions);
    setBillingAmount(unbilledSessions * patient.sessionPrice);
  };

  const handleSendWhatsAppBilling = () => {
    if (!selectedPatientForBilling) return;
    const url = gerarLinkCobrancaWhatsApp(
      selectedPatientForBilling.phone,
      selectedPatientForBilling.name,
      billingSessions,
      billingAmount,
      userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br'
    );
    window.open(url, '_blank');
    setSelectedPatientForBilling(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users size={20} className="text-teal-600" />
              Gestão de Pacientes
            </h1>
            <p className="text-xs text-slate-500">
              Controle de prontuários, pacotes e cobranças PIX
            </p>
          </div>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar paciente por nome ou lesão/diagnóstico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
      </div>

      {/* Patient Cards List */}
      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">Nenhum paciente encontrado com essa busca.</p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const progress = Math.round((patient.completedSessions / patient.totalSessions) * 100);

            const badgeMap: Record<Patient['paymentStatus'], BadgeVariant> = {
              em_dia: 'pago',
              pendente: 'pendente',
              atrasado: 'atrasado',
            };

            return (
              <Card key={patient.id} className="hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{patient.name}</h3>
                      <Badge variant={badgeMap[patient.paymentStatus]} size="sm">
                        {patient.paymentStatus === 'em_dia' ? 'Em dia' : patient.paymentStatus === 'pendente' ? 'Pendente' : 'Em atraso'}
                      </Badge>
                    </div>

                    <p className="text-xs text-teal-800 font-semibold">{patient.condition}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>{formatPhone(patient.phone)}</span>
                      <span>•</span>
                      <span>Sessão: {formatCurrency(patient.sessionPrice)}</span>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {patient.completedSessions}/{patient.totalSessions} sessões
                      </span>
                    </div>
                  </div>

                  {/* Actions (Touch >= 44px) */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleOpenBilling(patient)}
                      icon={<MessageCircle size={16} />}
                      className="flex-1 sm:flex-initial"
                    >
                      Cobrar WhatsApp
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Cobrança WhatsApp para o Paciente */}
      <Modal
        isOpen={Boolean(selectedPatientForBilling)}
        onClose={() => setSelectedPatientForBilling(null)}
        title={`Cobrar ${selectedPatientForBilling?.name}`}
      >
        {selectedPatientForBilling && (
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-teal-900">Prévia do Atendimento</p>
              <p className="text-teal-800">
                {selectedPatientForBilling.condition} • {selectedPatientForBilling.completedSessions} de {selectedPatientForBilling.totalSessions} realizadas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantidade de Sessões"
                type="number"
                min={1}
                value={billingSessions}
                onChange={(e) => {
                  const qtd = Number(e.target.value);
                  setBillingSessions(qtd);
                  setBillingAmount(qtd * selectedPatientForBilling.sessionPrice);
                }}
              />
              <Input
                label="Valor Total (R$)"
                type="number"
                value={billingAmount}
                onChange={(e) => setBillingAmount(Number(e.target.value))}
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="font-bold text-slate-700">Chave PIX inserida no texto:</span>
              <p className="text-teal-700 font-mono mt-0.5">{userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br'}</p>
            </div>

            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={handleSendWhatsAppBilling}
              icon={<MessageCircle size={18} />}
            >
              Abrir WhatsApp com Cobrança Pronta
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Pacientes;