import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FileDown, ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import { Transaction } from '../types';
import JobSuggestions from '../components/JobSuggestions';

const Dashboard: React.FC = () => {
  const { totalBalance, transactions, currency } = useFinance();
  const navigate = useNavigate();
  const now = new Date();
  const thisYear = now.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthsWithData = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      months.add(`${d.getMonth()}-${d.getFullYear()}`);
    });
    return months;
  }, [transactions]);

  const filterByMonth = (txs: Transaction[], month: number, year: number) => {
    return txs.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const currentViewTxs = filterByMonth(transactions, selectedMonth, selectedYear);

  const expenses = currentViewTxs.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
  const income = currentViewTxs.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const expenseByCategory = currentViewTxs
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc: Record<string, { name: string; value: number; color: string }>, t) => {
      const cat = CATEGORIES.find(c => c.id === t.categoryId);
      const name = cat?.name || 'Khác';
      if (!acc[name]) {
        acc[name] = { name, value: 0, color: cat?.color || 'bg-gray-500' };
      }
      acc[name].value += t.amount;
      return acc;
    }, {});

  const pieData = Object.values(expenseByCategory);

  const getHexColor = (twClass: string) => {
    const map: Record<string, string> = {
      'bg-orange-500': '#f97316',
      'bg-blue-500': '#3b82f6',
      'bg-pink-500': '#ec4899',
      'bg-green-500': '#22c55e',
      'bg-purple-500': '#a855f7',
      'bg-red-500': '#ef4444',
      'bg-indigo-500': '#6366f1',
      'bg-emerald-600': '#059669',
      'bg-yellow-500': '#eab308',
      'bg-rose-500': '#f43f5e',
      'bg-gray-500': '#6b7280',
    };
    return map[twClass] || '#6b7280';
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(val);
  };

  const exportToCSV = () => {
    const headers = ['Ngày', 'Loại', 'Hạng mục', 'Số tiền', 'Ghi chú'];
    const data = transactions.map(t => [
      t.date,
      t.type === 'INCOME' ? 'Thu' : 'Chi',
      CATEGORIES.find(c => c.id === t.categoryId)?.name || 'Khác',
      t.amount,
      t.note
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers, ...data].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_Cao_Tai_Chinh_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Thịnh vượng hơn mỗi ngày 🚀</h2>
          <p className="text-gray-500 font-medium">Bạn đã tiết kiệm được {formatCurrency(income - expenses)} trong {monthNames[selectedMonth]} {selectedYear}.</p>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center gap-3 max-w-md"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <p className="text-[11px] font-bold text-indigo-900 leading-tight">
              <span className="font-black">AI Tip:</span> Bạn có thể kiếm thêm thu nhập bằng cách làm Freelance hoặc Affiliate. Xem các gợi ý bên dưới!
            </p>
          </motion.div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chọn thời gian</span>
            <div className="flex gap-2">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i}>
                    {name} {monthsWithData.has(`${i}-${selectedYear}`) ? '•' : ''}
                  </option>
                ))}
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                {[thisYear - 1, thisYear, thisYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={exportToCSV} className="p-3 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-600 hover:border-indigo-600 transition-all flex items-center gap-2 h-[40px]">
            <FileDown size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm col-span-1 lg:col-span-2 space-y-8">
           <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieData.length > 0 ? pieData : [{ name: 'Trống', value: 1, color: 'bg-gray-100' }]} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getHexColor(entry.color)} />
                        ))}
                        {pieData.length === 0 && <Cell fill="#f3f4f6" />}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số dư khả dụng</p>
                    <p className="text-4xl font-black text-gray-900">{formatCurrency(totalBalance)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <ArrowUpRight size={14} strokeWidth={3} />
                        <p className="text-[10px] font-bold uppercase">Tổng thu</p>
                      </div>
                      <p className="font-black text-emerald-700">{formatCurrency(income)}</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <div className="flex items-center gap-2 text-rose-600 mb-1">
                        <ArrowDownRight size={14} strokeWidth={3} />
                        <p className="text-[10px] font-bold uppercase">Tổng chi</p>
                      </div>
                      <p className="font-black text-rose-700">{formatCurrency(expenses)}</p>
                    </div>
                  </div>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
              {pieData.map((item, i) => {
                const percentage = expenses > 0 ? ((item.value / expenses) * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-600 truncate">{item.name}</span>
                      <span className="text-[10px] font-black text-indigo-500">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl shadow-gray-200 overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
           <div>
             <div className="flex items-center gap-2 mb-2">
               <Sparkles className="text-indigo-400" size={20} />
               <h4 className="text-xl font-black italic">SaveMoney Pro</h4>
             </div>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: MC-888-999</p>
           </div>
           
           <div className="mt-20">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-2">Hạng mức tài chính</p>
             <div className="flex items-center gap-3">
               <div className="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                 <div className="bg-indigo-500 h-full w-3/4 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
               </div>
               <span className="text-sm font-black text-indigo-400">GOLD</span>
             </div>
           </div>
        </div>
      </div>

      <JobSuggestions />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Giao dịch gần đây
          </h3>
          <button onClick={() => navigate('/transactions')} className="text-xs font-bold text-indigo-600 hover:underline">Xem tất cả</button>
        </div>
        
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {currentViewTxs.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {currentViewTxs.slice(0, 5).map((t) => {
                const cat = CATEGORIES.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${cat?.color || 'bg-gray-100'} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                        {cat?.icon || '❓'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{cat?.name || 'Khác'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[10px] text-gray-400 italic truncate max-w-[150px]">{t.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto">📭</div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Không có giao dịch nào</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
