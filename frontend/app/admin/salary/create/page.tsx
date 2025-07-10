'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SalaryApi, StaffApi, type CreateSalaryRequest, type Staff } from '@/lib/api';
import { 
  FormField, 
  SubmitButton, 
  CancelButton, 
  SuccessToast 
} from '@/components/ui';

export default function CreateSalary() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [formData, setFormData] = useState<CreateSalaryRequest>({
    staff_id: 0,
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoadingStaff(true);
      const staffData = await StaffApi.getAll(true);
      setStaff(staffData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff');
    } finally {
      setLoadingStaff(false);
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

    if (!formData.staff_id || formData.staff_id === 0) {
      errors.staff_id = 'Please select a staff member';
    }
    
    if (!formData.amount || formData.amount <= 0) {
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
      
      await SalaryApi.create(formData);
      
      setAlert({
        show: true,
        message: 'Salary record created successfully!',
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
        setError(err instanceof Error ? err.message : 'Failed to create salary record');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingStaff) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          <h1 className="text-2xl font-semibold text-gray-900">Create Salary</h1>
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
              {/* Staff Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Staff Selection</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Staff <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="staff_id"
                    value={formData.staff_id}
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
                      value={formData.amount}
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

                  {/* Payment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                    </label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Current date will be used</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
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
              <CancelButton onClick={() => router.back()} />
              <SubmitButton 
                loading={loading} 
                loadingText="Processing..."
              >
                Process Payment
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
