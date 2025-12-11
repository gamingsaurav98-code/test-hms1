import { Student, Supplier, PaymentType, Attachment } from '../types';

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface ExpenseCategoryFormData {
  name: string;
  description?: string;
}

export interface Purchase {
  id: string;
  expense_id: string;
  item_name: string;
  item_quantity: number;
  item_price: number;
  item_unit_price: number;
  purchase_date: string;
  total_amount: number;
  created_at: string;
  updated_at?: string;
}

export interface PurchaseFormData {
  item_name: string;
  item_quantity: number;
  item_price: number;
  item_unit_price: number;
  purchase_date: string;
  total_amount: number;
}

export interface Expense {
  id: string;
  expense_category_id: string;
  expense_type: string;
  amount: number;
  expense_date: string;
  title: string;
  description?: string;
  student_id?: string;
  staff_id?: string;
  supplier_id?: string;
  expense_attachment?: string;
  payment_type_id?: string; // Made optional since we removed it from forms
  paid_amount?: number;
  due_amount?: number;
  payment_status: string;
  created_at: string;
  updated_at?: string;
  expenseCategory?: ExpenseCategory;
  student?: Student;
  supplier?: Supplier;
  paymentType?: PaymentType;
  purchases?: Purchase[];
  attachments?: Attachment[];
}

export interface ExpenseFormData {
  expense_category_id: string;
  expense_type?: string; // Made optional since it's auto-generated
  amount: number;
  expense_date: string;
  title?: string; // Made optional since it's auto-generated
  description?: string;
  student_id?: string;
  staff_id?: string;
  supplier_id?: string;
  expense_attachment?: File | null;
  paid_amount?: number;
  due_amount?: number;
  payment_status?: string;
  payment_type_id?: string;
  purchases?: PurchaseFormData[];
}
