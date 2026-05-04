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
