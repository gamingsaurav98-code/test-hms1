import { API_BASE_URL, handleResponse, PaginatedResponse } from './core';
import { Expense, ExpenseFormData, ExpenseCategory, ExpenseCategoryFormData } from './types/expense.types';

// Expense API functions
export const expenseApi = {
  // Get all expenses with pagination
  async getExpenses(page: number = 1): Promise<PaginatedResponse<Expense>> {
    const response = await fetch(`${API_BASE_URL}/expenses?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<PaginatedResponse<Expense>>(response);
  },

  // Get expenses by category
  async getExpensesByCategory(categoryId: string, page: number = 1): Promise<PaginatedResponse<Expense>> {
    const response = await fetch(`${API_BASE_URL}/expenses/category/${categoryId}?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<PaginatedResponse<Expense>>(response);
  },

  // Get expenses by date range
  async getExpensesByDateRange(startDate: string, endDate: string, page: number = 1): Promise<PaginatedResponse<Expense>> {
    const response = await fetch(`${API_BASE_URL}/expenses/date-range?start_date=${startDate}&end_date=${endDate}&page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<PaginatedResponse<Expense>>(response);
  },

  // Get a single expense by ID
  async getExpense(id: string): Promise<Expense> {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Expense>(response);
  },

  // Create a new expense
  async createExpense(data: ExpenseFormData): Promise<Expense> {
    const formData = new FormData();
    
    // Append all form fields
    formData.append('expense_category_id', data.expense_category_id);
    formData.append('expense_type', data.expense_type || '');
    formData.append('amount', data.amount.toString());
    formData.append('expense_date', data.expense_date);
    formData.append('title', data.title || '');
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.student_id) {
      formData.append('student_id', data.student_id);
    }
    
    if (data.staff_id) {
      formData.append('staff_id', data.staff_id);
    }
    
    if (data.supplier_id) {
      formData.append('supplier_id', data.supplier_id);
    }
    
    if (data.paid_amount !== undefined) {
      formData.append('paid_amount', data.paid_amount.toString());
    }
    
    if (data.due_amount !== undefined) {
      formData.append('due_amount', data.due_amount.toString());
    }
    
    // Append file if present
    if (data.expense_attachment) {
      formData.append('expense_attachment', data.expense_attachment);
    }
    
    // Append purchases if present
    if (data.purchases && data.purchases.length > 0) {
      formData.append('purchases', JSON.stringify(data.purchases));
    }

    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    return handleResponse<Expense>(response);
  },

  // Update an existing expense
  async updateExpense(id: string, data: ExpenseFormData): Promise<Expense> {
    const formData = new FormData();
    
    // Add method override for Laravel
    formData.append('_method', 'PUT');
    
    // Append all form fields
    formData.append('expense_category_id', data.expense_category_id);
    formData.append('expense_type', data.expense_type || '');
    formData.append('amount', data.amount.toString());
    formData.append('expense_date', data.expense_date);
    formData.append('title', data.title || '');
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.student_id) {
      formData.append('student_id', data.student_id);
    }
    
    if (data.staff_id) {
      formData.append('staff_id', data.staff_id);
    }
    
    if (data.supplier_id) {
      formData.append('supplier_id', data.supplier_id);
    }
    
    if (data.paid_amount !== undefined) {
      formData.append('paid_amount', data.paid_amount.toString());
    }
    
    if (data.due_amount !== undefined) {
      formData.append('due_amount', data.due_amount.toString());
    }
    
    // Append file if present
    if (data.expense_attachment) {
      formData.append('expense_attachment', data.expense_attachment);
    }
    
    // Append purchases if present
    if (data.purchases && data.purchases.length > 0) {
      formData.append('purchases', JSON.stringify(data.purchases));
    }

    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'POST', // Using POST with _method override for file uploads
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });
    
    return handleResponse<Expense>(response);
  },

  // Delete an expense
  async deleteExpense(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<void>(response);
  },
};

// Expense Category API functions
export const expenseCategoryApi = {
  // Get all expense categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const response = await fetch(`${API_BASE_URL}/expense-categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<ExpenseCategory[]>(response);
  },

  // Get a single expense category by ID
  async getExpenseCategory(id: string): Promise<ExpenseCategory> {
    const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<ExpenseCategory>(response);
  },

  // Create a new expense category
  async createExpenseCategory(data: ExpenseCategoryFormData): Promise<ExpenseCategory> {
    const response = await fetch(`${API_BASE_URL}/expense-categories`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<ExpenseCategory>(response);
  },

  // Update an existing expense category
  async updateExpenseCategory(id: string, data: ExpenseCategoryFormData): Promise<ExpenseCategory> {
    const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<ExpenseCategory>(response);
  },

  // Delete an expense category
  async deleteExpenseCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/expense-categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<void>(response);
  },
};
