import React from 'react';
import { Plus, ChevronRight, User, Calendar as CalendarIcon, CreditCard, TrendingUp } from 'lucide-react';
import { ZenCard } from '../ZenCard';
import { MOODS, MoodType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface HomeViewProps {
  quote: string;
  mood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  onAddTransaction: () => void;
  onNavigate: (view: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  quote,
  mood,
  onMoodSelect,
  onAddTransaction,
  onNavigate,
}) => {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col pb-32 animate-fade-in">
      <header className="pt-14 px-6 flex justify-between items-start mb-10">
        <div>
          <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-2">Daily Space</p>
          <h2 className="text-2xl font-light text-foreground leading-relaxed">「{quote}」</h2>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold shadow-inner">
          <User size={20} />
        </div>
      </header>

      <div className="px-6 space-y-8">
        {/* Mood Check-in */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-xl font-bold text-foreground">今日狀態</h3>
            <span className="text-xs text-muted-foreground">Check-in</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            {MOODS.map(m => (
              <div 
                key={m.id} 
                onClick={() => onMoodSelect(m)}
                className={cn(
                  "flex-shrink-0 w-20 h-28 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95",
                  mood?.id === m.id 
                    ? 'ring-2 ring-muted-foreground bg-card shadow-lg' 
                    : 'bg-card border border-border shadow-sm'
                )}
              >
                <div className={cn("p-3 rounded-2xl", m.colorClass)}>
                  <m.icon size={22} />
                </div>
                <span className="text-xs font-medium text-primary">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Add Transaction Card */}
        <section>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-xl font-bold text-foreground">記帳與感受</h3>
          </div>
          <ZenCard 
            onClick={onAddTransaction}
            className="flex items-center justify-between group hover:shadow-card transition-all py-8"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-muted group-hover:text-primary-foreground transition-colors">
                <Plus size={28} />
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">記錄一筆流動</p>
                <p className="text-xs text-muted-foreground mt-1 tracking-wide">重點不是金額，是感受</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground">
              <ChevronRight size={18} />
            </div>
          </ZenCard>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-2 gap-4">
          <ZenCard 
            onClick={() => onNavigate('calendar')} 
            className="flex flex-col items-center justify-center gap-3 py-8 hover:border-muted-foreground/30 transition-colors"
          >
            <div className="p-3 bg-mood-calm/30 rounded-2xl text-mood-calm-foreground">
              <CalendarIcon size={24} />
            </div>
            <span className="font-bold text-foreground">心靈日曆</span>
          </ZenCard>
          <ZenCard 
            onClick={() => onNavigate('debt')} 
            className="flex flex-col items-center justify-center gap-3 py-8 hover:border-muted-foreground/30 transition-colors"
          >
            <div className="p-3 bg-mood-chaos/30 rounded-2xl text-mood-chaos-foreground">
              <CreditCard size={24} />
            </div>
            <span className="font-bold text-foreground">還款規劃</span>
          </ZenCard>
          <ZenCard 
            onClick={() => onNavigate('reality')} 
            className="col-span-2 flex items-center justify-between py-6 px-8 hover:border-muted-foreground/30 transition-colors bg-foreground text-background"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-background/10 rounded-2xl text-background/80">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="font-bold text-lg">Reality Mode</p>
                <p className="text-xs text-background/60 mt-0.5">面對現實，找回安全感</p>
              </div>
            </div>
            <ChevronRight className="text-background/50" />
          </ZenCard>
        </section>
      </div>
    </div>
  );
};
