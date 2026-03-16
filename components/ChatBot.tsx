import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
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
  const { transactions, wallets, budgets, totalBalance } = useFinance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found. Please set GEMINI_API_KEY in your environment.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `
              Bạn là một chuyên gia tư vấn tài chính cá nhân cho ứng dụng SaveMoney Pro.
              Dưới đây là dữ liệu tài chính hiện tại của người dùng:
              - Tổng số dư: ${totalBalance.toLocaleString()} VND
              - Số lượng ví: ${wallets.length}
              - Số lượng giao dịch: ${transactions.length}
              - Số lượng ngân sách: ${budgets.length}

              Người dùng hỏi: "${currentInput}"

              Hãy trả lời một cách chuyên nghiệp, thân thiện và đưa ra lời khuyên hữu ích dựa trên dữ liệu (nếu có). 
              Nếu người dùng hỏi về các con số cụ thể, hãy sử dụng dữ liệu được cung cấp.
              Trả lời bằng tiếng Việt.
            ` }]
          }
        ],
        config: {
          systemInstruction: "Bạn là trợ lý tài chính thông minh của SaveMoney Pro. Hãy tư vấn ngắn gọn, súc tích và thực tế. Nếu người dùng hỏi về cách kiếm thêm thu nhập, hãy gợi ý các công việc online như Freelance Design (vLance), Content Writing (Freelancer.com), Web Development (Upwork), hoặc Affiliate Marketing (Accesstrade) và nhắc họ xem phần 'Gợi ý kiếm thêm thu nhập' trên Dashboard."
        }
      });

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "Xin lỗi, tôi gặp chút trục trặc khi xử lý yêu cầu của bạn.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Rất tiếc, tôi không thể kết nối với trí tuệ nhân tạo lúc này. Vui lòng thử lại sau.",
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
      {/* Floating Button */}
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

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : (window.innerWidth < 768 ? 'calc(100vh - 40px)' : '600px'),
              width: isMinimized ? '280px' : (window.innerWidth < 768 ? 'calc(100vw - 2rem)' : '400px')
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
                  <h3 className="font-black text-sm uppercase tracking-widest">Chat bot</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold opacity-70">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
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

                {/* Quick Suggestions */}
                <div className="px-6 py-2 flex gap-2 overflow-x-auto custom-scrollbar bg-white">
                  <button 
                    onClick={() => { setInput('Làm sao để kiếm thêm thu nhập?'); handleSend(); }}
                    className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    💰 Kiếm thêm thu nhập?
                  </button>
                  <button 
                    onClick={() => { setInput('Phân tích chi tiêu tháng này'); handleSend(); }}
                    className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    📊 Phân tích chi tiêu
                  </button>
                </div>

                {/* Input */}
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
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600"
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
