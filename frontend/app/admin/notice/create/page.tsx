"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { noticeApi, NoticeFormData } from '@/lib/api';
import { 
  FormField, 
  SubmitButton, 
  CancelButton, 
  MultipleImageUploadCreate,
  ImageModal
} from '@/components/ui';
import { AlertCircle } from 'lucide-react';

export default function CreateNotice() {
  const router = useRouter();
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    description: '',
    schedule_time: new Date().toISOString().split('T')[0] + 'T' + 
      new Date().toTimeString().split(' ')[0].substring(0, 5),
    target_type: 'all',
    notice_type: 'general',
    status: 'active',
    notice_attachments: [],
    student_id: null,
    staff_id: null,
    block_id: null,
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', alt: '' });

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

  const addAttachments = (files: File[]) => {
    setAttachments(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      notice_attachments: [...(prev.notice_attachments || []), ...files]
    }));
    
    // Clear error if it exists
    if (errors.notice_attachments) {
      setErrors(prev => ({
        ...prev,
        notice_attachments: ''
      }));
    }
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...attachments];
    updatedAttachments.splice(index, 1);
    setAttachments(updatedAttachments);
    
    setFormData(prev => ({
      ...prev,
      notice_attachments: updatedAttachments
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.schedule_time) {
      newErrors.schedule_time = 'Schedule time is required';
    }

    if (!formData.target_type) {
      newErrors.target_type = 'Target audience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await noticeApi.createNotice(formData);
      
      // Redirect to notices list on success
      router.push('/admin/notice');
      
    } catch (error: any) {
      console.error('Error creating notice:', error);
      if (error.validation) {
        // Handle validation errors from the API
        const validationErrors: Record<string, string> = {};
        Object.entries(error.validation).forEach(([field, messages]) => {
          validationErrors[field] = Array.isArray(messages) ? messages[0] : messages as string;
        });
        setErrors(validationErrors);
      } else {
        setErrors({
          submit: error.message || 'An error occurred while creating the notice. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create Notice</h1>
        </div>

        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Notice Title */}
              <FormField
                name="title"
                label="Notice Title"
                required
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="Enter notice title"
              />

              {/* Notice Description */}
              <FormField
                name="description"
                label="Notice Description"
                required
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                placeholder="Enter notice description"
                type="textarea"
                rows={5}
              />

              {/* Schedule Date/Time */}
              <div className="space-y-1.5">
                <label htmlFor="schedule_time" className="block text-sm font-semibold text-neutral-900">
                  Schedule Date <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="schedule_time"
                  name="schedule_time"
                  value={formData.schedule_time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border border-neutral-200/60 rounded-lg text-sm text-neutral-600 focus:border-neutral-400 focus:ring-0 outline-none transition-all duration-200"
                />
                {errors.schedule_time && (
                  <div className="flex items-center mt-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 mr-2" />
                    {errors.schedule_time}
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <FormField
                name="target_type"
                label="Send Notice To"
                type="select"
                required
                value={formData.target_type}
                onChange={handleInputChange}
                error={errors.target_type}
                options={[
                  { value: 'all', label: 'Everyone' },
                  { value: 'student', label: 'All Students' },
                  { value: 'staff', label: 'All Staff' },
                  { value: 'specific_student', label: 'Specific Student' },
                  { value: 'specific_staff', label: 'Specific Staff' },
                  { value: 'block', label: 'Specific Block' }
                ]}
              />

              {/* Notice Type */}
              <FormField
                name="notice_type"
                label="Notice Type"
                type="select"
                value={formData.notice_type || ''}
                onChange={handleInputChange}
                error={errors.notice_type}
                options={[
                  { value: 'general', label: 'General' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'event', label: 'Event' },
                  { value: 'announcement', label: 'Announcement' }
                ]}
              />
              
              {/* Conditional fields based on target type */}
              {formData.target_type === 'specific_student' && (
                <FormField
                  name="student_id"
                  label="Select Student"
                  type="select"
                  required
                  value={formData.student_id?.toString() || ''}
                  onChange={handleInputChange}
                  error={errors.student_id}
                  options={[
                    { value: '', label: 'Select a student' },
                    // You would fetch students from API and map them here
                    { value: '1', label: 'Student 1' },
                    { value: '2', label: 'Student 2' }
                  ]}
                />
              )}
              
              {formData.target_type === 'specific_staff' && (
                <FormField
                  name="staff_id"
                  label="Select Staff"
                  type="select"
                  required
                  value={formData.staff_id?.toString() || ''}
                  onChange={handleInputChange}
                  error={errors.staff_id}
                  options={[
                    { value: '', label: 'Select a staff member' },
                    // You would fetch staff from API and map them here
                    { value: '1', label: 'Staff 1' },
                    { value: '2', label: 'Staff 2' }
                  ]}
                />
              )}
              
              {formData.target_type === 'block' && (
                <FormField
                  name="block_id"
                  label="Select Block"
                  type="select"
                  required
                  value={formData.block_id?.toString() || ''}
                  onChange={handleInputChange}
                  error={errors.block_id}
                  options={[
                    { value: '', label: 'Select a block' },
                    // You would fetch blocks from API and map them here
                    { value: '1', label: 'Block A' },
                    { value: '2', label: 'Block B' }
                  ]}
                />
              )}

              {/* Attachments */}
              <div>
                <MultipleImageUploadCreate
                  images={attachments}
                  onAddImages={addAttachments}
                  onRemoveImage={removeAttachment}
                  error={errors.notice_attachments}
                  label="Add Attachments"
                  onImageClick={(imageUrl, alt) => {
                    setSelectedImage({ url: imageUrl, alt });
                    setImageModalOpen(true);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, Images - Max 2MB each
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
              <CancelButton onClick={() => router.back()} />
              <SubmitButton 
                loading={isSubmitting} 
                loadingText="Creating..."
              >
                Create Notice
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
