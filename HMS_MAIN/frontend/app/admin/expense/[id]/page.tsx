"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { expenseApi, Expense, ApiError } from '@/lib/api/index';
import { Button, TableSkeleton, ImageModal } from '@/components/ui';
import { Calendar, AlertCircle, Info, User, Check, X, Plus, Image } from 'lucide-react';

export default function ExpenseDetail() {
  const router = useRouter();
  const params = useParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>('');
  const [modalImageAlt, setModalImageAlt] = useState<string>('');

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await expenseApi.getExpense(params?.id as string);
        
        // Process expense data to ensure all required fields are present
        const processedExpense = {
          ...response,
          // Calculate due amount if not provided
          due_amount: response.due_amount !== undefined 
            ? response.due_amount 
            : Math.max(0, (response.amount || 0) - (response.paid_amount || 0))
        };

        console.log('Fetched expense data:', processedExpense);
        setExpense(processedExpense);
      } catch (error) {
        console.error('Error fetching expense:', error);
        if (error instanceof ApiError) {
          setError(`Failed to fetch expense: ${error.message}`);
        } else {
          setError('Failed to fetch expense. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (params?.id) {
      fetchExpense();
    }
  }, [params?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    // Ensure amount is a valid number
    const safeAmount = isNaN(amount) ? 0 : amount;
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(safeAmount);
  };

  // Calculate payment status based on amounts
  const calculatePaymentStatus = (expense: Expense): string => {
    // If payment_status is explicitly set, use that
    if (expense.payment_status) {
      return expense.payment_status;
    }

    const totalAmount = expense.amount || 0;
    const paidAmount = expense.paid_amount || 0;
    
    if (paidAmount >= totalAmount && totalAmount > 0) {
      return 'paid';
    } else if (paidAmount > 0) {
      return 'partially_paid';
    } else {
      return 'credit'; // Assuming credit expenses are on credit
    }
  };

  const getPaymentStatusColor = (status: string | null | undefined) => {
    if (!status) {
      return 'bg-gray-100 text-gray-800';
    }
    
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'credit':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Loading Expense...</h1>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Expense not found</p>
          <button
            onClick={() => router.push('/admin/expense')}
            className="mt-2 text-[#235999] hover:text-[#1e4d87]"
          >
            Back to Expenses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{expense.title}</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push(`/admin/expense/${expense.id}/edit`)}
              variant="primary"
            >
              Edit Expense
            </Button>
            <Button
              variant="danger"
              disabled={isDeleting}
              loading={isDeleting}
              onClick={() => {
                if (confirm('Are you sure you want to delete this expense?')) {
                  setIsDeleting(true);
                  expenseApi.deleteExpense(expense.id as string)
                    .then(() => {
                      router.push('/admin/expense');
                    })
                    .catch((error) => {
                      console.error('Error deleting expense:', error);
                      alert('Failed to delete expense. Please try again.');
                      setIsDeleting(false);
                    });
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(expense.amount || 0)}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(expense.paid_amount || 0)}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Due Amount</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency((expense.due_amount !== undefined) 
                    ? expense.due_amount 
                    : ((expense.amount || 0) - (expense.paid_amount || 0)))}
                </p>
              </div>
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="text-sm font-medium text-gray-900 mt-1">{expense.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{expense.expense_type || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {formatCurrency(expense.amount || 0)}
                {expense.due_amount !== undefined && expense.due_amount > 0 && (
                  <span className="text-xs ml-2 text-red-600">
                    (Due: {formatCurrency(expense.due_amount)})
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <div className="flex items-center mt-1">
                <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                <p className="text-sm font-medium text-gray-900">{formatDate(expense.expense_date)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
              {(() => {
                // Use our helper function to calculate the payment status
                const status = calculatePaymentStatus(expense);
                
                // Format the display text
                const displayText = status === 'partially_paid' 
                  ? 'Partial' 
                  : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
                
                const StatusIcon = status === 'paid' ? Check : status === 'credit' ? X : AlertCircle;
                
                return (
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(status)}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {displayText}
                    </span>
                  </div>
                );
              })()}
            </div>
            
            {expense.description && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-sm font-medium text-gray-900 mt-1">{expense.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Supplier Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Supplier Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {expense.supplier ? (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier Name</h3>
                  <p className="text-sm font-medium text-gray-900 mt-1">{expense.supplier.name}</p>
                </div>
                
                {expense.supplier.contact_number && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                    <p className="text-sm font-medium text-gray-900 mt-1">{expense.supplier.contact_number}</p>
                  </div>
                )}
                
                {expense.supplier.email && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-sm font-medium text-gray-900 mt-1">{expense.supplier.email}</p>
                  </div>
                )}
                
                {expense.supplier.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="text-sm font-medium text-gray-900 mt-1">{expense.supplier.address}</p>
                  </div>
                )}
              </>
            ) : expense.student ? (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
                  <p className="text-sm font-medium text-gray-900 mt-1">{expense.student.student_name}</p>
                </div>
                
                {expense.student.contact_number && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                    <p className="text-sm font-medium text-gray-900 mt-1">{expense.student.contact_number}</p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-gray-500">No supplier information available</p>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Items */}
        {expense.purchases && expense.purchases.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Purchase Items</h2>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expense.purchases.map((purchase, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {purchase.item_name || 'Unnamed Item'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.item_quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(purchase.item_unit_price || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(purchase.total_amount || 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50">
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-blue-900">
                      {formatCurrency(
                        expense.purchases.reduce((sum, item) => sum + (item.total_amount || 0), 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attachment */}
        {expense.expense_attachment && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Image className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Attachment</h2>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Image className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Expense Receipt</p>
                <button
                  onClick={() => {
                    // Ensure the URL is properly formatted
                    const imageUrl = expense.expense_attachment?.startsWith('http') 
                      ? expense.expense_attachment 
                      : `${process.env.NEXT_PUBLIC_API_URL}/storage/${expense.expense_attachment}`;
                    
                    setModalImageUrl(imageUrl);
                    setModalImageAlt('Expense Receipt');
                    setShowImageModal(true);
                  }}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  View Attachment
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Image Modal for Attachment */}
        <ImageModal
          show={showImageModal}
          imageUrl={modalImageUrl}
          alt={modalImageAlt}
          onClose={() => setShowImageModal(false)}
        />

        {/* Timestamps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Timestamps</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <div className="flex items-center mt-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                <p className="text-sm font-medium text-gray-900">{formatDate(expense.created_at)}</p>
              </div>
            </div>
            
            {expense.updated_at && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
                <div className="flex items-center mt-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                  <p className="text-sm font-medium text-gray-900">{formatDate(expense.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
