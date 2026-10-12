import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isFirebaseActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // AJUSTE FEITO AQUI: Trocado '/app' por '/'
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Por favor informe seu e-mail.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password || 'senha123');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'secretary') => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const demoEmail = role === 'admin'
        ? 'lucas.fisio@fisiogest.com.br'
        : 'mariana.secretaria@fisiogest.com.br';
      await login(demoEmail, 'demo123');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Erro no login demonstrativo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-8 antialiased">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30 mx-auto">
              <Activity size={26} className="stroke-[2.5px]" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            FisioGest
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Acesse o painel do consultório ou experimente os perfis de acesso
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail profissional"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: lucas.fisio@clinica.com"
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Senha de acesso"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={18} />}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={isSubmitting}
              icon={<ArrowRight size={18} />}
            >
              {isSubmitting ? 'Acessando...' : 'Entrar no Sistema'}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">
                Acesso Rápido para Avaliação (RBAC)
              </span>
            </div>
          </div>

          {/* Quick Demo Logins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 active:scale-97 text-left transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-900 leading-tight">Fisioterapeuta</p>
                <p className="text-[10px] text-teal-700">Acesso Total (Admin)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('secretary')}
              disabled={isSubmitting}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 active:scale-97 text-left transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <UserCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900 leading-tight">Secretária</p>
                <p className="text-[10px] text-blue-700">Agenda & Recepção</p>
              </div>
            </button>
          </div>
        </div>

        {/* Status do Firebase */}
        <div className="text-center text-[11px] text-slate-400">
          {isFirebaseActive ? (
            <p className="text-emerald-600 font-medium">✓ Firebase Auth conectado</p>
          ) : (
            <p>ℹ️ Modo Demo ativo. Chaves do Firebase podem ser configuradas no arquivo .env</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;