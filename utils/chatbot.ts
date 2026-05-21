import { Budget, Bill, Investment, Loan, SavingGoal, Transaction, Wallet } from '../types';
import { CATEGORIES } from '../constants';

export interface FinanceSnapshot {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
  savings: SavingGoal[];
  bills: Bill[];
  loans: Loan[];
  investments: Investment[];
  totalBalance: number;
  currency?: string;
}

const formatCurrency = (value: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value || 0);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getCurrentMonthTransactions = (transactions: Transaction[]) => {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
};

const sumByType = (transactions: Transaction[], type: 'INCOME' | 'EXPENSE') =>
  transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);

const getTopExpenseCategory = (transactions: Transaction[]) => {
  const expenseTx = transactions.filter((t) => t.type === 'EXPENSE');
  if (!expenseTx.length) return null;

  const grouped = expenseTx.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
    return acc;
  }, {});

  const [categoryId, amount] = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return {
    categoryId,
    name: category?.name || 'Khác',
    amount,
  };
};

const getBudgetAlerts = (snapshot: FinanceSnapshot) => {
  const monthTx = getCurrentMonthTransactions(snapshot.transactions).filter((t) => t.type === 'EXPENSE');
  return snapshot.budgets
    .map((budget) => {
      const spent = monthTx
        .filter((t) => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const category = CATEGORIES.find((c) => c.id === budget.categoryId);
      const percent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      return {
        name: category?.name || 'Khác',
        spent,
        limit: budget.limit,
        percent,
      };
    })
    .sort((a, b) => b.percent - a.percent);
};

const getUpcomingBills = (bills: Bill[]) => {
  const now = new Date();
  return bills
    .filter((bill) => !bill.isPaid)
    .map((bill) => {
      const due = new Date(bill.dueDate);
      const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...bill, daysLeft: diff };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
};

const buildOverview = (snapshot: FinanceSnapshot) => {
  const currentMonth = getCurrentMonthTransactions(snapshot.transactions);
  const income = sumByType(currentMonth, 'INCOME');
  const expense = sumByType(currentMonth, 'EXPENSE');
  const savingDelta = income - expense;
  const topExpense = getTopExpenseCategory(currentMonth);
  const upcomingBills = getUpcomingBills(snapshot.bills);
  const budgetAlerts = getBudgetAlerts(snapshot);
  const activeSavings = snapshot.savings.filter((s) => s.currentAmount < s.targetAmount);

  return {
    income,
    expense,
    savingDelta,
    topExpense,
    upcomingBills,
    budgetAlerts,
    activeSavings,
    currentMonth,
  };
};

const buildGeneralAdvice = (snapshot: FinanceSnapshot) => {
  const overview = buildOverview(snapshot);
  const advice: string[] = [];

  if (overview.expense > overview.income && overview.currentMonth.length > 0) {
    advice.push('Chi tiêu tháng này đang lớn hơn thu nhập. Bạn nên cắt các khoản không thiết yếu trong 7 ngày tới.');
  }

  if (overview.topExpense) {
    advice.push(`Nhóm chi lớn nhất hiện tại là ${overview.topExpense.name} với ${formatCurrency(overview.topExpense.amount, snapshot.currency)}.`);
  }

  const criticalBudget = overview.budgetAlerts.find((b) => b.percent >= 100);
  const warningBudget = overview.budgetAlerts.find((b) => b.percent >= 80 && b.percent < 100);

  if (criticalBudget) {
    advice.push(`Ngân sách ${criticalBudget.name} đã vượt mức ${formatCurrency(criticalBudget.limit, snapshot.currency)}.`);
  } else if (warningBudget) {
    advice.push(`Ngân sách ${warningBudget.name} đã dùng ${warningBudget.percent.toFixed(0)}%, nên hạn chế chi thêm.`);
  }

  const urgentBill = overview.upcomingBills.find((b) => b.daysLeft <= 3);
  if (urgentBill) {
    advice.push(`Bạn có hóa đơn ${urgentBill.name} sắp đến hạn trong ${Math.max(urgentBill.daysLeft, 0)} ngày.`);
  }

  if (!advice.length) {
    advice.push('Tình hình tài chính hiện tại khá ổn. Bạn nên tiếp tục theo dõi giao dịch đều và giữ quỹ dự phòng.');
  }

  return advice;
};

export const buildFinanceContextForAI = (snapshot: FinanceSnapshot) => {
  const overview = buildOverview(snapshot);
  const budgetAlerts = overview.budgetAlerts.slice(0, 5).map((b) => ({
    category: b.name,
    spent: b.spent,
    limit: b.limit,
    percent: Number(b.percent.toFixed(1)),
  }));

  const savings = snapshot.savings.map((s) => ({
    name: s.name,
    currentAmount: s.currentAmount,
    targetAmount: s.targetAmount,
    progress: s.targetAmount > 0 ? Number(((s.currentAmount / s.targetAmount) * 100).toFixed(1)) : 0,
    deadline: s.deadline,
  }));

  const upcomingBills = overview.upcomingBills.slice(0, 5).map((bill) => ({
    name: bill.name,
    amount: bill.amount,
    dueDate: bill.dueDate,
    daysLeft: bill.daysLeft,
  }));

  return {
    totalBalance: snapshot.totalBalance,
    currency: snapshot.currency || 'VND',
    walletCount: snapshot.wallets.length,
    transactionCount: snapshot.transactions.length,
    currentMonthIncome: overview.income,
    currentMonthExpense: overview.expense,
    currentMonthSavingDelta: overview.savingDelta,
    topExpenseCategory: overview.topExpense,
    budgets: budgetAlerts,
    savings,
    upcomingBills,
    loans: snapshot.loans,
    investments: snapshot.investments,
    recentTransactions: snapshot.transactions.slice(0, 8),
  };
};

export const getSuggestedPrompts = (snapshot: FinanceSnapshot) => {
  const prompts = [
    'Phân tích chi tiêu tháng này',
    'Tôi còn bao nhiêu tiền?',
    'Cho tôi lời khuyên tiết kiệm',
  ];

  if (snapshot.budgets.length) prompts.push('Ngân sách nào sắp vượt mức?');
  if (snapshot.savings.length) prompts.push('Tiến độ tiết kiệm của tôi ra sao?');
  if (snapshot.bills.some((b) => !b.isPaid)) prompts.push('Hóa đơn nào sắp đến hạn?');

  return prompts.slice(0, 5);
};

export const generateLocalResponse = (message: string, snapshot: FinanceSnapshot) => {
  const text = normalize(message);
  const overview = buildOverview(snapshot);
  const advice = buildGeneralAdvice(snapshot);
  const currency = snapshot.currency || 'VND';

  if (/xin chao|chao|hello|hi\b/.test(text)) {
    return 'Chào bạn, mình có thể hỗ trợ xem số dư, phân tích chi tiêu, ngân sách, tiết kiệm và nhắc các khoản sắp đến hạn ngay từ dữ liệu hiện có trong app.';
  }

  if (/so du|con bao nhieu tien|tong tien|tong so du|bao nhieu tien/.test(text)) {
    return `Tổng số dư hiện tại của bạn là ${formatCurrency(snapshot.totalBalance, currency)} trên ${snapshot.wallets.length} ví. Bạn có thể hỏi thêm mình về ví nào còn nhiều tiền nhất hoặc chi tiêu tháng này.`;
  }

  if (/chi tieu thang|phan tich chi tieu|da chi bao nhieu|tong chi/.test(text)) {
    const top = overview.topExpense
      ? `Nhóm chi lớn nhất là ${overview.topExpense.name} với ${formatCurrency(overview.topExpense.amount, currency)}.`
      : 'Hiện chưa có nhóm chi tiêu nổi bật.';
    return `Trong tháng này, bạn đã thu ${formatCurrency(overview.income, currency)} và chi ${formatCurrency(overview.expense, currency)}. Chênh lệch hiện là ${formatCurrency(overview.savingDelta, currency)}. ${top}`;
  }

  if (/thu nhap|tong thu|kiem duoc bao nhieu/.test(text)) {
    return `Tổng thu nhập trong tháng hiện tại là ${formatCurrency(overview.income, currency)}. Nếu bạn muốn, mình có thể so với tổng chi để xem tháng này đang dư hay hụt.`;
  }

  if (/ngan sach|vuot muc|budget/.test(text)) {
    if (!snapshot.budgets.length) {
      return 'Hiện bạn chưa tạo ngân sách nào. Bạn nên thêm ngân sách cho các nhóm như Ăn uống, Di chuyển hoặc Mua sắm để chatbot theo dõi tốt hơn.';
    }
    const topBudgets = overview.budgetAlerts.slice(0, 3);
    return topBudgets
      .map((b, i) => `${i + 1}. ${b.name}: đã dùng ${formatCurrency(b.spent, currency)}/${formatCurrency(b.limit, currency)} (${b.percent.toFixed(0)}%)`)
      .join('\n');
  }

  if (/tiet kiem|saving|muc tieu/.test(text)) {
    if (!snapshot.savings.length) {
      return 'Bạn chưa có mục tiêu tiết kiệm nào. Nên tạo ít nhất một mục tiêu như quỹ dự phòng hoặc mua đồ dùng để chatbot tư vấn sát hơn.';
    }
    return snapshot.savings
      .slice(0, 3)
      .map((s, i) => {
        const progress = s.targetAmount > 0 ? (s.currentAmount / s.targetAmount) * 100 : 0;
        return `${i + 1}. ${s.name}: ${formatCurrency(s.currentAmount, currency)}/${formatCurrency(s.targetAmount, currency)} (${progress.toFixed(0)}%)`;
      })
      .join('\n');
  }

  if (/hoa don|sap den han|den han|bill/.test(text)) {
    const upcoming = overview.upcomingBills.slice(0, 3);
    if (!upcoming.length) {
      return 'Hiện chưa có hóa đơn chưa thanh toán nào sắp đến hạn.';
    }
    return upcoming
      .map((bill, i) => `${i + 1}. ${bill.name}: ${formatCurrency(bill.amount, currency)}, hạn ${bill.dueDate}, còn ${Math.max(bill.daysLeft, 0)} ngày`)
      .join('\n');
  }

  if (/vi nao|wallet|tai khoan nao/.test(text)) {
    if (!snapshot.wallets.length) return 'Hiện bạn chưa có ví nào trong hệ thống.';
    const sorted = [...snapshot.wallets].sort((a, b) => b.balance - a.balance);
    const top = sorted[0];
    return `Ví có số dư cao nhất hiện tại là ${top.name} với ${formatCurrency(top.balance, currency)}. Tổng cộng bạn đang quản lý ${snapshot.wallets.length} ví.`;
  }

  if (/dau tu|investment/.test(text)) {
    if (!snapshot.investments.length) {
      return 'Hiện bạn chưa có khoản đầu tư nào được lưu trong app.';
    }
    const totalInvested = snapshot.investments.reduce((sum, item) => sum + item.amount, 0);
    const currentValue = snapshot.investments.reduce((sum, item) => sum + item.currentValue, 0);
    const delta = currentValue - totalInvested;
    return `Bạn đang có ${snapshot.investments.length} khoản đầu tư. Vốn gốc là ${formatCurrency(totalInvested, currency)}, giá trị hiện tại là ${formatCurrency(currentValue, currency)}, chênh lệch ${formatCurrency(delta, currency)}.`;
  }

  if (/vay|no|loan/.test(text)) {
    if (!snapshot.loans.length) {
      return 'Hiện chưa có khoản vay hoặc cho vay nào được lưu.';
    }
    const borrow = snapshot.loans.filter((l) => l.type === 'BORROW').reduce((sum, l) => sum + l.amount, 0);
    const lend = snapshot.loans.filter((l) => l.type === 'LEND').reduce((sum, l) => sum + l.amount, 0);
    return `Tổng tiền bạn đang vay là ${formatCurrency(borrow, currency)} và tổng tiền bạn cho vay là ${formatCurrency(lend, currency)}.`;
  }

  if (/loi khuyen|goi y|toi uu|tiet kiem hon|nen lam gi/.test(text)) {
    return advice.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }

  return [
    'Mình đã đọc câu hỏi của bạn.',
    `Hiện app có ${snapshot.transactions.length} giao dịch, ${snapshot.wallets.length} ví, ${snapshot.budgets.length} ngân sách và số dư tổng ${formatCurrency(snapshot.totalBalance, currency)}.`,
    'Bạn có thể hỏi cụ thể hơn như: “phân tích chi tiêu tháng này”, “tôi còn bao nhiêu tiền”, “ngân sách nào sắp vượt mức” hoặc “cho tôi lời khuyên tiết kiệm”.',
  ].join(' ');
};
