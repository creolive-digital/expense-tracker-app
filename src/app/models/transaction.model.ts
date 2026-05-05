export interface Category {
  id: number;
  name: string;
  type?: 'credit' | 'debit';
  icon?: string;
}

export interface Transaction {
  id?: number;
  type: 'credit' | 'debit';
  amount: number;
  category_id: number;
  description: string;
  date: string; // ISO string
}

export interface TransactionWithCategory extends Transaction {
  category_name: string;
  category_icon: string;
}

export interface Budget {
  id?: number;
  category_id: number;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetWithCategory extends Budget {
  category_name: string;
  actual_spending: number;
}
