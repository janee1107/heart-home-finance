import React, { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import { ZenHeader } from '../ZenHeader';
import { ZenCard } from '../ZenCard';
import { Transaction, DayData } from '@/types/finance';
import { formatMoney } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  transactions: Transaction[];
  selectedDayData: DayData | null;
  onSelectDay: (data: DayData) => void;
  onAddTransaction: (day: number, month: number, year: number) => void;
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
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Calculate days in month and first day offset
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentMonth, currentYear]);

  const firstDayOffset = useMemo(() => {
    // Sunday = 0, so this directly gives us the offset
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentMonth, currentYear]);

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const isToday = (day: number) => {
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col animate-slide-up">
      <ZenHeader title="日曆" back onBack={onBack} />
      <div className="px-6 pb-24">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <h3 className="text-lg font-bold text-foreground">
            {currentYear}年 {currentMonth + 1}月
          </h3>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight size={24} className="text-foreground" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-[24px] p-6 shadow-soft border border-border mb-6">
          <div className="grid grid-cols-7 gap-y-4 text-center mb-4">
            {['日','一','二','三','四','五','六'].map(d => (
              <span key={d} className="text-xs text-muted-foreground font-medium">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-3">
            {/* Empty slots for first week offset */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const dayTx = transactions.filter(
                t => t.day === day && t.month === currentMonth + 1 && t.year === currentYear
              );
              const totalSpend = dayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
              const hasIncome = dayTx.some(t => t.type === 'income');
              const isSelected = selectedDayData?.day === day && 
                                 selectedDayData?.month === currentMonth + 1 &&
                                 selectedDayData?.year === currentYear;

              return (
                <button 
                  key={day} 
                  onClick={() => onSelectDay({ 
                    day, 
                    month: currentMonth + 1, 
                    year: currentYear, 
                    items: dayTx, 
                    spend: totalSpend 
                  })}
                  className="flex flex-col items-center gap-1 relative"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    isSelected && 'bg-foreground text-background shadow-lg scale-110',
                    isToday(day) && !isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-card',
                    !isSelected && !isToday(day) && 'text-foreground hover:bg-muted'
                  )}>
                    {day}
                  </div>
                  <div className="flex gap-0.5">
                    {totalSpend > 0 && <div className="w-1 h-1 rounded-full bg-muted-foreground" />}
                    {hasIncome && <div className="w-1 h-1 rounded-full bg-accent" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDayData ? (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-foreground">
                {selectedDayData.month}月{selectedDayData.day}日
              </h3>
              <button 
                onClick={() => onAddTransaction(selectedDayData.day, selectedDayData.month, selectedDayData.year)}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-button active:scale-95 flex items-center gap-1.5 transition-transform"
              >
                <Plus size={14} /> 新增
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
                    <div className="flex gap-2 flex-wrap">
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
                本日無紀錄
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">點擊日期查看詳情</p>
          </div>
        )}
      </div>
    </div>
  );
};
