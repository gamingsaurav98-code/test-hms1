"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { staffInquiryApi } from '@/lib/api/staff-inquiry.api';
import { Inquiry } from '@/lib/api/types/inquiry.types';
import { ApiError } from '@/lib/api/core';
import { 
  Button, 
  SearchBar, 
  TableSkeleton,
  ActionButtons
} from '@/components/ui';

export default function StaffInquiryList() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch inquiries from API
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await staffInquiryApi.getInquiries();
        setInquiries(response.data);
        setFilteredInquiries(response.data);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        if (error instanceof ApiError) {
          setError(`Failed to fetch inquiries: ${error.message}`);
        } else {
          setError('Failed to fetch inquiries. Please check your connection.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInquiries(inquiries);
    } else {
      const filtered = inquiries.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inquiry.email && inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredInquiries(filtered);
    }
  }, [searchQuery, inquiries]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-medium text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Loading inquiries...</p>
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">{inquiries.length} total inquiries</p>
        </div>
        <Button
          onClick={() => router.push('/staff/inquiry/create')}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>}
          className="bg-[#235999] hover:bg-[#1e4d87]"
        >
          Add Inquiry
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search inquiries..."
        />
      </div>

      {/* List View */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <div className="text-gray-300 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {searchQuery ? 'No inquiries found' : 'No inquiries yet'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first inquiry to get started'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => router.push('/staff/inquiry/create')}
              className="bg-[#235999] hover:bg-[#1e4d87]"
            >
              Create Inquiry
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Inquiry Details</div>
              <div className="col-span-3">Contact Info</div>
              <div className="col-span-2">Seater</div>
              <div className="col-span-2 text-center">Created</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-gray-100">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Inquiry Details */}
                  <div className="col-span-4">
                    <div className="font-medium text-sm text-gray-900">{inquiry.name}</div>
                  </div>

                  {/* Contact Info */}
                  <div className="col-span-3">
                    <div className="text-sm text-gray-900">{inquiry.phone}</div>
                    {inquiry.email && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {inquiry.email}
                      </div>
                    )}
                  </div>

                  {/* Seater */}
                  <div className="col-span-2">
                    <div className="text-sm text-gray-700">
                      {inquiry.seater_type ? `${inquiry.seater_type}-seater` : 'Not specified'}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 text-center">
                      {formatDate(inquiry.created_at)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex justify-center">
                      <ActionButtons 
                        viewUrl={`/staff/inquiry/${inquiry.id}`}
                        editUrl={`/staff/inquiry/${inquiry.id}/edit`}
                        hideDelete={true}
                        style="compact"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {filteredInquiries.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {filteredInquiries.length} of {inquiries.length} inquiries
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
}
