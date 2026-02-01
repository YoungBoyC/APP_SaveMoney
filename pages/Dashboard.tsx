
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const { totalBalance, transactions } = useFinance();

  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Chart data for expenses by category
  const expenseData = CATEGORIES
    .filter(c => c.type === 'EXPENSE')
    .map(c => ({
      name: c.name,
      value: transactions
        .filter(t => t.categoryId === c.id)
        .reduce((acc, curr) => acc + curr.amount, 0),
      color: c.color.replace('bg-', '')
    }))
    .filter(d => d.value > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Chào bạn trở lại! 👋</h2>
          <p className="text-gray-500 mt-1">Cùng xem tình hình tài chính của bạn hôm nay nhé.</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 text-2xl">💰</div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng số dư</p>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-emerald-100">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <p className="text-emerald-100 font-medium mb-1">Tổng Thu Nhập</p>
          <h3 className="text-3xl font-black mb-6">{formatCurrency(income)}</h3>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 inline-flex items-center gap-2 text-sm">
            <span className="text-lg">📈</span>
            Tháng này
          </div>
        </div>

        <div className="bg-rose-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-rose-100">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <p className="text-rose-100 font-medium mb-1">Tổng Chi Tiêu</p>
          <h3 className="text-3xl font-black mb-6">{formatCurrency(expenses)}</h3>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 inline-flex items-center gap-2 text-sm">
            <span className="text-lg">📉</span>
            Tháng này
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white lg:col-span-1 md:col-span-2 shadow-xl shadow-gray-200">
          <p className="text-gray-400 font-medium mb-1">Tỷ lệ Tiết kiệm</p>
          <h3 className="text-3xl font-black mb-6">
            {income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}%
          </h3>
          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
            <div 
              className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" 
              style={{ width: `${income > 0 ? Math.min(100, Math.max(0, ((income - expenses) / income) * 100)) : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">Đặt mục tiêu đạt 20% tháng này</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Analysis */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold">Phân tích Chi tiêu</h4>
            <select className="bg-gray-100 border-none rounded-xl text-sm px-4 py-2 outline-none">
              <option>Tháng này</option>
              <option>Tháng trước</option>
            </select>
          </div>
          <div className="h-[300px]">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color === 'orange-500' ? '#f97316' : entry.color === 'blue-500' ? '#3b82f6' : '#ec4899'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-4">🏜️</span>
                <p>Chưa có dữ liệu chi tiêu</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
             {expenseData.slice(0, 4).map((item, idx) => (
               <div key={idx} className="flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full bg-${item.color}`}></div>
                 <span className="text-sm text-gray-600 truncate">{item.name}</span>
                 <span className="text-sm font-bold ml-auto">{Math.round((item.value / expenses) * 100)}%</span>
               </div>
             ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold">Giao dịch gần đây</h4>
            <button className="text-indigo-600 text-sm font-bold hover:underline">Tất cả</button>
          </div>
          <div className="space-y-5">
            {transactions.slice(0, 5).map(t => {
              const category = CATEGORIES.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl ${category?.color} flex items-center justify-center text-2xl shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
                    {category?.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{category?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className={`text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <p className="font-black">{t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Hoàn thành</p>
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400 italic">Chưa có giao dịch nào được ghi lại.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
