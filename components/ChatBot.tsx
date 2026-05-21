import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { useFinance } from '../context/FinanceContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý tài chính AI của SaveMoney Pro. Tôi có thể giúp gì cho bạn hôm nay?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Lấy dữ liệu thực tế từ hệ thống của bạn
  const { transactions, wallets, budgets, totalBalance } = useFinance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    // 1. Thêm tin nhắn của người dùng vào giao diện
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. Lấy API Key (Hỗ trợ Expo, Vite và CRA)
      const apiKey = 
        process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
        (import.meta as any).env?.VITE_GEMINI_API_KEY || 
        (process as any).env?.REACT_APP_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error("LỖI: Không tìm thấy API Key trong biến môi trường!");
        throw new Error("API_KEY_MISSING");
      }

      // 3. Khởi tạo Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Bạn là một chuyên gia tư vấn tài chính cá nhân cho ứng dụng SaveMoney Pro. Hãy trả lời ngắn gọn, thực tế bằng tiếng Việt. Luôn dựa vào dữ liệu người dùng cung cấp bên dưới để đưa ra lời khuyên chính xác về số dư và ngân sách."
      });

      // 4. Tạo nội dung câu hỏi kèm dữ liệu thực tế
      const prompt = `
        Dữ liệu tài chính hiện tại của người dùng:
        - Tổng số dư: ${totalBalance.toLocaleString('vi-VN')} VND
        - Số lượng ví: ${wallets.length}
        - Số lượng giao dịch gần đây: ${transactions.length}
        - Số lượng ngân sách đang quản lý: ${budgets.length}

        Câu hỏi của người dùng: "${messageText}"
      `;

      // 5. Gửi yêu cầu tới Google AI
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // 6. Cập nhật câu trả lời của bot
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error: any) {
      console.error("Chi tiết lỗi Gemini:", error);
      
      let errorHint = "Rất tiếc, tôi không thể kết nối với AI lúc này. Vui lòng thử lại sau.";
      if (error.message === "API_KEY_MISSING") {
        errorHint = "Lỗi: Chưa cấu hình API Key trong file .env. Hãy kiểm tra lại EXPO_PUBLIC_GEMINI_API_KEY.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorHint,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Nút nổi AI */}
      {!isOpen && (
        <motion.button
          drag
          dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[100] group cursor-grab active:cursor-grabbing"
        >
          <Sparkles className="group-hover:animate-pulse" size={28} />
          <div className="absolute -top-2 -right-2 bg-rose-500 text-[10px] font-black px-2 py-1 rounded-full border-2 border-white pointer-events-none">AI</div>
        </motion.button>
      )}

      {/* Cửa sổ Chat chính */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : (window.innerWidth < 768 ? 'calc(100vh - 40px)' : '600px'),
              width: isMinimized ? '320px' : (window.innerWidth < 768 ? 'calc(100vw - 2rem)' : '400px')
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 right-4 bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">Chat bot AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold opacity-70">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Danh sách tin nhắn */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-400 shadow-sm'
                        }`}>
                          {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                          msg.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                        }`}>
                          {msg.text}
                          <div className={`text-[9px] mt-2 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white text-gray-400 shadow-sm flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                          <Loader2 className="animate-spin text-indigo-600" size={18} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Gợi ý nhanh (Đã sửa lỗi phản hồi) */}
                <div className="px-6 py-2 flex gap-2 overflow-x-auto custom-scrollbar bg-white">
                  <button 
                    onClick={() => handleSend('Làm sao để kiếm thêm thu nhập?')}
                    className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    💰 Kiếm thêm thu nhập?
                  </button>
                  <button 
                    onClick={() => handleSend('Phân tích chi tiêu tháng này')}
                    className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    📊 Phân tích chi tiêu
                  </button>
                </div>

                {/* Ô nhập tin nhắn */}
                <div className="p-6 bg-white border-t border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Hỏi tôi về chi tiêu của bạn..."
                      className="w-full pl-6 pr-14 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest mt-4">
                    AI có thể đưa ra lời khuyên không chính xác. Hãy kiểm tra kỹ.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default ChatBot;