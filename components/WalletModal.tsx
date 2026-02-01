
import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { WALLET_TYPES, SUPPORTED_BANKS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addWallet } = useFinance();
  const [step, setStep] = useState<'SELECT_METHOD' | 'LINK_BANK' | 'MANUAL_DETAILS' | 'SYNCING'>('SELECT_METHOD');
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState<'CASH' | 'BANK' | 'E-WALLET'>('CASH');
  const [searchBank, setSearchBank] = useState('');
  const [selectedBank, setSelectedBank] = useState<any>(null);

  // Hook useMemo phải nằm trên câu lệnh return null để số lượng Hook không đổi
  const filteredBanks = useMemo(() => {
    return SUPPORTED_BANKS.filter(b => 
      b.name.toLowerCase().includes(searchBank.toLowerCase()) || 
      b.shortName.toLowerCase().includes(searchBank.toLowerCase())
    );
  }, [searchBank]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;
    
    const walletTypeData = WALLET_TYPES.find(t => t.id === type);
    addWallet({
      name,
      balance: parseFloat(balance),
      type,
      icon: selectedBank ? (selectedBank.icon.startsWith('http') ? '🏦' : selectedBank.icon) : (walletTypeData?.icon || '💰')
    });
    resetAndClose();
  };

  const handleBankSelect = (bank: any) => {
    setSelectedBank(bank);
    setStep('SYNCING');
    setTimeout(() => {
      setStep('MANUAL_DETAILS');
      setName(bank.name);
      setType(bank.id === 'momo' || bank.id === 'zalopay' ? 'E-WALLET' : 'BANK');
    }, 1800);
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep('SELECT_METHOD');
      setName('');
      setBalance('');
      setSelectedBank(null);
      setSearchBank('');
    }, 200);
  };

  const renderBankIcon = (icon: string, sizeClass: string = "w-6 h-6") => {
    if (icon.startsWith('http')) {
      return <img src={icon} alt="Bank logo" className={`${sizeClass} object-contain`} />;
    }
    return <span className="text-xl">{icon}</span>;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden transition-all transform scale-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50/80">
          <div>
            <h2 className="text-lg font-black text-gray-800">
              {step === 'SELECT_METHOD' && 'Thêm ví mới'}
              {step === 'LINK_BANK' && 'Chọn ngân hàng'}
              {step === 'SYNCING' && 'Đang kết nối...'}
              {step === 'MANUAL_DETAILS' && 'Thông tin ví'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {step === 'SELECT_METHOD' && 'Vui lòng chọn nguồn tiền'}
              {step === 'LINK_BANK' && 'Tìm kiếm ngân hàng của bạn'}
              {step === 'SYNCING' && 'Đang quét thiết bị'}
              {step === 'MANUAL_DETAILS' && 'Kiểm tra lại số dư'}
            </p>
          </div>
          <button onClick={resetAndClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400">✕</button>
        </div>

        <div className="p-6">
          {step === 'SELECT_METHOD' && (
            <div className="space-y-3">
              <button
                onClick={() => setStep('LINK_BANK')}
                className="w-full p-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-4 transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🔗</div>
                <div className="text-left">
                  <p className="font-bold text-base leading-tight">Liên kết ngân hàng</p>
                  <p className="text-[10px] opacity-70 font-medium">Đồng bộ tự động từ app ngân hàng</p>
                </div>
              </button>

              <button
                onClick={() => setStep('MANUAL_DETAILS')}
                className="w-full p-5 bg-white border-2 border-gray-100 hover:border-indigo-200 text-gray-800 rounded-2xl flex items-center gap-4 transition-all active:scale-95"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">✏️</div>
                <div className="text-left">
                  <p className="font-bold text-base leading-tight">Nhập thủ công</p>
                  <p className="text-[10px] text-gray-400 font-medium">Tự tạo ví theo ý muốn cá nhân</p>
                </div>
              </button>
            </div>
          )}

          {step === 'LINK_BANK' && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Tìm VCB, Momo, Techcombank..."
                  value={searchBank}
                  onChange={e => setSearchBank(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredBanks.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {renderBankIcon(bank.icon)}
                    </div>
                    <span className="font-bold text-[10px] text-gray-600">{bank.shortName}</span>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setStep('SELECT_METHOD')}
                className="w-full text-center text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors py-2"
              >
                ← Quay lại
              </button>
            </div>
          )}

          {step === 'SYNCING' && (
            <div className="py-10 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   {selectedBank && renderBankIcon(selectedBank.icon, "w-8 h-8")}
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base text-gray-800">Đang yêu cầu kết nối...</p>
                <p className="text-[10px] text-gray-400 font-medium">Vui lòng cho phép ứng dụng truy cập dữ liệu</p>
              </div>
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-full origin-left animate-loading-bar"></div>
              </div>
            </div>
          )}

          {step === 'MANUAL_DETAILS' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {selectedBank && (
                <div className="bg-emerald-50 p-3 rounded-xl flex items-center gap-3 border border-emerald-100">
                  <span className="text-emerald-500">✅</span>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Liên kết thành công</p>
                    <p className="text-xs font-semibold text-emerald-900">{selectedBank.name}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tên ví</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                  placeholder="Ví dụ: Tài khoản chi tiêu"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Số dư hiện tại</label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-black"
                  placeholder="0"
                />
              </div>

              {!selectedBank && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Loại ví</label>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLET_TYPES.map(wType => (
                      <button
                        key={wType.id}
                        type="button"
                        onClick={() => setType(wType.id as any)}
                        className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                          type === wType.id 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <span className="text-xl">{wType.icon}</span>
                        <span className="text-[9px] font-bold uppercase">{wType.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-100 text-sm"
                >
                  Xác nhận tạo ví
                </button>
                <button
                  type="button"
                  onClick={() => setStep('SELECT_METHOD')}
                  className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 py-1"
                >
                  Hủy và chọn lại
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.8s ease-in-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default WalletModal;
