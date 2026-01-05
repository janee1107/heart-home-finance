import React, { useState, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { SUPPORT_QUOTES, MoodType } from '@/lib/constants';
import { safeInt } from '@/lib/formatters';
import { Transaction, Debt, Settings, TransactionForm, DayData } from '@/types/finance';

import { SplashView } from '@/components/finance/views/SplashView';
import { HomeView } from '@/components/finance/views/HomeView';
import { TransactionView } from '@/components/finance/views/TransactionView';
import { CalendarView } from '@/components/finance/views/CalendarView';
import { DebtView } from '@/components/finance/views/DebtView';
import { RealityView } from '@/components/finance/views/RealityView';

type ViewType = 'splash' | 'home' | 'transaction' | 'calendar' | 'debt' | 'reality';

const Index = () => {
  const [view, setView] = useState<ViewType>('splash');
  const [quote] = useState(() => SUPPORT_QUOTES[Math.floor(Math.random() * SUPPORT_QUOTES.length)]);

  // Data State
  const [mood, setMood] = usePersistentState<MoodType | null>('rb_mood_v2', null);
  const [savings, setSavings] = usePersistentState<number>('rb_savings_v2', 0);
  const [investments, setInvestments] = usePersistentState<number>('rb_invest_v2', 0);
  const [survivalCost, setSurvivalCost] = usePersistentState<number>('rb_survival_v2', 25000);
  const [debts, setDebts] = usePersistentState<Debt[]>('rb_debts_v2', [
    { id: 1, name: '信貸範例', total: 300000, remaining: 240000, monthlyPay: 8000, interest: '3.5', date: '5' }
  ]);
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('rb_tx_v2', []);
  const [settings, setSettings] = usePersistentState<Settings>('rb_settings_v2', { includeDebtInSurvival: true });

  // UI State
  const [activeDate, setActiveDate] = useState(new Date(2026, 0, 4));
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const [form, setForm] = useState<TransactionForm>({
    type: 'expense',
    amount: '',
    name: '',
    note: '',
    isNeed: false,
    feelings: []
  });

  // Calculations
  const getMonthlyBalance = (month: number) => {
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const targetTx = safeTx.filter(t => t.month === month);
    const income = targetTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = targetTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  const currentMonthStats = useMemo(() => getMonthlyBalance(1), [transactions]);
  const totalMonthlyDebtPay = useMemo(() => debts.reduce((acc, d) => acc + safeInt(d.monthlyPay), 0), [debts]);

  // Handlers
  const saveTransaction = () => {
    if (!form.amount) return;
    
    const newTx: Transaction = {
      id: editingTx ? editingTx.id : Date.now(),
      date: activeDate.toISOString(),
      day: activeDate.getDate(),
      month: activeDate.getMonth() + 1,
      year: activeDate.getFullYear(),
      type: form.type,
      name: form.name || '未命名',
      amount: safeInt(form.amount),
      isNeed: form.type === 'expense' ? form.isNeed : null,
      feelings: form.feelings,
      note: form.note,
      moodAtTime: mood
    };

    if (editingTx) {
      setTransactions(prev => prev.map(t => t.id === editingTx.id ? newTx : t));
    } else {
      setTransactions(prev => [newTx, ...prev]);
    }

    resetFormAndNavigate();
  };

  const deleteTransaction = (id: number) => {
    if (confirm("確定要刪除這筆紀錄嗎？")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      resetFormAndNavigate();
    }
  };

  const resetFormAndNavigate = () => {
    setForm({ type: 'expense', amount: '', name: '', note: '', isNeed: false, feelings: [] });
    setEditingTx(null);
    setView('home');
  };

  const updateDebt = (id: number, field: keyof Debt, value: string | number) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const payDebt = (debt: Debt) => {
    const pay = safeInt(debt.monthlyPay);
    const remain = safeInt(debt.remaining);
    if (pay <= 0) {
      alert('請先設定每月還款金額');
      return;
    }
    
    const newRemain = Math.max(0, remain - pay);
    if (confirm(`確認本月已還款 NT$ ${pay.toLocaleString()}？\n剩餘金額將更新為 NT$ ${newRemain.toLocaleString()}`)) {
      updateDebt(debt.id, 'remaining', newRemain);
    }
  };

  const deleteDebt = (id: number) => {
    if (confirm("刪除此債務？")) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  const addDebt = () => {
    setDebts(prev => [...prev, { 
      id: Date.now(), 
      name: '新債務', 
      total: 0, 
      remaining: 0, 
      monthlyPay: 0, 
      interest: '0', 
      date: '1' 
    }]);
  };

  const handleAddTransaction = () => {
    setEditingTx(null);
    setActiveDate(new Date(2026, 0, 4));
    setForm({ type: 'expense', amount: '', name: '', note: '', isNeed: false, feelings: [] });
    setView('transaction');
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setForm({
      type: tx.type,
      amount: String(tx.amount),
      name: tx.name,
      note: tx.note,
      isNeed: tx.isNeed ?? false,
      feelings: tx.feelings
    });
    setActiveDate(new Date(2026, 0, tx.day));
    setView('transaction');
  };

  const handleCalendarAddTransaction = (day: number) => {
    setActiveDate(new Date(2026, 0, day));
    setForm({ type: 'expense', amount: '', name: '', note: '', isNeed: false, feelings: [] });
    setEditingTx(null);
    setView('transaction');
  };

  // Render Views
  if (view === 'splash') {
    return <SplashView onEnter={() => setView('home')} />;
  }

  if (view === 'home') {
    return (
      <HomeView
        quote={quote}
        mood={mood}
        onMoodSelect={setMood}
        onAddTransaction={handleAddTransaction}
        onNavigate={(v) => setView(v as ViewType)}
      />
    );
  }

  if (view === 'transaction') {
    return (
      <TransactionView
        form={form}
        setForm={setForm}
        editingTx={editingTx}
        activeDate={activeDate}
        debts={debts}
        onSave={saveTransaction}
        onDelete={deleteTransaction}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'calendar') {
    return (
      <CalendarView
        transactions={transactions}
        selectedDayData={selectedDayData}
        onSelectDay={setSelectedDayData}
        onAddTransaction={handleCalendarAddTransaction}
        onEditTransaction={handleEditTransaction}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'debt') {
    return (
      <DebtView
        debts={debts}
        onUpdateDebt={updateDebt}
        onPayDebt={payDebt}
        onDeleteDebt={deleteDebt}
        onAddDebt={addDebt}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'reality') {
    return (
      <RealityView
        savings={savings}
        investments={investments}
        survivalCost={survivalCost}
        currentMonthBalance={currentMonthStats.balance}
        totalMonthlyDebtPay={totalMonthlyDebtPay}
        settings={settings}
        onSavingsChange={(v) => setSavings(Number(v))}
        onInvestmentsChange={(v) => setInvestments(Number(v))}
        onSurvivalCostChange={(v) => setSurvivalCost(Number(v))}
        onSettingsChange={setSettings}
        onBack={() => setView('home')}
      />
    );
  }

  return <div className="p-4 text-center">Error: Unknown View</div>;
};

export default Index;
