import { API_BASE_URL, handleResponse, PaginatedResponse } from './core';

export interface Complain {
  id: number;
  title: string;
  description: string;
  student_id?: number;
  staff_id?: number;
  status: 'pending' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  complaint_date: string;
  resolved_date?: string;
  resolved_by?: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    student_name: string;
    contact_number: string;
  };
  staff?: {
    id: number;
    staff_name: string;
    contact_number: string;
  };
}

export interface ComplainFormData {
  title: string;
  description: string;
  student_id?: number;
  staff_id?: number;
  status?: 'pending' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
  complaint_date?: string;
  remarks?: string;
}

export const complainApi = {
  // Get all complains with pagination
  async getComplains(page: number = 1): Promise<PaginatedResponse<Complain>> {
    const response = await fetch(`${API_BASE_URL}/complains?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<PaginatedResponse<Complain>>(response);
  },

  // Get all complains without pagination
  async getAllComplains(): Promise<Complain[]> {
    const response = await fetch(`${API_BASE_URL}/complains?all=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Complain[]>(response);
  },

  // Get a single complain by ID
  async getComplain(id: string): Promise<Complain> {
    const response = await fetch(`${API_BASE_URL}/complains/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Complain>(response);
  },

  // Create a new complain
  async createComplain(data: ComplainFormData): Promise<Complain> {
    const response = await fetch(`${API_BASE_URL}/complains`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<Complain>(response);
  },

  // Update an existing complain
  async updateComplain(id: string, data: ComplainFormData): Promise<Complain> {
    const response = await fetch(`${API_BASE_URL}/complains/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse<Complain>(response);
  },

  // Delete a complain
  async deleteComplain(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/complains/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<void>(response);
  },
};
