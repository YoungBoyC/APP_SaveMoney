
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import SavingModal from '../components/SavingModal';

const Savings: React.FC = () => {
  const { savings, updateSaving, deleteSaving } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState<{[key: string]: string}>({});

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleAddMoney = (id: string) => {
    const amount = parseFloat(contributionAmount[id] || '0');
    if (amount <= 0) return;
    updateSaving(id, amount);
    setContributionAmount(prev => ({ ...prev, [id]: '' }));
  };

  const calculateDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tiết kiệm & Mục tiêu</h2>
          <p className="text-gray-500 mt-1">Quản lý các khoản tích lũy cho những dự định tương lai.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Mục tiêu mới
        </button>
      </header>

      {savings.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mb-6">🎯</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Hãy bắt đầu tiết kiệm ngay hôm nay</h3>
          <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
            Bạn muốn đi du lịch? Mua máy tính mới? Hay đơn giản là quỹ dự phòng? Hãy tạo mục tiêu để theo dõi tiến độ mỗi ngày.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all"
          >
            Thêm mục tiêu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savings.map(saving => {
            const progress = Math.min(100, (saving.currentAmount / saving.targetAmount) * 100);
            const daysLeft = calculateDaysLeft(saving.deadline);
            
            return (
              <div key={saving.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                    {saving.icon}
                  </div>
                  <button 
                    onClick={() => deleteSaving(saving.id)}
                    className="p-2 text-gray-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    🗑️
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-gray-900 leading-tight">{saving.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${daysLeft < 7 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                         {daysLeft} NGÀY CÒN LẠI
                       </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                      <span>Tiến độ: {Math.round(progress)}%</span>
                      <span>Mục tiêu: {formatCurrency(saving.targetAmount)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-lg font-black text-indigo-600">{formatCurrency(saving.currentAmount)}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-50">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Đóng góp thêm</p>
                     <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Số tiền..."
                          value={contributionAmount[saving.id] || ''}
                          onChange={e => setContributionAmount(prev => ({ ...prev, [saving.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm font-bold focus:border-indigo-500 transition-all"
                        />
                        <button
                          onClick={() => handleAddMoney(saving.id)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors"
                        >
                          Nạp
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SavingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Savings;
