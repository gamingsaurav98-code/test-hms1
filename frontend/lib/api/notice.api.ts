import { API_BASE_URL, handleResponse } from './core';
import { PaginatedResponse } from './core';

export interface NoticeFormData {
  title: string;
  description: string;
  schedule_time: string;
  status?: string; // 'active', 'inactive'
  target_type: string; // 'all', 'student', 'staff', 'specific_student', 'specific_staff', 'block'
  notice_type?: string; // 'general', 'urgent', 'event', 'announcement'
  notice_attachments?: File[];
  student_id?: number | null;
  staff_id?: number | null;
  block_id?: number | null;
}

export interface Notice extends Omit<NoticeFormData, 'notice_attachments'> {
  id: number;
  created_at: string;
  updated_at: string;
  notice_attachment?: string | null;
  attachments: {
    id: number;
    path: string;
    name: string;
    type: string;
  }[];
}

// Notice API functions
export const noticeApi = {
  // Get all notices with pagination
  async getNotices(page: number = 1): Promise<PaginatedResponse<Notice>> {
    const response = await fetch(`${API_BASE_URL}/notices?page=${page}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<PaginatedResponse<Notice>>(response);
  },

  // Get a single notice by ID
  async getNotice(id: string): Promise<Notice> {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<Notice>(response);
  },

  // Create a new notice
  async createNotice(noticeData: NoticeFormData): Promise<Notice> {
    // Convert to FormData if files are included
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.entries(noticeData).forEach(([key, value]) => {
      if (key === 'notice_attachments' && value) {
        // Add each file to form data
        Array.from(value as File[]).forEach((file, index) => {
          formData.append(`notice_attachments[${index}]`, file);
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    const response = await fetch(`${API_BASE_URL}/notices`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header when sending FormData
      // The browser will set it with the correct boundary
    });
    
    return handleResponse<Notice>(response);
  },

  // Update an existing notice
  async updateNotice(id: string, noticeData: NoticeFormData): Promise<Notice> {
    // Convert to FormData
    const formData = new FormData();
    formData.append('_method', 'PUT'); // For Laravel to handle as PUT request
    
    // Add all fields to FormData
    Object.entries(noticeData).forEach(([key, value]) => {
      if (key === 'notice_attachments' && value) {
        // Add each file to form data
        Array.from(value as File[]).forEach((file, index) => {
          formData.append(`notice_attachments[${index}]`, file);
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: 'POST', // Use POST for multipart form data with _method=PUT
      body: formData,
      // Don't set Content-Type header when sending FormData
    });
    
    return handleResponse<Notice>(response);
  },

  // Delete a notice
  async deleteNotice(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<void>(response);
  },
  
  // Delete an attachment from a notice
  async deleteAttachment(noticeId: string, attachmentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notices/${noticeId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse<void>(response);
  }
};

export default noticeApi;
