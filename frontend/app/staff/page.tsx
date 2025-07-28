'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { staffCheckInCheckOutApi } from '@/lib/api/staff-checkincheckout.api';
import { SalaryApi } from '@/lib/api/salary.api';
import { roomApi } from '@/lib/api/room.api';
import { studentApi } from '@/lib/api/student.api';

interface StaffDashboardStats {
  currentStatus: 'checked-in' | 'checked-out' | 'pending';
  workShift: string;
  department: string;
  position: string;
  lastCheckIn: string;
  lastCheckOut: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalStudents: number;
  monthlySalary: number;
  lastSalaryDate: string;
  lastSalaryAmount: number;
  recentActivities: Array<{
    type: 'checkin' | 'checkout' | 'salary' | 'maintenance' | 'student';
    message: string;
    time: string;
    status?: string;
  }>;
  pendingTasks: Array<{
    task: string;
    priority: 'high' | 'medium' | 'low';
    dueDate: string;
  }>;
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<StaffDashboardStats>({
    currentStatus: 'checked-out',
    workShift: 'Day Shift (8AM - 4PM)',
    department: 'General',
    position: 'Staff Member',
    lastCheckIn: '',
    lastCheckOut: '',
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalStudents: 0,
    monthlySalary: 0,
    lastSalaryDate: '',
    lastSalaryAmount: 0,
    recentActivities: [],
    pendingTasks: [],
  });
  const [loading, setLoading] = useState(true);
  const [staffId] = useState('1'); // This should come from auth context

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch staff-specific data
      const [
        checkInOutData,
        salaryData,
        roomsData,
        studentsData,
      ] = await Promise.all([
        staffCheckInCheckOutApi.getCheckInCheckOuts().catch(() => ({ data: [] })),
        SalaryApi.getAll().catch(() => ({ data: [] })),
        roomApi.getRooms().catch(() => ({ data: [] })),
        studentApi.getAllActiveStudents().catch(() => []),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Calculate current status from check-in/out data
      const myCheckIns = checkInOutData.data?.filter((record: any) => 
        record.staff_id === staffId || (record.staff && record.staff.id === staffId)
      ) || [];
      
      const latestCheckIn = myCheckIns
        .filter((record: any) => record.status === 'approved' || record.status === 'checked_in')
        .sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime())[0];

      const currentStatus = latestCheckIn && latestCheckIn.checkin_time && !latestCheckIn.checkout_time ? 'checked-in' : 'checked-out';

      // Calculate room statistics
      const totalRooms = roomsData.data?.length || 0;
      const occupiedRooms = roomsData.data?.filter((room: any) => room.status === 'occupied').length || 0;
      const availableRooms = totalRooms - occupiedRooms;

      // Calculate student statistics
      const totalStudents = Array.isArray(studentsData) ? studentsData.length : 0;

      // Calculate salary statistics
      const salariesArray = Array.isArray(salaryData) ? salaryData : (salaryData.data || []);
      const mySalaries = salariesArray.filter((salary: any) => 
        salary.staff_id === staffId || (salary.staff && salary.staff.id === staffId)
      ) || [];

      const thisMonthSalary = mySalaries.find((salary: any) => 
        salary.month === (currentMonth + 1) && salary.year === currentYear
      );

      const lastSalary = mySalaries
        .sort((a: any, b: any) => {
          const aDate = new Date(a.year, a.month - 1);
          const bDate = new Date(b.year, b.month - 1);
          return bDate.getTime() - aDate.getTime();
        })[0];

      // Generate recent activities
      const recentActivities: Array<{
        type: 'checkin' | 'checkout' | 'salary' | 'maintenance' | 'student';
        message: string;
        time: string;
        status?: string;
      }> = [];

      // Add recent check-ins/check-outs
      myCheckIns.slice(0, 2).forEach((checkIn: any) => {
        if (checkIn.checkin_time) {
          const checkInDate = new Date(checkIn.date || checkIn.created_at);
          const timeAgo = formatTimeAgo(checkInDate);
          recentActivities.push({
            type: 'checkin' as const,
            message: `Checked in for ${checkIn.shift || 'work shift'}`,
            time: timeAgo,
            status: checkIn.status,
          });
        }

        if (checkIn.checkout_time) {
          const checkOutDate = new Date(checkIn.date || checkIn.created_at);
          const timeAgo = formatTimeAgo(checkOutDate);
          recentActivities.push({
            type: 'checkout' as const,
            message: `Checked out from ${checkIn.shift || 'work shift'}`,
            time: timeAgo,
            status: 'completed',
          });
        }
      });

      // Add recent salary information
      if (lastSalary) {
        const salaryDate = new Date(lastSalary.year, lastSalary.month - 1);
        const timeAgo = formatTimeAgo(salaryDate);
        recentActivities.push({
          type: 'salary' as const,
          message: `Salary of Rs.${parseFloat(String(lastSalary.amount || '0')).toLocaleString()} processed`,
          time: timeAgo,
          status: lastSalary.status,
        });
      }

      // Add system activities
      recentActivities.push(
        {
          type: 'student' as const,
          message: `${totalStudents} students currently registered`,
          time: 'Current',
          status: 'active',
        },
        {
          type: 'maintenance' as const,
          message: `${availableRooms} rooms available for new students`,
          time: 'Current',
          status: 'available',
        }
      );

      // Sort activities by most recent first
      recentActivities.sort((a, b) => {
        if (a.time === 'Current') return -1;
        if (b.time === 'Current') return 1;
        return a.time.localeCompare(b.time);
      });

      setStats({
        currentStatus,
        workShift: 'Day Shift (8AM - 4PM)', // This should come from staff data
        department: 'General', // This should come from staff data
        position: 'Staff Member', // This should come from staff data
        lastCheckIn: (latestCheckIn && latestCheckIn.checkin_time) ? latestCheckIn.checkin_time : '',
        lastCheckOut: (latestCheckIn && latestCheckIn.checkout_time) ? latestCheckIn.checkout_time : '',
        totalRooms,
        occupiedRooms,
        availableRooms,
        totalStudents,
        monthlySalary: thisMonthSalary ? parseFloat(String(thisMonthSalary.amount || '0')) : 0,
        lastSalaryDate: lastSalary ? `${lastSalary.year}-${String(lastSalary.month).padStart(2, '0')}-01` : '',
        lastSalaryAmount: lastSalary ? parseFloat(String(lastSalary.amount || '0')) : 0,
        recentActivities: recentActivities.slice(0, 5),
        pendingTasks: [
          { task: 'Review student check-in requests', priority: 'high', dueDate: '2025-07-29' },
          { task: 'Update room maintenance records', priority: 'medium', dueDate: '2025-07-30' },
          { task: 'Submit monthly activity report', priority: 'low', dueDate: '2025-08-01' },
        ],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return '1 week ago';
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 60) return '1 month ago';
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const StatusCard = ({ title, value, subtitle, icon, color = 'blue', action }: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon?: string;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
    action?: { label: string; href: string };
  }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    };

    const getIcon = (iconName: string) => {
      const iconMap = {
        'status': (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        'rooms': (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
        'students': (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        ),
        'salary': (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        ),
      };
      return iconMap[iconName as keyof typeof iconMap] || null;
    };

    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {icon && (
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${colorClasses[color].bg} ${colorClasses[color].text}`}>
                {getIcon(icon)}
              </div>
            )}
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {action && (
            <Button 
              onClick={() => window.location.href = action.href}
              className="text-xs px-3 py-2 rounded-lg"
              variant="secondary"
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="text-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-300 mx-auto animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Staff Member!</h1>
            <p className="text-blue-100 text-lg">{stats.workShift} • {stats.department} • {stats.position}</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.href = '/staff/checkin-checkout'}
              variant="secondary"
              size="lg"
              className="bg-white/90 backdrop-blur-sm text-blue-700 hover:bg-white border-0 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              {stats.currentStatus === 'checked-in' ? 'Check Out' : 'Check In'}
            </Button>
            <Button 
              onClick={() => window.location.href = '/staff/salary'}
              variant="secondary"
              size="lg"
              className="bg-white/90 backdrop-blur-sm text-blue-700 hover:bg-white border-0 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              View Salary
            </Button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard
          title="Work Status"
          value={stats.currentStatus === 'checked-in' ? 'On Duty' : 'Off Duty'}
          subtitle={stats.workShift}
          icon="status"
          color={stats.currentStatus === 'checked-in' ? 'green' : 'red'}
          action={{ label: 'Manage', href: '/staff/checkin-checkout' }}
        />
        <StatusCard
          title="Total Rooms"
          value={stats.totalRooms}
          subtitle={`${stats.occupiedRooms} occupied, ${stats.availableRooms} available`}
          icon="rooms"
          color="blue"
        />
        <StatusCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Currently registered"
          icon="students"
          color="purple"
        />
        <StatusCard
          title="Monthly Salary"
          value={stats.monthlySalary > 0 ? `Rs.${Math.round(stats.monthlySalary).toLocaleString()}` : 'N/A'}
          subtitle={stats.lastSalaryDate ? `Last: ${new Date(stats.lastSalaryDate).toLocaleDateString()}` : 'No record'}
          icon="salary"
          color="green"
          action={{ label: 'Details', href: '/staff/salary' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
              <p className="text-gray-500 mt-1">Your latest work activities and system updates</p>
            </div>
            <div className="space-y-4">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'salary' 
                      ? 'bg-green-100 text-green-600' 
                      : activity.type === 'checkin'
                      ? 'bg-blue-100 text-blue-600'
                      : activity.type === 'checkout'
                      ? 'bg-red-100 text-red-600'
                      : activity.type === 'student'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {activity.type === 'salary' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    ) : activity.type === 'checkin' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    ) : activity.type === 'checkout' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    ) : activity.type === 'student' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    {activity.status && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        activity.status === 'completed' || activity.status === 'approved' || activity.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : activity.status === 'active' || activity.status === 'available'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {stats.recentActivities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No recent activities to display</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pending Tasks & Quick Actions */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Pending Tasks</h2>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-sm text-orange-700 font-medium">{stats.pendingTasks.length} tasks pending</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {stats.pendingTasks.map((task, index) => (
                <div key={index} className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority} priority
                    </span>
                    <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/staff/checkin-checkout'}
                className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100"
                variant="secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Check-In/Out History
              </Button>
              <Button 
                onClick={() => window.location.href = '/staff/salary'}
                className="w-full justify-start bg-green-50 text-green-700 hover:bg-green-100"
                variant="secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                View Salary Details
              </Button>
              <Button 
                onClick={() => window.location.href = '/staff/notice'}
                className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100"
                variant="secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Notices
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
