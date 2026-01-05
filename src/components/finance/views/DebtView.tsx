import React from 'react';
import { Trash2, CheckCircle, Flag, Trophy } from 'lucide-react';
import { ZenHeader } from '../ZenHeader';
import { ZenCard } from '../ZenCard';
import { ZenButton } from '../ZenButton';
import { Debt } from '@/types/finance';
import { formatMoney, safeInt } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface DebtViewProps {
  debts: Debt[];
  onUpdateDebt: (id: number, field: keyof Debt, value: string | number) => void;
  onPayDebt: (debt: Debt) => void;
  onDeleteDebt: (id: number) => void;
  onAddDebt: () => void;
  onBack: () => void;
}

export const DebtView: React.FC<DebtViewProps> = ({
  debts,
  onUpdateDebt,
  onPayDebt,
  onDeleteDebt,
  onAddDebt,
  onBack,
}) => {
  const sortedDebts = [...debts].sort((a, b) => parseFloat(b.interest) - parseFloat(a.interest));
  const highPriorityIds = sortedDebts.slice(0, 3).map(d => d.id);
  
  const totalDebtAmt = debts.reduce((acc, d) => acc + safeInt(d.remaining), 0);
  const totalMonthlyDebtPay = debts.reduce((acc, d) => acc + safeInt(d.monthlyPay), 0);
  const paidOffDebts = debts.filter(d => safeInt(d.remaining) === 0);
  const totalOriginal = debts.reduce((acc, d) => acc + (safeInt(d.total) || safeInt(d.remaining)), 0);
  const progress = totalOriginal > 0 ? ((totalOriginal - totalDebtAmt) / totalOriginal) * 100 : 0;

  const maxMonthsLeft = debts.reduce((max, d) => {
    const months = safeInt(d.monthlyPay) > 0 ? Math.ceil(safeInt(d.remaining) / safeInt(d.monthlyPay)) : 0;
    return Math.max(max, months);
  }, 0);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col animate-slide-up">
      <ZenHeader title="還款規劃" back onBack={onBack} />
      <div className="px-6 pb-24 space-y-6">
        
        {/* Freedom Countdown Hero */}
        <div className="bg-foreground text-background p-8 rounded-[32px] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-background/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="mb-8 relative z-10">
            <p className="text-background/60 text-xs font-bold tracking-[0.2em] uppercase mb-2">Freedom Countdown</p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-light tracking-tighter">
                {maxMonthsLeft || '-'}
              </span>
              <span className="text-lg text-background/60">個月後歸零</span>
            </div>
          </div>
          
          <div className="flex justify-between border-t border-background/10 pt-5 relative z-10">
            <div>
              <p className="text-[10px] text-background/60 mb-1 tracking-wider">目前總債務</p>
              <p className="text-xl font-bold font-mono">NT$ {formatMoney(totalDebtAmt)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-background/60 mb-1 tracking-wider">每月固定還款</p>
              <p className="text-xl font-bold font-mono">NT$ {formatMoney(totalMonthlyDebtPay)}</p>
            </div>
          </div>
        </div>

        {/* Milestone Header */}
        <div className="flex items-center gap-5 bg-card p-5 rounded-3xl shadow-sm border border-border">
          <div className="relative w-14 h-14 flex-none">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="hsl(var(--border))" 
                strokeWidth="2.5" 
              />
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="hsl(var(--accent))" 
                strokeWidth="2.5" 
                strokeDasharray={`${progress}, 100`} 
                className="animate-grow" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs text-foreground font-bold">
              {parseInt(String(progress))}%
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              自由進度 <Trophy size={16} className="text-accent" />
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {paidOffDebts.length > 0 ? `已結清 ${paidOffDebts.length} 筆債務，太棒了！` : '開始你的自由之旅吧。'}
            </p>
          </div>
        </div>

        {/* Debt Cards */}
        <div className="space-y-4">
          {debts.map(debt => {
            const isPaid = safeInt(debt.remaining) === 0;
            const isPriority = highPriorityIds.includes(debt.id) && !isPaid;
            
            const monthsLeft = safeInt(debt.monthlyPay) > 0 ? Math.ceil(safeInt(debt.remaining) / safeInt(debt.monthlyPay)) : 0;
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + monthsLeft);

            return (
              <ZenCard 
                key={debt.id} 
                className={cn(
                  "relative overflow-hidden transition-all",
                  isPaid && 'border-accent/50 bg-accent/10'
                )}
              >
                {isPaid && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] px-3 py-1.5 rounded-bl-2xl font-bold tracking-wide shadow-sm">
                    🎉 已結清
                  </div>
                )}
                {!isPaid && isPriority && (
                  <div className="absolute top-0 right-0 bg-secondary text-primary text-[10px] px-3 py-1.5 rounded-bl-2xl font-bold tracking-wide">
                    相對重要
                  </div>
                )}
                
                <button 
                  onClick={() => onDeleteDebt(debt.id)}
                  className="absolute top-5 right-4 text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 size={18} />
                </button>

                <div className="mb-5 mt-1">
                  <input 
                    className="font-bold text-xl text-foreground bg-transparent border-b border-transparent focus:border-muted-foreground focus:outline-none w-2/3 placeholder-muted-foreground"
                    value={debt.name}
                    onChange={e => onUpdateDebt(debt.id, 'name', e.target.value)}
                    placeholder="債務名稱"
                  />
                  <div className="flex gap-2 mt-3 text-xs text-primary">
                    <div className="flex items-center gap-1 bg-muted px-2.5 py-1.5 rounded-lg border border-border">
                      <span className="text-muted-foreground">利率</span>
                      <input 
                        className="w-10 bg-transparent text-center font-bold outline-none" 
                        value={debt.interest} 
                        onChange={e => onUpdateDebt(debt.id, 'interest', e.target.value)} 
                      />
                      <span>%</span>
                    </div>
                    <div className="flex items-center gap-1 bg-muted px-2.5 py-1.5 rounded-lg border border-border">
                      <span className="text-muted-foreground">每月</span>
                      <input 
                        className="w-6 bg-transparent text-center font-bold outline-none" 
                        value={debt.date} 
                        onChange={e => onUpdateDebt(debt.id, 'date', e.target.value)} 
                      />
                      <span>號扣款</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-4 bg-background rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1 font-medium tracking-wide">剩餘金額</p>
                    <input 
                      type="number"
                      className="w-full bg-transparent font-bold text-lg text-foreground outline-none font-mono"
                      value={debt.remaining}
                      onChange={e => onUpdateDebt(debt.id, 'remaining', e.target.value)}
                    />
                  </div>
                  <div className="p-4 bg-background rounded-2xl border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1 font-medium tracking-wide">月還款</p>
                    <input 
                      type="number"
                      className="w-full bg-transparent font-bold text-lg text-foreground outline-none font-mono"
                      value={debt.monthlyPay}
                      onChange={e => onUpdateDebt(debt.id, 'monthlyPay', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border mb-2">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Flag size={14} className="text-accent" />
                    <span className="font-medium">預計 {futureDate.getFullYear()}年{futureDate.getMonth()+1}月 結清</span>
                  </div>
                  <span className="text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground">剩 {monthsLeft} 期</span>
                </div>

                {!isPaid && (
                  <button 
                    onClick={() => onPayDebt(debt)}
                    className="w-full mt-2 py-3 bg-background hover:bg-accent/20 text-primary hover:text-accent-foreground rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-border hover:border-accent/30 active:scale-[0.98]"
                  >
                    <CheckCircle size={16} />
                    記錄本月已還
                  </button>
                )}
              </ZenCard>
            );
          })}
        </div>

        <ZenButton 
          variant="secondary" 
          onClick={onAddDebt}
          className="border-dashed border-muted-foreground/30 text-primary hover:bg-muted"
        >
          + 新增債務規劃
        </ZenButton>
      </div>
    </div>
  );
};
