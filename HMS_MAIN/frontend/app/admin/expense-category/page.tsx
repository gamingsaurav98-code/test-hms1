"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { expenseCategoryApi, ExpenseCategory, ApiError } from '@/lib/api/index';
import { 
  Button, 
  SearchBar, 
  ConfirmModal, 
  SuccessToast, 
  TableSkeleton,
  ActionButtons 
} from '@/components/ui';
import { Plus } from 'lucide-react';

export default function ExpenseCategoryList() {
  const router = useRouter();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, categoryId: string | null}>({
    show: false,
    categoryId: null
  });
  const [alert, setAlert] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch expense categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await expenseCategoryApi.getExpenseCategories();
        setCategories(response);
        setFilteredCategories(response);
      } catch (error) {
        console.error('Error fetching expense categories:', error);
        if (error instanceof ApiError) {
          setError(`Failed to fetch expense categories: ${error.message}`);
        } else {
          setError('Failed to fetch expense categories. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setDeleteModal({show: true, categoryId});
  };

  const confirmDelete = async () => {
    const categoryId = deleteModal.categoryId;
    if (!categoryId) return;

    try {
      setIsDeleting(categoryId);
      setDeleteModal({show: false, categoryId: null});
      
      await expenseCategoryApi.deleteExpenseCategory(categoryId);
      
      // Remove from local state
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
      setFilteredCategories(updatedCategories.filter(category =>
        !searchQuery.trim() ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
      
      setAlert({show: true, message: 'Expense category deleted successfully!', type: 'success'});
      
      setTimeout(() => {
        setAlert({show: false, message: '', type: 'success'});
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting category:', error);
      setAlert({
        show: true,
        message: error instanceof ApiError ? error.message : 'Failed to delete expense category',
        type: 'error'
      });
      
      setTimeout(() => {
        setAlert({show: false, message: '', type: 'success'});
      }, 3000);
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({show: false, categoryId: null});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Expense Categories</h1>
          <p className="text-sm text-gray-600 mt-1">Loading expense categories...</p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        title="Delete Expense Category"
        message="Are you sure you want to delete this expense category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting !== null}
        variant="danger"
      />

      {/* Success/Error Toast */}
      {alert.show && alert.type === 'success' && (
        <SuccessToast
          show={alert.show}
          message={alert.message}
          progress={100}
          onClose={() => setAlert({show: false, message: '', type: 'success'})}
        />
      )}
      {alert.show && alert.type === 'error' && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-red-100 border-red-500 text-red-700 border-l-4 p-4 rounded-lg shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
            <button
              onClick={() => setAlert({show: false, message: '', type: 'success'})}
              className="ml-auto pl-3 inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expense Categories</h1>
          <p className="text-sm text-gray-600 mt-1">{categories.length} total categories</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={() => router.push('/admin/expense-category/create')}
            icon={<Plus className="w-4 h-4" />}
            className="bg-[#235999] hover:bg-[#1e4d87]"
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search categories by name or description..."
        />
      </div>

      {/* Category List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <div className="text-gray-300 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {searchQuery ? 'No categories found' : 'No expense categories yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first expense category to get started'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push('/admin/expense-category/create')}
              className="bg-[#235999] hover:bg-[#1e4d87]"
            >
              Add Category
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Category Name</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Created Date</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-gray-100">
            {filteredCategories.map((category) => (
              <div key={category.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Category Name */}
                  <div className="col-span-4">
                    <div className="font-medium text-sm text-gray-900">{category.name}</div>
                  </div>

                  {/* Description */}
                  <div className="col-span-5">
                    <div className="text-sm text-gray-600">
                      {category.description || 'No description'}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">
                      {formatDate(category.created_at)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <ActionButtons 
                      viewUrl={`/admin/expense-category/${category.id}`}
                      editUrl={`/admin/expense-category/${category.id}/edit`}
                      onDelete={() => handleDeleteCategory(category.id)}
                      isDeleting={isDeleting === category.id}
                      style="compact"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {filteredCategories.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {filteredCategories.length} of {categories.length} categories
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
}
