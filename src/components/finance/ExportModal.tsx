import React, { useState } from 'react';
import { X, FileText, Copy, CheckCircle } from 'lucide-react';
import { ZenButton } from './ZenButton';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportText: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, exportText }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-foreground/30 backdrop-blur-sm">
      <div className="bg-background rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in border border-border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-foreground font-medium flex items-center gap-2">
            <FileText size={20} /> 月報表已生成
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-muted"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
        <div className="bg-card p-4 rounded-xl text-xs text-foreground h-64 overflow-y-auto whitespace-pre-wrap font-mono mb-4 border border-border leading-relaxed">
          {exportText}
        </div>
        <ZenButton onClick={copyToClipboard}>
          {isCopied ? (
            <>
              <CheckCircle size={18} /> 已複製到剪貼簿
            </>
          ) : (
            <>
              <Copy size={18} /> 複製並傳送給教練
            </>
          )}
        </ZenButton>
      </div>
    </div>
  );
};
