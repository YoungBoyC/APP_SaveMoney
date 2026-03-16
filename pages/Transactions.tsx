
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';

const Transactions: React.FC = () => {
  const { transactions, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const filtered = transactions.filter(t => {
    const category = CATEGORIES.find(c => c.id === t.categoryId);
    const matchesSearch = category?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.note.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-gray-900">Sổ Giao Dịch</h2>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border shadow-sm">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {type === 'ALL' ? 'Tất cả' : type === 'INCOME' ? 'Khoản thu' : 'Khoản chi'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <input
            type="text"
            placeholder="Tìm kiếm giao dịch hoặc ghi chú..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Hạng mục</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ghi chú</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Số tiền</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => {
                const category = CATEGORIES.find(c => c.id === t.categoryId);
                return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg ${category?.color} flex items-center justify-center text-lg`}>
                          {category?.icon}
                        </span>
                        <span className="font-bold text-gray-700">{category?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-[200px] truncate italic text-gray-500 text-sm">
                      {t.note || 'Không có ghi chú'}
                    </td>
                    <td className={`px-6 py-5 text-right font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Xóa giao dịch"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <span className="text-5xl">🕵️‍♂️</span>
                      <p className="font-medium italic">Không tìm thấy giao dịch nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
