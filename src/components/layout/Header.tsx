import React, { useState } from 'react';
import { useAuth, type UserRole } from '../../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom'; // 1. Adicionada a importação de navegação
import { LogOut, Activity, ShieldCheck, UserCheck, RefreshCw, Key } from 'lucide-react';
import { Badge } from '../ui/Badge.tsx';
import { Modal } from '../ui/Modal.tsx';
import { Input } from '../ui/Input.tsx';
import { Button } from '../ui/Button.tsx';

export const Header: React.FC = () => {
  const { userProfile, role, logout, switchRole, updatePixKey, isFirebaseActive } = useAuth();
  const navigate = useNavigate(); // 2. Instanciado o hook de navegação
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pixInput, setPixInput] = useState(userProfile?.pixKey || 'lucas.fisio@fisiogest.com.br');

  const handleToggleRole = () => {
    const nextRole: UserRole = role === 'admin' ? 'secretary' : 'admin';
    switchRole(nextRole);
  };

  const handleSavePix = (e: React.FormEvent) => {
    e.preventDefault();
    updatePixKey(pixInput);
    setShowProfileModal(false);
  };

  // 3. Criada a função que encerra a sessão e redireciona
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 pt-safe">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
              <Activity size={20} className="stroke-[2.5px]" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
                FisioGest
                <span className="text-[10px] uppercase font-bold tracking-widest bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md">
                  PWA
                </span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px] sm:max-w-none">
                {userProfile?.clinicName || 'Fisioterapia Especializada'}
              </p>
            </div>
          </div>

          {/* User Controls & RBAC Toggle */}
          <div className="flex items-center gap-2">
            {/* Role switch toggle - Quick simulator for RBAC testing */}
            <button
              onClick={handleToggleRole}
              title={`Alternar para ${role === 'admin' ? 'Secretária' : 'Fisioterapeuta (Admin)'}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className="text-slate-400" />
              <span>Simular Perfil:</span>
              <Badge variant={role} size="sm">
                {role === 'admin' ? 'Fisioterapeuta (Admin)' : 'Secretária'}
              </Badge>
            </button>

            {/* Profile Avatar & Modal trigger */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Perfil do Usuário"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                {userProfile?.name?.charAt(0) || 'F'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {userProfile?.name?.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">{role}</p>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout} // 4. Botão agora chama a função com redirecionamento
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors"
              title="Sair do sistema"
              aria-label="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile secondary role bar */}
        <div className="flex sm:hidden items-center justify-between px-4 py-1.5 bg-slate-50/90 border-t border-slate-100 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Perfil ativo:</span>
            <Badge variant={role} size="sm">
              {role === 'admin' ? 'Fisio (Admin)' : 'Secretária'}
            </Badge>
          </div>
          <button
            onClick={handleToggleRole}
            className="text-teal-700 font-semibold underline flex items-center gap-1 active:opacity-70"
          >
            <RefreshCw size={10} /> Alternar
          </button>
        </div>
      </header>

      {/* Modal de Configuração do Perfil e Chave PIX */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Configurações do Perfil"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p className="font-bold text-slate-800">{userProfile?.name}</p>
            <p className="text-slate-600">{userProfile?.email}</p>
            <div className="pt-1 flex items-center gap-2">
              <span className="text-slate-500">Nível de Acesso (RBAC):</span>
              <Badge variant={role} size="sm" />
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              {isFirebaseActive ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  ● Conectado ao Firebase Auth
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  ● Modo Demonstração (preencha .env com chaves Firebase para produção)
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSavePix} className="space-y-3">
            <Input
              label="Chave PIX padrão para Cobranças WhatsApp"
              value={pixInput}
              onChange={(e) => setPixInput(e.target.value)}
              placeholder="CPF, CNPJ, Email ou Chave Aleatória"
              helperText="Essa chave será injetada automaticamente nas mensagens de cobrança via WhatsApp."
              icon={<Key size={16} />}
            />

            <div className="pt-2">
              <Button type="submit" fullWidth>
                Salvar Chave PIX
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Header;