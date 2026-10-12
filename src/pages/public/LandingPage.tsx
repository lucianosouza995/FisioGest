import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Zap, 
  Phone, 
  Star,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 pt-safe">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
              <Activity size={22} className="stroke-[2.5px]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">FisioGest</span>
              <span className="block text-[10px] text-teal-700 font-semibold tracking-wide">
                GESTÃO & COBRANÇA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Área do Fisioterapeuta
              </Button>
              <Button variant="primary" size="sm" className="sm:hidden">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            Mini SaaS Mobile-First para Fisioterapia
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Gerencie atendimentos e cobre sessões com{' '}
            <span className="text-teal-600 bg-linear-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              1 toque no WhatsApp
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Feito sob medida para o fisioterapeuta autônomo e clínicas. Controle presença, evolução de pacotes e envie cobranças amigáveis com chave PIX sem intermediários.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link to="/login" className="w-full">
              <Button size="lg" fullWidth icon={<ArrowRight size={18} />}>
                Acessar Painel / Demonstração
              </Button>
            </Link>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%21%20Gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o%20de%20fisioterapia."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="secondary" size="lg" fullWidth icon={<MessageCircle size={18} className="text-emerald-600" />}>
                Falar com a Clínica
              </Button>
            </a>
          </div>

          {/* Micro badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-teal-600" /> Sem taxas por cobrança
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-teal-600" /> App nativo PWA no celular
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-teal-600" /> Acesso Fisioterapeuta & Secretária
            </span>
          </div>
        </div>
      </section>

      {/* Mobile App Highlight Card */}
      <section className="px-4 pb-12 max-w-3xl mx-auto">
        <div className="bg-linear-to-b from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400">
                Experiência no Smartphone
              </span>
              <h2 className="text-2xl font-bold">Direto da maca ou do consultório</h2>
              <p className="text-slate-300 text-sm max-w-md">
                Marque &quot;Realizado&quot; ou &quot;Faltou&quot; com um toque. Ao fechar o pacote de 10 sessões, gere o link de PIX no WhatsApp do paciente na hora.
              </p>
            </div>
            <Link to="/app" className="shrink-0 w-full sm:w-auto">
              <Button variant="primary" size="md" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
                Ver Sistema Aberto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Serviços Clínicos & Funcionalidades */}
      <section className="py-12 bg-white border-y border-slate-200/80 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Tudo o que sua rotina precisa
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Desenvolvido ouvindo fisioterapeutas de ortopedia, neuro, respiratória e pilates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Agenda Inteligente</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Visualização clara das consultas do dia. Status imediato de presença e contagem progressiva do pacote de sessões.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <MessageCircle size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Cobrança Zero-Cost</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Mensagens pré-formatadas para o WhatsApp com resumo de atendimentos, valor total e sua chave PIX com 1 clique.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Controle de Acesso (RBAC)</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Perfis dedicados: Fisioterapeuta (Acesso total clínico e financeiro) e Secretária (Recepção e agendamento).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato Direto Footer */}
      <footer className="mt-auto bg-slate-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Activity className="text-teal-400" size={20} />
              <span className="font-bold text-lg">FisioGest</span>
            </div>
            <p className="text-xs text-slate-400">
              Sistema de Gestão & Faturamento para Fisioterapeutas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs min-h-[44px]"
            >
              <Phone size={16} /> Suporte no WhatsApp
            </a>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs min-h-[44px]"
            >
              Acesso ao Sistema
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
