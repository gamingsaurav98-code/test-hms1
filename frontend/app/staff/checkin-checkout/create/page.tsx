'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { staffCheckInCheckOutApi } from '@/lib/api/staff-checkincheckout.api';
import { 
  Button, 
  FormField, 
  SubmitButton, 
  CancelButton 
} from '@/components/ui';

export default function StaffCheckoutCreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [canCheckout, setCanCheckout] = useState(false);
  
  // Get current date and time for display (non-editable)
  const currentDate = new Date().toISOString().split('T')[0];
  const currentDateTime = new Date();
  
  const formatCheckoutDateTime = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${month}/${day}/${year} at ${time}`;
  };
  
  const [formData, setFormData] = useState({
    expected_return_date: '',
    remarks: ''
  });

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Check-in status check timed out');
        setLoading(false);
        setCanCheckout(false);
      }
    }, 10000); // 10 second timeout

    checkCheckinStatus();

    return () => clearTimeout(timeoutId);
  }, []);

  const checkCheckinStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking checkin status...');
      
      const response = await staffCheckInCheckOutApi.getMyRecords();
      console.log('API Response:', response);
      
      // Check if response has data array
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.log('No valid data received from getMyRecords:', response);
        setCanCheckout(false);
        return;
      }
      
      // Check if staff is checked in today
      const today = new Date().toISOString().split('T')[0];
      console.log('Today date:', today);
      console.log('All records:', response.data);
      
      const todaysCheckin = response.data.find(record => {
        if (!record || !record.date) return false;
        
        console.log('Checking record:', {
          id: record.id,
          date: record.date,
          checkin_time: record.checkin_time,
          checkout_time: record.checkout_time,
          status: record.status
        });
        
        const recordDate = record.date;
        const hasCheckinTime = record.checkin_time !== null && record.checkin_time !== undefined;
        const hasNoCheckoutTime = record.checkout_time === null || record.checkout_time === undefined;
        const isToday = recordDate === today;
        
        console.log('Record evaluation:', {
          isToday,
          hasCheckinTime,
          hasNoCheckoutTime,
          shouldMatch: isToday && hasCheckinTime && hasNoCheckoutTime
        });
        
        return isToday && hasCheckinTime && hasNoCheckoutTime;
      });
      
      console.log('Today\'s checkin found:', todaysCheckin);
      
      setCanCheckout(!!todaysCheckin);
    } catch (err) {
      console.error('Failed to check status:', err);
      // If the API call fails, assume staff is not checked in
      // This allows them to attempt a check-in
      setCanCheckout(false);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckin = async () => {
    try {
      setCheckingIn(true);
      setErrors({});
      
      // For demo purposes, using a default block_id
      // In a real app, this would come from the staff's work assignment
      await staffCheckInCheckOutApi.checkIn({
        block_id: "1", // This should come from staff's assignment data
        remarks: "Staff self check-in before checkout request"
      });
      
      setCanCheckout(true);
    } catch (err: any) {
      // If staff is already checked in, this is actually good - they can checkout
      if (err.message && err.message.includes('already checked in')) {
        console.log('Staff is already checked in - enabling checkout form');
        setCanCheckout(true);
        setErrors({});
        return;
      }
      
      console.error('Check-in failed:', err);
      setErrors({ general: err.message || 'Failed to check in' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Client-side validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.expected_return_date.trim()) {
      newErrors.expected_return_date = 'Expected return date is required';
    }
    
    if (!formData.remarks.trim()) {
      newErrors.remarks = 'Please provide a reason for your checkout request';
    }

    // Check if expected return date is in the future
    if (formData.expected_return_date && formData.expected_return_date <= currentDate) {
      newErrors.expected_return_date = 'Expected return date must be in the future';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      await staffCheckInCheckOutApi.checkOut({
        remarks: `${formData.remarks} | Expected return: ${formData.expected_return_date}`
      });
      
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/staff/checkin-checkout');
      }, 3000);
      
    } catch (err: any) {
      console.error('Checkout request failed:', err);
      if (err.validation) {
        setErrors(err.validation);
      } else if (err.message?.includes('No active check-in record')) {
        // This shouldn't happen anymore since we check first, but just in case
        setCanCheckout(false);
        setErrors({ 
          general: 'You must be checked in before you can request a checkout. Please check in first.' 
        });
      } else {
        setErrors({ general: err.message || 'Failed to submit checkout request' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Checkout Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your checkout request has been submitted successfully and is now pending admin approval.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/staff/checkin-checkout')}
                className="w-full"
              >
                View Check-in/Checkout Status
              </Button>
              <Button
                onClick={() => router.push('/staff')}
                variant="secondary"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-lg font-medium text-gray-900">
              Checking your status...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (!canCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Request Checkout</h1>
              <p className="text-gray-600 mt-1">
                Submit a checkout request when you need to leave the hostel premises
              </p>
            </div>

            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-orange-800 font-medium">You must be checked in before you can request a checkout.</p>
                  <p className="text-orange-700 mt-1">Please check in first from the Check-In/Out page.</p>
                  
                  {errors.general && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">{errors.general}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={handleQuickCheckin}
                      disabled={checkingIn}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {checkingIn ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Checking In...
                        </>
                      ) : (
                        'Check In Now'
                      )}
                    </Button>
                    <Button
                      onClick={() => router.push('/staff/checkin-checkout')}
                      variant="secondary"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300"
                    >
                      Go to Check-In/Out Page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Request Checkout</h1>
            <p className="text-gray-600 mt-1">
              Submit a checkout request when you need to leave the hostel premises
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Checkout Time (Display Only) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-neutral-900">
                  Checkout Time
                </label>
                <div className="w-full px-4 py-4 border border-neutral-200/60 rounded-lg text-sm text-neutral-600 bg-gray-50">
                  {formatCheckoutDateTime(currentDateTime)}
                </div>
                <p className="text-xs text-gray-500">Automatically set to current date and time</p>
              </div>

              {/* Expected Return Date */}
              <div className="space-y-1.5">
                <label htmlFor="expected_return_date" className="block text-sm font-semibold text-neutral-900">
                  Expected Return Date *
                </label>
                <input
                  type="date"
                  id="expected_return_date"
                  name="expected_return_date"
                  value={formData.expected_return_date}
                  onChange={handleChange}
                  required
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                  className="w-full px-4 py-4 border border-neutral-200/60 rounded-lg text-sm text-neutral-600 focus:border-neutral-400 focus:ring-0 outline-none transition-all duration-200"
                />
                {errors.expected_return_date && (
                  <div className="flex items-center mt-1.5 text-xs text-red-600">
                    <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.expected_return_date}
                  </div>
                )}
                <p className="text-xs text-gray-500">When do you plan to return back?</p>
              </div>
            </div>

            {/* Remarks */}
            <FormField
              label="Reason for Checkout"
              name="remarks"
              type="textarea"
              value={formData.remarks}
              onChange={handleChange}
              required
              error={errors.remarks}
              placeholder="Please provide a detailed reason for your checkout request (e.g., medical appointment, family emergency, personal work, etc.)"
              rows={4}
            />

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li><strong>You must be checked in today</strong> before you can request a checkout</li>
                    <li>Your checkout will be recorded at the current time: <strong>{formatCheckoutDateTime(currentDateTime)}</strong></li>
                    <li>Your request will be reviewed by the admin</li>
                    <li>You'll receive a notification once it's approved or declined</li>
                    <li>Make sure to provide accurate return date</li>
                    <li>Contact administration if you need to extend your checkout</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <CancelButton onClick={() => router.back()} />
              <SubmitButton 
                loading={isSubmitting}
                loadingText="Submitting Request..."
              >
                Submit Checkout Request
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
