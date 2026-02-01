
import { Category } from './types';

export const CATEGORIES: Category[] = [
  // Expenses
  { id: 'exp_food', name: 'Ăn uống', icon: '🍔', color: 'bg-orange-500', type: 'EXPENSE' },
  { id: 'exp_transport', name: 'Di chuyển', icon: '🚗', color: 'bg-blue-500', type: 'EXPENSE' },
  { id: 'exp_shopping', name: 'Mua sắm', icon: '🛍️', color: 'bg-pink-500', type: 'EXPENSE' },
  { id: 'exp_health', name: 'Sức khỏe', icon: '💊', color: 'bg-green-500', type: 'EXPENSE' },
  { id: 'exp_education', name: 'Học tập', icon: '📚', color: 'bg-purple-500', type: 'EXPENSE' },
  { id: 'exp_bill', name: 'Hóa đơn', icon: '📄', color: 'bg-red-500', type: 'EXPENSE' },
  { id: 'exp_entertainment', name: 'Giải trí', icon: '🎬', color: 'bg-indigo-500', type: 'EXPENSE' },
  
  // Income
  { id: 'inc_salary', name: 'Lương', icon: '💰', color: 'bg-emerald-600', type: 'INCOME' },
  { id: 'inc_bonus', name: 'Thưởng', icon: '🎖️', color: 'bg-yellow-500', type: 'INCOME' },
  { id: 'inc_gift', name: 'Quà tặng', icon: '🎁', color: 'bg-rose-500', type: 'INCOME' },
  { id: 'inc_other', name: 'Khác', icon: '➕', color: 'bg-gray-500', type: 'INCOME' },
];

export const WALLET_TYPES = [
  { id: 'CASH', name: 'Tiền mặt', icon: '💵' },
  { id: 'BANK', name: 'Ngân hàng', icon: '🏦' },
  { id: 'E-WALLET', name: 'Ví điện tử', icon: '📱' },
];

export const SUPPORTED_BANKS = [
  { id: 'vcb', name: 'Vietcombank', icon: '🏦', shortName: 'VCB', color: '#006a33' },
  { id: 'tcb', name: 'Techcombank', icon: '🏦', shortName: 'TCB', color: '#e31837' },
  { id: 'bidv', name: 'BIDV', icon: '🏦', shortName: 'BIDV', color: '#213a8f' },
  { id: 'vpb', name: 'VPBank', icon: '🏦', shortName: 'VPB', color: '#00b14f' },
  { id: 'mbb', name: 'MB Bank', icon: '🏦', shortName: 'MBB', color: '#003399' },
  { id: 'tpv', name: 'TPBank', icon: '🏦', shortName: 'TPB', color: '#522d80' },
  { id: 'vbi', name: 'VietinBank', icon: '🏦', shortName: 'VBI', color: '#00aed1' },
  { id: 'acb', name: 'ACB', icon: '🏦', shortName: 'ACB', color: '#005baa' },
  { id: 'momo', name: 'Momo', icon: '📱', shortName: 'Momo', color: '#a50064' },
  { id: 'zalopay', name: 'ZaloPay', icon: '📱', shortName: 'ZaloPay', color: '#008fe5' },
];
