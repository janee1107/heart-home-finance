import React from 'react';
import { Trash2, Edit3, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { ZenHeader } from '../ZenHeader';
import { ZenButton } from '../ZenButton';
import { ZenToggle } from '../ZenToggle';
import { FEELING_TAGS } from '@/lib/constants';
import { TransactionForm, Transaction, Debt } from '@/types/finance';
import { formatMoney, safeInt } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TransactionViewProps {
  form: TransactionForm;
  setForm: React.Dispatch<React.SetStateAction<TransactionForm>>;
  editingTx: Transaction | null;
  activeDate: Date;
  debts: Debt[];
  onSave: () => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  onDateChange: (date: Date) => void;
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  form,
  setForm,
  editingTx,
  activeDate,
  debts,
  onSave,
  onDelete,
  onBack,
  onDateChange,
}) => {
  const isEdit = !!editingTx;

  const handlePrevDay = () => {
    const newDate = new Date(activeDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(activeDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  // Smart debt detection: check if any debt payment date matches today
  const matchingDebts = debts.filter(d => safeInt(d.date) === activeDate.getDate());

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col animate-slide-up">
      <ZenHeader 
        title={isEdit ? "編輯紀錄" : "新增紀錄"} 
        back 
        onBack={onBack}
        action={isEdit && editingTx && (
          <button 
            onClick={() => onDelete(editingTx.id)} 
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )} 
      />
      
      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-8">
        {/* Date Selector - Editable */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={handlePrevDay}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-muted-foreground" />
          </button>
          <span className="px-4 py-2 bg-secondary rounded-full text-sm font-bold text-foreground tracking-wide min-w-[160px] text-center">
            {activeDate.getFullYear()}年 {activeDate.getMonth()+1}月 {activeDate.getDate()}日
          </span>
          <button 
            onClick={handleNextDay}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Smart Debt Detection */}
        {!isEdit && matchingDebts.length > 0 && (
          <div className="space-y-2">
            {matchingDebts.map(d => (
              <div 
                key={d.id} 
                onClick={() => { 
                  setForm(f => ({ 
                    ...f, 
                    type: 'expense', 
                    name: `${d.name} 還款`, 
                    amount: String(d.monthlyPay), 
                    isNeed: true, 
                    note: '🔔 偵測到扣款日' 
                  })); 
                }} 
                className="bg-primary text-primary-foreground p-4 rounded-2xl flex items-center justify-between shadow-button active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell size={18} className="opacity-80" />
                  <span className="text-sm tracking-wide">🔔 偵測到 {d.name} 扣款日</span>
                </div>
                <span className="font-bold font-mono text-lg">NT$ {formatMoney(d.monthlyPay)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Income/Expense Toggle */}
        <ZenToggle 
          left="支出" 
          right="收入" 
          value={form.type === 'income'} 
          onChange={(v) => setForm({...form, type: v ? 'income' : 'expense'})} 
        />

        {/* Name & Amount */}
        <div className="space-y-6 px-2">
          <input 
            type="text" 
            placeholder="項目名稱"
            className="w-full bg-transparent text-center text-xl font-medium text-foreground placeholder-muted-foreground/50 border-b border-border pb-3 focus:outline-none focus:border-primary transition-colors"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
          
          <div className="flex justify-center items-baseline gap-3">
            <span className="text-2xl text-muted-foreground font-light">NT$</span>
            <input 
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-48 bg-transparent text-center text-5xl font-bold text-foreground placeholder-border focus:outline-none font-mono tracking-tight"
              value={form.amount ? Number(form.amount).toLocaleString() : ''}
              onChange={e => {
                // Remove commas for storage
                const raw = e.target.value.replace(/,/g, '');
                if (/^\d*$/.test(raw)) {
                  setForm({...form, amount: raw});
                }
              }}
            />
          </div>
        </div>

        {/* Need/Want Toggle for Expense */}
        {form.type === 'expense' && (
          <div className="space-y-3">
            <p className="text-center text-xs text-muted-foreground font-medium tracking-wide">這筆花費是？</p>
            <ZenToggle 
              left="想要 (Want)" 
              right="必需 (Need)" 
              value={form.isNeed} 
              onChange={v => setForm({...form, isNeed: v})} 
            />
          </div>
        )}

        {/* Feelings Tags */}
        <div className="space-y-3">
          <p className="text-center text-xs text-muted-foreground font-medium tracking-wide">當下的感受？</p>
          <div className="flex flex-wrap justify-center gap-2">
            {FEELING_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  const has = form.feelings.includes(tag);
                  setForm({
                    ...form,
                    feelings: has ? form.feelings.filter(t => t !== tag) : [...form.feelings, tag]
                  });
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all border active:scale-95",
                  form.feelings.includes(tag) 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                    : 'bg-card text-foreground border-border hover:border-primary'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="bg-card p-4 rounded-[24px] border border-border flex gap-3 shadow-soft">
          <Edit3 size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <textarea 
            placeholder="寫點什麼..." 
            className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none leading-relaxed"
            rows={2}
            value={form.note}
            onChange={e => setForm({...form, note: e.target.value})}
          />
        </div>

        <div className="h-8" />
      </div>

      {/* Save Button */}
      <div className="p-6 bg-background/80 backdrop-blur-md fixed bottom-0 left-0 w-full border-t border-border/50">
        <ZenButton onClick={onSave}>{isEdit ? "更新紀錄" : "記錄"}</ZenButton>
      </div>
    </div>
  );
};
