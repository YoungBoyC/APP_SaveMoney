import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Wallets from './pages/Wallets';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import Bills from './pages/Bill';
import Loans from './pages/Loans';
import Investments from './pages/Investments';
import Groups from './pages/Groups';
import TransactionModal from './components/TransactionModal';
import ChatBot from './components/ChatBot';
import Comparison from './pages/Comparison';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <FinanceProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          
          <main className="flex-1 pb-24 md:pb-8 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/comparison" element={<Comparison />} />            
            </Routes>
            {/* Global Add Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-300 flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </main>

          <BottomNav />

          <TransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />

          <ChatBot />
        </div>
      </BrowserRouter>
    </FinanceProvider>
  );
};

export default App;
