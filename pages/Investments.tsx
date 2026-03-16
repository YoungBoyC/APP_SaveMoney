import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, PieChart, Plus, ChevronRight, ArrowUpRight, ArrowDownRight, Activity, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface Investment {
  id: string;
  name: string;
  amount: number;
  currentValue: number;
  type: 'STOCK' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE';
  change: number;
}

const Investments: React.FC = () => {
  const { currency } = useFinance();
  const [investments, setInvestments] = useState<Investment[]>([
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    amount: '',
    currentValue: '',
    type: 'STOCK' as 'STOCK' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE'
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(val);
  };

  const handleDelete = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvestment.name || !newInvestment.amount || !newInvestment.currentValue) return;

    const amount = Number(newInvestment.amount);
    const currentValue = Number(newInvestment.currentValue);
    const change = Number(((currentValue - amount) / amount * 100).toFixed(1));

    const investment: Investment = {
      id: Date.now().toString(),
      name: newInvestment.name,
      amount,
      currentValue,
      type: newInvestment.type,
      change
    };

    setInvestments([...investments, investment]);
    setIsModalOpen(false);
    setNewInvestment({ name: '', amount: '', currentValue: '', type: 'STOCK' });
  };

  const totalInvested = investments.reduce((a, b) => a + b.amount, 0);
  const totalCurrentValue = investments.reduce((a, b) => a + b.currentValue, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const totalProfitPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : '0';

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24 md:pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Đầu tư 📈</h2>
          <p className="text-gray-500 font-medium">Theo dõi danh mục đầu tư và lợi nhuận của bạn.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Activity size={20} />
              <p className="text-[10px] font-black uppercase tracking-widest">Tổng giá trị danh mục</p>
            </div>
            <p className="text-5xl font-black">{formatCurrency(totalCurrentValue)}</p>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${totalProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {totalProfit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {totalProfit >= 0 ? '+' : ''}{totalProfitPercentage}% ({formatCurrency(totalProfit)})
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kể từ khi bắt đầu</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
              <PieChart size={48} className="text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <Activity size={20} className="text-indigo-600" />
          Danh mục tài sản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {investments.map((inv) => (
            <motion.div 
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ y: -5 }}
              key={inv.id} 
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                  inv.type === 'STOCK' ? 'bg-blue-50 text-blue-600' : 
                  inv.type === 'CRYPTO' ? 'bg-orange-50 text-orange-600' : 
                  inv.type === 'GOLD' ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {inv.type === 'STOCK' ? '📊' : inv.type === 'CRYPTO' ? '₿' : inv.type === 'GOLD' ? '🏆' : '🏢'}
                </div>
                <div>
                  <h4 className="font-black text-gray-900">{inv.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vốn: {formatCurrency(inv.amount)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">{formatCurrency(inv.currentValue)}</p>
                  <div className={`flex items-center justify-end gap-1 text-[10px] font-black uppercase tracking-widest ${inv.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {inv.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {inv.change >= 0 ? '+' : ''}{inv.change}%
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(inv.id);
                  }}
                  className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
          {investments.length === 0 && (
            <div className="col-span-full p-12 text-center bg-white rounded-[2.5rem] border border-gray-100">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Không có danh mục đầu tư nào</p>
            </div>
          )}
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
                <h3 className="text-xl font-black uppercase tracking-tight">Thêm đầu tư mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên tài sản</label>
                  <input 
                    type="text" 
                    required
                    value={newInvestment.name}
                    onChange={e => setNewInvestment({...newInvestment, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                    placeholder="VD: Cổ phiếu Vingroup, Bitcoin..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vốn đầu tư (VND)</label>
                    <input 
                      type="number" 
                      required
                      value={newInvestment.amount}
                      onChange={e => setNewInvestment({...newInvestment, amount: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá trị hiện tại (VND)</label>
                    <input 
                      type="number" 
                      required
                      value={newInvestment.currentValue}
                      onChange={e => setNewInvestment({...newInvestment, currentValue: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại tài sản</label>
                  <select 
                    value={newInvestment.type}
                    onChange={e => setNewInvestment({...newInvestment, type: e.target.value as any})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all appearance-none"
                  >
                    <option value="STOCK">Cổ phiếu</option>
                    <option value="CRYPTO">Tiền điện tử</option>
                    <option value="GOLD">Vàng</option>
                    <option value="REAL_ESTATE">Bất động sản</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Lưu đầu tư
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Investments;
