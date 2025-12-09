"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { staffInquiryApi } from '@/lib/api/staff-inquiry.api';
import { InquiryFormData } from '@/lib/api/types/inquiry.types';
import { ApiError } from '@/lib/api/core';
import { 
  FormField, 
  SubmitButton, 
  CancelButton, 
  SuccessToast,
  TableSkeleton
} from '@/components/ui';

export default function StaffEditInquiry({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: inquiryId } = use(params);
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    seater_type: 1
  });
  
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [isCustomSeater, setIsCustomSeater] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Load inquiry data
  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setIsLoading(true);
        const inquiryData = await staffInquiryApi.getInquiry(inquiryId);
        
        if (!inquiryData) {
          throw new Error('No inquiry data received');
        }
        
        const seaterType = inquiryData.seater_type || 1;
        
        const formDataToSet = {
          name: inquiryData.name || '',
          email: inquiryData.email || '',
          phone: inquiryData.phone || '',
          seater_type: seaterType
        };
        
        setFormData(formDataToSet);
        setIsCustomSeater(seaterType > 4 || seaterType < 1);
        setIsFormLoaded(true);
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        if (error instanceof ApiError) {
          setError(`Failed to load inquiry: ${error.message}`);
        } else {
          setError('Failed to load inquiry data. Please try refreshing the page.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInquiry();
  }, [inquiryId]);
  
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
    
    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await staffInquiryApi.updateInquiry(inquiryId, formData);
      setSuccess('Inquiry updated successfully!');
      setTimeout(() => {
        router.push('/staff/inquiry');
      }, 2000);
    } catch (error) {
      console.error('Error updating inquiry:', error);
      if (error instanceof ApiError) {
        setError(`Failed to update inquiry: ${error.message}`);
      } else {
        setError('Failed to update inquiry. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isFormLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Inquiry</h1>
            <p className="text-sm text-gray-500 mt-1">Loading inquiry data...</p>
          </div>
          <TableSkeleton />
        </div>
      </div>
    );
  }
  
  if (!formData || (!formData.name && !formData.phone && !isLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">No inquiry data found</p>
            </div>
            <button
              onClick={() => router.push('/staff/inquiry')}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Back to Inquiries
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold text-gray-900">Edit Inquiry</h1>
          <p className="text-sm text-gray-600 mt-1">Modify inquiry details for {formData.name}</p>
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
                value={isCustomSeater ? 'custom' : String(formData.seater_type || 1)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    setIsCustomSeater(true);
                    return;
                  }
                  setIsCustomSeater(false);
                  setFormData({
                    ...formData,
                    seater_type: parseInt(value) || 1
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
                  value={String(formData.seater_type || '')}
                  onChange={(e) => {
                    const numValue = e.target.value ? parseInt(e.target.value) : 1;
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
              loadingText="Updating..."
            >
              Update Inquiry
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
