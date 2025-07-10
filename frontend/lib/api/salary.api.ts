import { API_BASE_URL, handleResponse, PaginatedResponse } from './core';

export interface Salary {
  id: number;
  staff_id: number;
  amount: number;
  month: number;
  year: number;
  status: 'pending' | 'paid' | 'cancelled';
  month_name: string;
  formatted_amount: string;
  created_at: string;
  updated_at: string;
  staff?: Staff;
}

export interface Staff {
  id: number;
  staff_id: string;
  staff_name: string;
  email: string;
  contact_number: string;
}

export interface SalaryStatistics {
  total_salaries_this_month: number;
  total_amount_this_month: number;
  paid_salaries_this_month: number;
  pending_salaries_this_month: number;
  total_salaries_this_year: number;
  total_amount_this_year: number;
}

export interface CreateSalaryRequest {
  staff_id: number;
  amount: number;
  month: number;
  year: number;
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface UpdateSalaryRequest {
  staff_id?: number;
  amount?: number;
  month?: number;
  year?: number;
  status?: 'pending' | 'paid' | 'cancelled';
}

export interface SalaryFilters {
  staff_id?: number;
  month?: number;
  year?: number;
  status?: string;
  paginate?: boolean;
  per_page?: number;
}

export class SalaryApi {
  static async getAll(filters: SalaryFilters = {}): Promise<PaginatedResponse<Salary> | Salary[]> {
    const params = new URLSearchParams();
    
    if (filters.staff_id) params.append('staff_id', filters.staff_id.toString());
    if (filters.month) params.append('month', filters.month.toString());
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.paginate !== undefined) params.append('paginate', filters.paginate.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const url = `${API_BASE_URL}/salaries${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    return handleResponse<PaginatedResponse<Salary> | Salary[]>(response);
  }

  static async getById(id: number): Promise<Salary> {
    const response = await fetch(`${API_BASE_URL}/salaries/${id}`);
    return handleResponse<Salary>(response);
  }

  static async create(data: CreateSalaryRequest): Promise<Salary> {
    const response = await fetch(`${API_BASE_URL}/salaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Salary>(response);
  }

  static async update(id: number, data: UpdateSalaryRequest): Promise<Salary> {
    const response = await fetch(`${API_BASE_URL}/salaries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Salary>(response);
  }

  static async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/salaries/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  }

  static async getStaffSalaries(staffId: number): Promise<Salary[]> {
    const response = await fetch(`${API_BASE_URL}/staff/${staffId}/salaries`);
    return handleResponse<Salary[]>(response);
  }

  static async getStatistics(): Promise<SalaryStatistics> {
    const response = await fetch(`${API_BASE_URL}/salaries/statistics`);
    return handleResponse<SalaryStatistics>(response);
  }
}

export class StaffApi {
  static async getAll(includeAll = false): Promise<Staff[]> {
    const url = `${API_BASE_URL}/staff${includeAll ? '?all=true' : ''}`;
    const response = await fetch(url);
    return handleResponse<Staff[]>(response);
  }

  static async getById(id: number): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/staff/${id}`);
    return handleResponse<Staff>(response);
  }
}
