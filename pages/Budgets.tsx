
import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import BudgetModal from '../components/BudgetModal';

const Budgets: React.FC = () => {
  const { budgets, transactions, deleteBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const budgetStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets.map(budget => {
      const category = CATEGORIES.find(c => c.id === budget.categoryId);
      
      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return (
            t.categoryId === budget.categoryId &&
            t.type === 'EXPENSE' &&
            tDate.getMonth() === currentMonth &&
            tDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = Math.min(100, (spent / budget.limit) * 100);
      const remaining = budget.limit - spent;

      return {
        ...budget,
        category,
        spent,
        percent,
        remaining
      };
    });
  }, [budgets, transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Ngân sách chi tiêu</h2>
          <p className="text-gray-500 mt-1">Lập kế hoạch để tiết kiệm nhiều hơn mỗi tháng.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Tạo ngân sách
        </button>
      </header>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6">📉</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có ngân sách nào</h3>
          <p className="text-gray-400 max-w-xs mx-auto text-sm">Hãy thiết lập hạn mức cho các hạng mục như Ăn uống, Mua sắm để không bị "vung tay quá trán".</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 text-indigo-600 font-bold hover:underline"
          >
            Bắt đầu thiết lập ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetStats.map(stat => (
            <div key={stat.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.category?.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                    {stat.category?.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{stat.category?.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hàng tháng</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteBudget(stat.id)}
                  className="p-2 text-gray-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tight">Đã chi</p>
                    <p className="text-2xl font-black text-gray-900">{formatCurrency(stat.spent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-tight">Hạn mức</p>
                    <p className="text-lg font-bold text-gray-500">{formatCurrency(stat.limit)}</p>
                  </div>
                </div>

                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      stat.percent > 90 ? 'bg-rose-500' : stat.percent > 70 ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stat.percent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-sm">
                   <p className="text-gray-500 font-medium">
                     {stat.remaining > 0 
                       ? `Còn lại: ${formatCurrency(stat.remaining)}` 
                       : `Vượt mức: ${formatCurrency(Math.abs(stat.remaining))}`
                     }
                   </p>
                   <p className={`font-black ${stat.percent > 90 ? 'text-rose-600' : 'text-gray-400'}`}>
                     {Math.round(stat.percent)}%
                   </p>
                </div>

                {stat.percent > 100 && (
                  <div className="mt-4 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <span>⚠️</span>
                    Bạn đã chi tiêu vượt quá kế hoạch!
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Budgets;
