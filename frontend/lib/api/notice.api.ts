import { API_BASE_URL, handleResponse } from './core';
import { getAuthHeaders } from './auth.api';
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
  // Related entity information
  student?: StudentForNotice | null;
  staff?: StaffForNotice | null;
  block?: BlockForNotice | null;
  // Target information from backend
  target_info?: {
    type: string;
    id?: number;
    name: string;
    identifier?: string;
    contact?: string;
    location?: string;
    rooms_count?: number;
  } | null;
  // Additional profile data added by backend
  profile_data?: any;
}

// Notice API functions
// Types for fetching students/staff/blocks for notice creation
export interface StudentForNotice {
  id: number;
  name: string;
  student_id: string;
  contact: string;
  email: string;
  image?: string;
  room?: {
    id: number;
    room_number: string;
    block?: {
      id: number;
      name: string;
      location: string;
    }
  };
  educational_institution?: string;
  level_of_study?: string;
}

export interface StaffForNotice {
  id: number;
  name: string;
  staff_id: string;
  contact: string;
  email: string;
  image?: string;
  educational_institution?: string;
  level_of_study?: string;
}

export interface BlockForNotice {
  id: number;
  name: string;
  location: string;
  manager_name: string;
  manager_contact: string;
  room_count: number;
  total_capacity?: number;
  vacant_beds?: number;
  remarks?: string;
  image?: string;
}

export const noticeApi = {
  // Get all notices with pagination
  async getNotices(page: number = 1): Promise<PaginatedResponse<Notice>> {
    const response = await fetch(`${API_BASE_URL}/notices?page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse<PaginatedResponse<Notice>>(response);
  },
  
  // Get students for notice selection
  async getStudentsForNotice(search: string = '', page: number = 1): Promise<PaginatedResponse<StudentForNotice>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    
    const response = await fetch(`${API_BASE_URL}/notices-create/students?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse<PaginatedResponse<StudentForNotice>>(response);
  },
  
  // Get staff for notice selection
  async getStaffForNotice(search: string = '', page: number = 1): Promise<PaginatedResponse<StaffForNotice>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    
    const response = await fetch(`${API_BASE_URL}/notices-create/staff?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse<PaginatedResponse<StaffForNotice>>(response);
  },
  
  // Get blocks for notice selection
  async getBlocksForNotice(search: string = '', page: number = 1): Promise<PaginatedResponse<BlockForNotice>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    
    const response = await fetch(`${API_BASE_URL}/notices-create/blocks?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse<PaginatedResponse<BlockForNotice>>(response);
  },

  // Get a single notice by ID
  async getNotice(id: string): Promise<Notice> {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
    });
    
    return handleResponse<void>(response);
  },
  
  // Delete an attachment from a notice
  async deleteAttachment(noticeId: string, attachmentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notices/${noticeId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse<void>(response);
  }
};

export default noticeApi;
