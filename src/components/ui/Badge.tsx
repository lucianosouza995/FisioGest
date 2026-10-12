import React from 'react';

export type BadgeVariant = 
  | 'realizado' 
  | 'agendado' 
  | 'faltou' 
  | 'cancelado'
  | 'pago' 
  | 'pendente' 
  | 'atrasado' 
  | 'admin' 
  | 'secretary'
  | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, size = 'sm' }) => {
  const styles: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
    realizado: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Realizado' },
    agendado: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', label: 'Agendado' },
    faltou: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Faltou' },
    cancelado: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-500', label: 'Cancelado' },
    pago: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Pago' },
    pendente: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Pendente' },
    atrasado: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Em atraso' },
    admin: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Fisioterapeuta (Admin)' },
    secretary: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Secretária' },
    neutral: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Normal' },
  };

  const current = styles[variant] || styles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses} ${current.bg} ${current.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children || current.label}
    </span>
  );
};
