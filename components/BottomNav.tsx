import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, CalendarRange, Target, MoreHorizontal, X, FileText, Users, TrendingUp, Landmark, BarChart3  } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomNav: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const links = [
    { to: '/', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { to: '/transactions', label: 'Giao dịch', icon: <Receipt size={20} /> },
    { to: '/wallets', label: 'Ví', icon: <Wallet size={20} /> },
    { to: '/budgets', label: 'Ngân sách', icon: <CalendarRange size={20} /> },
  ];

  const moreLinks = [
    { to: '/savings', label: 'Tiết kiệm', icon: <Target size={20} className="text-rose-500" /> },
    { to: '/bills', label: 'Hóa đơn', icon: <FileText size={20} className="text-orange-500" /> },
    { to: '/loans', label: 'Vay & Nợ', icon: <Landmark size={20} className="text-blue-500" /> },
    { to: '/investments', label: 'Đầu tư', icon: <TrendingUp size={20} className="text-emerald-500" /> },
    { to: '/groups', label: 'Nhóm', icon: <Users size={20} className="text-purple-500" /> },
    { to: '/comparison', label: 'So Sánh', icon: <BarChart3 size={20} className="text-indigo-500" /> },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center pt-2 pb-6 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 flex-1 transition-all ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50' : ''}`}>
                  {link.icon}
                </div>
                <span className="text-[8px] font-black tracking-tighter uppercase text-center leading-none">
                  {link.label}
                </span>
                <div className={`h-1 w-1 rounded-full bg-indigo-600 mt-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
              </>
            )}
          </NavLink>
        ))}
        
        <button
          onClick={() => setIsMoreOpen(true)}
          className="flex flex-col items-center gap-1 flex-1 text-gray-400"
        >
          <div className="p-1 rounded-xl">
            <MoreHorizontal size={20} />
          </div>
          <span className="text-[8px] font-black tracking-tighter uppercase text-center leading-none">
            Thêm
          </span>
          <div className="h-1 w-1 rounded-full bg-transparent mt-1"></div>
        </button>
      </nav>

      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 z-[70] md:hidden shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Tiện ích khác</h3>
                <button onClick={() => setIsMoreOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {moreLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors shadow-sm border border-gray-100">
                      {link.icon}
                    </div>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">
                      {link.label}
                    </span>
                  </NavLink>
                ))}
              </div>
              
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">SaveMoney Pro v1.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
