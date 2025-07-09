"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  inquiryApi, 
  InquiryFormData,
  ApiError,
} from '@/lib/api/index';
import { 
  FormField, 
  SubmitButton, 
  CancelButton, 
  SuccessToast,
} from '@/components/ui';

export default function CreateInquiry() {
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
  
  // Form handling logic
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'seater_type') {
      // Only allow numbers and ensure value is within reasonable range
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
  
  // Room seater options have been removed
  // No helper functions needed for room selection
  

  
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
      const response = await inquiryApi.createInquiry(formData);
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
        router.push('/admin/inquiry');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating inquiry:', error);
      if (error instanceof ApiError && error.validation) {
        // Show validation errors if available
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
    <div className="p-4 max-w-3xl mx-auto">
      {/* Success Toast */}
      {success && (
        <SuccessToast
          show={!!success}
          message={success}
          progress={100}
          onClose={() => setSuccess(null)}
        />
      )}
      
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Create New Inquiry</h1>
        <p className="text-sm text-gray-500 mt-1">Record a new student inquiry for accommodation</p>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
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
        <div className="flex justify-end space-x-3 pt-5">
          <CancelButton 
            onClick={() => router.push('/admin/inquiry')} 
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
  );
  
  // No helper functions needed as room selection has been removed
}
