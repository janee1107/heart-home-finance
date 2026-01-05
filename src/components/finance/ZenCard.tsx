import React from 'react';
import { cn } from '@/lib/utils';

interface ZenCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const ZenCard: React.FC<ZenCardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-card/80 backdrop-blur-sm p-6 rounded-3xl border border-border shadow-soft",
      onClick && "active:scale-[0.99] transition-transform cursor-pointer hover:border-muted-foreground/20",
      className
    )}
  >
    {children}
  </div>
);
