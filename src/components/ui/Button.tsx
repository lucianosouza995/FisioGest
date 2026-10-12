import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-97 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  // Mobile-first touch sizes (minimum 44px for touch targets)
  const sizeStyles = {
    sm: 'min-h-[44px] px-3.5 text-xs gap-1.5',
    md: 'min-h-[46px] px-4 text-sm gap-2 font-semibold',
    lg: 'min-h-[52px] px-6 text-base gap-2.5 font-bold shadow-sm',
  };

  const variantStyles = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm shadow-teal-700/20',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200',
    ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-700/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
