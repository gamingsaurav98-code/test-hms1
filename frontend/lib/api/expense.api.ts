import { API_BASE_URL, handleResponse, PaginatedResponse } from './core';
import { getAuthHeaders } from './auth.api';
import { Expense, ExpenseFormData, ExpenseCategory, ExpenseCategoryFormData } from './types/expense.types';

// Expense API functions
export const expenseApi = {
  // Get all expenses with pagination
  async getExpenses(page: number = 1): Promise<PaginatedResponse<Expense>> {
    const response = await fetch(`${API_BASE_URL}/expenses?page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
    
    if (data.payment_status) {
      formData.append('payment_status', data.payment_status);
    }
    
    if (data.payment_type_id) {
      formData.append('payment_type_id', data.payment_type_id);
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
    
    if (data.payment_status) {
      formData.append('payment_status', data.payment_status);
    }
    
    if (data.payment_type_id) {
      formData.append('payment_type_id', data.payment_type_id);
    }
    
    // Append file if present and validate it again
    if (data.expense_attachment) {
      // Double-check file type and size
      const file = data.expense_attachment;
      
      // Check file type
      const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validFileTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed types: JPG, PNG, GIF, PDF.`);
      }
      
      // Check file size
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error(`File size exceeds 5MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      console.log('Adding file to form data:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)}KB`
      });
      
      formData.append('expense_attachment', file);
    } else {
      console.log('No new attachment file to upload');
    }
    
    // Append purchases if present
    if (data.purchases && data.purchases.length > 0) {
      formData.append('purchases', JSON.stringify(data.purchases));
    }

    console.log('Sending update request to:', `${API_BASE_URL}/expenses/${id}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'POST', // Using POST with _method override for file uploads
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      
      return handleResponse<Expense>(response);
    } catch (error) {
      console.error('Network error during expense update:', error);
      throw error;
    }
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
