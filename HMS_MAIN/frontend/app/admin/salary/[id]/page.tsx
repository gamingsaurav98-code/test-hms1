'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SalaryApi, type Salary } from '@/lib/api';
import { Button } from '@/components/ui';
import { Edit, Calendar, User, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SalaryDetail() {
  const params = useParams();
  const salaryId = parseInt(params?.id as string);
  
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
      const salaryData = await SalaryApi.getById(salaryId);
      setSalary(salaryData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salary details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="p-6">
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
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-end mb-4">
            <Link href={`/admin/salary/${salary.id}/edit`}>
              <Button 
                icon={<Edit className="w-4 h-4" />}
                className="bg-[#235999] hover:bg-[#1e4d87]"
              >
                Edit Salary
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            Salary record for {salary.staff?.staff_name} - {salary.month_name} {salary.year}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">Staff Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Staff Name</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">{salary.staff?.staff_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Staff ID</label>
                <p className="mt-1 text-sm text-gray-900">{salary.staff_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{salary.staff?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                <p className="mt-1 text-sm text-gray-900">{salary.staff?.contact_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Salary Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">Salary Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Payment Date</label>
                <p className="mt-1 text-sm text-gray-900 font-medium">
                  {formatDate(salary.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Amount</label>
                <p className="mt-1 text-lg text-gray-900 font-bold">
                  {formatCurrency(salary.amount)}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{salary.description || 'No description provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">Timeline</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(salary.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(salary.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href={`/admin/salary/${salary.id}/edit`} className="block">
                <Button variant="secondary" className="w-full" icon={<Edit className="w-4 h-4" />}>
                  Edit Salary
                </Button>
              </Link>
              <Link href="/admin/salary/create" className="block">
                <Button variant="primary" className="w-full bg-[#235999] hover:bg-[#1e4d87]">
                  Create New Salary
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
