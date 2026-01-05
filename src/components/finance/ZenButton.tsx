import React from 'react';
import { cn } from '@/lib/utils';

interface ZenButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
}

export const ZenButton: React.FC<ZenButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  const baseStyle = "w-full py-4 rounded-[20px] font-medium text-base tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-button",
    secondary: "bg-card text-foreground border border-border hover:bg-secondary",
    ghost: "bg-transparent text-muted-foreground hover:bg-muted",
    danger: "bg-destructive/10 text-destructive border border-destructive/20",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(baseStyle, variants[variant], className)}
    >
      {children}
    </button>
  );
};
