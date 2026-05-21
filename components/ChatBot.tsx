import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Eraser,
  Loader2,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import { Transaction } from '../types';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const CHAT_HISTORY_KEY = 'mc_ai_chat_history';

const formatCurrency = (amount: number, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount || 0);
};

const normalize = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
};

const getPreviousMonthRange = () => {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
  };
};

const filterByDateRange = (transactions: Transaction[], start: Date, end: Date) => {
  return transactions.filter((item) => {
    const date = new Date(item.date);
    return date >= start && date <= end;
  });
};

const sumByType = (transactions: Transaction[], type: 'INCOME' | 'EXPENSE') => {
  return transactions
    .filter((item) => item.type === type)
    .reduce((total, item) => total + Number(item.amount || 0), 0);
};

const getCategoryName = (categoryId: string) => {
  return CATEGORIES.find((item) => item.id === categoryId)?.name || 'Khác';
};

const getCategoryIcon = (categoryId: string) => {
  return CATEGORIES.find((item) => item.id === categoryId)?.icon || '💸';
};

const getTopExpenseCategories = (transactions: Transaction[]) => {
  const map = new Map<string, number>();

  transactions
    .filter((item) => item.type === 'EXPENSE')
    .forEach((item) => {
      map.set(item.categoryId, (map.get(item.categoryId) || 0) + item.amount);
    });

  return Array.from(map.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      name: getCategoryName(categoryId),
      icon: getCategoryIcon(categoryId),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
};

const createWelcomeMessage = (): Message => ({
  id: 'welcome',
  text:
    'Xin chào! Mình là trợ lý tài chính AI của bạn. Bạn có thể hỏi: “phân tích chi tiêu tháng này”, “so sánh tháng này với tháng trước”, “ngân sách nào sắp vượt”, “tôi còn bao nhiêu tiền”, hoặc “gợi ý cách tiết kiệm”.',
  sender: 'bot',
  timestamp: new Date(),
});

const loadMessages = (): Message[] => {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [createWelcomeMessage()];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [createWelcomeMessage()];
    }

    return parsed.map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [createWelcomeMessage()];
  }
};

const getGeminiApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY?.trim();
};

const STORAGE_KEY = 'mc_chatbot_messages';

const getApiKey = () => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    (window as any).__GEMINI_API_KEY__ ||
    ''
  ); 
};

const ChatBot: React.FC = () => {
  const finance = useFinance();

  const {
    transactions,
    wallets,
    budgets,
    savings,
    bills,
    loans,
    investments,
    totalBalance,
    currency,
  } = finance;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiKey = getGeminiApiKey();

  const currentMonthData = useMemo(() => {
    const range = getCurrentMonthRange();
    const data = filterByDateRange(transactions, range.start, range.end);

    return {
      data,
      income: sumByType(data, 'INCOME'),
      expense: sumByType(data, 'EXPENSE'),
      topExpenses: getTopExpenseCategories(data),
    };
  }, [transactions]);

  const previousMonthData = useMemo(() => {
    const range = getPreviousMonthRange();
    const data = filterByDateRange(transactions, range.start, range.end);

    return {
      data,
      income: sumByType(data, 'INCOME'),
      expense: sumByType(data, 'EXPENSE'),
      topExpenses: getTopExpenseCategories(data),
    };
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getBudgetReport = () => {
    return budgets
      .map((budget) => {
        const spent = currentMonthData.data
          .filter(
            (item) =>
              item.type === 'EXPENSE' && item.categoryId === budget.categoryId
          )
          .reduce((total, item) => total + item.amount, 0);

        const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return {
          ...budget,
          name: getCategoryName(budget.categoryId),
          icon: getCategoryIcon(budget.categoryId),
          spent,
          percent,
          remaining: budget.limit - spent,
        };
      })
      .sort((a, b) => b.percent - a.percent);
  };

  const buildLocalAnswer = (question: string) => {
    const q = normalize(question);
    const budgetReport = getBudgetReport();

    if (
      q.includes('so sanh') ||
      q.includes('thang truoc') ||
      q.includes('bien dong')
    ) {
      const diffExpense = currentMonthData.expense - previousMonthData.expense;
      const diffIncome = currentMonthData.income - previousMonthData.income;

      const lines = [
        '🔍 So sánh tháng này với tháng trước:',
        `• Chi tiêu tháng này: ${formatCurrency(currentMonthData.expense, currency)}.`,
        `• Chi tiêu tháng trước: ${formatCurrency(previousMonthData.expense, currency)}.`,
        `• Chênh lệch chi tiêu: ${
          diffExpense >= 0 ? 'tăng' : 'giảm'
        } ${formatCurrency(Math.abs(diffExpense), currency)}.`,
        `• Thu nhập tháng này: ${formatCurrency(currentMonthData.income, currency)}.`,
        `• Chênh lệch thu nhập: ${
          diffIncome >= 0 ? 'tăng' : 'giảm'
        } ${formatCurrency(Math.abs(diffIncome), currency)}.`,
      ];

      if (currentMonthData.topExpenses.length > 0) {
        lines.push('\n📌 Hạng mục chi nhiều nhất tháng này:');
        currentMonthData.topExpenses.slice(0, 5).forEach((item, index) => {
          lines.push(
            `${index + 1}. ${item.icon} ${item.name}: ${formatCurrency(item.amount, currency)}.`
          );
        });
      }

      if (diffExpense > 0) {
        lines.push(
          '\n⚠️ Chi tiêu tháng này đang cao hơn tháng trước. Bạn nên kiểm tra các hạng mục chi lớn nhất để cắt giảm.'
        );
      } else if (diffExpense < 0) {
        lines.push(
          '\n✅ Chi tiêu tháng này đang thấp hơn tháng trước. Đây là tín hiệu tốt.'
        );
      }

      return lines.join('\n');
    }

    if (
      q.includes('ngan sach') ||
      q.includes('vuot') ||
      q.includes('sap vuot')
    ) {
      if (budgetReport.length === 0) {
        return 'Bạn chưa tạo ngân sách nào. Hãy tạo ngân sách cho các hạng mục như Ăn uống, Di chuyển, Mua sắm để mình có thể cảnh báo khi gần vượt mức.';
      }

      const lines = ['🎯 Tình trạng ngân sách tháng này:'];

      budgetReport.slice(0, 6).forEach((item, index) => {
        const status =
          item.percent >= 100
            ? 'Đã vượt mức'
            : item.percent >= 80
              ? 'Sắp vượt'
              : 'An toàn';

        lines.push(
          `${index + 1}. ${item.icon} ${item.name}: đã dùng ${formatCurrency(item.spent, currency)} / ${formatCurrency(item.limit, currency)} (${item.percent.toFixed(1)}%) — ${status}.`
        );
      });

      const warning = budgetReport.filter((item) => item.percent >= 80);

      if (warning.length > 0) {
        lines.push(
          `\n⚠️ Cần chú ý: ${warning.map((item) => item.name).join(', ')}.`
        );
      } else {
        lines.push('\n✅ Hiện chưa có ngân sách nào gần vượt mức.');
      }

      return lines.join('\n');
    }

    if (
      q.includes('so du') ||
      q.includes('con bao nhieu') ||
      q.includes('vi') ||
      q.includes('tien')
    ) {
      const lines = [
        '👛 Số dư hiện tại:',
        `• Tổng số dư: ${formatCurrency(totalBalance, currency)}.`,
      ];

      if (wallets.length > 0) {
        lines.push('\nChi tiết từng ví:');
        wallets.forEach((wallet, index) => {
          lines.push(
            `${index + 1}. ${wallet.icon} ${wallet.name}: ${formatCurrency(wallet.balance, currency)}.`
          );
        });
      }

      return lines.join('\n');
    }

    if (
      q.includes('hoa don') ||
      q.includes('den han') ||
      q.includes('qua han')
    ) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const next7Days = new Date(today);
      next7Days.setDate(today.getDate() + 7);

      const unpaidBills = bills.filter((bill) => !bill.isPaid);

      const overdue = unpaidBills.filter((bill) => {
        return new Date(bill.dueDate) < today;
      });

      const upcoming = unpaidBills.filter((bill) => {
        const due = new Date(bill.dueDate);
        return due >= today && due <= next7Days;
      });

      const lines = ['🧾 Tình trạng hóa đơn:'];

      if (overdue.length === 0 && upcoming.length === 0) {
        return '✅ Hiện không có hóa đơn quá hạn hoặc sắp đến hạn trong 7 ngày tới.';
      }

      if (overdue.length > 0) {
        lines.push('\n⚠️ Hóa đơn quá hạn:');
        overdue.forEach((bill, index) => {
          lines.push(
            `${index + 1}. ${bill.name}: ${formatCurrency(bill.amount, currency)} — hạn ${new Date(bill.dueDate).toLocaleDateString('vi-VN')}.`
          );
        });
      }

      if (upcoming.length > 0) {
        lines.push('\n📌 Hóa đơn sắp đến hạn trong 7 ngày:');
        upcoming.forEach((bill, index) => {
          lines.push(
            `${index + 1}. ${bill.name}: ${formatCurrency(bill.amount, currency)} — hạn ${new Date(bill.dueDate).toLocaleDateString('vi-VN')}.`
          );
        });
      }

      return lines.join('\n');
    }

    if (
      q.includes('tiet kiem') ||
      q.includes('de danh') ||
      q.includes('muc tieu')
    ) {
      const lines = [
        '💡 Gợi ý tiết kiệm:',
        `• Thu nhập tháng này: ${formatCurrency(currentMonthData.income, currency)}.`,
        `• Chi tiêu tháng này: ${formatCurrency(currentMonthData.expense, currency)}.`,
        `• Còn lại sau thu - chi: ${formatCurrency(currentMonthData.income - currentMonthData.expense, currency)}.`,
      ];

      if (currentMonthData.topExpenses.length > 0) {
        const top = currentMonthData.topExpenses[0];
        lines.push(
          `\nKhoản nên xem lại đầu tiên là ${top.icon} ${top.name}, vì tháng này bạn đã chi ${formatCurrency(top.amount, currency)} cho hạng mục này.`
        );
      }

      if (savings.length > 0) {
        lines.push('\n🎯 Mục tiêu tiết kiệm:');
        savings.slice(0, 5).forEach((saving, index) => {
          const percent =
            saving.targetAmount > 0
              ? (saving.currentAmount / saving.targetAmount) * 100
              : 0;

          lines.push(
            `${index + 1}. ${saving.icon} ${saving.name}: ${formatCurrency(saving.currentAmount, currency)} / ${formatCurrency(saving.targetAmount, currency)} (${percent.toFixed(1)}%).`
          );
        });
      }

      lines.push(
        '\nGợi ý nhanh: hãy đặt giới hạn cho 1–2 hạng mục chi nhiều nhất, sau đó chuyển một phần tiền còn lại vào mục tiêu tiết kiệm ngay khi có thu nhập.'
      );

      return lines.join('\n');
    }

    if (q.includes('vay') || q.includes('no')) {
      if (loans.length === 0) {
        return 'Bạn chưa có khoản vay/nợ nào được ghi nhận.';
      }

      const borrow = loans
        .filter((loan) => loan.type === 'BORROW')
        .reduce((total, loan) => total + loan.amount, 0);

      const lend = loans
        .filter((loan) => loan.type === 'LEND')
        .reduce((total, loan) => total + loan.amount, 0);

      return [
        '🤝 Tổng hợp vay & nợ:',
        `• Bạn đang nợ người khác: ${formatCurrency(borrow, currency)}.`,
        `• Người khác đang nợ bạn: ${formatCurrency(lend, currency)}.`,
        `• Tổng số khoản vay/nợ: ${loans.length}.`,
      ].join('\n');
    }

    if (q.includes('dau tu') || q.includes('loi nhuan')) {
      if (investments.length === 0) {
        return 'Bạn chưa có khoản đầu tư nào được ghi nhận.';
      }

      const original = investments.reduce((total, item) => total + item.amount, 0);
      const current = investments.reduce(
        (total, item) => total + item.currentValue,
        0
      );

      return [
        '📈 Tổng hợp đầu tư:',
        `• Tổng vốn ban đầu: ${formatCurrency(original, currency)}.`,
        `• Giá trị hiện tại: ${formatCurrency(current, currency)}.`,
        `• Lãi/lỗ tạm tính: ${formatCurrency(current - original, currency)}.`,
      ].join('\n');
    }

    const overviewLines = [
      '📊 Tổng quan tài chính hiện tại:',
      `• Tổng số dư: ${formatCurrency(totalBalance, currency)}.`,
      `• Thu nhập tháng này: ${formatCurrency(currentMonthData.income, currency)}.`,
      `• Chi tiêu tháng này: ${formatCurrency(currentMonthData.expense, currency)}.`,
      `• Chênh lệch thu - chi: ${formatCurrency(currentMonthData.income - currentMonthData.expense, currency)}.`,
      `• Số ví: ${wallets.length}.`,
      `• Số giao dịch: ${transactions.length}.`,
      `• Số ngân sách: ${budgets.length}.`,
      '\nBạn có thể hỏi rõ hơn như: “so sánh tháng này với tháng trước”, “ngân sách nào sắp vượt”, “hóa đơn nào sắp đến hạn”, hoặc “gợi ý cách tiết kiệm”.',
    ];

    return overviewLines.join('\n');
  };

  const buildGeminiPrompt = (question: string) => {
    return `
Bạn là trợ lý tài chính cá nhân trong app quản lý chi tiêu.
Hãy trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, có gạch đầu dòng.
Không bịa số liệu. Chỉ dùng dữ liệu dưới đây.

DỮ LIỆU:
- Tổng số dư: ${formatCurrency(totalBalance, currency)}
- Thu nhập tháng này: ${formatCurrency(currentMonthData.income, currency)}
- Chi tiêu tháng này: ${formatCurrency(currentMonthData.expense, currency)}
- Thu nhập tháng trước: ${formatCurrency(previousMonthData.income, currency)}
- Chi tiêu tháng trước: ${formatCurrency(previousMonthData.expense, currency)}
- Số ví: ${wallets.length}
- Số giao dịch: ${transactions.length}
- Số ngân sách: ${budgets.length}
- Số mục tiêu tiết kiệm: ${savings.length}
- Số hóa đơn: ${bills.length}
- Số khoản vay/nợ: ${loans.length}
- Số khoản đầu tư: ${investments.length}

TOP HẠNG MỤC CHI THÁNG NÀY:
${currentMonthData.topExpenses
  .slice(0, 8)
  .map(
    (item, index) =>
      `${index + 1}. ${item.name}: ${formatCurrency(item.amount, currency)}`
  )
  .join('\n')}

CÂU HỎI NGƯỜI DÙNG:
${question}
`;
  };

  const askGemini = async (question: string) => {
    if (!apiKey) throw new Error('NO_API_KEY');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const result = await model.generateContent(buildGeminiPrompt(question));
    const response = await result.response;
    return response.text();
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = (textOverride || input).trim();

    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let answer = '';

      if (apiKey) {
        try {
          answer = await askGemini(messageText);
        } catch (error) {
          console.error('Gemini lỗi, dùng bot nội bộ:', error);
          answer =
            buildLocalAnswer(messageText) +
            '\n\nGhi chú: AI online đang lỗi hoặc API key chưa đúng, nên mình đã dùng chế độ phân tích nội bộ.';
        }
      } else {
        answer = buildLocalAnswer(messageText);
      }

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        text: answer,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      const botMessage: Message = {
        id: `${Date.now()}-error`,
        text: 'Mình chưa thể xử lý câu hỏi này. Bạn thử hỏi ngắn hơn như “phân tích chi tiêu tháng này” hoặc “ngân sách nào sắp vượt?” nhé.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcome = createWelcomeMessage();
    setMessages([welcome]);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify([welcome]));
  };

  const quickQuestions = [
    'Phân tích chi tiêu tháng này',
    'So sánh tháng này với tháng trước',
    'Ngân sách nào sắp vượt?',
    'Tôi còn bao nhiêu tiền?',
    'Hóa đơn nào sắp đến hạn?',
    'Gợi ý cách tiết kiệm',
  ];

  return (
    <>
      {!isOpen && (
        <motion.button
          drag
          dragMomentum={false}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-5 md:bottom-8 md:right-28 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-300 flex items-center justify-center z-[100] group cursor-grab active:cursor-grabbing border-4 border-white"
        >
          <Sparkles className="group-hover:animate-pulse" size={28} />
          <div className="absolute -top-2 -right-2 bg-rose-500 text-[10px] font-black px-2 py-1 rounded-full border-2 border-white pointer-events-none">
            AI
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.94 }}
            className={`fixed right-3 md:right-6 bottom-3 md:bottom-6 bg-white rounded-[2rem] shadow-[0_20px_70px_rgba(15,23,42,0.22)] border border-gray-100 flex flex-col overflow-hidden z-[100] ${
              isMinimized
                ? 'w-[320px] h-[82px]'
                : 'w-[calc(100vw-1.5rem)] md:w-[430px] h-[calc(100vh-1.5rem)] md:h-[650px]'
            }`}
          >
            <div className="p-5 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Bot size={24} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-black text-sm uppercase tracking-widest truncate">
                    Chatbot tài chính AI
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/75">
                      {apiKey ? 'AI Gemini + phân tích nội bộ' : 'Chế độ nội bộ'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  title="Xóa lịch sử chat"
                >
                  <Eraser size={17} />
                </button>

                <button
                  onClick={() => setIsMinimized((prev) => !prev)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {isMinimized ? <Maximize2 size={17} /> : <Minimize2 size={17} />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-700 leading-relaxed">
                    Bot có thể đọc dữ liệu trong app như giao dịch, ví, ngân sách,
                    hóa đơn, tiết kiệm, vay nợ và đầu tư. Không có API key vẫn dùng được.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gray-50/70">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[88%] ${
                          message.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            message.sender === 'user'
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-white text-gray-500 shadow-sm border border-gray-100'
                          }`}
                        >
                          {message.sender === 'user' ? (
                            <User size={16} />
                          ) : (
                            <Bot size={16} />
                          )}
                        </div>

                        <div
                          className={`p-4 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-line ${
                            message.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                          }`}
                        >
                          {message.text}

                          <div
                            className={`text-[9px] mt-2 opacity-50 ${
                              message.sender === 'user'
                                ? 'text-right'
                                : 'text-left'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-xl bg-white text-gray-500 shadow-sm border border-gray-100 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-500">
                          <Loader2 className="animate-spin text-indigo-600" size={18} />
                          Đang phân tích dữ liệu...
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="px-5 py-3 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleSend(question)}
                        disabled={isLoading}
                        className="whitespace-nowrap px-4 py-2 bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-2">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleSend();
                      }}
                      placeholder="Hỏi về chi tiêu, ngân sách, số dư..."
                      className="w-full pl-5 pr-14 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                    />

                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default ChatBot;