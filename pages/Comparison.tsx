import React, { useMemo, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarSearch, TrendingDown, TrendingUp } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../constants';
import { Transaction } from '../types';

type CompareMode = 'PREVIOUS_MONTH' | 'SAME_MONTH_LAST_YEAR';

type PeriodInfo = {
  month: number;
  year: number;
  label: string;
};

type CategoryCompare = {
  id: string;
  name: string;
  icon: string;
  current: number;
  previous: number;
  diff: number;
  percent: number | null;
};

const monthNames = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const getPeriodLabel = (month: number, year: number) => `${monthNames[month]} ${year}`;

const getComparePeriod = (month: number, year: number, mode: CompareMode): PeriodInfo => {
  if (mode === 'SAME_MONTH_LAST_YEAR') {
    return {
      month,
      year: year - 1,
      label: getPeriodLabel(month, year - 1),
    };
  }

  if (month === 0) {
    return {
      month: 11,
      year: year - 1,
      label: getPeriodLabel(11, year - 1),
    };
  }

  return {
    month: month - 1,
    year,
    label: getPeriodLabel(month - 1, year),
  };
};

const filterByMonth = (transactions: Transaction[], month: number, year: number) => {
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
};

const sumByType = (transactions: Transaction[], type: 'INCOME' | 'EXPENSE') => {
  return transactions
    .filter(t => t.type === type)
    .reduce((total, item) => total + item.amount, 0);
};

const percentChange = (current: number, previous: number) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

const Comparison: React.FC = () => {
  const { transactions, currency } = useFinance();

  const now = new Date();
  const thisYear = now.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [compareMode, setCompareMode] = useState<CompareMode>('PREVIOUS_MONTH');
  const [alertThreshold, setAlertThreshold] = useState(20);

  const currentPeriod = {
    month: selectedMonth,
    year: selectedYear,
    label: getPeriodLabel(selectedMonth, selectedYear),
  };

  const comparePeriod = getComparePeriod(selectedMonth, selectedYear, compareMode);

  const currentTxs = useMemo(
    () => filterByMonth(transactions, currentPeriod.month, currentPeriod.year),
    [transactions, currentPeriod.month, currentPeriod.year]
  );

  const compareTxs = useMemo(
    () => filterByMonth(transactions, comparePeriod.month, comparePeriod.year),
    [transactions, comparePeriod.month, comparePeriod.year]
  );

  const currentExpense = sumByType(currentTxs, 'EXPENSE');
  const compareExpense = sumByType(compareTxs, 'EXPENSE');

  const currentIncome = sumByType(currentTxs, 'INCOME');
  const compareIncome = sumByType(compareTxs, 'INCOME');

  const currentSaving = currentIncome - currentExpense;
  const compareSaving = compareIncome - compareExpense;

  const expenseChange = percentChange(currentExpense, compareExpense);
  const incomeChange = percentChange(currentIncome, compareIncome);
  const savingChange = currentSaving - compareSaving;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(val);

  const formatPercent = (val: number | null) => {
    if (val === null) return 'Mới phát sinh';
    if (val === 0) return '0%';
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const expenseCategoryCompare = useMemo<CategoryCompare[]>(() => {
    return CATEGORIES
      .filter(cat => cat.type === 'EXPENSE')
      .map(cat => {
        const current = currentTxs
          .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
          .reduce((total, item) => total + item.amount, 0);

        const previous = compareTxs
          .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
          .reduce((total, item) => total + item.amount, 0);

        const diff = current - previous;

        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          current,
          previous,
          diff,
          percent: percentChange(current, previous),
        };
      })
      .filter(item => item.current > 0 || item.previous > 0)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [currentTxs, compareTxs]);

  const alerts = expenseCategoryCompare.filter(item => {
    if (item.previous === 0 && item.current > 0) return true;
    if (item.percent === null) return false;
    return Math.abs(item.percent) >= alertThreshold;
  });

  const chartData = expenseCategoryCompare.slice(0, 8).map(item => ({
    name: item.name,
    [currentPeriod.label]: item.current,
    [comparePeriod.label]: item.previous,
  }));

  const summaryCards = [
    {
      label: 'Tổng chi',
      current: currentExpense,
      previous: compareExpense,
      change: expenseChange,
      icon: <ArrowDownRight size={18} />,
      tone: currentExpense > compareExpense ? 'rose' : 'emerald',
    },
    {
      label: 'Tổng thu',
      current: currentIncome,
      previous: compareIncome,
      change: incomeChange,
      icon: <ArrowUpRight size={18} />,
      tone: currentIncome >= compareIncome ? 'emerald' : 'rose',
    },
    {
      label: 'Tiết kiệm ròng',
      current: currentSaving,
      previous: compareSaving,
      change: compareSaving === 0 ? null : ((currentSaving - compareSaving) / Math.abs(compareSaving)) * 100,
      icon: savingChange >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />,
      tone: savingChange >= 0 ? 'emerald' : 'rose',
    },
  ];

  const years = Array.from(new Set([
    thisYear - 3,
    thisYear - 2,
    thisYear - 1,
    thisYear,
    thisYear + 1,
    ...transactions.map(t => new Date(t.date).getFullYear()),
  ])).sort((a, b) => b - a);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <CalendarSearch size={14} />
            Phân tích biến động
          </div>

          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            So sánh chi tiêu
          </h2>

          <p className="text-gray-500 font-medium mt-2">
            So sánh {currentPeriod.label} với {comparePeriod.label}, phát hiện khoản chi tăng/giảm bất thường.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] p-3 shadow-sm flex flex-col md:flex-row gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-gray-50 rounded-2xl px-4 py-3 text-xs font-black text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {monthNames.map((name, index) => (
              <option key={name} value={index}>{name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-gray-50 rounded-2xl px-4 py-3 text-xs font-black text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={compareMode}
            onChange={(e) => setCompareMode(e.target.value as CompareMode)}
            className="bg-gray-50 rounded-2xl px-4 py-3 text-xs font-black text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PREVIOUS_MONTH">So với tháng trước</option>
            <option value="SAME_MONTH_LAST_YEAR">So với cùng tháng năm trước</option>
          </select>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {card.label}
              </p>

              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                card.tone === 'emerald'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}>
                {card.icon}
              </div>
            </div>

            <p className="text-2xl font-black text-gray-900">
              {formatCurrency(card.current)}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs font-bold">
              <span className="text-gray-400">
                Kỳ trước: {formatCurrency(card.previous)}
              </span>

              <span className={
                card.change === null
                  ? 'text-indigo-600'
                  : card.change >= 0
                    ? 'text-rose-600'
                    : 'text-emerald-600'
              }>
                {formatPercent(card.change)}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900">
                Chi tiêu theo hạng mục
              </h3>
              <p className="text-xs font-bold text-gray-400 mt-1">
                Hiển thị tối đa 8 hạng mục có biến động lớn nhất.
              </p>
            </div>
          </div>

          <div className="h-[360px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis
                    tickFormatter={(value) => `${Number(value) / 1000}k`}
                    tick={{ fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey={comparePeriod.label} radius={[10, 10, 0, 0]} fill="#c7d2fe" />
                  <Bar dataKey={currentPeriod.label} radius={[10, 10, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">
                  📊
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  Chưa có dữ liệu để so sánh
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-300">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h3 className="font-black text-lg">
                Cảnh báo biến động
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Ngưỡng từ {alertThreshold}%
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Ngưỡng cảnh báo
            </label>

            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
              className="w-full mt-3 accent-indigo-500"
            />
          </div>

          <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
            {alerts.length > 0 ? alerts.map(item => {
              const isIncrease = item.diff > 0;

              return (
                <div key={item.id} className="bg-white/10 border border-white/10 rounded-3xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                        {item.icon}
                      </div>

                      <div>
                        <p className="font-black text-sm">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                          {isIncrease ? 'Tăng thêm' : 'Giảm'} {formatCurrency(Math.abs(item.diff))}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-black ${
                      isIncrease ? 'text-rose-300' : 'text-emerald-300'
                    }`}>
                      {formatPercent(item.percent)}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-white/10 border border-white/10 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-gray-300">
                  Không có biến động vượt ngưỡng.
                </p>
                <p className="text-[10px] text-gray-500 font-bold mt-2">
                  Bạn có thể kéo thanh ngưỡng xuống thấp hơn để kiểm tra kỹ hơn.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              Chi tiết thay đổi từng hạng mục
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Giúp bạn biết chính xác tháng/năm này đã chi tiêu khác gì so với kỳ trước.
            </p>
          </div>
        </div>

        {expenseCategoryCompare.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {expenseCategoryCompare.map(item => {
              const isIncrease = item.diff > 0;
              const noChange = item.diff === 0;

              return (
                <div
                  key={item.id}
                  className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 md:items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="md:col-span-2 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>

                    <div>
                      <p className="font-black text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Hạng mục chi tiêu
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {currentPeriod.label}
                    </p>
                    <p className="font-black text-gray-900">
                      {formatCurrency(item.current)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {comparePeriod.label}
                    </p>
                    <p className="font-black text-gray-500">
                      {formatCurrency(item.previous)}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <p className={`font-black ${
                      noChange
                        ? 'text-gray-400'
                        : isIncrease
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                    }`}>
                      {noChange ? 'Không đổi' : `${isIncrease ? '+' : '-'}${formatCurrency(Math.abs(item.diff))}`}
                    </p>

                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {formatPercent(item.percent)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              📭
            </div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
              Không có dữ liệu chi tiêu trong 2 kỳ này
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Comparison;