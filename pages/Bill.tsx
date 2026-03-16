import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, AlertCircle, Plus, FileText, ChevronRight, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
}

const Bills: React.FC = () => {
  const { currency } = useFinance();
  const [bills, setBills] = useState<Bill[]>([
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'Tiện ích',
    status: 'UNPAID' as const
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(val);
  };

  const handleDelete = (id: string) => {
    setBills(bills.filter(b => b.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.name || !newBill.amount || !newBill.dueDate) return;

    const bill: Bill = {
      id: Date.now().toString(),
      name: newBill.name,
      amount: Number(newBill.amount),
      dueDate: newBill.dueDate,
      category: newBill.category,
      status: newBill.status
    };

    setBills([...bills, bill]);
    setIsModalOpen(false);
    setNewBill({ name: '', amount: '', dueDate: '', category: 'Tiện ích', status: 'UNPAID' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'UNPAID': return <Clock className="text-orange-500" size={18} />;
      case 'OVERDUE': return <AlertCircle className="text-rose-500" size={18} />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'UNPAID': return 'Chưa thanh toán';
      case 'OVERDUE': return 'Quá hạn';
      default: return '';
    }
  };

  const upcomingCount = bills.filter(b => b.status === 'UNPAID').length;
  const overdueCount = bills.filter(b => b.status === 'OVERDUE').length;
  const totalThisMonth = bills.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24 md:pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Hóa đơn 🧾</h2>
          <p className="text-gray-500 font-medium">Quản lý các khoản chi phí định kỳ của bạn.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sắp tới hạn</p>
            <p className="text-xl font-black text-gray-900">{upcomingCount} Hóa đơn</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quá hạn</p>
            <p className="text-xl font-black text-gray-900">{overdueCount} Hóa đơn</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tháng này</p>
            <p className="text-xl font-black text-gray-900">{formatCurrency(totalThisMonth)}</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Danh sách hóa đơn</h3>
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {bills.map((bill) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
                key={bill.id} 
                className="p-6 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 
                    bill.status === 'OVERDUE' ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {bill.category === 'Tiện ích' ? '⚡' : bill.category === 'Dịch vụ' ? '🌐' : bill.category === 'Giải trí' ? '🎬' : '🏠'}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">{bill.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} />
                        Hạn: {bill.dueDate}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {bill.category}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900">{formatCurrency(bill.amount)}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      {getStatusIcon(bill.status)}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        bill.status === 'PAID' ? 'text-emerald-600' : 
                        bill.status === 'OVERDUE' ? 'text-rose-600' : 'text-orange-500'
                      }`}>
                        {getStatusText(bill.status)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bill.id);
                    }}
                    className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
            {bills.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Không có hóa đơn nào</p>
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
                <h3 className="text-xl font-black uppercase tracking-tight">Thêm hóa đơn mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên hóa đơn</label>
                  <input 
                    type="text" 
                    required
                    value={newBill.name}
                    onChange={e => setNewBill({...newBill, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                    placeholder="VD: Tiền điện tháng 4"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền (VND)</label>
                    <input 
                      type="number" 
                      required
                      value={newBill.amount}
                      onChange={e => setNewBill({...newBill, amount: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày hết hạn</label>
                    <input 
                      type="date" 
                      required
                      value={newBill.dueDate}
                      onChange={e => setNewBill({...newBill, dueDate: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh mục</label>
                  <select 
                    value={newBill.category}
                    onChange={e => setNewBill({...newBill, category: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all appearance-none"
                  >
                    <option value="Tiện ích">Tiện ích</option>
                    <option value="Dịch vụ">Dịch vụ</option>
                    <option value="Giải trí">Giải trí</option>
                    <option value="Nhà ở">Nhà ở</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Lưu hóa đơn
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bills;
