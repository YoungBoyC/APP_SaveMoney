import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ChevronRight, User, MessageSquare, ArrowUpRight, ArrowDownRight, Share2, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface Group {
  id: string;
  name: string;
  members: number;
  balance: number;
  lastActivity: string;
  type: 'FAMILY' | 'FRIENDS' | 'WORK';
}

const Groups: React.FC = () => {
  const { currency } = useFinance();
  const [groups, setGroups] = useState<Group[]>([
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    members: '',
    type: 'FRIENDS' as 'FAMILY' | 'FRIENDS' | 'WORK'
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(val);
  };

  const handleDelete = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name || !newGroup.members) return;

    const group: Group = {
      id: Date.now().toString(),
      name: newGroup.name,
      members: Number(newGroup.members),
      balance: 0,
      lastActivity: 'Vừa xong',
      type: newGroup.type
    };

    setGroups([...groups, group]);
    setIsModalOpen(false);
    setNewGroup({ name: '', members: '', type: 'FRIENDS' });
  };

  const totalOwedToMe = groups.filter(g => g.balance > 0).reduce((acc, g) => acc + g.balance, 0);
  const totalIOwe = Math.abs(groups.filter(g => g.balance < 0).reduce((acc, g) => acc + g.balance, 0));

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24 md:pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Nhóm 👥</h2>
          <p className="text-gray-500 font-medium">Chia sẻ chi tiêu và quản lý quỹ chung.</p>
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
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang tham gia</p>
            <p className="text-xl font-black text-gray-900">{groups.length} Nhóm</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bạn được nhận</p>
            <p className="text-xl font-black text-gray-900">{formatCurrency(totalOwedToMe)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bạn cần trả</p>
            <p className="text-xl font-black text-gray-900">{formatCurrency(totalIOwe)}</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <Share2 size={20} className="text-indigo-600" />
          Nhóm của bạn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {groups.map((group) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                key={group.id} 
                className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6 group cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm ${
                    group.type === 'FAMILY' ? 'bg-rose-50 text-rose-600' : 
                    group.type === 'FRIENDS' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {group.type === 'FAMILY' ? '🏠' : group.type === 'FRIENDS' ? '🏕️' : '💼'}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {[...Array(Math.min(group.members, 3))].map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-gray-400">
                          <User size={16} />
                        </div>
                      ))}
                      {group.members > 3 && (
                        <div className="w-10 h-10 rounded-full border-4 border-white bg-gray-900 flex items-center justify-center text-[10px] font-black text-white">
                          +{group.members - 3}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group.id);
                      }}
                      className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-2xl font-black text-gray-900">{group.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <MessageSquare size={12} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.lastActivity}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số dư của bạn</p>
                    <p className={`text-xl font-black ${group.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {group.balance >= 0 ? '+' : ''}{formatCurrency(group.balance)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {groups.length === 0 && (
            <div className="col-span-full p-12 text-center bg-white rounded-[3rem] border border-gray-100">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Bạn chưa tham gia nhóm nào</p>
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
                <h3 className="text-xl font-black uppercase tracking-tight">Tạo nhóm mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên nhóm</label>
                  <input 
                    type="text" 
                    required
                    value={newGroup.name}
                    onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                    placeholder="VD: Nhóm bạn thân, Gia đình..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số thành viên</label>
                    <input 
                      type="number" 
                      required
                      value={newGroup.members}
                      onChange={e => setNewGroup({...newGroup, members: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all"
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại nhóm</label>
                    <select 
                      value={newGroup.type}
                      onChange={e => setNewGroup({...newGroup, type: e.target.value as any})}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold transition-all appearance-none"
                    >
                      <option value="FRIENDS">Bạn bè</option>
                      <option value="FAMILY">Gia đình</option>
                      <option value="WORK">Công việc</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Tạo nhóm
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Groups;
