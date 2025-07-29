'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { staffApi } from '@/lib/api/staff.api';

interface PaymentRecord {
  id: string;
  amount: string;
  income_date?: string;
  payment_type?: {
    name: string;
  };
  remark?: string;
  created_at: string;
  staff_id?: string;
}

export default function StaffPaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPaymentHistory();
  }, [currentPage]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      
      // Use staff-specific payment history endpoint
      const response = await staffApi.getStaffPayments();
      
      // Handle different response structures
      const paymentsData = Array.isArray(response) ? response : (response.data || []);
      
      // Map to PaymentRecord format
      const staffPayments: PaymentRecord[] = paymentsData.map((payment: any) => ({
        id: payment.id,
        amount: payment.amount?.toString() || '0',
        income_date: payment.payment_date || payment.income_date,
        payment_type: payment.payment_type,
        remark: payment.remark,
        created_at: payment.created_at,
        staff_id: payment.staff_id,
      }));
      
      setPayments(staffPayments);
      setTotalPages(Math.ceil(staffPayments.length / 10)); // Assuming 10 per page
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: string) => {
    return `Rs. ${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">Loading your payment records...</p>
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-4 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Payment History</h1>
        <p className="text-sm text-gray-500 mt-1">Your salary and payment records</p>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <div className="text-gray-300 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No payment records</h3>
          <p className="text-sm text-gray-500">Your payment history will appear here once processed</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Payment Date</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-3">Payment Type</div>
              <div className="col-span-4">Remarks</div>
            </div>
          </div>

          {/* Payment Records */}
          <div className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Payment Date */}
                  <div className="col-span-3">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(payment.income_date || payment.created_at)}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div className="col-span-3">
                    <div className="text-sm text-gray-600">
                      {payment.payment_type?.name || 'Salary'}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="col-span-4">
                    <div className="text-sm text-gray-600">
                      {payment.remark || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {payments.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-lg font-medium text-gray-900">{payments.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-lg font-medium text-green-600">
                {formatCurrency(
                  payments.reduce((total, payment) => total + parseFloat(payment.amount), 0).toString()
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
