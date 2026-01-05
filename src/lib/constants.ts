import { CloudRain, Zap, Anchor, Wind, Sun } from 'lucide-react';

export const SUPPORT_QUOTES = [
  "你不用急著變好，先讓自己舒服一點。",
  "混亂是暫時的，你的價值是永恆的。",
  "今天只要做到一件小事，就已經很棒了。",
  "呼吸。這只是一個數字，它定義不了你。",
  "錢流出去了，生活也流進來了。",
  "慢慢來，比較快。",
  "把心安頓好，路就會出現。",
  "你的價值，不等於你的存款數字。"
];

export const MOODS = [
  { id: 'chaos', label: '混亂', icon: CloudRain, colorClass: 'bg-mood-chaos text-mood-chaos-foreground' },
  { id: 'anxious', label: '焦慮', icon: Zap, colorClass: 'bg-mood-anxious text-mood-anxious-foreground' },
  { id: 'numb', label: '麻木', icon: Anchor, colorClass: 'bg-mood-numb text-mood-numb-foreground' },
  { id: 'calm', label: '平靜', icon: Wind, colorClass: 'bg-mood-calm text-mood-calm-foreground' },
  { id: 'hope', label: '希望', icon: Sun, colorClass: 'bg-mood-hope text-mood-hope-foreground' },
] as const;

export const FEELING_TAGS = ['感謝', '幸福', '喜悅', '舒壓', '無感', '焦慮', '憤怒', '罪惡'];

export type MoodType = typeof MOODS[number];
export type MoodId = MoodType['id'];
