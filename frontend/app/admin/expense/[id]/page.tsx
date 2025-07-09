"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { expenseApi, Expense, ApiError } from '@/lib/api/index';
import { Button, TableSkeleton } from '@/components/ui';

export default function ExpenseDetail() {
  const router = useRouter();
  const params = useParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await expenseApi.getExpense(params.id as string);
        setExpense(response);
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

    if (params.id) {
      fetchExpense();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
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
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Expense not found</h3>
          <p className="text-gray-600 mb-4">The expense you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/expense')}>
            ← Back to Expenses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{expense.title}</h1>
          <p className="text-sm text-gray-600 mt-1">Expense Details</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => router.push('/admin/expense')}
            variant="secondary"
          >
            ← Back to List
          </Button>
          <Button
            onClick={() => router.push(`/admin/expense/${expense.id}/edit`)}
            variant="edit"
          >
            Edit Expense
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="text-sm text-gray-900 mt-1">{expense.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="text-sm text-gray-900 mt-1">{expense.expenseCategory?.name || 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="text-sm text-gray-900 mt-1 capitalize">{expense.expense_type}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(expense.amount)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="text-sm text-gray-900 mt-1">{formatDate(expense.expense_date)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getPaymentStatusColor(expense.payment_status)}`}>
                {expense.payment_status.replace('_', ' ')}
              </span>
            </div>
            
            {expense.description && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-sm text-gray-900 mt-1">{expense.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="text-sm font-medium text-gray-900 mt-1">{formatCurrency(expense.amount)}</p>
            </div>
            
            {expense.paid_amount && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Paid Amount</h3>
                <p className="text-sm font-medium text-green-600 mt-1">{formatCurrency(expense.paid_amount)}</p>
              </div>
            )}
            
            {expense.due_amount && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Due Amount</h3>
                <p className="text-sm font-medium text-red-600 mt-1">{formatCurrency(expense.due_amount)}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Type</h3>
              <p className="text-sm text-gray-900 mt-1">{expense.paymentType?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Related Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Related Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {expense.supplier && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                <p className="text-sm text-gray-900 mt-1">{expense.supplier.name}</p>
                {expense.supplier.contact_number && (
                  <p className="text-sm text-gray-600">{expense.supplier.contact_number}</p>
                )}
              </div>
            )}
            
            {expense.student && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Student</h3>
                <p className="text-sm text-gray-900 mt-1">{expense.student.student_name}</p>
                {expense.student.contact_number && (
                  <p className="text-sm text-gray-600">{expense.student.contact_number}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Purchase Items */}
        {expense.purchases && expense.purchases.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase Items</h2>
            
            <div className="overflow-x-auto">
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
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {purchase.item_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.item_quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(purchase.item_unit_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(purchase.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attachment */}
        {expense.expense_attachment && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Attachment</h2>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <div className="flex-1">
                <a
                  href={expense.expense_attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Attachment
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="text-sm text-gray-900 mt-1">{formatDate(expense.created_at)}</p>
            </div>
            
            {expense.updated_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
                <p className="text-sm text-gray-900 mt-1">{formatDate(expense.updated_at)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
