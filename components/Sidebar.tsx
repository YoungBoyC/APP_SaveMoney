import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  CalendarRange, 
  Target, 
  ShieldCheck, 
  ReceiptText, 
  HandCoins, 
  TrendingUp, 
  Users 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { to: '/transactions', label: 'Giao dịch', icon: <Receipt size={20} /> },
    { to: '/wallets', label: 'Ví của tôi', icon: <Wallet size={20} /> },
    { to: '/budgets', label: 'Ngân sách', icon: <CalendarRange size={20} /> },
    { to: '/savings', label: 'Tiết kiệm', icon: <Target size={20} /> },
    { to: '/bills', label: 'Hóa đơn', icon: <ReceiptText size={20} /> },
    { to: '/loans', label: 'Vay & Nợ', icon: <HandCoins size={20} /> },
    { to: '/investments', label: 'Đầu tư', icon: <TrendingUp size={20} /> },
    { to: '/groups', label: 'Nhóm', icon: <Users size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-8">
        <h1 className="text-2xl font-black text-indigo-600 flex items-center gap-2">
          <ShieldCheck size={32} strokeWidth={3} />
          SaveMoney
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                isActive 
                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Gói Premium</p>
          <p className="text-sm font-bold leading-tight mb-4">Mở khóa tất cả tính năng AI</p>
          <button className="w-full bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-indigo-50 transition-colors">
            Nâng cấp ngay
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
