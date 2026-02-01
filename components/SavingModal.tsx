
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SAVING_ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '💍', '🍼', '🎓', '🏥', '🎁', '📱', '🚲'];

const SavingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addSaving } = useFinance();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;

    addSaving({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline,
      icon
    });
    
    // Reset
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800">Mục tiêu tiết kiệm</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Từng bước thực hiện ước mơ</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {SAVING_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${
                    icon === i ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tên mục tiêu</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
              placeholder="Ví dụ: Mua điện thoại mới"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Số tiền mục tiêu</label>
              <input
                type="number"
                required
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Đã có sẵn</label>
              <input
                type="number"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Ngày kết thúc dự kiến</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-indigo-100 text-sm uppercase tracking-widest mt-4"
          >
            Tạo mục tiêu
          </button>
        </form>
      </div>
    </div>
  );
};

export default SavingModal;
