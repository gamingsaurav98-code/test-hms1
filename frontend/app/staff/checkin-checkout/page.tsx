'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  SearchBar, 
  TableSkeleton 
} from '@/components/ui';
import { staffCheckInCheckOutApi, StaffCheckInCheckOut } from '@/lib/api/staff-checkincheckout.api';
import { 
  Calendar, 
  Clock,
  User,
  Check,
  X,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function StaffCheckInCheckOutPage() {
  const [checkInOuts, setCheckInOuts] = useState<StaffCheckInCheckOut[]>([]);
  const [filteredCheckInOuts, setFilteredCheckInOuts] = useState<StaffCheckInCheckOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'checked-in' | 'checked-out'>('checked-out');

  useEffect(() => {
    fetchCheckInOuts();
  }, []);

  const fetchCheckInOuts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test if the staff profile endpoint works (this should be available)
      console.log('Testing staff profile endpoint first...');
      try {
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/staff/profile`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
        });
        console.log('Profile endpoint status:', profileResponse.status);
        if (profileResponse.ok) {
          console.log('Staff profile endpoint works, so auth is working');
        } else {
          console.log('Staff profile endpoint failed:', await profileResponse.text());
        }
      } catch (profileError) {
        console.error('Profile endpoint error:', profileError);
      }
      
      // Now try our custom endpoint
      let data: StaffCheckInCheckOut[] = [];
      try {
        const response = await staffCheckInCheckOutApi.getMyRecords();
        data = response.data || [];
        console.log('getMyRecords succeeded:', data);
      } catch (error) {
        console.error('getMyRecords failed:', error);
        // For now, just use empty data so the page loads
        data = [];
      }
      
      setCheckInOuts(data);
      setFilteredCheckInOuts(data);
      
      // Determine current status based on latest record
      const latestRecord = data[0];
      if (latestRecord && latestRecord.checkin_time && !latestRecord.checkout_time) {
        setCurrentStatus('checked-in');
      } else {
        setCurrentStatus('checked-out');
      }
    } catch (err) {
      console.error('Error fetching check-in/out data:', err);
      setError('Failed to load check-in/checkout data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter check-ins based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCheckInOuts(checkInOuts);
    } else {
      const filtered = checkInOuts.filter(record =>
        record.date.includes(searchQuery) ||
        record.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.block?.block_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCheckInOuts(filtered);
    }
  }, [searchQuery, checkInOuts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCheckIn = async () => {
    try {
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS format
      
      await staffCheckInCheckOutApi.checkIn({
        staff_id: '1', // This should come from auth context
        block_id: '1', // Default block
        checkin_time: timeString,
        remarks: 'Staff check-in'
      });
      
      setCurrentStatus('checked-in');
      fetchCheckInOuts();
    } catch (error) {
      console.error('Error checking in:', error);
      setError('Failed to check in. Please try again.');
    }
  };

  const handleCheckOut = async () => {
    try {
      // Find the latest check-in record without checkout
      const latestCheckIn = checkInOuts.find(record => 
        record.checkin_time && !record.checkout_time
      );
      
      if (latestCheckIn) {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        
        await staffCheckInCheckOutApi.checkOut({
          staff_id: '1', // This should come from auth context
          checkout_time: timeString,
          remarks: 'Staff check-out'
        });
        
        setCurrentStatus('checked-out');
        fetchCheckInOuts();
      }
    } catch (error) {
      console.error('Error checking out:', error);
      setError('Failed to check out. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      checked_out: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      checked_in: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'checked_out':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateHoursWorked = (checkinTime: string, checkoutTime: string): string => {
    try {
      const checkin = new Date(`2000-01-01 ${checkinTime}`);
      const checkout = new Date(`2000-01-01 ${checkoutTime}`);
      const diffMs = checkout.getTime() - checkin.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading && filteredCheckInOuts.length === 0) {
    return (
      <div className="p-6 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-In/Check-Out Management</h1>
          <p className="text-gray-600">Manage your attendance and view check-in/checkout history</p>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-In/Check-Out Management</h1>
          <p className="text-gray-600">Manage your attendance and view check-in/checkout history</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
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
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-In/Check-Out Management</h1>
            <p className="text-gray-600">Manage your attendance and view check-in/checkout history</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Status</p>
              <p className={`font-semibold ${currentStatus === 'checked-in' ? 'text-green-600' : 'text-red-600'}`}>
                {currentStatus === 'checked-in' ? 'On Duty' : 'Off Duty'}
              </p>
            </div>
            {currentStatus === 'checked-out' ? (
              <Button
                onClick={handleCheckIn}
                variant="primary"
                size="lg"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Check In
              </Button>
            ) : (
              <Button
                onClick={handleCheckOut}
                variant="danger"
                size="lg"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Check Out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by date, block, or remarks..."
        />
      </div>

      {/* Check-In/Out History */}
      {filteredCheckInOuts.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No check-in records found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'Try adjusting your search criteria' 
              : 'Your attendance history will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCheckInOuts.map((record) => {
            const hoursWorked = record.checkin_time && record.checkout_time
              ? calculateHoursWorked(record.checkin_time, record.checkout_time)
              : 'In Progress';

            return (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Record Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Work Shift - {record.block?.block_name || 'General'}
                          </h3>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1">{record.status}</span>
                        </span>
                      </div>

                      {/* Times */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-medium">
                            {record.checkin_time || 'Not checked in'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <X className="w-4 h-4 text-red-600" />
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">
                            {record.checkout_time || 'Not checked out'}
                          </span>
                        </div>
                      </div>

                      {/* Remarks */}
                      {record.remarks && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Remarks:</span> {record.remarks}
                          </p>
                        </div>
                      )}

                      {/* Meta Information */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Date: {new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Block: {record.block?.block_name || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-500">Hours Worked</p>
                      <p className={`font-semibold ${hoursWorked === 'In Progress' ? 'text-blue-600' : 'text-green-600'}`}>
                        {hoursWorked}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
