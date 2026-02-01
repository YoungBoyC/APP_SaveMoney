import React, { useState } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Wallets from './pages/Wallets';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import TransactionModal from './components/TransactionModal';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <FinanceProvider>
      <MemoryRouter>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          
          <main className="flex-1 pb-28 md:pb-6 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/savings" element={<Savings />} />
            </Routes>

            <button
              onClick={() => setIsModalOpen(true)}
              className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-300 flex items-center justify-center text-3xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
            >
              +
            </button>
          </main>

          <BottomNav />

          <TransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        </div>
      </MemoryRouter>
    </FinanceProvider>
  );
};

export default App;