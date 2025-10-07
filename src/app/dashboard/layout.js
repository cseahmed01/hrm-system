'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'employee', label: 'Employees', icon: '👥', path: '/dashboard/employe' },
    { id: 'department', label: 'Departments', icon: '🏢', path: '/dashboard/department' },
    { id: 'designation', label: 'Designations', icon: '👔', path: '/dashboard/designation' },
    { id: 'attendance', label: 'Attendance', icon: '📅', path: '/dashboard/attendance' },
    { id: 'leaves', label: 'Leave Requests', icon: '🧾', path: '/dashboard/leaves' },
    { id: 'payroll', label: 'Payroll', icon: '💰', path: '/dashboard/payroll' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/dashboard/reports' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/dashboard/settings' },
  ];

  const getActiveMenu = () => {
    const item = menuItems.find(item => pathname === item.path);
    return item ? item.id : 'dashboard';
  };

  const activeMenu = getActiveMenu();

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter',sans-serif]">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="flex justify-between items-center px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">ERP SaaS</div>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-600">Dashboard</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hidden sm:block">
              🔔
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 hover:bg-slate-50 px-2 sm:px-3 py-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <span className="hidden sm:inline text-slate-700">Admin</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</a>
                  <hr className="my-1" />
                  <button
                    onClick={async () => {
                      try {
                        // Call logout API to clear server-side cookie
                        await fetch('/api/auth/logout', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                      } catch (error) {
                        console.error('Logout API error:', error);
                      }

                      // Clear client-side auth data
                      localStorage.removeItem('token');
                      sessionStorage.clear();

                      // Clear cookies
                      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Max-Age=0';

                      // Redirect to login
                      window.location.href = '/auth/login';
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Left Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-30 w-64 bg-white shadow-lg min-h-[calc(100vh-73px)] border-r border-slate-200 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeMenu === item.id
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}