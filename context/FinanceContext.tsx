
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, Wallet, Budget, SavingGoal } from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  savings: SavingGoal[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addWallet: (w: Omit<Wallet, 'id'>) => void;
  deleteWallet: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  addSaving: (s: Omit<SavingGoal, 'id'>) => void;
  deleteSaving: (id: string) => void;
  updateSaving: (id: string, amount: number) => void;
  totalBalance: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'w1', name: 'Tiền mặt', balance: 0, type: 'CASH', icon: '💵' },
    { id: 'w2', name: 'Vietcombank', balance: 0, type: 'BANK', icon: '🏦' }
  ]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<SavingGoal[]>([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('mc_transactions');
    const savedWallets = localStorage.getItem('mc_wallets');
    const savedBudgets = localStorage.getItem('mc_budgets');
    const savedSavings = localStorage.getItem('mc_savings');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedWallets) setWallets(JSON.parse(savedWallets));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedSavings) setSavings(JSON.parse(savedSavings));
  }, []);

  useEffect(() => {
    localStorage.setItem('mc_transactions', JSON.stringify(transactions));
    localStorage.setItem('mc_wallets', JSON.stringify(wallets));
    localStorage.setItem('mc_budgets', JSON.stringify(budgets));
    localStorage.setItem('mc_savings', JSON.stringify(savings));
  }, [transactions, wallets, budgets, savings]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTransaction = { ...t, id: newId };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    setWallets(prev => prev.map(w => {
      if (w.id === t.walletId) {
        return {
          ...w,
          balance: t.type === 'INCOME' ? w.balance + t.amount : w.balance - t.amount
        };
      }
      return w;
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    setTransactions(prev => prev.filter(t => t.id !== id));
    
    setWallets(prev => prev.map(w => {
      if (w.id === transaction.walletId) {
        return {
          ...w,
          balance: transaction.type === 'INCOME' ? w.balance - transaction.amount : w.balance + transaction.amount
        };
      }
      return w;
    }));
  }, [transactions]);

  const addWallet = (w: Omit<Wallet, 'id'>) => {
    setWallets(prev => [...prev, { ...w, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const deleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      alert("Bạn phải có ít nhất một tài khoản ví!");
      return;
    }
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    const exists = budgets.find(ex => ex.categoryId === b.categoryId && ex.period === b.period);
    if (exists) {
        alert("Ngân sách cho hạng mục này đã tồn tại!");
        return;
    }
    setBudgets(prev => [...prev, { ...b, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addSaving = (s: Omit<SavingGoal, 'id'>) => {
    setSavings(prev => [...prev, { ...s, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const deleteSaving = (id: string) => {
    setSavings(prev => prev.filter(s => s.id !== id));
  };

  const updateSaving = (id: string, amount: number) => {
    setSavings(prev => prev.map(s => s.id === id ? { ...s, currentAmount: Math.max(0, s.currentAmount + amount) } : s));
  };

  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <FinanceContext.Provider value={{
      transactions, wallets, budgets, savings,
      addTransaction, deleteTransaction, addWallet, deleteWallet, addBudget, deleteBudget, addSaving, deleteSaving, updateSaving,
      totalBalance
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
