'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SalaryApi, StaffApi, type UpdateSalaryRequest, type Salary, type Staff } from '@/lib/api';
import { 
  SubmitButton, 
  CancelButton, 
  SuccessToast,
  TableSkeleton 
} from '@/components/ui';

export default function EditSalary() {
  const router = useRouter();
  const params = useParams();
  const salaryId = parseInt(params.id as string);
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [formData, setFormData] = useState<UpdateSalaryRequest>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (salaryId) {
      fetchData();
    }
  }, [salaryId]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [salaryData, staffData] = await Promise.all([
        SalaryApi.getById(salaryId),
        StaffApi.getAll(true)
      ]);
      
      setSalary(salaryData);
      setStaff(staffData);
      
      // Initialize form data with current salary data
      setFormData({
        staff_id: salaryData.staff_id,
        amount: salaryData.amount,
        month: salaryData.month,
        year: salaryData.year,
        description: salaryData.description,
        status: salaryData.status
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salary data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === 'staff_id' || name === 'month' || name === 'year') {
      processedValue = parseInt(value) || 0;
    } else if (name === 'amount') {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.staff_id !== undefined && (!formData.staff_id || formData.staff_id === 0)) {
      errors.staff_id = 'Please select a staff member';
    }
    
    if (formData.amount !== undefined && (!formData.amount || formData.amount <= 0)) {
      errors.amount = 'Please enter a valid amount';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updatedSalary = await SalaryApi.update(salaryId, formData);
      setSalary(updatedSalary);
      
      setAlert({
        show: true,
        message: 'Salary record updated successfully!',
        type: 'success'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/salary');
      }, 2000);
      
    } catch (err: any) {
      if (err.validation) {
        setValidationErrors(err.validation);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update salary record');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Salary</h1>
            <p className="text-sm text-gray-500 mt-1">Loading salary data...</p>
          </div>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error || 'Salary record not found'}</p>
            </div>
            <button
              onClick={() => router.push('/admin/salary')}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Back to Salary List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4">
      <div className="max-w-5xl mx-auto">
        {/* Success Toast */}
        {alert.type === 'success' && alert.show && (
          <SuccessToast
            show={alert.show}
            message={alert.message}
            progress={100}
            onClose={() => setAlert({show: false, message: '', type: 'success'})}
          />
        )}

        {/* Clean Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Salary</h1>
        </div>

        {/* Modern Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-4">
            {/* Submit Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Current Info Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Staff:</span> {salary.staff?.staff_name}
                  </div>
                  <div>
                    <span className="text-gray-500">Period:</span> {salary.month_name} {salary.year}
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span> Rs. {salary.formatted_amount}
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span> {salary.status}
                  </div>
                </div>
              </div>

              {/* Staff Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Staff Selection</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Staff <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="staff_id"
                    value={formData.staff_id || salary.staff_id}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#235999] focus:border-[#235999] sm:text-sm ${
                      validationErrors.staff_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value={0}>Select Staff</option>
                    {staff.map((staffMember) => (
                      <option key={staffMember.id} value={staffMember.id}>
                        {staffMember.staff_name} ({staffMember.staff_id})
                      </option>
                    ))}
                  </select>
                  {validationErrors.staff_id && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.staff_id}</p>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      min="0"
                      step="0.01"
                      value={formData.amount !== undefined ? formData.amount : salary.amount}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#235999] focus:border-[#235999] sm:text-sm ${
                        validationErrors.amount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter payment amount"
                      disabled={loading}
                    />
                    {validationErrors.amount && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
                    )}
                  </div>

                  {/* Original Creation Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                    </label>
                    <input
                      type="text"
                      value={new Date(salary.created_at).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                      disabled
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description !== undefined ? formData.description || '' : salary.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#235999] focus:border-[#235999] sm:text-sm"
                    placeholder="Enter description (optional)"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
              <CancelButton onClick={() => router.push('/admin/salary')} />
              <SubmitButton 
                loading={loading}
                loadingText="Updating..."
              >
                Update Salary
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
