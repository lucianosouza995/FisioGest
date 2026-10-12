import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Receipt } from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Início', to: '/', icon: LayoutDashboard },
  { name: 'Agenda', to: '/agenda', icon: Calendar },
  { name: 'Pacientes', to: '/pacientes', icon: Users },
  { name: 'Faturamento', to: '/faturamento', icon: Receipt },
];

export const BottomNavigation: React.FC = () => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe md:hidden transition-all shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
      aria-label="Navegação Principal"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => `
                flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1.5 px-1 rounded-xl transition-all duration-150 select-none group
                ${isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-400 hover:text-slate-600 active:text-slate-700 font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`relative flex items-center justify-center p-1 rounded-xl transition-all ${isActive ? 'bg-teal-50 text-teal-600 scale-105' : 'group-active:scale-95'
                    }`}>
                    <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
                    {isActive && (
                      <span className="absolute -bottom-1 w-1.5 h-1.5 bg-teal-600 rounded-full" />
                    )}
                  </div>
                  <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-teal-700' : 'text-slate-500'}`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
