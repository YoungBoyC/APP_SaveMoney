
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'CASH' | 'BANK' | 'E-WALLET';
  icon: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  date: string;
  note: string;
  image?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}
