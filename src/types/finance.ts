import { MoodType } from '@/lib/constants';

export interface Transaction {
  id: number;
  date: string;
  day: number;
  month: number;
  year: number;
  type: 'income' | 'expense';
  name: string;
  amount: number;
  isNeed: boolean | null;
  feelings: string[];
  note: string;
  moodAtTime: MoodType | null;
}

export interface Debt {
  id: number;
  name: string;
  total: number;
  remaining: number;
  monthlyPay: number;
  interest: string;
  date: string;
  lastPaid?: string; // ISO date string of last payment
}

export interface Settings {
  includeDebtInSurvival: boolean;
  survivalCost: number;
}

export interface TransactionForm {
  type: 'income' | 'expense';
  amount: string;
  name: string;
  note: string;
  isNeed: boolean;
  feelings: string[];
}

export interface DayData {
  day: number;
  month: number;
  year: number;
  items: Transaction[];
  spend: number;
}

export interface AppData {
  mood: MoodType | null;
  savings: number;
  investments: number;
  debts: Debt[];
  transactions: Transaction[];
  settings: Settings;
}
