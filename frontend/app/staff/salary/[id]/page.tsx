'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SalaryApi, type Salary } from '@/lib/api';

export default function StaffSalaryDetail() {
  const params = useParams();
  const salaryId = parseInt(params.id as string);
  
  const [salary, setSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (salaryId) {
      fetchSalary();
    }
  }, [salaryId]);

  const fetchSalary = async () => {
    try {
      setLoading(true);
      // Use the getMySalaryHistory and filter by ID since staff can only view their own salary
      const salaries = await SalaryApi.getMySalaryHistory();
      const salaryData = salaries.find(s => s.id === salaryId);
      
      if (!salaryData) {
        throw new Error('Salary record not found or you do not have permission to view it');
      }
      
      setSalary(salaryData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salary details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs.${Math.round(amount).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMonthName = (month: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Salary Details</h1>
          <p className="text-sm text-gray-500 mt-1">Loading salary information...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error || 'Salary record not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {getMonthName(salary.month)} {salary.year}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Viewing salary details
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Main Content */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Month</h4>
                  <p className="text-lg text-gray-900 font-medium">
                    {getMonthName(salary.month)} {salary.year}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Amount</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(parseFloat(String(salary.amount || '0')))}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Date</h4>
                  <p className="text-lg text-gray-900">
                    {formatDate(salary.created_at)}
                  </p>
                </div>

                {salary.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-lg text-gray-900">{salary.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-200 mt-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">{formatDate(salary.created_at)}</span>
                </div>
                {salary.updated_at && (
                  <div>
                    <span className="font-medium text-gray-500">Last Updated:</span>
                    <span className="ml-2 text-gray-900">{formatDate(salary.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
