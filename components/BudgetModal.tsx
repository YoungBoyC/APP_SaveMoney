
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const BudgetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addBudget } = useFinance();
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !limit) return;

    addBudget({
      categoryId,
      limit: parseFloat(limit),
      period
    });
    
    setCategoryId('');
    setLimit('');
    onClose();
  };

  const expenseCategories = CATEGORIES.filter(c => c.type === 'EXPENSE');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800">Thiết lập ngân sách</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Kiểm soát chi tiêu thông minh</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Hạng mục chi tiêu</label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {expenseCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                    categoryId === cat.id 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' 
                    : 'border-gray-50 bg-white text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-[9px] font-bold text-center leading-tight truncate w-full">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Hạn mức chi tiêu (VNĐ)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">₫</span>
              <input
                type="number"
                required
                value={limit}
                onChange={e => setLimit(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-2xl font-black text-gray-800 transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Chu kỳ</label>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {(['WEEKLY', 'MONTHLY', 'YEARLY'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'
                  }`}
                >
                  {p === 'WEEKLY' ? 'Tuần' : p === 'MONTHLY' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs"
            >
              Lưu ngân sách
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BudgetModal;
