"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { expenseCategoryApi, ExpenseCategory, ApiError } from '@/lib/api/index';
import { Button, TableSkeleton } from '@/components/ui';
import { Edit, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default function ExpenseCategoryDetail() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        const data = await expenseCategoryApi.getExpenseCategory(categoryId);
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError('Failed to load expense category details');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Category Details</h1>
          <p className="text-sm text-gray-600 mt-1">Loading category data...</p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error || 'Expense category not found'}</p>
          </div>
          <button
            onClick={() => router.push('/admin/expense-category')}
            className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
          >
            Back to Categories
          </button>
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
            <Link href={`/admin/expense-category/${category.id}/edit`}>
              <Button 
                icon={<Edit className="w-4 h-4" />}
                className="bg-[#235999] hover:bg-[#1e4d87]"
              >
                Edit Category
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Category Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            Expense category information
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">Category Information</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Category Name</label>
                  <p className="mt-1 text-lg text-gray-900 font-semibold">{category.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{category.description || 'No description provided'}</p>
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
                    {formatDate(category.created_at)}
                  </p>
                </div>
                {category.updated_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(category.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href={`/admin/expense-category/${category.id}/edit`} className="block">
                  <Button variant="secondary" className="w-full" icon={<Edit className="w-4 h-4" />}>
                    Edit Category
                  </Button>
                </Link>
                <Link href="/admin/expense-category/create" className="block">
                  <Button variant="primary" className="w-full bg-[#235999] hover:bg-[#1e4d87]">
                    Create New Category
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
