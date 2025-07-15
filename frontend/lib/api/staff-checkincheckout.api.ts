import { API_BASE_URL, handleResponse, PaginatedResponse } from './core';

// Staff Check-in/Check-out interfaces
export interface StaffCheckInCheckOut {
  id: string;
  staff_id: string;
  block_id: string;
  checkout_rule_id?: string;
  date: string;
  checkin_time?: string;
  checkout_time?: string;
  checkout_duration?: string;
  status: 'pending' | 'approved' | 'declined' | 'checked_in' | 'checked_out';
  remarks?: string;
  created_at: string;
  updated_at: string;
  // Relations
  staff?: {
    id: string;
    staff_name: string;
    staff_id?: string;
    contact_number: string;
    email: string;
    position?: string;
    department?: string;
    salary_amount?: string;
  };
  block?: {
    id: string;
    block_name: string;
  };
  checkout_rule?: {
    id: string;
    percentage: number;
    active_after_days?: number;
  };
  checkout_financials?: StaffCheckoutFinancial[];
}

export interface StaffCheckoutRule {
  id: string;
  staff_id: string;
  is_active: boolean;
  active_after_days?: number;
  percentage?: number;
  created_at: string;
  updated_at: string;
  // Relations
  staff?: {
    id: string;
    staff_name: string;
    staff_id?: string;
    position?: string;
    department?: string;
  };
}

export interface StaffCheckoutFinancial {
  id: string;
  staff_id: string;
  checkout_id: string;
  checkout_rule_id?: string;
  checkout_duration?: string;
  deducted_amount: string;
  created_at: string;
  updated_at: string;
  // Relations
  staff?: {
    id: string;
    staff_name: string;
  };
  check_in_check_out?: StaffCheckInCheckOut;
  checkout_rule?: StaffCheckoutRule;
}

// Form data interfaces
export interface StaffCheckInCheckOutFormData {
  staff_id: string;
  block_id: string;
  date: string;
  checkin_time?: string;
  checkout_time?: string;
  remarks?: string;
}

export interface CheckInFormData {
  staff_id: string;
  block_id: string;
  checkin_time?: string;
  remarks?: string;
}

export interface CheckOutFormData {
  staff_id: string;
  checkout_time?: string;
  remarks?: string;
}

export interface StaffCheckoutRuleFormData {
  staff_id: string;
  is_active: boolean;
  active_after_days?: number;
  percentage?: number;
}

// Filter interfaces
export interface CheckInCheckOutFilters {
  staff_id?: string;
  block_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: 'checked_in' | 'checked_out';
  department?: string;
  position?: string;
  per_page?: number;
  all?: boolean;
}

export interface AttendanceStatistics {
  total_records: number;
  checked_in_count: number;
  checked_out_count: number;
  unique_staff: number;
  by_date: Array<{
    date: string;
    total: number;
    checked_in: number;
    checked_out: number;
  }>;
  by_block: Array<{
    block_id: string;
    block_name: string;
    total: number;
    checked_in: number;
    checked_out: number;
    unique_staff: number;
  }>;
  by_department: Array<{
    department: string;
    total: number;
    checked_in: number;
    checked_out: number;
    unique_staff: number;
  }>;
}

export interface StaffStatistics {
  total_checkouts: number;
  total_deducted_amount: number;
  average_checkout_duration_hours: number;
  recent_checkouts: StaffCheckInCheckOut[];
}

// API functions for Staff Check-in/Check-out
export const staffCheckInCheckOutApi = {
  // Get all check-in/check-out records
  async getCheckInCheckOuts(
    page: number = 1, 
    filters: CheckInCheckOutFilters = {}
  ): Promise<PaginatedResponse<StaffCheckInCheckOut>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts?${queryParams}`);
    return handleResponse<PaginatedResponse<StaffCheckInCheckOut>>(response);
  },

  // Get specific check-in/check-out record
  async getCheckInCheckOut(id: string): Promise<{ data: StaffCheckInCheckOut }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/${id}`);
    return handleResponse<{ data: StaffCheckInCheckOut }>(response);
  },

  // Create new check-in/check-out record
  async createCheckInCheckOut(data: StaffCheckInCheckOutFormData): Promise<{ data: StaffCheckInCheckOut }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ data: StaffCheckInCheckOut }>(response);
  },

  // Update check-in/check-out record
  async updateCheckInCheckOut(id: string, data: Partial<StaffCheckInCheckOutFormData>): Promise<{ data: StaffCheckInCheckOut }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ data: StaffCheckInCheckOut }>(response);
  },

  // Delete check-in/check-out record
  async deleteCheckInCheckOut(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  // Quick check-in
  async checkIn(data: CheckInFormData): Promise<{ data: StaffCheckInCheckOut }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ data: StaffCheckInCheckOut }>(response);
  },

  // Quick check-out
  async checkOut(data: CheckOutFormData): Promise<{ data: StaffCheckInCheckOut }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ data: StaffCheckInCheckOut }>(response);
  },

  // Get today's attendance
  async getTodayAttendance(blockId?: string): Promise<{ data: StaffCheckInCheckOut[]; date: string }> {
    const queryParams = blockId ? `?block_id=${blockId}` : '';
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/today/attendance${queryParams}`);
    return handleResponse<{ data: StaffCheckInCheckOut[]; date: string }>(response);
  },

  // Approve checkout request
  async approveCheckout(id: string): Promise<{ data: StaffCheckInCheckOut }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/${id}/approve-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<{ data: StaffCheckInCheckOut }>(response);
  },

  // Decline checkout request
  async declineCheckout(id: string, remarks?: string): Promise<{ data: StaffCheckInCheckOut }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/${id}/decline-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        remarks: remarks || 'Checkout declined by admin'
      }),
    });
    return handleResponse<{ data: StaffCheckInCheckOut }>(response);
  },

  // Get staff statistics
  async getStaffStatistics(
    staffId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<{ data: StaffStatistics }> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/statistics/${staffId}?${queryParams}`);
    return handleResponse<{ data: StaffStatistics }>(response);
  },

  // Get attendance statistics
  async getAttendanceStatistics(
    startDate?: string, 
    endDate?: string, 
    blockId?: string,
    department?: string
  ): Promise<{ data: AttendanceStatistics }> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    if (blockId) queryParams.append('block_id', blockId);
    if (department) queryParams.append('department', department);
    
    const response = await fetch(`${API_BASE_URL}/staff-checkincheckouts/attendance/statistics?${queryParams}`);
    return handleResponse<{ data: AttendanceStatistics }>(response);
  },
};

// API functions for Staff Checkout Rules
export const staffCheckoutRuleApi = {
  // Get all checkout rules
  async getCheckoutRules(
    page: number = 1, 
    filters: { staff_id?: string; is_active?: boolean; department?: string; position?: string; all?: boolean } = {}
  ): Promise<PaginatedResponse<StaffCheckoutRule>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules?${queryParams}`);
    return handleResponse<PaginatedResponse<StaffCheckoutRule>>(response);
  },

  // Get specific checkout rule
  async getCheckoutRule(id: string): Promise<{ data: StaffCheckoutRule }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules/${id}`);
    return handleResponse<{ data: StaffCheckoutRule }>(response);
  },

  // Create new checkout rule
  async createCheckoutRule(data: StaffCheckoutRuleFormData): Promise<{ data: StaffCheckoutRule }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ data: StaffCheckoutRule }>(response);
  },

  // Update checkout rule
  async updateCheckoutRule(id: string, data: Partial<StaffCheckoutRuleFormData>): Promise<{ data: StaffCheckoutRule }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ data: StaffCheckoutRule }>(response);
  },

  // Delete checkout rule
  async deleteCheckoutRule(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(response);
  },

  // Get rules for specific staff
  async getStaffRules(staffId: string): Promise<{ data: StaffCheckoutRule[] }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules/staff/${staffId}`);
    return handleResponse<{ data: StaffCheckoutRule[] }>(response);
  },

  // Toggle rule status
  async toggleRuleStatus(id: string): Promise<{ data: StaffCheckoutRule }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules/${id}/toggle-status`, {
      method: 'POST',
    });
    return handleResponse<{ data: StaffCheckoutRule }>(response);
  },

  // Get rule preview
  async getRulePreview(staffId: string): Promise<{ data: any }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-rules/preview/${staffId}`);
    return handleResponse<{ data: any }>(response);
  },
};

// API functions for Staff Checkout Financials
export const staffCheckoutFinancialApi = {
  // Get all checkout financials
  async getCheckoutFinancials(
    page: number = 1, 
    filters: { 
      staff_id?: string; 
      block_id?: string; 
      department?: string;
      start_date?: string; 
      end_date?: string; 
      month?: string; 
      year?: string; 
      all?: boolean 
    } = {}
  ): Promise<PaginatedResponse<StaffCheckoutFinancial>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await fetch(`${API_BASE_URL}/staff-checkout-financials?${queryParams}`);
    return handleResponse<PaginatedResponse<StaffCheckoutFinancial>>(response);
  },

  // Get specific checkout financial
  async getCheckoutFinancial(id: string): Promise<{ data: StaffCheckoutFinancial }> {
    const response = await fetch(`${API_BASE_URL}/staff-checkout-financials/${id}`);
    return handleResponse<{ data: StaffCheckoutFinancial }>(response);
  },

  // Get financials for specific staff
  async getStaffFinancials(
    staffId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<{ data: { financials: StaffCheckoutFinancial[]; summary: any } }> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    
    const response = await fetch(`${API_BASE_URL}/staff-checkout-financials/staff/${staffId}?${queryParams}`);
    return handleResponse<{ data: { financials: StaffCheckoutFinancial[]; summary: any } }>(response);
  },

  // Get financial statistics
  async getFinancialStatistics(
    startDate?: string, 
    endDate?: string, 
    blockId?: string,
    department?: string
  ): Promise<{ data: any }> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    if (blockId) queryParams.append('block_id', blockId);
    if (department) queryParams.append('department', department);
    
    const response = await fetch(`${API_BASE_URL}/staff-checkout-financials/statistics/overview?${queryParams}`);
    return handleResponse<{ data: any }>(response);
  },

  // Export financials
  async exportFinancials(
    startDate?: string, 
    endDate?: string, 
    blockId?: string,
    department?: string
  ): Promise<{ data: any[]; summary: any }> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    if (blockId) queryParams.append('block_id', blockId);
    if (department) queryParams.append('department', department);
    
    const response = await fetch(`${API_BASE_URL}/staff-checkout-financials/export/data?${queryParams}`);
    return handleResponse<{ data: any[]; summary: any }>(response);
  },
};
