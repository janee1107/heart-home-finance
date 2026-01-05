import React from 'react';
import { cn } from '@/lib/utils';

interface ZenToggleProps {
  left: string;
  right: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ZenToggle: React.FC<ZenToggleProps> = ({ left, right, value, onChange }) => (
  <div className="flex bg-secondary/50 p-1.5 rounded-full relative cursor-pointer select-none">
    <div 
      className={cn(
        "w-1/2 text-center py-2.5 z-10 text-sm font-medium transition-colors duration-300",
        !value ? 'text-foreground' : 'text-muted-foreground'
      )} 
      onClick={() => onChange(false)}
    >
      {left}
    </div>
    <div 
      className={cn(
        "w-1/2 text-center py-2.5 z-10 text-sm font-medium transition-colors duration-300",
        value ? 'text-foreground' : 'text-muted-foreground'
      )} 
      onClick={() => onChange(true)}
    >
      {right}
    </div>
    <div 
      className={cn(
        "absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-card rounded-full shadow-sm transition-transform duration-500",
        value ? 'translate-x-[100%]' : 'translate-x-0'
      )} 
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    />
  </div>
);
