export interface Transaction {
  id: string;
  amount: number;
  title: string;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
}