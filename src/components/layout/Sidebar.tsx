import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Receipt, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const links = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
    { name: 'Agenda do Dia', to: '/agenda', icon: Calendar },
    { name: 'Pacientes', to: '/pacientes', icon: Users },
    { name: 'Faturamento & PIX', to: '/faturamento', icon: Receipt },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-64px)] p-4 shrink-0">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Menu de Gestão
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150
                ${isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
                }
              `}
            >
              <Icon size={19} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100/80 text-xs">
          <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-1">
            <Sparkles size={14} className="text-teal-600" />
            <span>Mobile-First PWA</span>
          </div>
          <p className="text-teal-700/90 text-[11px] leading-relaxed">
            Otimizado para toques rápidos no smartphone do consultório ou domiciliar.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
