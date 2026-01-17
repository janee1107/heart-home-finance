import React, { useState, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { SUPPORT_QUOTES, MoodType } from '@/lib/constants';
import { safeInt } from '@/lib/formatters';
import { Transaction, Debt, Settings, TransactionForm, DayData, AppData } from '@/types/finance';

import { ErrorBoundary } from '@/components/finance/ErrorBoundary';
import { SettingsModal } from '@/components/finance/SettingsModal';
import { SplashView } from '@/components/finance/views/SplashView';
import { HomeView } from '@/components/finance/views/HomeView';
import { TransactionView } from '@/components/finance/views/TransactionView';
import { CalendarView } from '@/components/finance/views/CalendarView';
import { DebtView } from '@/components/finance/views/DebtView';
import { RealityView } from '@/components/finance/views/RealityView';
import { InsightView } from '@/components/finance/views/InsightView';

type ViewType = 'splash' | 'home' | 'transaction' | 'calendar' | 'debt' | 'reality' | 'insight';

const DEFAULT_SETTINGS: Settings = {
  includeDebtInSurvival: true,
  survivalCost: 25000,
};

const IndexContent = () => {
  const [view, setView] = useState<ViewType>('splash');
  const [quote] = useState(() => SUPPORT_QUOTES[Math.floor(Math.random() * SUPPORT_QUOTES.length)]);
  const [showSettings, setShowSettings] = useState(false);

  // Data State - Uses REAL system date
  const [mood, setMood] = usePersistentState<MoodType | null>('rb_mood_v3', null);
  const [savings, setSavings] = usePersistentState<number>('rb_savings_v3', 0);
  const [investments, setInvestments] = usePersistentState<number>('rb_invest_v3', 0);
  const [debts, setDebts] = usePersistentState<Debt[]>('rb_debts_v3', []);
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('rb_tx_v3', []);
  const [settings, setSettings] = usePersistentState<Settings>('rb_settings_v3', DEFAULT_SETTINGS);

  // UI State - Uses REAL date
  const today = new Date();
  const [activeDate, setActiveDate] = useState(today);
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
  const getMonthlyBalance = (month: number, year: number) => {
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const targetTx = safeTx.filter(t => t.month === month && t.year === year);
    const income = targetTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = targetTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  const currentMonthStats = useMemo(
    () => getMonthlyBalance(today.getMonth() + 1, today.getFullYear()), 
    [transactions, today]
  );
  const totalMonthlyDebtPay = useMemo(() => debts.reduce((acc, d) => acc + safeInt(d.monthlyPay), 0), [debts]);

  // App Data for export/import
  const appData: AppData = useMemo(() => ({
    mood,
    savings,
    investments,
    debts,
    transactions,
    settings,
  }), [mood, savings, investments, debts, transactions, settings]);

  const handleImportData = (data: AppData) => {
    setMood(data.mood);
    setSavings(data.savings);
    setInvestments(data.investments);
    setDebts(data.debts);
    setTransactions(data.transactions);
    setSettings(data.settings);
  };

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

  // One-click pay: creates transaction AND updates debt
  const payDebt = (debt: Debt) => {
    const pay = safeInt(debt.monthlyPay);
    const remain = safeInt(debt.remaining);
    if (pay <= 0) {
      alert('請先設定每月還款金額');
      return;
    }
    
    const newRemain = Math.max(0, remain - pay);
    
    // Create expense transaction automatically
    const newTx: Transaction = {
      id: Date.now(),
      date: new Date().toISOString(),
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      type: 'expense',
      name: `${debt.name} 還款`,
      amount: pay,
      isNeed: true,
      feelings: [],
      note: '自動記錄：一鍵還款',
      moodAtTime: mood,
    };

    setTransactions(prev => [newTx, ...prev]);
    
    // Update debt with new remaining and lastPaid
    setDebts(prev => prev.map(d => 
      d.id === debt.id 
        ? { ...d, remaining: newRemain, lastPaid: new Date().toISOString() }
        : d
    ));
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
    setActiveDate(new Date()); // Use real date
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
    setActiveDate(new Date(tx.date));
    setView('transaction');
  };

  const handleCalendarAddTransaction = (day: number, month: number, year: number) => {
    setActiveDate(new Date(year, month - 1, day));
    setForm({ type: 'expense', amount: '', name: '', note: '', isNeed: false, feelings: [] });
    setEditingTx(null);
    setView('transaction');
  };

  const handleDateChange = (date: Date) => {
    setActiveDate(date);
  };

  // Render Views
  if (view === 'splash') {
    return <SplashView onEnter={() => setView('home')} />;
  }

  if (view === 'home') {
    return (
      <>
        <HomeView
          quote={quote}
          mood={mood}
          onMoodSelect={setMood}
          onAddTransaction={handleAddTransaction}
          onNavigate={(v) => setView(v as ViewType)}
          onOpenSettings={() => setShowSettings(true)}
        />
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          appData={appData}
          onImportData={handleImportData}
        />
      </>
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
        onDateChange={handleDateChange}
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
        survivalCost={settings.survivalCost}
        currentMonthBalance={currentMonthStats.balance}
        totalMonthlyDebtPay={totalMonthlyDebtPay}
        settings={settings}
        onSavingsChange={(v) => setSavings(Number(v))}
        onInvestmentsChange={(v) => setInvestments(Number(v))}
        onSurvivalCostChange={(v) => setSettings(prev => ({ ...prev, survivalCost: Number(v) }))}
        onSettingsChange={setSettings}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'insight') {
    return (
      <InsightView
        transactions={transactions}
        debts={debts}
        savings={savings}
        investments={investments}
        settings={settings}
        onBack={() => setView('home')}
      />
    );
  }

  return <div className="p-4 text-center">Error: Unknown View</div>;
};

const Index = () => (
  <ErrorBoundary>
    <IndexContent />
  </ErrorBoundary>
);

export default Index;
