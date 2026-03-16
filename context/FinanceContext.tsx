import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Transaction, Wallet, Budget, SavingGoal, 
  Bill, Loan, Investment, SpendingGroup 
} from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  savings: SavingGoal[];
  bills: Bill[];
  loans: Loan[];
  investments: Investment[];
  groups: SpendingGroup[];
  currency: string;
  setCurrency: (c: string) => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addWallet: (w: Omit<Wallet, 'id'>) => void;
  deleteWallet: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  addSaving: (s: Omit<SavingGoal, 'id'>) => void;
  deleteSaving: (id: string) => void;
  updateSaving: (id: string, amount: number) => void;
  addBill: (b: Omit<Bill, 'id'>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;
  addLoan: (l: Omit<Loan, 'id'>) => void;
  deleteLoan: (id: string) => void;
  addInvestment: (i: Omit<Investment, 'id'>) => void;
  deleteInvestment: (id: string) => void;
  addGroup: (g: Omit<SpendingGroup, 'id'>) => void;
  deleteGroup: (id: string) => void;
  totalBalance: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'w1', name: 'Tiền mặt', balance: 0, type: 'CASH', icon: '💵' },
    { id: 'w2', name: 'Ngân hàng', balance: 0, type: 'BANK', icon: '🏦' }
  ]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savings, setSavings] = useState<SavingGoal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [groups, setGroups] = useState<SpendingGroup[]>([]);
  const [currency, setCurrency] = useState('VND');

  useEffect(() => {
    const loadData = (key: string) => localStorage.getItem(key);
    const savedTransactions = loadData('mc_transactions');
    const savedWallets = loadData('mc_wallets');
    const savedBudgets = loadData('mc_budgets');
    const savedSavings = loadData('mc_savings');
    const savedBills = loadData('mc_bills');
    const savedLoans = loadData('mc_loans');
    const savedInvestments = loadData('mc_investments');
    const savedGroups = loadData('mc_groups');
    const savedCurrency = loadData('mc_currency');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedWallets) setWallets(JSON.parse(savedWallets));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedSavings) setSavings(JSON.parse(savedSavings));
    if (savedBills) setBills(JSON.parse(savedBills));
    if (savedLoans) setLoans(JSON.parse(savedLoans));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  useEffect(() => {
    const saveData = (key: string, data: unknown) => localStorage.setItem(key, JSON.stringify(data));
    saveData('mc_transactions', transactions);
    saveData('mc_wallets', wallets);
    saveData('mc_budgets', budgets);
    saveData('mc_savings', savings);
    saveData('mc_bills', bills);
    saveData('mc_loans', loans);
    saveData('mc_investments', investments);
    saveData('mc_groups', groups);
    localStorage.setItem('mc_currency', currency);
  }, [transactions, wallets, budgets, savings, bills, loans, investments, groups, currency]);

  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    setTransactions(prev => [{ ...t, id }, ...prev]);
    setWallets(prev => prev.map(w => w.id === t.walletId ? {
      ...w, balance: t.type === 'INCOME' ? w.balance + t.amount : w.balance - t.amount
    } : w));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const item = prev.find(x => x.id === id);
      if (item) {
        setWallets(wPrev => wPrev.map(w => w.id === item.walletId ? {
          ...w, balance: item.type === 'INCOME' ? w.balance - item.amount : w.balance + item.amount
        } : w));
      }
      return prev.filter(x => x.id !== id);
    });
  }, []);

  const addWallet = (w: Omit<Wallet, 'id'>) => setWallets(prev => [...prev, { ...w, id: Math.random().toString(36).substring(2, 11) }]);
  const deleteWallet = (id: string) => setWallets(prev => prev.filter(w => w.id !== id));
  const addBudget = (b: Omit<Budget, 'id'>) => setBudgets(prev => [...prev, { ...b, id: Math.random().toString(36).substring(2, 11) }]);
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));
  const addSaving = (s: Omit<SavingGoal, 'id'>) => setSavings(prev => [...prev, { ...s, id: Math.random().toString(36).substring(2, 11) }]);
  const deleteSaving = (id: string) => setSavings(prev => prev.filter(s => s.id !== id));
  const updateSaving = (id: string, amount: number) => setSavings(prev => prev.map(s => s.id === id ? { ...s, currentAmount: s.currentAmount + amount } : s));
  const addBill = (b: Omit<Bill, 'id'>) => setBills(prev => [{ ...b, id: Math.random().toString(36).substring(2, 11) }, ...prev]);
  const deleteBill = (id: string) => setBills(prev => prev.filter(b => b.id !== id));
  const toggleBillPaid = (id: string) => setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b));
  const addLoan = (l: Omit<Loan, 'id'>) => setLoans(prev => [{ ...l, id: Math.random().toString(36).substring(2, 11) }, ...prev]);
  const deleteLoan = (id: string) => setLoans(prev => prev.filter(l => l.id !== id));
  const addInvestment = (i: Omit<Investment, 'id'>) => setInvestments(prev => [{ ...i, id: Math.random().toString(36).substring(2, 11) }, ...prev]);
  const deleteInvestment = (id: string) => setInvestments(prev => prev.filter(i => i.id !== id));
  const addGroup = (g: Omit<SpendingGroup, 'id'>) => setGroups(prev => [{ ...g, id: Math.random().toString(36).substring(2, 11) }, ...prev]);
  const deleteGroup = (id: string) => setGroups(prev => prev.filter(g => g.id !== id));

  return (
    <FinanceContext.Provider value={{
      transactions, wallets, budgets, savings, bills, loans, investments, groups, currency, setCurrency,
      addTransaction, deleteTransaction, addWallet, deleteWallet, addBudget, deleteBudget, addSaving, deleteSaving, updateSaving,
      addBill, deleteBill, toggleBillPaid, addLoan, deleteLoan, addInvestment, deleteInvestment, addGroup, deleteGroup,
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
