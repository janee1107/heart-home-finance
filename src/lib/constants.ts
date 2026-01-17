import { Sun, Cloud, Smile, Frown, LucideIcon } from 'lucide-react';

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

// 4 Simple Moods: Happy, Relaxed, Sad, Annoyed
export const MOODS = [
  { id: 'happy', label: '開心', icon: Sun, colorClass: 'bg-mood-happy text-mood-happy-foreground' },
  { id: 'relaxed', label: '放鬆', icon: Cloud, colorClass: 'bg-mood-relaxed text-mood-relaxed-foreground' },
  { id: 'sad', label: '難過', icon: Frown, colorClass: 'bg-mood-sad text-mood-sad-foreground' },
  { id: 'annoyed', label: '煩躁', icon: Smile, colorClass: 'bg-mood-annoyed text-mood-annoyed-foreground' },
] as const;

// Feeling tags sorted positive to negative
export const FEELING_TAGS = ['感謝', '幸福', '喜悅', '舒壓', '無感', '焦慮', '憤怒', '罪惡'];

export type MoodType = typeof MOODS[number];
export type MoodId = MoodType['id'];
