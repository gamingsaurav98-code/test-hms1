import { Block } from '../types';

export interface Inquiry {
  id: string;
  name: string;
  email?: string;
  phone: string;
  seater_type: number;
  created_at: string;
  updated_at?: string;
}

export interface InquiryFormData {
  name: string;
  email?: string;
  phone: string;
  seater_type: number;
}
