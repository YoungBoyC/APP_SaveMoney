import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const links = [
    { to: '/', label: 'Tổng quan', icon: '📊' },
    { to: '/transactions', label: 'Giao dịch', icon: '📝' },
    { to: '/wallets', label: 'Ví của tôi', icon: '👛' },
    { to: '/budgets', label: 'Ngân sách', icon: '📅' },
    { to: '/savings', label: 'Tiết kiệm', icon: '🎯' },
    { to: '/export', label: 'Xuất APK', icon: '📱' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center pt-2 pb-5 md:hidden z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 flex-1 transition-all ${
              isActive ? 'text-indigo-600' : 'text-gray-400'
            }`
          }
        >
          {/* 
            Fix: NavLink children can be a function that receives { isActive }
            to allow child elements to style themselves based on the active state.
          */}
          {({ isActive }) => (
            <>
              <span className="text-xl">{link.icon}</span>
              <span className="text-[7px] font-black tracking-tighter uppercase text-center leading-none px-0.5">
                {link.label}
              </span>
              {/* Dấu chấm nhỏ chỉ thị trạng thái active */}
              <div className={`h-1 w-1 rounded-full bg-indigo-600 mt-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;