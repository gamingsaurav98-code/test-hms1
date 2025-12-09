"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { staffApi } from '@/lib/api/staff.api';
import { ApiError } from '@/lib/api/core';
import { 
  FormField,
  SubmitButton, 
  CancelButton, 
  SingleImageUploadCreate,
  ImageModal
} from '@/components/ui';

export default function StaffCreateComplain() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complain_attachment: undefined as File | undefined
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', alt: '' });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        complain_attachment: 'Please select a valid file (JPG, PNG, PDF, DOC, DOCX)'
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        complain_attachment: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      complain_attachment: file
    }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Clear file error
    if (errors.complain_attachment) {
      setErrors(prev => ({
        ...prev,
        complain_attachment: ''
      }));
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({
      ...prev,
      complain_attachment: undefined
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const complainDataToSubmit = {
        title: formData.title,
        description: formData.description,
        complain_attachment: formData.complain_attachment
      };

      await staffApi.createStaffComplaint(complainDataToSubmit);
      
      // Redirect to complains list on success
      router.push('/staff/complain');
      
    } catch (error) {
      console.error('Error creating complain:', error);
      
      if (error instanceof ApiError) {
        if (error.validation) {
          const validationErrors: Record<string, string> = {};
          Object.entries(error.validation).forEach(([key, value]) => {
            validationErrors[key] = Array.isArray(value) ? value[0] : value;
          });
          setErrors(validationErrors);
        } else {
          setErrors({
            submit: `Failed to create complaint: ${error.message}`
          });
        }
      } else {
        setErrors({
          submit: 'Failed to create complaint. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      <div className="max-w-5xl mx-auto">
        {/* Clean Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create Complaint</h1>
        </div>

        {/* Modern Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-4">
            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Complaint Title */}
                <FormField
                  name="title"
                  label="Complaint Title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  error={errors.title}
                  placeholder="Brief summary of your complaint"
                />

                {/* Empty column for spacing consistency */}
                <div></div>
              </div>

              {/* Complaint Description - Full Width */}
              <FormField
                name="description"
                label="Detailed Description"
                required
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                placeholder="Provide detailed information about your complaint, including when it occurred, what happened, and any relevant context..."
                type="textarea"
                rows={6}
              />

              {/* Attachment Upload Component */}
              <div>
                <SingleImageUploadCreate
                  imagePreview={imagePreview}
                  onFileSelect={processFile}
                  onRemove={removeAttachment}
                  error={errors.complain_attachment}
                  label="Supporting Document (Optional)"
                  onImageClick={(imageUrl, alt) => {
                    setSelectedImage({ url: imageUrl, alt });
                    setImageModalOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
              <CancelButton onClick={() => router.push('/staff/complain')} />
              <SubmitButton 
                loading={isSubmitting} 
                loadingText="Creating..."
              >
                Create Complaint
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        show={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage.url}
        alt={selectedImage.alt}
      />
    </div>
  );
}
