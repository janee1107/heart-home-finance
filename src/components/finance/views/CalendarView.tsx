import React from 'react';
import { Plus, Calendar as CalendarIcon, Leaf } from 'lucide-react';
import { ZenHeader } from '../ZenHeader';
import { ZenCard } from '../ZenCard';
import { Transaction, DayData } from '@/types/finance';
import { formatMoney } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  transactions: Transaction[];
  selectedDayData: DayData | null;
  onSelectDay: (data: DayData) => void;
  onAddTransaction: (day: number) => void;
  onEditTransaction: (tx: Transaction) => void;
  onBack: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  selectedDayData,
  onSelectDay,
  onAddTransaction,
  onEditTransaction,
  onBack,
}) => {
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const firstDayOffset = 4; // Jan 1 2026 is Thursday

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col animate-slide-up">
      <ZenHeader title="2026年 1月" back onBack={onBack} />
      <div className="px-6 pb-24">
        <div className="bg-card rounded-[32px] p-6 shadow-sm border border-border mb-6">
          <div className="grid grid-cols-7 gap-y-4 text-center mb-4">
            {['日','一','二','三','四','五','六'].map(d => (
              <span key={d} className="text-xs text-muted-foreground font-medium">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-4">
            {Array.from({length: firstDayOffset}).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const dayTx = transactions.filter(t => t.day === day && t.month === 1);
              const totalSpend = dayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
              const hasIncome = dayTx.some(t => t.type === 'income');
              const isSelected = selectedDayData?.day === day;

              return (
                <button 
                  key={day} 
                  onClick={() => onSelectDay({ day, items: dayTx, spend: totalSpend })}
                  className="flex flex-col items-center gap-1 relative"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isSelected 
                      ? 'bg-foreground text-background shadow-lg scale-110' 
                      : 'text-primary hover:bg-muted'
                  )}>
                    {day}
                  </div>
                  {totalSpend > 0 && <div className="w-1 h-1 rounded-full bg-muted-foreground" />}
                  {hasIncome && <div className="w-1 h-1 rounded-full bg-accent absolute top-1.5 right-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDayData ? (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-foreground">1月{selectedDayData.day}日</h3>
              <button 
                onClick={() => onAddTransaction(selectedDayData.day)}
                className="px-4 py-2 bg-foreground text-background text-xs font-medium rounded-full shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Plus size={14} /> 補記
              </button>
            </div>
            {selectedDayData.items.length > 0 ? (
              selectedDayData.items.map(item => (
                <ZenCard 
                  key={item.id} 
                  onClick={() => onEditTransaction(item)} 
                  className="flex items-center justify-between py-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-foreground">{item.name}</span>
                    <div className="flex gap-2">
                      {item.feelings?.map(f => (
                        <span key={f} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={cn(
                    "font-bold font-mono text-lg",
                    item.type === 'income' ? 'text-financial-income' : 'text-foreground'
                  )}>
                    {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)}
                  </span>
                </ZenCard>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <Leaf size={32} className="mx-auto mb-2 opacity-50" />
                本日無紀錄，享受空白。
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>點擊日期查看詳情</p>
          </div>
        )}
      </div>
    </div>
  );
};
