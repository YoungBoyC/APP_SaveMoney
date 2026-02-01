
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import { TransactionType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TransactionModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addTransaction, wallets } = useFinance();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Luôn phải render các Hook ở trên cùng, sau đó mới kiểm tra isOpen
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !walletId) return;

    addTransaction({
      amount: parseFloat(amount),
      type,
      categoryId,
      walletId,
      date,
      note
    });
    onClose();
    // Reset form
    setAmount('');
    setNote('');
  };

  const filteredCategories = CATEGORIES.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Thêm giao dịch mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selector */}
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${type === 'EXPENSE' ? 'bg-white shadow-md text-red-600' : 'text-gray-500'}`}
            >
              Chi tiêu
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${type === 'INCOME' ? 'bg-white shadow-md text-green-600' : 'text-gray-500'}`}
            >
              Thu nhập
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số tiền (VNĐ)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-bold"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hạng mục</label>
              <select
                required
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
              >
                <option value="">Chọn hạng mục</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ví sử dụng</label>
              <select
                required
                value={walletId}
                onChange={e => setWalletId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày thực hiện</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
              />  
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ghi chú</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Mua đồ ăn sáng, đổ xăng..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none min-h-[80px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all transform active:scale-95 shadow-xl shadow-indigo-100"
          >
            Lưu giao dịch
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
