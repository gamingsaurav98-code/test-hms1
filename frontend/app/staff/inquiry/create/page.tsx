"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { staffInquiryApi } from '@/lib/api/staff-inquiry.api';
import { InquiryFormData } from '@/lib/api/types/inquiry.types';
import { ApiError } from '@/lib/api/core';
import { 
  FormField, 
  SubmitButton, 
  CancelButton, 
  SuccessToast,
} from '@/components/ui';

export default function StaffCreateInquiry() {
  const router = useRouter();
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    seater_type: 1
  });
  const [isCustomSeater, setIsCustomSeater] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'seater_type') {
      const numValue = value ? parseInt(value) : 0;
      if (!isNaN(numValue) && numValue > 0) {
        setFormData({
          ...formData,
          seater_type: numValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.seater_type) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting data:', formData);
      const response = await staffInquiryApi.createInquiry(formData);
      console.log('Create response:', response);
      
      setSuccess('Inquiry created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        seater_type: 1
      });
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/staff/inquiry');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating inquiry:', error);
      if (error instanceof ApiError && error.validation) {
        const validationMessages = Object.values(error.validation).flat();
        setError(validationMessages.join('\n'));
      } else if (error instanceof ApiError) {
        setError(`Failed to create inquiry: ${error.message}`);
      } else {
        setError('Failed to create inquiry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Success Toast */}
      {success && (
        <SuccessToast
          show={!!success}
          message={success}
          progress={100}
          onClose={() => setSuccess(null)}
        />
      )}
      
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Inquiry</h1>
          <p className="text-sm text-gray-600 mt-1">Record a new student inquiry for accommodation</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
            {/* Student Name */}
            <FormField
              label="Student Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter student name"
              required
              error={!formData.name && error ? 'Name is required' : ''}
            />
            
            {/* Phone */}
            <FormField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
              error={!formData.phone && error ? 'Phone number is required' : ''}
            />
            
            {/* Email */}
            <FormField
              label="Email Address"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              type="email"
              placeholder="Enter email address (optional)"
            />
            
            {/* Number of Seaters */}
            <div className="space-y-2">
              <FormField
                label="Number of Seaters"
                name="seater_type_select"
                value={isCustomSeater ? 'custom' : formData.seater_type.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    setIsCustomSeater(true);
                    return;
                  }
                  setIsCustomSeater(false);
                  setFormData({
                    ...formData,
                    seater_type: parseInt(value)
                  });
                }}
                type="select"
                options={[
                  { value: '1', label: '1-Seater' },
                  { value: '2', label: '2-Seater' },
                  { value: '3', label: '3-Seater' },
                  { value: '4', label: '4-Seater' },
                  { value: 'custom', label: 'Custom Seater' }
                ]}
                required
                error={!formData.seater_type && error ? 'Number of seaters is required' : ''}
              />
              {isCustomSeater && (
                <FormField
                  label="Custom Seater Number"
                  name="seater_type"
                  value={formData.seater_type?.toString() || ''}
                  onChange={(e) => {
                    const numValue = e.target.value ? parseInt(e.target.value) : 0;
                    if (!isNaN(numValue) && numValue > 0) {
                      setFormData({
                        ...formData,
                        seater_type: numValue
                      });
                    }
                  }}
                  type="text"
                  placeholder="Enter custom number of seaters"
                  required
                  error={!formData.seater_type && error ? 'Number of seaters is required' : ''}
                />
              )}
            </div>
          </div>
        
          {/* Form Actions */}
          <div className="flex justify-end items-center gap-3 pt-6 mt-6 border-t border-gray-200">
            <CancelButton 
              onClick={() => router.push('/staff/inquiry')} 
              children="Cancel"
            />
            <SubmitButton 
              loading={isSubmitting} 
              loadingText="Creating..."
            >
              Create Inquiry
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
