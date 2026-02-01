
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Tổng quan', icon: '📊' },
    { to: '/transactions', label: 'Giao dịch', icon: '📝' },
    { to: '/wallets', label: 'Ví của tôi', icon: '👛' },
    { to: '/budgets', label: 'Ngân sách', icon: '📅' },
    { to: '/savings', label: 'Tiết kiệm', icon: '🎯' },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <span className="text-3xl"></span> SaveMoney
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/*
      <div className="p-4 border-t">
        <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-200">
          <p className="text-xs opacity-80">Gói Premium</p>
          <p className="text-sm font-medium">Nâng cấp ngay!</p>
          <button className="mt-2 w-full bg-white text-indigo-600 text-xs font-bold py-2 rounded-lg hover:bg-indigo-50 transition-colors">
            Khám phá
          </button>
        </div>
      </div>
      */}

    </aside>
  );
};

export default Sidebar;
