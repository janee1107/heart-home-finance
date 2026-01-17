import React from 'react';
import { Plus, ChevronRight, Settings, Calendar as CalendarIcon, CreditCard, TrendingUp, BarChart3 } from 'lucide-react';
import { ZenCard } from '../ZenCard';
import { MOODS, MoodType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface HomeViewProps {
  quote: string;
  mood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  onAddTransaction: () => void;
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  quote,
  mood,
  onMoodSelect,
  onAddTransaction,
  onNavigate,
  onOpenSettings,
}) => {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col pb-32 animate-fade-in">
      <header className="pt-14 px-6 flex justify-between items-start mb-10">
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-2">Daily Support</p>
          <h2 className="text-xl font-light text-foreground leading-relaxed max-w-[260px]">「{quote}」</h2>
        </div>
        <button 
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors active:scale-95"
        >
          <Settings size={20} />
        </button>
      </header>

      <div className="px-6 space-y-8">
        {/* Mood Check-in - 4 Simple Moods */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-xl font-bold text-foreground">今日心情</h3>
            <span className="text-xs text-muted-foreground">Check-in</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            {MOODS.map(m => (
              <div 
                key={m.id} 
                onClick={() => onMoodSelect(m)}
                className={cn(
                  "flex-shrink-0 w-20 h-28 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95",
                  mood?.id === m.id 
                    ? 'ring-2 ring-primary bg-card shadow-card' 
                    : 'bg-card/80 border border-border shadow-soft hover:shadow-card'
                )}
              >
                <div className={cn("p-3 rounded-2xl", m.colorClass)}>
                  <m.icon size={22} />
                </div>
                <span className="text-xs font-medium text-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Add Transaction Card */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-xl font-bold text-foreground">記帳</h3>
          </div>
          <ZenCard 
            onClick={onAddTransaction}
            className="flex items-center justify-between group hover:shadow-card transition-all py-8"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plus size={28} />
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">記錄一筆</p>
                <p className="text-xs text-muted-foreground mt-1 tracking-wide">收入或支出</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
              <ChevronRight size={18} />
            </div>
          </ZenCard>
        </section>

        {/* Feature Grid - 2x2 */}
        <section className="grid grid-cols-2 gap-4">
          <ZenCard 
            onClick={() => onNavigate('calendar')} 
            className="flex flex-col items-center justify-center gap-3 py-8 hover:shadow-card transition-all"
          >
            <div className="p-3 bg-mood-relaxed rounded-2xl text-mood-relaxed-foreground">
              <CalendarIcon size={24} />
            </div>
            <span className="font-bold text-foreground">日曆</span>
          </ZenCard>
          <ZenCard 
            onClick={() => onNavigate('debt')} 
            className="flex flex-col items-center justify-center gap-3 py-8 hover:shadow-card transition-all"
          >
            <div className="p-3 bg-mood-annoyed rounded-2xl text-mood-annoyed-foreground">
              <CreditCard size={24} />
            </div>
            <span className="font-bold text-foreground">還款</span>
          </ZenCard>
          <ZenCard 
            onClick={() => onNavigate('insight')} 
            className="flex flex-col items-center justify-center gap-3 py-8 hover:shadow-card transition-all"
          >
            <div className="p-3 bg-mood-happy rounded-2xl text-mood-happy-foreground">
              <BarChart3 size={24} />
            </div>
            <span className="font-bold text-foreground">Insight</span>
          </ZenCard>
          <ZenCard 
            onClick={() => onNavigate('reality')} 
            className="flex flex-col items-center justify-center gap-3 py-8 hover:shadow-card transition-all"
          >
            <div className="p-3 bg-mood-sad rounded-2xl text-mood-sad-foreground">
              <TrendingUp size={24} />
            </div>
            <span className="font-bold text-foreground">Reality</span>
          </ZenCard>
        </section>
      </div>
    </div>
  );
};
