import React, { useMemo, useState } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, Leaf, Calendar } from 'lucide-react';
import { ZenHeader } from '../ZenHeader';
import { ZenCard } from '../ZenCard';
import { ZenButton } from '../ZenButton';
import { Transaction, Debt, Settings } from '@/types/finance';
import { formatMoney } from '@/lib/formatters';

interface InsightViewProps {
  transactions: Transaction[];
  debts: Debt[];
  savings: number;
  investments: number;
  settings: Settings;
  onBack: () => void;
}

interface MonthlyStats {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
  needExpense: number;
  wantExpense: number;
  transactionCount: number;
  feelingCounts: Record<string, number>;
  zeroSpendDays: number;
  dailyAverage: number;
}

export const InsightView: React.FC<InsightViewProps> = ({
  transactions,
  debts,
  savings,
  investments,
  settings,
  onBack,
}) => {
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const today = new Date();

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const statsMap = new Map<string, MonthlyStats>();
    const daysWithSpending = new Map<string, Set<number>>();
    
    transactions.forEach(tx => {
      const key = `${tx.year}-${tx.month}`;
      
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          month: tx.month,
          year: tx.year,
          income: 0,
          expense: 0,
          balance: 0,
          needExpense: 0,
          wantExpense: 0,
          transactionCount: 0,
          feelingCounts: {},
          zeroSpendDays: 0,
          dailyAverage: 0,
        });
        daysWithSpending.set(key, new Set());
      }
      
      const stats = statsMap.get(key)!;
      stats.transactionCount++;
      
      if (tx.type === 'income') {
        stats.income += tx.amount;
      } else {
        stats.expense += tx.amount;
        daysWithSpending.get(key)?.add(tx.day);
        if (tx.isNeed) {
          stats.needExpense += tx.amount;
        } else {
          stats.wantExpense += tx.amount;
        }
      }
      
      stats.balance = stats.income - stats.expense;
      
      tx.feelings.forEach(f => {
        stats.feelingCounts[f] = (stats.feelingCounts[f] || 0) + 1;
      });
    });

    // Calculate zero spend days and daily average
    statsMap.forEach((stats, key) => {
      const daysInMonth = new Date(stats.year, stats.month, 0).getDate();
      const spendDays = daysWithSpending.get(key)?.size || 0;
      stats.zeroSpendDays = daysInMonth - spendDays;
      stats.dailyAverage = spendDays > 0 ? Math.round(stats.expense / spendDays) : 0;
    });
    
    return Array.from(statsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [transactions]);

  // Current month stats
  const currentStats = monthlyStats.find(
    s => s.month === today.getMonth() + 1 && s.year === today.getFullYear()
  ) || {
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    income: 0,
    expense: 0,
    balance: 0,
    needExpense: 0,
    wantExpense: 0,
    transactionCount: 0,
    feelingCounts: {},
    zeroSpendDays: 0,
    dailyAverage: 0,
  };

  // Top 3 largest expenses this month
  const top3Expenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.month === currentStats.month && t.year === currentStats.year)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [transactions, currentStats]);

  // Top feelings (word cloud data)
  const topFeelings = useMemo(() => {
    return Object.entries(currentStats.feelingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [currentStats]);

  // Export all data to CSV
  const exportToCSV = () => {
    const txHeaders = ['日期', '年', '月', '日', '類型', '名稱', '金額', '必需/想要', '感受', '備註'];
    const txRows = transactions.map(tx => [
      tx.date,
      tx.year,
      tx.month,
      tx.day,
      tx.type === 'income' ? '收入' : '支出',
      tx.name,
      tx.amount,
      tx.isNeed === null ? '' : tx.isNeed ? '必需' : '想要',
      tx.feelings.join(';'),
      tx.note.replace(/,/g, '，').replace(/\n/g, ' '),
    ]);
    
    const debtHeaders = ['名稱', '總金額', '剩餘金額', '每月還款', '利率%', '扣款日'];
    const debtRows = debts.map(d => [
      d.name,
      d.total,
      d.remaining,
      d.monthlyPay,
      d.interest,
      d.date,
    ]);
    
    const settingsHeaders = ['設定', '值'];
    const settingsRows = [
      ['現金存款', savings],
      ['投資部位', investments],
      ['每月生存成本', settings.survivalCost],
      ['含債務計算', settings.includeDebtInSurvival ? '是' : '否'],
    ];
    
    const csvContent = [
      '=== 交易紀錄 ===',
      txHeaders.join(','),
      ...txRows.map(row => row.join(',')),
      '',
      '=== 債務資料 ===',
      debtHeaders.join(','),
      ...debtRows.map(row => row.join(',')),
      '',
      '=== 帳戶設定 ===',
      settingsHeaders.join(','),
      ...settingsRows.map(row => row.join(',')),
    ].join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReBalance_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  };

  const needPercent = currentStats.expense > 0 
    ? Math.round((currentStats.needExpense / currentStats.expense) * 100) 
    : 0;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col animate-slide-up">
      <ZenHeader 
        title="Insight" 
        back 
        onBack={onBack}
        action={
          <button 
            onClick={exportToCSV}
            className="p-2 rounded-full hover:bg-secondary text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Download size={18} />
          </button>
        }
      />
      
      <div className="px-6 pb-24 space-y-6">
        {/* Export Success Toast */}
        {showExportSuccess && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in z-50">
            ✓ 資料已匯出
          </div>
        )}

        {/* Monthly Flow Hero */}
        <ZenCard className="bg-foreground text-background p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-background/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-background/60 text-xs font-bold tracking-widest uppercase mb-2">
              {currentStats.year}年 {currentStats.month}月
            </p>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className={`text-5xl font-light tracking-tight ${currentStats.balance >= 0 ? 'text-accent' : 'text-mood-annoyed'}`}>
                {currentStats.balance >= 0 ? '+' : ''}{formatMoney(currentStats.balance)}
              </span>
              <span className="text-background/60 text-lg">結餘</span>
            </div>
            
            {/* Income vs Expense Bar */}
            <div className="flex justify-between border-t border-background/10 pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                <div>
                  <p className="text-[10px] text-background/50">收入</p>
                  <p className="font-bold font-mono">+{formatMoney(currentStats.income)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-mood-annoyed" />
                <div>
                  <p className="text-[10px] text-background/50">支出</p>
                  <p className="font-bold font-mono">-{formatMoney(currentStats.expense)}</p>
                </div>
              </div>
            </div>
          </div>
        </ZenCard>

        {/* Need vs Want Breakdown */}
        <ZenCard>
          <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-muted-foreground" />
            支出組成
          </h3>
          
          <div className="flex h-4 w-full rounded-full overflow-hidden bg-secondary mb-3">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${needPercent}%` }}
            />
            <div 
              className="h-full bg-mood-annoyed"
              style={{ width: `${100 - needPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>必需 {needPercent}%</span>
              <span className="text-foreground font-bold ml-1">{formatMoney(currentStats.needExpense)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-mood-annoyed" />
              <span>想要 {100 - needPercent}%</span>
              <span className="text-foreground font-bold ml-1">{formatMoney(currentStats.wantExpense)}</span>
            </div>
          </div>
        </ZenCard>

        {/* Mood Word Cloud */}
        {topFeelings.length > 0 && (
          <ZenCard>
            <h3 className="text-foreground font-bold mb-4">消費時的感受</h3>
            <div className="flex flex-wrap gap-2">
              {topFeelings.map(([feeling, count]) => {
                const maxCount = topFeelings[0][1];
                const size = 0.75 + (count / maxCount) * 0.5; // Scale from 0.75 to 1.25
                return (
                  <span 
                    key={feeling}
                    className="px-3 py-1.5 bg-secondary rounded-full text-foreground font-medium"
                    style={{ fontSize: `${size}rem` }}
                  >
                    {feeling} <span className="text-muted-foreground text-xs">×{count}</span>
                  </span>
                );
              })}
            </div>
          </ZenCard>
        )}

        {/* Top 3 Expenses */}
        {top3Expenses.length > 0 && (
          <ZenCard>
            <h3 className="text-foreground font-bold mb-4">Top 3 支出</h3>
            <div className="space-y-3">
              {top3Expenses.map((tx, i) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm text-foreground">{tx.name}</span>
                  </div>
                  <span className="font-bold font-mono text-foreground">
                    {formatMoney(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </ZenCard>
        )}

        {/* Coach's Notes */}
        <ZenCard>
          <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-muted-foreground" />
            Coach's Note
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/20 rounded-2xl p-4 text-center">
              <p className="text-3xl font-light text-accent-foreground mb-1">
                {currentStats.zeroSpendDays}
              </p>
              <p className="text-xs text-muted-foreground">零消費天數</p>
            </div>
            <div className="bg-secondary rounded-2xl p-4 text-center">
              <p className="text-3xl font-light text-foreground mb-1">
                {formatMoney(currentStats.dailyAverage)}
              </p>
              <p className="text-xs text-muted-foreground">日均消費</p>
            </div>
          </div>
        </ZenCard>

        {/* Export Button */}
        <ZenButton onClick={exportToCSV} variant="secondary" className="mt-4">
          <Download size={18} />
          匯出全部資料 (CSV)
        </ZenButton>
      </div>
    </div>
  );
};
