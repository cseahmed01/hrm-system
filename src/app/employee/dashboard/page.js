'use client';

import { useState, useEffect } from 'react';

export default function EmployeeDashboard() {
  const [stats, setStats] = useState({
    todayAttendance: null,
    pendingLeaves: 0,
    recentPayslip: null,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getTenantId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.tenantId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const userId = getUserId();

      // Fetch today's attendance
      const attendanceRes = await fetch(`/api/attendances?date=${new Date().toISOString().split('T')[0]}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });

      // Fetch user profile
      const userRes = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Fetch pending leaves
      const leavesRes = await fetch('/api/leaves?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });

      // Fetch recent payslip
      const payslipsRes = await fetch('/api/payrolls', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });

      const [attendanceData, userData, leavesData, payslipsData] = await Promise.all([
        attendanceRes.json(),
        userRes.json(),
        leavesRes.json(),
        payslipsRes.json(),
      ]);

      if (userData.user) {
        setUser(userData.user);
      }

      // Find today's attendance for this user
      const todayAttendance = attendanceData.attendances?.find(a => a.employeeId === userData.user?.employee?.id) || null;

      // Count pending leaves for this user
      const pendingLeaves = leavesData.leaves?.filter(l => l.employeeId === userData.user?.employee?.id && l.status === 'pending').length || 0;

      // Find most recent payslip
      const userPayrolls = payslipsData.payrolls?.filter(p => p.employeeId === userData.user?.employee?.id) || [];
      const recentPayslip = userPayrolls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

      setStats({
        todayAttendance,
        pendingLeaves,
        recentPayslip,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const userId = getUserId();

      const response = await fetch('/api/attendances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          employeeId: user?.employee?.id,
          action: stats.todayAttendance?.checkIn ? 'checkout' : 'checkin',
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {user?.name || 'Employee'}!
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">Here's your dashboard overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Today's Attendance</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {stats.todayAttendance ? (
                  stats.todayAttendance.checkOut ? 'Checked Out' : 'Checked In'
                ) : 'Not Checked In'}
              </p>
              {stats.todayAttendance?.checkIn && (
                <p className="text-xs text-slate-500 mt-1">
                  Check-in: {new Date(stats.todayAttendance.checkIn).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              ⏰
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Pending Leave Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stats.pendingLeaves}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              🧾
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Latest Payslip</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {stats.recentPayslip ? `$${stats.recentPayslip.netSalary}` : 'No payslips'}
              </p>
              {stats.recentPayslip && (
                <p className="text-xs text-slate-500 mt-1">
                  {stats.recentPayslip.month}
                </p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Attendance</h3>
          <button
            onClick={handleQuickCheckIn}
            disabled={!user?.employee?.id}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              stats.todayAttendance?.checkIn && !stats.todayAttendance?.checkOut
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {stats.todayAttendance?.checkIn && !stats.todayAttendance?.checkOut
              ? 'Check Out'
              : 'Check In'
            }
          </button>
          {stats.todayAttendance?.workHours && (
            <p className="text-sm text-slate-600 mt-2 text-center">
              Today's hours: {stats.todayAttendance.workHours.toFixed(2)}h
            </p>
          )}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h3>
          <div className="space-y-2">
            <a
              href="/employee/leaves"
              className="block w-full py-2 px-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-center"
            >
              Apply for Leave
            </a>
            <a
              href="/employee/payslips"
              className="block w-full py-2 px-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-center"
            >
              View Payslips
            </a>
          </div>
        </div>
      </div>
    </>
  );
}