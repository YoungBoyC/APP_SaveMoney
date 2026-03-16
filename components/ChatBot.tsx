import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useFinance } from '../context/FinanceContext';
import { buildFinanceContextForAI, generateLocalResponse, getSuggestedPrompts } from '../utils/chatbot';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const STORAGE_KEY = 'mc_chatbot_messages';

const createWelcomeMessage = (): Message => ({
  id: 'welcome',
  text: 'Xin chào! Mình là trợ lý tài chính của SaveMoney. Mình có thể xem số dư, phân tích chi tiêu, ngân sách, tiết kiệm và hóa đơn từ chính dữ liệu đang có trong app của bạn.',
  sender: 'bot',
  timestamp: new Date(),
});

const getApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    (window as any).__GEMINI_API_KEY__ ||
    ''
  ); 
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [createWelcomeMessage()];
      const parsed = JSON.parse(saved) as Message[];
      return parsed.map((item) => ({ ...item, timestamp: new Date(item.timestamp) }));
    } catch {
      return [createWelcomeMessage()];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { transactions, wallets, budgets, savings, bills, loans, investments, totalBalance, currency } = useFinance();

  const financeSnapshot = useMemo(
    () => ({ transactions, wallets, budgets, savings, bills, loans, investments, totalBalance, currency }),
    [transactions, wallets, budgets, savings, bills, loans, investments, totalBalance, currency]
  );

  const suggestedPrompts = useMemo(() => getSuggestedPrompts(financeSnapshot), [financeSnapshot]);
  const hasApiKey = Boolean(getApiKey());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const askGemini = async (messageText: string) => {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction:
        'Bạn là trợ lý tài chính cá nhân trong ứng dụng SaveMoney Pro. Luôn trả lời bằng tiếng Việt, ngắn gọn, thực tế, có cấu trúc rõ ràng. Chỉ dựa trên dữ liệu được cung cấp. Không bịa đặt dữ liệu không có. Nếu dữ liệu thiếu, hãy nói rõ phần thiếu và đưa gợi ý hành động tiếp theo.',
    });

    const financeContext = buildFinanceContextForAI(financeSnapshot);
    const prompt = `Dữ liệu tài chính hiện tại của người dùng:\n${JSON.stringify(financeContext, null, 2)}\n\nYêu cầu của người dùng: ${messageText}\n\nHãy trả lời súc tích, dễ hiểu, ưu tiên nêu số liệu chính trước rồi mới nêu khuyến nghị.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = (textOverride || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}`,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';

      if (hasApiKey) {
        try {
          responseText = (await askGemini(messageText)) || '';
        } catch {
          responseText = '';
        }
      }

      if (!responseText) {
        responseText = generateLocalResponse(messageText, financeSnapshot);
      }

      const botResponse: Message = {
        id: `${Date.now() + 1}`,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch {
      const fallbackMessage: Message = {
        id: `${Date.now() + 1}`,
        text: generateLocalResponse(messageText, financeSnapshot),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcome = createWelcomeMessage();
    setMessages([welcome]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcome]));
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          drag
          dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[100] group cursor-grab active:cursor-grabbing"
        >
          <Sparkles className="group-hover:animate-pulse" size={28} />
          <div className="absolute -top-2 -right-2 bg-rose-500 text-[10px] font-black px-2 py-1 rounded-full border-2 border-white pointer-events-none">AI</div>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? '84px' : window.innerWidth < 768 ? 'calc(100vh - 40px)' : '680px',
              width: isMinimized ? '340px' : window.innerWidth < 768 ? 'calc(100vw - 1.5rem)' : '430px',
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 right-4 bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden z-[100]"
          >
            <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">Chat bot tài chính</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400' : 'bg-amber-300'} animate-pulse`}></div>
                    <span className="text-[10px] font-bold opacity-85">
                      {hasApiKey ? 'Chế độ AI nâng cao' : 'Chế độ nội bộ an toàn'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearChat} className="px-3 py-2 hover:bg-white/10 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest">
                  Xóa chat
                </button>
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
                <div className="px-5 pt-4 pb-3 bg-indigo-50 border-b border-indigo-100">
                  <div className="flex items-start gap-3 text-indigo-900">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest">Nguồn trả lời</p>
                      <p className="text-xs leading-relaxed font-medium mt-1">
                        Chatbot luôn ưu tiên đọc dữ liệu tài chính hiện có trong app. {hasApiKey ? 'Nếu có API key, bot sẽ dùng AI để diễn giải tự nhiên hơn.' : 'Bạn chưa cần API key để bot hoạt động.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gray-50/60">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-400 shadow-sm'
                          }`}
                        >
                          {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div
                          className={`p-4 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-line ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                          }`}
                        >
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
                        <div className="w-8 h-8 rounded-xl bg-white text-gray-400 shadow-sm flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                          <Loader2 className="animate-spin text-indigo-600" size={18} />
                          <span className="text-xs font-bold text-gray-500">Đang phân tích dữ liệu...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-5 py-3 flex gap-2 overflow-x-auto custom-scrollbar bg-white border-t border-gray-100">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="p-5 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 border border-gray-100">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ví dụ: phân tích chi tiêu tháng này"
                      className="flex-1 bg-transparent outline-none px-3 text-sm font-medium text-gray-800 placeholder:text-gray-400"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest mt-4">
                    Chatbot hỗ trợ theo dữ liệu app và chỉ mang tính tham khảo tài chính cá nhân.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default ChatBot;
