import React from 'react';

interface SplashViewProps {
  onEnter: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onEnter }) => {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-background px-8 text-center animate-fade-in">
      <div className="mb-20 relative">
        {/* Soft Ambient Glow */}
        <div className="absolute inset-0 bg-secondary rounded-full blur-[80px] opacity-40 animate-pulse"></div>
        {/* Zen Circle Icon */}
        <div className="relative z-10 animate-breathe opacity-60 text-primary">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M50 10 A40 40 0 0 1 90 50" className="opacity-40" strokeLinecap="round" />
            <path d="M90 50 A40 40 0 0 1 50 90" className="opacity-60" strokeLinecap="round" />
            <path d="M50 90 A40 40 0 0 1 10 50" className="opacity-80" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      
      {/* Title Group - Positioned Golden Ratio */}
      <div className="flex flex-col items-center gap-4 mb-24">
        <h1 className="text-3xl font-light tracking-[0.4em] text-foreground">Re:Balance</h1>
        <div className="w-8 h-[1px] bg-border"></div>
        <p className="text-muted-foreground text-sm font-light leading-relaxed tracking-widest opacity-80">
          先把心安頓好<br/>再談生活
        </p>
      </div>

      {/* Bottom Button */}
      <button 
        onClick={onEnter}
        className="group relative px-12 py-3.5 rounded-full border border-border bg-card/40 backdrop-blur-sm text-foreground tracking-[0.25em] text-xs font-medium hover:bg-card/80 hover:shadow-lg hover:shadow-border/30 transition-all duration-700 active:scale-95 animate-float"
      >
        BREATHE
      </button>
    </div>
  );
};
