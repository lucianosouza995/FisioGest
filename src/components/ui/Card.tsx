import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flat' | 'outline' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5',
    flat: 'bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-100',
    outline: 'bg-white rounded-2xl border border-slate-200 p-4 sm:p-5',
    interactive: 'bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm active:scale-98 transition-transform cursor-pointer hover:border-teal-300'
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
