import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, ArrowUpRight, ArrowDownRight, User, Calendar, Plus, ChevronRight, TrendingUp, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface Loan {
  id: string;
  person: string;
  amount: number;
  type: 'LENT' | 'BORROWED';
  dueDate: string;
  interestRate: number;
  status: 'ACTIVE' | 'PAID';
}

const Loans: React.FC = () => {
  const { currency } = useFinance();
  const [loans, setLoans] = useState<Loan[]>([
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
    person: '',
    amount: '',
    type: 'LENT' as 'LENT' | 'BORROWED',
    dueDate: '',
    interestRate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PAID'
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(val);
  };

  const handleDelete = (id: string) => {
    setLoans(loans.filter(l => l.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.person || !newLoan.amount || !newLoan.dueDate) return;

    const loan: Loan = {
      id: Date.now().toString(),
      person: newLoan.person,
      amount: Number(newLoan.amount),
      type: newLoan.type,
      dueDate: newLoan.dueDate,
      interestRate: Number(newLoan.interestRate) || 0,
      status: newLoan.status
    };

    setLoans([...loans, loan]);
    setIsModalOpen(false);
    setNewLoan({ person: '', amount: '', type: 'LENT', dueDate: '', interestRate: '', status: 'ACTIVE' });
  };

  const totalLent = loans.filter(l => l.type === 'LENT' && l.status === 'ACTIVE').reduce((a, b) => a + b.amount, 0);
  const totalBorrowed = loans.filter(l => l.type === 'BORROWED' && l.status === 'ACTIVE').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24 md:pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Vay & Nợ 🏦</h2>
          <p className="text-gray-500 font-medium">Theo dõi các khoản vay mượn của bạn.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <ArrowUpRight size={20} strokeWidth={3} />
              <p className="text-[10px] font-black uppercase tracking-widest">Cho vay (Tôi được nợ)</p>
            </div>
            <p className="text-3xl font-black text-emerald-700">{formatCurrency(totalLent)}</p>
          </div>
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-500 shadow-sm">
            <User size={32} />
          </div>
        </div>
        <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-600">
              <ArrowDownRight size={20} strokeWidth={3} />
              <p className="text-[10px] font-black uppercase tracking-widest">Đi vay (Tôi nợ người khác)</p>
            </div>
            <p className="text-3xl font-black text-rose-700">{formatCurrency(totalBorrowed)}</p>
          </div>
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-rose-500 shadow-sm">
            <Landmark size={32} />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" />
          Chi tiết các khoản vay
        </h3>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {loans.map((loan) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
                key={loan.id} 
                className="p-6 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    loan.type === 'LENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {loan.type === 'LENT' ? '📈' : '📉'}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">{loan.person}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} />
                        Hạn: {loan.dueDate}
                      </div>
                      {loan.interestRate > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                          Lãi suất: {loan.interestRate}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={`text-lg font-black ${loan.type === 'LENT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {loan.type === 'LENT' ? '+' : '-'}{formatCurrency(loan.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        loan.status === 'PAID' ? 'text-gray-400 line-through' : 'text-indigo-600'
                      }`}>
                        {loan.status === 'PAID' ? 'Đã thanh toán' : 'Đang hoạt động'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(loan.id);
                    }}
                    className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
            {loans.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Không có khoản vay nào</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-indigo-600 text-white flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Thêm khoản vay mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đối tượng</label>
                  <input 
                    type="text" 
                    required
                    value={newLoan.person}
                    onChange={e => setNewLoan({...newLoan, person: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                    placeholder="VD: Anh Tuấn, Ngân hàng..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền (VND)</label>
                    <input 
                      type="number" 
                      required
                      value={newLoan.amount}
                      onChange={e => setNewLoan({...newLoan, amount: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại</label>
                    <select 
                      value={newLoan.type}
                      onChange={e => setNewLoan({...newLoan, type: e.target.value as 'LENT' | 'BORROWED'})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all appearance-none"
                    >
                      <option value="LENT">Cho vay</option>
                      <option value="BORROWED">Đi vay</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hạn thanh toán</label>
                    <input 
                      type="date" 
                      required
                      value={newLoan.dueDate}
                      onChange={e => setNewLoan({...newLoan, dueDate: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lãi suất (%)</label>
                    <input 
                      type="number" 
                      value={newLoan.interestRate}
                      onChange={e => setNewLoan({...newLoan, interestRate: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Lưu khoản vay
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Loans;
