export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  date: string;
  note: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'CASH' | 'BANK' | 'E-WALLET';
  icon: string;
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

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
}

export interface Loan {
  id: string;
  person: string;
  amount: number;
  type: 'BORROW' | 'LEND';
  dueDate: string;
  note: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  currentValue: number;
  type: 'STOCK' | 'GOLD' | 'CRYPTO' | 'REAL_ESTATE';
}

export interface SpendingGroup {
  id: string;
  name: string;
  members: string[];
  totalSpent: number;
}
