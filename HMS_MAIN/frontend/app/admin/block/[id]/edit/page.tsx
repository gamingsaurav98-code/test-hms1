"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { blockApi, BlockFormData, Block, ApiError } from '@/lib/api/index';
import { getImageUrl } from '@/lib/utils';
import { 
  Button, 
  FormField, 
  SubmitButton, 
  CancelButton, 
  SingleImageUploadEdit,
  TableSkeleton,
  ImageModal
} from '@/components/ui';

export default function EditBlock() {
  const router = useRouter();
  const params = useParams();
  const blockId = params.id as string;

  const [formData, setFormData] = useState<BlockFormData>({
    block_name: '',
    location: '',
    manager_name: '',
    manager_contact: '',
    remarks: '',
    block_attachment: null,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', alt: '' });

  // Fetch existing block data
  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        setIsLoading(true);
        
        const block = await blockApi.getBlock(blockId);
        setCurrentBlock(block);
        
        setFormData({
          block_name: block.block_name,
          location: block.location,
          manager_name: block.manager_name,
          manager_contact: block.manager_contact,
          remarks: block.remarks,
          block_attachment: null,
        });

        // Set existing image preview if available
        if (block.block_attachment) {
          const imageUrl = getImageUrl(block.block_attachment);
          setImagePreview(imageUrl);
        }
        
      } catch (error) {
        console.error('Error fetching block data:', error);
        if (error instanceof ApiError) {
          setErrors({
            fetch: `Failed to load block: ${error.message}`
          });
        } else {
          setErrors({
            fetch: 'Failed to load block data. Please try again.'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (blockId) {
      fetchBlockData();
    }
  }, [blockId]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        block_attachment: 'Please select a valid image file (JPG, JPEG, PNG)'
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        block_attachment: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      block_attachment: file
    }));

    // Create preview for images
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear file error
    if (errors.block_attachment) {
      setErrors(prev => ({
        ...prev,
        block_attachment: ''
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      block_attachment: null
    }));
    setImagePreview(null);
    const fileInput = document.getElementById('block_attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.block_name.trim()) {
      newErrors.block_name = 'Block name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.manager_name.trim()) {
      newErrors.manager_name = 'Manager name is required';
    }

    if (!formData.manager_contact.trim()) {
      newErrors.manager_contact = 'Manager contact is required';
    } else if (!/^\d{10}$/.test(formData.manager_contact.trim())) {
      newErrors.manager_contact = 'Please enter a valid 10-digit phone number';
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
      await blockApi.updateBlock(blockId, formData);
      
      // Redirect to blocks list on success
      router.push('/admin/block');
      
    } catch (error) {
      console.error('Error updating block:', error);
      if (error instanceof ApiError) {
        setErrors({
          submit: `Failed to update block: ${error.message}`
        });
      } else {
        setErrors({
          submit: 'An error occurred while updating the block. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Edit Block</h1>
          <p className="text-sm text-gray-500 mt-1">Loading block data...</p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{errors.fetch}</p>
          </div>
          <button
            onClick={() => router.push('/admin/block')}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Back to Blocks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      <div className="max-w-5xl mx-auto">
        {/* Clean Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Block</h1>
        </div>

        {/* Modern Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-4">
            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Block Name */}
              <FormField
                name="block_name"
                label="Block Name"
                required
                value={formData.block_name}
                onChange={handleInputChange}
                error={errors.block_name}
                placeholder="Enter block name"
              />

              {/* Location */}
              <FormField
                name="location"
                label="Location"
                required
                value={formData.location}
                onChange={handleInputChange}
                error={errors.location}
                placeholder="Enter location"
              />

              {/* Manager Name */}
              <FormField
                name="manager_name"
                label="Manager Name"
                required
                value={formData.manager_name}
                onChange={handleInputChange}
                error={errors.manager_name}
                placeholder="Enter manager name"
              />

              {/* Manager Contact */}
              <FormField
                name="manager_contact"
                label="Manager Contact"
                required
                value={formData.manager_contact}
                onChange={handleInputChange}
                error={errors.manager_contact}
                placeholder="Enter 10-digit phone number"
              />

              {/* Remarks - Full Width */}
              <div className="lg:col-span-2">
                <FormField
                  name="remarks"
                  label="Remarks"
                  value={formData.remarks || ''}
                  onChange={handleInputChange}
                  placeholder="Enter any additional remarks..."
                  type="textarea"
                  rows={3}
                />
              </div>

              {/* File Upload - Full Width */}
              <div className="lg:col-span-2 space-y-1">
                <SingleImageUploadEdit
                  imagePreview={imagePreview}
                  existingImageUrl={getImageUrl(currentBlock?.block_attachment)}
                  onFileSelect={processFile}
                  onRemove={removeImage}
                  error={errors.block_attachment}
                  label="Block Image"
                  onImageClick={(imageUrl, alt) => {
                    setSelectedImage({ url: imageUrl, alt });
                    setImageModalOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 mt-4">
              <CancelButton onClick={() => router.push('/admin/block')} />
              <SubmitButton 
                loading={isSubmitting}
                loadingText="Updating..."
              >
                Update Block
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
