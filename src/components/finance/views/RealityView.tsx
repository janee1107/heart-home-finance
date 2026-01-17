import React from 'react';
import { Shield } from 'lucide-react';
import { ZenHeader } from '../ZenHeader';
import { ZenCard } from '../ZenCard';
import { ZenToggle } from '../ZenToggle';
import { Settings } from '@/types/finance';
import { formatMoney, safeInt } from '@/lib/formatters';

interface RealityViewProps {
  savings: number;
  investments: number;
  survivalCost: number;
  currentMonthBalance: number;
  totalMonthlyDebtPay: number;
  settings: Settings;
  onSavingsChange: (value: string) => void;
  onInvestmentsChange: (value: string) => void;
  onSurvivalCostChange: (value: string) => void;
  onSettingsChange: (settings: Settings) => void;
  onBack: () => void;
}

export const RealityView: React.FC<RealityViewProps> = ({
  savings,
  investments,
  survivalCost,
  currentMonthBalance,
  totalMonthlyDebtPay,
  settings,
  onSavingsChange,
  onInvestmentsChange,
  onSurvivalCostChange,
  onSettingsChange,
  onBack,
}) => {
  const liquidAssets = safeInt(savings) + currentMonthBalance;
  const totalAssets = liquidAssets + safeInt(investments);
  
  // Real Mode = include debt, Simple Mode = basic only
  const realSurvivalCost = settings.includeDebtInSurvival 
    ? (safeInt(survivalCost) + totalMonthlyDebtPay) 
    : safeInt(survivalCost);
  
  const survivalMonths = realSurvivalCost > 0 ? (totalAssets / realSurvivalCost).toFixed(1) : "∞";

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col animate-slide-up">
      <ZenHeader title="Reality Mode" back onBack={onBack} />
      <div className="px-6 pb-24 space-y-8">
        
        {/* Survival Time Hero */}
        <div className="text-center py-6">
          <p className="text-muted-foreground text-xs mb-3 uppercase tracking-[0.2em]">Survival Time</p>
          <div className="flex items-baseline justify-center gap-3">
            <span className="text-7xl font-light text-foreground tracking-tighter">{survivalMonths}</span>
            <span className="text-xl text-muted-foreground font-medium">個月</span>
          </div>
          
          {/* Real vs Simple Mode Toggle */}
          <div className="flex justify-center mt-8">
            <ZenToggle 
              left="真實 (含債務)" 
              right="基本 (不含債)"
              value={!settings.includeDebtInSurvival}
              onChange={v => onSettingsChange({ ...settings, includeDebtInSurvival: !v })}
            />
          </div>
        </div>

        {/* Survival Cost Input */}
        <ZenCard className="flex items-center justify-between py-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-bold">每月最低生存開銷</p>
            <p className="text-[10px] text-muted-foreground/70">不亂花錢，活下去要多少？</p>
          </div>
          <div className="flex items-center border-b border-border w-28">
            <span className="text-muted-foreground mr-1 text-sm">NT$</span>
            <input 
              type="text"
              inputMode="numeric"
              className="w-full text-right font-bold text-lg text-foreground outline-none bg-transparent"
              value={survivalCost ? Number(survivalCost).toLocaleString() : ''}
              onChange={e => {
                const raw = e.target.value.replace(/,/g, '');
                if (/^\d*$/.test(raw)) {
                  onSurvivalCostChange(raw);
                }
              }}
            />
          </div>
        </ZenCard>
        
        {settings.includeDebtInSurvival && totalMonthlyDebtPay > 0 && (
          <div className="text-center text-xs text-muted-foreground -mt-4 bg-secondary/50 py-2 rounded-lg mx-4">
            + 每月固定還款 NT$ {formatMoney(totalMonthlyDebtPay)}
          </div>
        )}

        {/* Safety Net Composition */}
        <div>
          <h3 className="text-foreground font-bold mb-5 flex items-center gap-2 px-2">
            <Shield size={18} className="text-muted-foreground" /> 安全網組成
          </h3>
          
          {/* Stacked Bar Chart */}
          <div className="flex h-5 w-full rounded-full overflow-hidden bg-secondary mb-3">
            <div 
              className="h-full bg-primary transition-all" 
              style={{ width: `${Math.min((liquidAssets / (realSurvivalCost * 6)) * 100, 50)}%` }} 
            />
            <div 
              className="h-full bg-accent transition-all" 
              style={{ width: `${Math.min((safeInt(investments) / (realSurvivalCost * 6)) * 100, 50)}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-6 px-1">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" /> 現金
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" /> 投資
            </span>
            <span>目標: 6個月</span>
          </div>

          <ZenCard className="space-y-5">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-foreground">現有存款</span>
              <input 
                type="text"
                inputMode="numeric"
                className="text-right font-bold text-lg text-foreground bg-transparent outline-none w-32" 
                value={savings ? Number(savings).toLocaleString() : ''} 
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, '');
                  if (/^\d*$/.test(raw)) {
                    onSavingsChange(raw);
                  }
                }} 
              />
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-foreground">本月結餘</span>
              <span className="font-bold text-lg text-foreground font-mono">
                NT$ {formatMoney(currentMonthBalance)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">投資金額</span>
              <input 
                type="text"
                inputMode="numeric"
                className="text-right font-bold text-lg text-foreground bg-transparent outline-none w-32" 
                value={investments ? Number(investments).toLocaleString() : ''} 
                onChange={e => {
                  const raw = e.target.value.replace(/,/g, '');
                  if (/^\d*$/.test(raw)) {
                    onInvestmentsChange(raw);
                  }
                }} 
              />
            </div>
          </ZenCard>
        </div>
      </div>
    </div>
  );
};
