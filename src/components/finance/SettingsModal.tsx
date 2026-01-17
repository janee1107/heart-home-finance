import React, { useState } from 'react';
import { X, Download, Upload, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { ZenButton } from './ZenButton';
import { AppData } from '@/types/finance';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onImportData: (data: AppData) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  appData,
  onImportData,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [showImport, setShowImport] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const jsonData = JSON.stringify(appData, null, 2);
    navigator.clipboard.writeText(jsonData).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownloadJSON = () => {
    const jsonData = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReBalance_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importText) as AppData;
      
      // Validate structure
      if (!parsed.transactions || !parsed.debts || !parsed.settings) {
        throw new Error('資料格式不正確');
      }
      
      if (confirm('確定要匯入資料嗎？這將覆蓋現有的所有資料。')) {
        onImportData(parsed);
        setImportText('');
        setShowImport(false);
        onClose();
      }
    } catch (e) {
      setImportError('無法解析資料，請確認 JSON 格式正確');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-foreground/30 backdrop-blur-sm">
      <div className="bg-background rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in border border-border max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-foreground font-bold text-lg">資料管理</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Download size={16} /> 匯出資料
            </h4>
            <p className="text-xs text-muted-foreground">
              將資料複製到剪貼簿，或下載為 JSON 檔案
            </p>
            <div className="flex gap-2">
              <ZenButton variant="secondary" onClick={handleExportJSON} className="flex-1 py-3">
                {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {isCopied ? '已複製' : '複製'}
              </ZenButton>
              <ZenButton variant="secondary" onClick={handleDownloadJSON} className="flex-1 py-3">
                <Download size={16} />
                下載
              </ZenButton>
            </div>
          </div>

          <div className="border-t border-border my-4" />

          {/* Import Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Upload size={16} /> 匯入資料
            </h4>
            
            {!showImport ? (
              <ZenButton 
                variant="ghost" 
                onClick={() => setShowImport(true)}
                className="border border-dashed border-border"
              >
                點此貼上 JSON 資料
              </ZenButton>
            ) : (
              <div className="space-y-3">
                <textarea
                  className="w-full h-32 bg-card border border-border rounded-xl p-3 text-xs font-mono text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-primary"
                  placeholder='貼上 JSON 資料...'
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
                
                {importError && (
                  <div className="flex items-center gap-2 text-destructive text-xs">
                    <AlertTriangle size={14} />
                    {importError}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <ZenButton 
                    variant="ghost" 
                    onClick={() => { setShowImport(false); setImportText(''); setImportError(''); }}
                    className="flex-1 py-3"
                  >
                    取消
                  </ZenButton>
                  <ZenButton 
                    onClick={handleImport}
                    className="flex-1 py-3"
                    disabled={!importText.trim()}
                  >
                    匯入
                  </ZenButton>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border my-4" />

          {/* Data Stats */}
          <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">目前資料統計</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">交易紀錄</span>
                <span className="font-bold text-foreground">{appData.transactions.length} 筆</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">債務項目</span>
                <span className="font-bold text-foreground">{appData.debts.length} 筆</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
