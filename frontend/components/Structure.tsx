"use client";

import React, { useState, useEffect } from 'react';

export default function Structure({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-gray-900">
              <span className="text-gray-600">Hostel Management</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300"></div>
            <div className="hidden md:block text-gray-700 font-medium">Dashboard</div>
          </div>
          
          {/* Right side - Date/Time and User */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDateTime(currentTime)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto z-20">
        <div className="py-4">
          <nav className="space-y-1 px-3">
            {/* Dashboard */}
            <div className="bg-blue-600 rounded-md">
              <a href="#" className="flex items-center px-3 py-2.5 text-white">
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="text-sm font-medium">Dashboard</span>
              </a>
            </div>

            {/* Students */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-sm">Students</span>
            </a>

            {/* Student Check-In/Out */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Student Check-In/Out</span>
            </a>

            {/* Complaint */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Complaint</span>
            </a>

            {/* Staffs */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span className="text-sm">Staffs</span>
            </a>

            {/* Staff Check-In/Out */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Staff Check-In/Out</span>
            </a>

            {/* Salary */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Salary</span>
            </a>

            {/* Income */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-sm">Income</span>
            </a>

            {/* Expenses */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-sm">Expenses</span>
            </a>

            {/* Supplier */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Supplier</span>
            </a>

            {/* Block */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v2h4V6H4zm6 0v2h6V6h-6zM4 10v2h4v-2H4zm6 0v2h6v-2h-6zM4 14v2h4v-2H4zm6 0v2h6v-2h-6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Block</span>
            </a>

            {/* Rooms */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-sm">Rooms</span>
            </a>

            {/* Notice */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Notice</span>
            </a>

            {/* Inquiry */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Inquiry</span>
            </a>

            {/* Report */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Report</span>
            </a>

            {/* Settings */}
            <a href="#" className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Settings</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 mt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}