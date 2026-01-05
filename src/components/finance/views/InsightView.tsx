import React, { useMemo, useState } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, PiggyBank, Coffee, Leaf } from 'lucide-react';
import { ZenHeader } from '../ZenHeader';
import { ZenCard } from '../ZenCard';
import { ZenButton } from '../ZenButton';
import { Transaction, Debt, Settings } from '@/types/finance';
import { formatMoney } from '@/lib/formatters';
import { FEELING_TAGS } from '@/lib/constants';

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

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const statsMap = new Map<string, MonthlyStats>();
    
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
        });
      }
      
      const stats = statsMap.get(key)!;
      stats.transactionCount++;
      
      if (tx.type === 'income') {
        stats.income += tx.amount;
      } else {
        stats.expense += tx.amount;
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
    
    return Array.from(statsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [transactions]);

  // Current month (default to latest or Jan 2026)
  const currentStats = monthlyStats[0] || {
    month: 1,
    year: 2026,
    income: 0,
    expense: 0,
    balance: 0,
    needExpense: 0,
    wantExpense: 0,
    transactionCount: 0,
    feelingCounts: {},
  };

  // Top feelings
  const topFeelings = useMemo(() => {
    return Object.entries(currentStats.feelingCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [currentStats]);

  // Export all data to CSV
  const exportToCSV = () => {
    // Transactions CSV
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
    
    // Debts CSV
    const debtHeaders = ['名稱', '總金額', '剩餘金額', '每月還款', '利率%', '扣款日'];
    const debtRows = debts.map(d => [
      d.name,
      d.total,
      d.remaining,
      d.monthlyPay,
      d.interest,
      d.date,
    ]);
    
    // Settings CSV
    const settingsHeaders = ['設定', '值'];
    const settingsRows = [
      ['現金存款', savings],
      ['投資部位', investments],
      ['含債務計算', settings.includeDebtInSurvival ? '是' : '否'],
    ];
    
    // Combine all
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
    
    // Add BOM for proper Chinese encoding
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
            className="p-2 rounded-full hover:bg-secondary text-primary transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Download size={18} />
            <span>匯出</span>
          </button>
        }
      />
      
      <div className="px-6 pb-24 space-y-6">
        {/* Export Success Toast */}
        {showExportSuccess && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-mood-hope text-mood-hope-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in z-50">
            ✓ 資料已匯出
          </div>
        )}

        {/* Current Month Hero */}
        <ZenCard className="bg-foreground text-background p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-background/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-background/60 text-xs font-bold tracking-widest uppercase mb-2">
              {currentStats.year}年 {currentStats.month}月 概覽
            </p>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className={`text-5xl font-light tracking-tight ${currentStats.balance >= 0 ? 'text-mood-hope' : 'text-mood-chaos'}`}>
                {currentStats.balance >= 0 ? '+' : ''}{formatMoney(currentStats.balance)}
              </span>
              <span className="text-background/60 text-lg">結餘</span>
            </div>
            
            <div className="flex justify-between border-t border-background/10 pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-mood-hope" />
                <div>
                  <p className="text-[10px] text-background/50">收入</p>
                  <p className="font-bold font-mono">+{formatMoney(currentStats.income)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-mood-chaos" />
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
            支出組成分析
          </h3>
          
          <div className="flex h-4 w-full rounded-full overflow-hidden bg-secondary mb-3">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${needPercent}%` }}
            />
            <div 
              className="h-full bg-mood-anxious"
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
              <div className="w-2 h-2 rounded-full bg-mood-anxious" />
              <span>想要 {100 - needPercent}%</span>
              <span className="text-foreground font-bold ml-1">{formatMoney(currentStats.wantExpense)}</span>
            </div>
          </div>
        </ZenCard>

        {/* Feelings Summary */}
        <ZenCard>
          <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
            <Coffee size={18} className="text-muted-foreground" />
            消費時的感受
          </h3>
          
          {topFeelings.length > 0 ? (
            <div className="space-y-3">
              {topFeelings.map(([feeling, count]) => {
                const maxCount = topFeelings[0][1];
                const percent = Math.round((count / maxCount) * 100);
                return (
                  <div key={feeling} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-12">{feeling}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-mood-calm transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}次</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Leaf size={24} className="mx-auto mb-2 opacity-50" />
              尚無感受紀錄
            </div>
          )}
        </ZenCard>

        {/* Monthly History */}
        {monthlyStats.length > 1 && (
          <ZenCard>
            <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
              <PiggyBank size={18} className="text-muted-foreground" />
              歷史月份
            </h3>
            
            <div className="space-y-3">
              {monthlyStats.slice(1, 6).map(stats => (
                <div key={`${stats.year}-${stats.month}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{stats.year}年 {stats.month}月</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{stats.transactionCount}筆</span>
                    <span className={`font-bold font-mono ${stats.balance >= 0 ? 'text-mood-hope-foreground' : 'text-mood-chaos-foreground'}`}>
                      {stats.balance >= 0 ? '+' : ''}{formatMoney(stats.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ZenCard>
        )}

        {/* Export Button */}
        <ZenButton onClick={exportToCSV} variant="secondary" className="mt-4">
          <Download size={18} />
          匯出全部資料 (CSV)
        </ZenButton>
      </div>
    </div>
  );
};
