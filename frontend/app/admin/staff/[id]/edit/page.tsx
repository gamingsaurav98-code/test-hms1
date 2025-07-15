"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { staffApi, type StaffFormData, type StaffAmenity } from '@/lib/api/staff.api';
import { ApiError } from '@/lib/api/core';
import { 
  Button, 
  FormField, 
  SubmitButton, 
  CancelButton, 
  SingleImageUploadEdit,
  MultipleImageUploadEdit,
  ImageModal
} from '@/components/ui';
import { getImageUrl } from '@/lib/utils';

export default function EditStaff() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;
  
  // Form state
  const [formData, setFormData] = useState<StaffFormData>({
    staff_name: '',
    contact_number: '',
    email: '',
    date_of_birth: '',
    district: '',
    city_name: '',
    ward_no: '',
    street_name: '',
    citizenship_no: '',
    date_of_issue: '',
    citizenship_issued_district: '',
    educational_institution: '',
    level_of_study: '',
    blood_group: '',
    food: '',
    disease: '',
    father_name: '',
    father_contact: '',
    father_occupation: '',
    mother_name: '',
    mother_contact: '',
    mother_occupation: '',
    spouse_name: '',
    spouse_contact: '',
    spouse_occupation: '',
    local_guardian_name: '',
    local_guardian_address: '',
    local_guardian_contact: '',
    local_guardian_occupation: '',
    local_guardian_relation: '',
    is_active: true,
    staff_id: '',
    position: '',
    department: '',
    joining_date: '',
    salary_amount: '',
    employment_type: '',
    declaration_agreed: false,
    contract_agreed: false,
    verified_by: '',
    verified_on: '',
    amenities: []
  });
  
  // Form processing state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: '', alt: '' });
  const [staffImage, setStaffImage] = useState<File | null>(null);
  
  // Document state - Multiple file uploads
  const [citizenshipDocuments, setCitizenshipDocuments] = useState<File[]>([]);
  const [contractDocuments, setContractDocuments] = useState<File[]>([]);
  const [existingCitizenshipDoc, setExistingCitizenshipDoc] = useState<{id: number; image: string; is_primary: boolean}[]>([]);
  const [existingContractDoc, setExistingContractDoc] = useState<{id: number; image: string; is_primary: boolean}[]>([]);
  const [removedCitizenshipDocIds, setRemovedCitizenshipDocIds] = useState<number[]>([]);
  const [removedContractDocIds, setRemovedContractDocIds] = useState<number[]>([]);
  const [removedAmenityIds, setRemovedAmenityIds] = useState<number[]>([]);
  
  // Amenities state
  const [amenities, setAmenities] = useState<StaffAmenity[]>([]);

  // Load staff data
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        setIsLoading(true);
        const staff = await staffApi.getStaffMember(staffId);
        
        // Populate form data
        setFormData({
          staff_name: staff.staff_name || '',
          contact_number: staff.contact_number || '',
          email: staff.email || '',
          date_of_birth: staff.date_of_birth || '',
          district: staff.district || '',
          city_name: staff.city_name || '',
          ward_no: staff.ward_no || '',
          street_name: staff.street_name || '',
          citizenship_no: staff.citizenship_no || '',
          date_of_issue: staff.date_of_issue || '',
          citizenship_issued_district: staff.citizenship_issued_district || '',
          educational_institution: staff.educational_institution || '',
          level_of_study: staff.level_of_study || '',
          blood_group: staff.blood_group || '',
          food: staff.food || '',
          disease: staff.disease || '',
          father_name: staff.father_name || '',
          father_contact: staff.father_contact || '',
          father_occupation: staff.father_occupation || '',
          mother_name: staff.mother_name || '',
          mother_contact: staff.mother_contact || '',
          mother_occupation: staff.mother_occupation || '',
          spouse_name: staff.spouse_name || '',
          spouse_contact: staff.spouse_contact || '',
          spouse_occupation: staff.spouse_occupation || '',
          local_guardian_name: staff.local_guardian_name || '',
          local_guardian_address: staff.local_guardian_address || '',
          local_guardian_contact: staff.local_guardian_contact || '',
          local_guardian_occupation: staff.local_guardian_occupation || '',
          local_guardian_relation: staff.local_guardian_relation || '',
          is_active: staff.is_active !== undefined ? staff.is_active : true,
          staff_id: staff.staff_id || '',
          position: staff.position || '',
          department: staff.department || '',
          joining_date: staff.joining_date || '',
          salary_amount: staff.salary_amount || '',
          employment_type: staff.employment_type || '',
          declaration_agreed: staff.declaration_agreed || false,
          contract_agreed: staff.contract_agreed || false,
          verified_by: staff.verified_by || '',
          verified_on: staff.verified_on || '',
          amenities: []
        });

        // Set existing amenities
        if (staff.amenities && staff.amenities.length > 0) {
          setAmenities(staff.amenities);
        }

        // Set existing image preview
        if (staff.staff_image) {
          setImagePreview(getImageUrl(staff.staff_image));
        }

        // Set citizenship document if available
        if (staff.staff_citizenship_image) {
          setExistingCitizenshipDoc([{
            id: 1, // Using 1 as id since we don't have real IDs from the API
            image: staff.staff_citizenship_image,
            is_primary: true
          }]);
        }
        
        // Set contract document if available
        if (staff.staff_contract_image) {
          setExistingContractDoc([{
            id: 1, // Using 1 as id since we don't have real IDs from the API
            image: staff.staff_contract_image,
            is_primary: true
          }]);
        }

      } catch (error) {
        console.error('Error loading staff data:', error);
        setErrors({
          submit: 'Failed to load staff data. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (staffId) {
      loadStaffData();
    }
  }, [staffId]);

  // Process staff image file
  const processFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        staff_image: 'Please select a valid image file (JPG, JPEG, PNG)'
      }));
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        staff_image: 'File size must be less than 2MB'
      }));
      return;
    }

    setStaffImage(file);

    // Create preview for images
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear file error
    if (errors.staff_image) {
      setErrors(prev => ({
        ...prev,
        staff_image: ''
      }));
    }
  };

  // Remove staff image
  const removeImage = () => {
    setStaffImage(null);
    setImagePreview(null);
  };
  
  // Validate citizenship document file
  const validateCitizenshipFile = (file: File): boolean => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        staff_citizenship_image: 'Please select a valid file (JPG, JPEG, PNG, PDF)'
      }));
      return false;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        staff_citizenship_image: 'File size must be less than 5MB'
      }));
      return false;
    }

    // Clear file error
    if (errors.staff_citizenship_image) {
      setErrors(prev => ({
        ...prev,
        staff_citizenship_image: ''
      }));
    }
    
    return true;
  };

  // Add citizenship documents
  const addCitizenshipDocuments = (files: File[]) => {
    const validFiles = files.filter(file => validateCitizenshipFile(file));
    if (validFiles.length > 0) {
      setCitizenshipDocuments(prev => [...prev, ...validFiles]);
    }
  };

  // Remove citizenship document
  const removeCitizenshipImage = (index: number) => {
    setCitizenshipDocuments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate contract form file
  const validateContractFile = (file: File): boolean => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        staff_contract_image: 'Please select a valid file (JPG, JPEG, PNG, PDF)'
      }));
      return false;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        staff_contract_image: 'File size must be less than 5MB'
      }));
      return false;
    }

    // Clear file error
    if (errors.staff_contract_image) {
      setErrors(prev => ({
        ...prev,
        staff_contract_image: ''
      }));
    }
    
    return true;
  };

  // Add contract documents
  const addContractDocuments = (files: File[]) => {
    const validFiles = files.filter(file => validateContractFile(file));
    if (validFiles.length > 0) {
      setContractDocuments(prev => [...prev, ...validFiles]);
    }
  };

  // Remove contract document
  const removeContractImage = (index: number) => {
    setContractDocuments(prev => prev.filter((_, i) => i !== index));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle amenity changes
  const handleAmenityChange = (index: number, field: keyof StaffAmenity, value: string) => {
    const updatedAmenities = [...amenities];
    updatedAmenities[index] = {
      ...updatedAmenities[index],
      [field]: value
    };
    setAmenities(updatedAmenities);
  };

  // Add new amenity field
  const addAmenity = () => {
    setAmenities([...amenities, { name: '', description: '' }]);
  };

  // Remove amenity field
  const removeAmenity = (index: number) => {
    const amenityToRemove = amenities[index];
    
    // If the amenity has an ID (existing amenity), track it for deletion
    if (amenityToRemove.id) {
      const amenityId = typeof amenityToRemove.id === 'string' ? parseInt(amenityToRemove.id) : amenityToRemove.id;
      if (!isNaN(amenityId)) {
        setRemovedAmenityIds(prev => [...prev, amenityId]);
      }
    }
    
    // Remove from local state
    const updatedAmenities = [...amenities];
    updatedAmenities.splice(index, 1);
    setAmenities(updatedAmenities);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.staff_name.trim()) {
      newErrors.staff_name = 'Staff name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact_number.trim())) {
      newErrors.contact_number = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Filter out empty amenities
    const filteredAmenities = amenities.filter(item => item.name.trim() !== '');
    
    try {
      // Prepare the form data with all files
      const staffFormData = {
        ...formData,
        amenities: filteredAmenities,
        removedAmenityIds: removedAmenityIds,
        removedCitizenshipDocIds: removedCitizenshipDocIds,
        removedContractDocIds: removedContractDocIds,
        staff_image: staffImage,
        // For now, we use the first file of multiple uploads as the API only accepts one file
        // In the future, the API could be updated to handle multiple files
        staff_citizenship_image: citizenshipDocuments.length > 0 ? citizenshipDocuments[0] : null,
        staff_contract_image: contractDocuments.length > 0 ? contractDocuments[0] : null,
      };
      
      // Update the staff member
      const updatedStaff = await staffApi.updateStaff(staffId, staffFormData);

      // Redirect to staff detail on success
      router.push(`/admin/staff/${staffId}`);
    } catch (error) {
      console.error('Error updating staff:', error);
      
      if (error instanceof ApiError) {
        if (error.validation && Object.keys(error.validation).length > 0) {
          // Convert validation errors to our format
          const formattedErrors: Record<string, string> = {};
          
          Object.entries(error.validation).forEach(([field, messages]) => {
            formattedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
          });
          
          setErrors({
            ...formattedErrors,
            submit: `Failed to update staff: ${error.message}`
          });
        } else {
          setErrors({
            submit: `Failed to update staff: ${error.message}`
          });
        }
      } else {
        setErrors({
          submit: 'An unexpected error occurred. Please try again later.'
        });
      }
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Staff Member</h1>
            <p className="text-sm text-gray-600 mt-1">Loading staff data...</p>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Staff Member</h1>
          <p className="text-sm text-gray-600 mt-1">Update staff member information</p>
        </div>

        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{errors.submit}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-4">
          <div className="p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staff Name */}
                <FormField
                  name="staff_name"
                  label="Staff Name"
                  required
                  value={formData.staff_name}
                  onChange={handleInputChange}
                  error={errors.staff_name}
                  placeholder="Enter full name"
                />
                
                {/* Email */}
                <FormField
                  name="email"
                  label="Email Address"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter email address"
                />
                
                {/* Contact Number */}
                <FormField
                  name="contact_number"
                  label="Contact Number"
                  required
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  error={errors.contact_number}
                  placeholder="Enter 10-digit phone number"
                />
                
                {/* Date of Birth */}
                <FormField
                  name="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={handleInputChange}
                  error={errors.date_of_birth}
                  placeholder="YYYY-MM-DD"
                />
                
                {/* Blood Group */}
                <FormField
                  name="blood_group"
                  label="Blood Group"
                  type="select"
                  value={formData.blood_group || ''}
                  onChange={handleInputChange}
                  error={errors.blood_group}
                  options={[
                    { value: '', label: 'Select Blood Group' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                  ]}
                />

                {/* Active Status */}
                <div className="flex items-center mt-4">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.is_active || false}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-semibold text-neutral-900">Active Staff Member</label>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* District */}
                <FormField
                  name="district"
                  label="District"
                  value={formData.district || ''}
                  onChange={handleInputChange}
                  error={errors.district}
                  placeholder="Enter district name"
                />
                
                {/* City Name */}
                <FormField
                  name="city_name"
                  label="City"
                  value={formData.city_name || ''}
                  onChange={handleInputChange}
                  error={errors.city_name}
                  placeholder="Enter city name"
                />
                
                {/* Ward No */}
                <FormField
                  name="ward_no"
                  label="Ward Number"
                  value={formData.ward_no || ''}
                  onChange={handleInputChange}
                  error={errors.ward_no}
                  placeholder="Enter ward number"
                />
                
                {/* Street Name */}
                <FormField
                  name="street_name"
                  label="Street Name"
                  value={formData.street_name || ''}
                  onChange={handleInputChange}
                  error={errors.street_name}
                  placeholder="Enter street name"
                />
              </div>
            </div>

            {/* Citizenship Information */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Citizenship Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Citizenship No */}
                <FormField
                  name="citizenship_no"
                  label="Citizenship Number"
                  value={formData.citizenship_no || ''}
                  onChange={handleInputChange}
                  error={errors.citizenship_no}
                  placeholder="Enter citizenship number"
                />
                
                {/* Date of Issue */}
                <FormField
                  name="date_of_issue"
                  label="Date of Issue"
                  type="date"
                  value={formData.date_of_issue || ''}
                  onChange={handleInputChange}
                  error={errors.date_of_issue}
                />
                
                {/* Citizenship Issued District */}
                <FormField
                  name="citizenship_issued_district"
                  label="Issued District"
                  value={formData.citizenship_issued_district || ''}
                  onChange={handleInputChange}
                  error={errors.citizenship_issued_district}
                  placeholder="Enter district where citizenship was issued"
                />
              </div>
            </div>

            {/* Educational Information */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Educational Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Educational Institution */}
                <FormField
                  name="educational_institution"
                  label="Educational Institution"
                  value={formData.educational_institution || ''}
                  onChange={handleInputChange}
                  error={errors.educational_institution}
                  placeholder="Enter school/college name"
                />
                
                {/* Level of Study */}
                <FormField
                  name="level_of_study"
                  label="Level of Study"
                  value={formData.level_of_study || ''}
                  onChange={handleInputChange}
                  error={errors.level_of_study}
                  placeholder="e.g., Bachelors, Masters"
                />
              </div>
            </div>

            {/* Health Information */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Health Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Food Preference */}
                <FormField
                  name="food"
                  label="Food Preference"
                  type="select"
                  value={formData.food || ''}
                  onChange={handleInputChange}
                  error={errors.food}
                  options={[
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'non-vegetarian', label: 'Non-vegetarian' },
                    { value: 'egg-only', label: 'Egg Only' }
                  ]}
                />
                
                {/* Disease/Health Issues */}
                <div className="md:col-span-2">
                  <FormField
                    name="disease"
                    label="Disease or Health Issues (if any)"
                    type="textarea"
                    value={formData.disease || ''}
                    onChange={handleInputChange}
                    error={errors.disease}
                    placeholder="Enter any health conditions or allergies"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Family Information */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Family Information</h2>
              <div className="grid grid-cols-1 gap-4">
                {/* Father's Information */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-md font-medium text-gray-800 mb-3">Father's Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      name="father_name"
                      label="Father's Name"
                      value={formData.father_name || ''}
                      onChange={handleInputChange}
                      error={errors.father_name}
                      placeholder="Enter father's name"
                    />
                    <FormField
                      name="father_contact"
                      label="Father's Contact"
                      value={formData.father_contact || ''}
                      onChange={handleInputChange}
                      error={errors.father_contact}
                      placeholder="Enter father's phone number"
                    />
                    <FormField
                      name="father_occupation"
                      label="Father's Occupation"
                      value={formData.father_occupation || ''}
                      onChange={handleInputChange}
                      error={errors.father_occupation}
                      placeholder="Enter father's occupation"
                    />
                  </div>
                </div>

                {/* Mother's Information */}
                <div className="border-b border-gray-100 py-4">
                  <h3 className="text-md font-medium text-gray-800 mb-3">Mother's Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      name="mother_name"
                      label="Mother's Name"
                      value={formData.mother_name || ''}
                      onChange={handleInputChange}
                      error={errors.mother_name}
                      placeholder="Enter mother's name"
                    />
                    <FormField
                      name="mother_contact"
                      label="Mother's Contact"
                      value={formData.mother_contact || ''}
                      onChange={handleInputChange}
                      error={errors.mother_contact}
                      placeholder="Enter mother's phone number"
                    />
                    <FormField
                      name="mother_occupation"
                      label="Mother's Occupation"
                      value={formData.mother_occupation || ''}
                      onChange={handleInputChange}
                      error={errors.mother_occupation}
                      placeholder="Enter mother's occupation"
                    />
                  </div>
                </div>

                {/* Spouse's Information */}
                <div className="py-4">
                  <h3 className="text-md font-medium text-gray-800 mb-3">Spouse's Details (if applicable)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      name="spouse_name"
                      label="Spouse's Name"
                      value={formData.spouse_name || ''}
                      onChange={handleInputChange}
                      error={errors.spouse_name}
                      placeholder="Enter spouse's name"
                    />
                    <FormField
                      name="spouse_contact"
                      label="Spouse's Contact"
                      value={formData.spouse_contact || ''}
                      onChange={handleInputChange}
                      error={errors.spouse_contact}
                      placeholder="Enter spouse's phone number"
                    />
                    <FormField
                      name="spouse_occupation"
                      label="Spouse's Occupation"
                      value={formData.spouse_occupation || ''}
                      onChange={handleInputChange}
                      error={errors.spouse_occupation}
                      placeholder="Enter spouse's occupation"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Local Guardian Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="local_guardian_name"
                  label="Guardian's Name"
                  value={formData.local_guardian_name || ''}
                  onChange={handleInputChange}
                  error={errors.local_guardian_name}
                  placeholder="Enter local guardian's name"
                />
                <FormField
                  name="local_guardian_relation"
                  label="Relation with Staff"
                  value={formData.local_guardian_relation || ''}
                  onChange={handleInputChange}
                  error={errors.local_guardian_relation}
                  placeholder="e.g., Uncle, Aunt"
                />
                <FormField
                  name="local_guardian_contact"
                  label="Guardian's Contact"
                  value={formData.local_guardian_contact || ''}
                  onChange={handleInputChange}
                  error={errors.local_guardian_contact}
                  placeholder="Enter guardian's phone number"
                />
                <FormField
                  name="local_guardian_occupation"
                  label="Guardian's Occupation"
                  value={formData.local_guardian_occupation || ''}
                  onChange={handleInputChange}
                  error={errors.local_guardian_occupation}
                  placeholder="Enter guardian's occupation"
                />
                <FormField
                  name="local_guardian_address"
                  label="Guardian's Address"
                  value={formData.local_guardian_address || ''}
                  onChange={handleInputChange}
                  error={errors.local_guardian_address}
                  placeholder="Enter guardian's address"
                />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Document Uploads</h2>
              
              {/* Staff Photo */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Staff Photo</h3>
                <div className="w-full">
                  <SingleImageUploadEdit
                    imagePreview={imagePreview}
                    onFileSelect={(file) => processFile(file)}
                    onRemove={removeImage}
                    error={errors.staff_image}
                    label="Staff Photo"
                    onImageClick={(imageUrl, alt) => {
                      setSelectedImage({ url: imageUrl, alt });
                      setImageModalOpen(true);
                    }}
                  />
                </div>
              </div>
              
              {/* Citizenship Documents */}
              <div className="mb-6 pt-4">
                <h3 className="text-md font-medium text-gray-800 mb-3">Citizenship Documents</h3>
                <div className="w-full">
                  <MultipleImageUploadEdit
                    images={citizenshipDocuments}
                    existingImages={existingCitizenshipDoc}
                    removedImageIds={removedCitizenshipDocIds}
                    onAddImages={addCitizenshipDocuments}
                    onRemoveImage={removeCitizenshipImage}
                    onRemoveExistingImage={(id) => {
                      setRemovedCitizenshipDocIds(prev => [...prev, id]);
                      setExistingCitizenshipDoc(prev => prev.filter(img => img.id !== id));
                    }}
                    error={errors.staff_citizenship_image}
                    label="Citizenship Documents"
                    onImageClick={(imageUrl, alt) => {
                      setSelectedImage({ url: imageUrl, alt });
                      setImageModalOpen(true);
                    }}
                  />
                </div>
              </div>
              
              {/* Contract Documents */}
              <div className="pt-4">
                <h3 className="text-md font-medium text-gray-800 mb-3">Contract Documents</h3>
                <div className="w-full">
                  <MultipleImageUploadEdit
                    images={contractDocuments}
                    existingImages={existingContractDoc}
                    removedImageIds={removedContractDocIds}
                    onAddImages={addContractDocuments}
                    onRemoveImage={removeContractImage}
                    onRemoveExistingImage={(id) => {
                      setRemovedContractDocIds(prev => [...prev, id]);
                      setExistingContractDoc(prev => prev.filter(img => img.id !== id));
                    }}
                    error={errors.staff_contract_image}
                    label="Contract Documents"
                    onImageClick={(imageUrl, alt) => {
                      setSelectedImage({ url: imageUrl, alt });
                      setImageModalOpen(true);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Administrative Details */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Administrative Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staff ID */}
                <FormField
                  name="staff_id"
                  label="Staff ID"
                  value={formData.staff_id || ''}
                  onChange={handleInputChange}
                  error={errors.staff_id}
                />
                
                {/* Position */}
                <FormField
                  name="position"
                  label="Position"
                  value={formData.position || ''}
                  onChange={handleInputChange}
                  error={errors.position}
                  placeholder="e.g., Manager, Assistant, Guard"
                />
                
                {/* Department */}
                <FormField
                  name="department"
                  label="Department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  error={errors.department}
                  placeholder="e.g., Administration, Security, Maintenance"
                />
                
                {/* Employment Type */}
                <FormField
                  name="employment_type"
                  label="Employment Type"
                  type="select"
                  value={formData.employment_type || ''}
                  onChange={handleInputChange}
                  error={errors.employment_type}
                  options={[
                    { value: '', label: 'Select Employment Type' },
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'contract', label: 'Contract' },
                    { value: 'intern', label: 'Intern' }
                  ]}
                />
                
                {/* Joining Date */}
                <FormField
                  name="joining_date"
                  label="Joining Date"
                  type="date"
                  value={formData.joining_date || ''}
                  onChange={handleInputChange}
                  error={errors.joining_date}
                />
                
                {/* Salary Amount */}
                <FormField
                  name="salary_amount"
                  label="Salary Amount"
                  value={formData.salary_amount || ''}
                  onChange={handleInputChange}
                  error={errors.salary_amount}
                  placeholder="Enter monthly salary"
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Staff Amenities</h2>
                <Button 
                  type="button" 
                  onClick={addAmenity}
                  variant="secondary"
                  size="sm"
                >
                  Add Amenity
                </Button>
              </div>
              
              <div className="space-y-4">
                {amenities.length > 0 ? (
                  amenities.map((amenity, index) => (
                    <div key={index} className="flex space-x-4 items-start">
                      <div className="flex-1">
                        <FormField
                          name={`amenity_name_${index}`}
                          label={`Amenity ${index + 1} Name`}
                          placeholder="Enter amenity name"
                          value={amenity.name || ''}
                          onChange={(e) => handleAmenityChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          name={`amenity_description_${index}`}
                          label="Description (Optional)"
                          placeholder="Enter description"
                          value={amenity.description || ''}
                          onChange={(e) => handleAmenityChange(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="pt-8">
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No amenities added. Click "Add Amenity" to add staff amenities.</p>
                )}
              </div>
            </div>

            {/* Verification */}
            <div className="mb-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Verification</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="declaration_agreed"
                    name="declaration_agreed"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.declaration_agreed || false}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="declaration_agreed" className="ml-2 text-sm text-neutral-800">
                    I hereby declare that all the information provided above is true and correct to the best of my knowledge.
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="contract_agreed"
                    name="contract_agreed"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.contract_agreed || false}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="contract_agreed" className="ml-2 text-sm text-neutral-800">
                    I agree to abide by all the terms and conditions of employment.
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    name="verified_by"
                    label="Verified By"
                    value={formData.verified_by || ''}
                    onChange={handleInputChange}
                    error={errors.verified_by}
                    placeholder="Name of verifying officer"
                  />
                  
                  <FormField
                    name="verified_on"
                    label="Verification Date"
                    type="date"
                    value={formData.verified_on || ''}
                    onChange={handleInputChange}
                    error={errors.verified_on}
                  />
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <CancelButton onClick={() => router.push(`/admin/staff/${staffId}`)} />
              <SubmitButton 
                loading={isSubmitting} 
                loadingText="Updating..."
              >
                Update Staff Member
              </SubmitButton>
            </div>
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
