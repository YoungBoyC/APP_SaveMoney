
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import WalletModal from '../components/WalletModal';

const Wallets: React.FC = () => {
  const { wallets, totalBalance, deleteWallet } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ví của tôi</h2>
          <p className="text-gray-500 mt-1">Quản lý các nguồn tiền của bạn một cách tập trung.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Thêm ví mới
        </button>
      </header>

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-indigo-100 font-medium opacity-80 uppercase tracking-widest text-xs mb-1">Tổng tài sản</p>
          <h3 className="text-4xl font-black">{formatCurrency(totalBalance)}</h3>
          <div className="mt-8 flex gap-4">
             <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/20">
               {wallets.length} Tài khoản
             </div>
             <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/20">
               Sẵn dùng: {formatCurrency(totalBalance)}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map(wallet => (
          <div key={wallet.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                {wallet.icon}
              </div>
              <button 
                onClick={() => deleteWallet(wallet.id)}
                className="text-gray-300 hover:text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                🗑️
              </button>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {wallet.type === 'CASH' ? 'Tiền mặt' : wallet.type === 'BANK' ? 'Ngân hàng' : 'Ví điện tử'}
              </p>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{wallet.name}</h4>
              <p className="text-2xl font-black text-indigo-600">{formatCurrency(wallet.balance)}</p>
            </div>
            
            <div className="absolute -bottom-2 -right-2 text-6xl opacity-[0.03] font-black group-hover:scale-110 transition-transform">
              {wallet.icon}
            </div>
          </div>
        ))}

        <button
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            +
          </div>
          <span className="font-bold text-sm">Thêm nguồn tiền mới</span>
        </button>
      </div>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Wallets;
