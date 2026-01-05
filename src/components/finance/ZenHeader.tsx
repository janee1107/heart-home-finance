import React from 'react';
import { X } from 'lucide-react';

interface ZenHeaderProps {
  title: string;
  back?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
}

export const ZenHeader: React.FC<ZenHeaderProps> = ({ title, back = false, onBack, action }) => (
  <div className="pt-12 pb-6 px-6 bg-background flex items-center justify-between sticky top-0 z-20 shadow-soft">
    <div className="flex items-center gap-4">
      {back && (
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-muted text-primary transition-colors"
        >
          <X size={24} />
        </button>
      )}
      <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
    </div>
    {action}
  </div>
);
