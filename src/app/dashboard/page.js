'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    totalDesignations: 0,
    presentToday: 0,
  });

  useEffect(() => {
    // Check authentication on client side
    const token = localStorage.getItem('token') || getCookie('token');

    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    // Optional: Verify token with API
    fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (res.ok) {
        setIsAuthenticated(true);
        fetchStats();
      } else {
        // Token invalid, redirect
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/auth/login';
      }
    })
    .catch(() => {
      // Error, redirect
      window.location.href = '/auth/login';
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  // Helper function to get cookie
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Helper function to get tenant ID from token
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const [employeesRes, departmentsRes, designationsRes] = await Promise.all([
        fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId } }),
        fetch('/api/departments', { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId } }),
        fetch('/api/designations', { headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId } }),
      ]);

      const employees = employeesRes.ok ? (await employeesRes.json()).employees : [];
      const departments = departmentsRes.ok ? (await departmentsRes.json()).departments : [];
      const designations = designationsRes.ok ? (await designationsRes.json()).designations : [];

      setStats({
        totalEmployees: employees.length,
        totalDepartments: departments.length,
        totalDesignations: designations.length,
        presentToday: Math.floor(employees.length * 0.9), // Mock data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome back, Admin!</h1>
        <p className="text-slate-600 text-sm sm:text-base">Here's what's happening with your team today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Employees</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.totalEmployees}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              👥
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Present Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.presentToday}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              ✅
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Departments</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.totalDepartments}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              🏢
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Designations</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.totalDesignations}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              👔
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Overview Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">Attendance Overview</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">📊</div>
              <p className="text-sm sm:text-base">Chart visualization would go here</p>
              <p className="text-xs sm:text-sm">Present: {stats.presentToday}, Absent: {stats.totalEmployees - stats.presentToday}</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">Recent Activities</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
              <div>
                <p className="text-slate-900 font-medium text-sm sm:text-base">Employee checked in</p>
                <p className="text-slate-500 text-xs sm:text-sm">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-slate-900 font-medium text-sm sm:text-base">Leave request approved</p>
                <p className="text-slate-500 text-xs sm:text-sm">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <p className="text-slate-900 font-medium text-sm sm:text-base">New employee onboarded</p>
                <p className="text-slate-500 text-xs sm:text-sm">3 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-slate-900 font-medium text-sm sm:text-base">Payroll generated</p>
                <p className="text-slate-500 text-xs sm:text-sm">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/dashboard/employe" className="bg-indigo-600 text-white p-3 sm:p-4 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base">
            <span>➕</span>
            <span>Add Employee</span>
          </Link>
          <Link href="/dashboard/department" className="bg-emerald-600 text-white p-3 sm:p-4 rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base">
            <span>🏢</span>
            <span>Add Department</span>
          </Link>
          <Link href="/dashboard/designation" className="bg-amber-600 text-white p-3 sm:p-4 rounded-2xl hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base col-span-1 sm:col-span-2 lg:col-span-1">
            <span>👔</span>
            <span>Add Designation</span>
          </Link>
        </div>
      </div>
    </>
  );
}