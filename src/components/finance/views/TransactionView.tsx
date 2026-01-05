import React from 'react';
import { Trash2, Edit3, Bell } from 'lucide-react';
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
}) => {
  const isEdit = !!editingTx;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col animate-slide-up">
      <ZenHeader 
        title={isEdit ? "編輯紀錄" : "新增紀錄"} 
        back 
        onBack={onBack}
        action={isEdit && (
          <button 
            onClick={() => onDelete(editingTx.id)} 
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )} 
      />
      
      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-8">
        {/* Date Indicator */}
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 bg-secondary/50 rounded-full text-xs font-bold text-primary tracking-wide">
            {activeDate.getFullYear()} 年 {activeDate.getMonth()+1} 月 {activeDate.getDate()} 日
          </span>
        </div>

        {/* Smart Debt Detection (Only in Add mode) */}
        {!isEdit && (
          debts.filter(d => safeInt(d.date) === activeDate.getDate()).map(d => (
            <div 
              key={d.id} 
              onClick={() => { 
                setForm(f => ({ 
                  ...f, 
                  type: 'expense', 
                  name: `${d.name} 扣款`, 
                  amount: String(d.monthlyPay), 
                  isNeed: true, 
                  note: '自動偵測：固定還款' 
                })); 
              }} 
              className="bg-foreground text-background p-4 rounded-2xl flex items-center justify-between shadow-lg active:scale-95 transition-transform cursor-pointer border border-foreground/80"
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-background/60" />
                <span className="text-sm tracking-wide">偵測到 {d.name} 扣款日</span>
              </div>
              <span className="font-bold font-mono text-lg">NT$ {formatMoney(d.monthlyPay)}</span>
            </div>
          ))
        )}

        <ZenToggle 
          left="支出" 
          right="收入" 
          value={form.type === 'income'} 
          onChange={(v) => setForm({...form, type: v ? 'income' : 'expense'})} 
        />

        <div className="space-y-6 px-2">
          <input 
            type="text" 
            placeholder="項目名稱 (例如: 午餐)"
            className="w-full bg-transparent text-center text-xl font-medium text-foreground placeholder-muted-foreground/50 border-b border-border pb-3 focus:outline-none focus:border-muted-foreground transition-colors"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
          
          <div className="flex justify-center items-baseline gap-3">
            <span className="text-2xl text-muted-foreground font-light">NT$</span>
            <input 
              type="number" 
              placeholder="0"
              className="w-48 bg-transparent text-center text-5xl font-bold text-foreground placeholder-border focus:outline-none font-mono tracking-tight"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>
        </div>

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
                  "px-4 py-2 rounded-full text-sm transition-all border",
                  form.feelings.includes(tag) 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                    : 'bg-card text-primary border-border hover:border-muted-foreground'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card p-4 rounded-3xl border border-border flex gap-3 shadow-sm">
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

      <div className="p-6 bg-background/80 backdrop-blur-md fixed bottom-0 left-0 w-full border-t border-card/50">
        <ZenButton onClick={onSave}>{isEdit ? "更新紀錄" : "記錄並放下"}</ZenButton>
      </div>
    </div>
  );
};
