"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { expenseApi, Expense, ApiError } from '@/lib/api/index';
import { 
  Button, 
  SearchBar, 
  ConfirmModal, 
  SuccessToast, 
  TableSkeleton,
  ActionButtons 
} from '@/components/ui';

export default function ExpenseList() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, expenseId: string | null}>({
    show: false,
    expenseId: null
  });
  const [alert, setAlert] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch expenses from API
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await expenseApi.getExpenses(currentPage);
        // Log the first expense to see what fields are available
        if (response.data && response.data.length > 0) {
          console.log('Sample expense data:', response.data[0]);
        }
        
        // Process expenses to ensure payment status is set
        const processedExpenses = response.data.map(expense => {
          const expenseCopy = { ...expense };
          // If payment status is missing but we have payment data, calculate it
          if (!expenseCopy.payment_status) {
            const paidAmount = expenseCopy.paid_amount || 0;
            const totalAmount = expenseCopy.amount || 0;
            
            if (paidAmount >= totalAmount && totalAmount > 0) {
              expenseCopy.payment_status = 'paid';
            } else if (paidAmount > 0) {
              expenseCopy.payment_status = 'partially_paid';
            } else {
              expenseCopy.payment_status = 'credit';
            }
          }
          return expenseCopy;
        });
        
        setExpenses(processedExpenses);
        setFilteredExpenses(processedExpenses);
        setTotalPages(response.last_page);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        if (error instanceof ApiError) {
          setError(`Failed to fetch expenses: ${error.message}`);
        } else {
          setError('Failed to fetch expenses. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [currentPage]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExpenses(expenses);
    } else {
      const filtered = expenses.filter(expense =>
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.expenseCategory?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExpenses(filtered);
    }
  }, [searchQuery, expenses]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
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
  
  // No longer needed as we're using payment_status directly

  const handleDeleteExpense = async (expenseId: string) => {
    setDeleteModal({show: true, expenseId});
  };

  const confirmDelete = async () => {
    const expenseId = deleteModal.expenseId;
    if (!expenseId) return;

    try {
      setIsDeleting(expenseId);
      setDeleteModal({show: false, expenseId: null});
      setAlert({show: true, message: 'Deleting expense...', type: 'success'});
      
      await expenseApi.deleteExpense(expenseId);
      
      // Remove from local state
      const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
      setExpenses(updatedExpenses);
      setFilteredExpenses(updatedExpenses.filter(expense =>
        !searchQuery.trim() ||
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.expenseCategory?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      
      setAlert({show: true, message: 'Expense deleted successfully!', type: 'success'});
      
      // Hide alert after 3 seconds
      setTimeout(() => {
        setAlert({show: false, message: '', type: 'success'});
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting expense:', error);
      if (error instanceof ApiError) {
        setAlert({show: true, message: `Failed to delete expense: ${error.message}`, type: 'error'});
      } else {
        setAlert({show: true, message: 'Failed to delete expense. Please try again.', type: 'error'});
      }
      
      // Hide error alert after 5 seconds
      setTimeout(() => {
        setAlert({show: false, message: '', type: 'success'});
      }, 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({show: false, expenseId: null});
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Loading expenses...</p>
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting !== null}
        variant="danger"
      />

      {/* Alert Notification */}
      {alert.type === 'success' && alert.show && (
        <SuccessToast
          show={alert.show}
          message={alert.message}
          progress={100}
          onClose={() => setAlert({show: false, message: '', type: 'success'})}
        />
      )}
      {alert.type === 'error' && alert.show && (
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
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setAlert({show: false, message: '', type: 'success'})}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">{expenses.length} total expenses</p>
        </div>
        <Button
          onClick={() => router.push('/admin/expense/create')}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>}
          className="bg-[#235999] hover:bg-[#1e4d87]"
        >
          Add Expense
        </Button>
      </div>

      {/* Compact Search */}
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search expenses..."
        />
      </div>

      {/* Clean List View */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <div className="text-gray-300 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {searchQuery ? 'No expenses found' : 'No expenses yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first expense to get started'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push('/admin/expense/create')}
              className="bg-[#235999] hover:bg-[#1e4d87]"
            >
              Create Expense
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Expense Details</div>
              <div className="col-span-2">Description</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Supplier</div>
              <div className="col-span-1 text-center">Date</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-gray-100">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Expense Details - Title only */}
                  <div className="col-span-3">
                    <div className="font-medium text-sm text-gray-900">{expense.title}</div>
                  </div>

                  {/* Description - truncated to 15 characters */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-900">
                      {expense.description 
                        ? (expense.description.length > 15 
                            ? expense.description.substring(0, 15) + '...' 
                            : expense.description)
                        : 'No description'
                      }
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                    {(expense.paid_amount || 0) > 0 && (
                      <div className="text-xs text-green-600">Paid: {formatCurrency(expense.paid_amount || 0)}</div>
                    )}
                    {expense.amount > (expense.paid_amount || 0) && (
                      <div className="text-xs text-red-600">Due: {formatCurrency(expense.amount - (expense.paid_amount || 0))}</div>
                    )}
                  </div>

                  {/* Status - Using pre-calculated status from data processing */}
                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(expense.payment_status)}`}>
                      {expense.payment_status === 'paid' && 'Paid'}
                      {expense.payment_status === 'partially_paid' && 'Partial'}
                      {(!expense.payment_status || expense.payment_status === 'credit') && 'Credit'}
                    </span>
                  </div>

                  {/* Supplier */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-900">
                      {expense.supplier?.name || expense.student?.student_name || 'N/A'}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-1">
                    <div className="text-xs text-gray-500 text-center">
                      {formatDate(expense.expense_date)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <ActionButtons 
                      viewUrl={`/admin/expense/${expense.id}`}
                      editUrl={`/admin/expense/${expense.id}/edit`}
                      onDelete={() => handleDeleteExpense(expense.id)}
                      isDeleting={isDeleting === expense.id}
                      style="compact"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      {filteredExpenses.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {filteredExpenses.length} of {expenses.length} expenses
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
}
