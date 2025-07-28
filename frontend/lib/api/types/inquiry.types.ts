// Inquiry related types

export interface Inquiry {
  id: string;
  name: string;
  email?: string;
  phone: string;
  seater_type: number;
  created_at: string;
  updated_at?: string;
  attachments?: Attachment[];
  inquirySeaters?: InquirySeater[];
}

export interface InquiryFormData {
  name: string;
  email?: string;
  phone: string;
  seater_type: number;
}

export interface InquirySeater {
  id: string;
  inquiry_id: string;
  seater_type: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Attachment {
  id: number;
  name: string;
  path: string;
  type: string;
  inquiry_id?: string;
  created_at: string;
  updated_at?: string;
}
