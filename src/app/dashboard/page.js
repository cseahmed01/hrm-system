'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Employees state
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    empCode: '',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    joinDate: '',
    departmentId: '',
    designationId: '',
    salary: '',
    address: '',
  });

  // Departments state
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
  });

  // Designations state
  const [designations, setDesignations] = useState([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [designationForm, setDesignationForm] = useState({
    title: '',
    departmentId: '',
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

  // Employees functions
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeForm),
      });

      if (response.ok) {
        setShowEmployeeModal(false);
        setEditingEmployee(null);
        setEmployeeForm({
          empCode: '',
          fullName: '',
          email: '',
          phone: '',
          gender: '',
          dob: '',
          joinDate: '',
          departmentId: '',
          designationId: '',
          salary: '',
          address: '',
        });
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      empCode: employee.empCode,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || '',
      gender: employee.gender || '',
      dob: employee.dob ? employee.dob.split('T')[0] : '',
      joinDate: employee.joinDate ? employee.joinDate.split('T')[0] : '',
      departmentId: employee.departmentId || '',
      designationId: employee.designationId || '',
      salary: employee.salary || '',
      address: employee.address || '',
    });
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/employees/${employeeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchEmployees();
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  // Departments functions
  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDepartment ? `/api/departments/${editingDepartment.id}` : '/api/departments';
      const method = editingDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(departmentForm),
      });

      if (response.ok) {
        setShowDepartmentModal(false);
        setEditingDepartment(null);
        setDepartmentForm({ name: '' });
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setDepartmentForm({ name: department.name });
    setShowDepartmentModal(true);
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (confirm('Are you sure you want to delete this department? This will affect all related data.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/departments/${departmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchDepartments();
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  // Designations functions
  const fetchDesignations = async () => {
    setDesignationsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/designations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDesignations(data.designations);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
    } finally {
      setDesignationsLoading(false);
    }
  };

  const handleDesignationSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDesignation ? `/api/designations/${editingDesignation.id}` : '/api/designations';
      const method = editingDesignation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(designationForm),
      });

      if (response.ok) {
        setShowDesignationModal(false);
        setEditingDesignation(null);
        setDesignationForm({ title: '', departmentId: '' });
        fetchDesignations();
      }
    } catch (error) {
      console.error('Error saving designation:', error);
    }
  };

  const handleEditDesignation = (designation) => {
    setEditingDesignation(designation);
    setDesignationForm({ title: designation.title, departmentId: designation.departmentId });
    setShowDesignationModal(true);
  };

  const handleDeleteDesignation = async (designationId) => {
    if (confirm('Are you sure you want to delete this designation? This will affect all related employees.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/designations/${designationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchDesignations();
        }
      } catch (error) {
        console.error('Error deleting designation:', error);
      }
    }
  };

  // Load data when menu is selected
  useEffect(() => {
    if (activeMenu === 'employees' && isAuthenticated) {
      fetchEmployees();
    }
    if (activeMenu === 'departments' && isAuthenticated) {
      fetchDepartments();
    }
    if (activeMenu === 'designations' && isAuthenticated) {
      fetchDesignations();
    }
  }, [activeMenu, isAuthenticated]);

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
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'designations', label: 'Designations', icon: '👔' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'leaves', label: 'Leave Requests', icon: '🧾' },
    { id: 'payroll', label: 'Payroll', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const stats = [
    { title: 'Total Employees', value: '24', icon: '👥', color: 'bg-blue-500' },
    { title: 'Present Today', value: '22', icon: '✅', color: 'bg-emerald-500' },
    { title: 'Pending Leave Requests', value: '3', icon: '🧾', color: 'bg-amber-500' },
    { title: 'Payrolls Generated', value: '1', icon: '💰', color: 'bg-purple-500' },
  ];

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
                  <button
                    onClick={() => {
                      setActiveMenu(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeMenu === item.id
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6">
          {activeMenu === 'dashboard' && (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome back, Admin!</h1>
                <p className="text-slate-600 text-sm sm:text-base">Here's what's happening with your team today.</p>
              </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-lg sm:text-xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
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
                  <p className="text-xs sm:text-sm">Present: 22, Absent: 2</p>
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
                    <p className="text-slate-900 font-medium text-sm sm:text-base">John Doe checked in</p>
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
              <button className="bg-indigo-600 text-white p-3 sm:p-4 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base">
                <span>➕</span>
                <span>Add Employee</span>
              </button>
              <button className="bg-emerald-600 text-white p-3 sm:p-4 rounded-2xl hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base">
                <span>📅</span>
                <span>Mark Attendance</span>
              </button>
              <button className="bg-amber-600 text-white p-3 sm:p-4 rounded-2xl hover:bg-amber-700 transition-colors flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base col-span-1 sm:col-span-2 lg:col-span-1">
                <span>💰</span>
                <span>Generate Payroll</span>
              </button>
            </div>
          </div>
            </>
          )}

          {activeMenu === 'employees' && (
            <>
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Employees</h1>
                    <p className="text-slate-600 text-sm sm:text-base">Manage your team members</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingEmployee(null);
                      setEmployeeForm({
                        empCode: '',
                        fullName: '',
                        email: '',
                        phone: '',
                        gender: '',
                        dob: '',
                        joinDate: '',
                        departmentId: '',
                        designationId: '',
                        salary: '',
                        address: '',
                      });
                      setShowEmployeeModal(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Add Employee</span>
                  </button>
                </div>
              </div>

              {/* Employees Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {employeesLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading employees...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Designation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {employee.fullName.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-slate-900">{employee.fullName}</div>
                                  <div className="text-sm text-slate-500">{employee.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{employee.empCode}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{employee.department?.name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{employee.designation?.title || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditEmployee(employee)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {employees.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                              No employees found. Add your first employee to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeMenu === 'departments' && (
            <>
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Departments</h1>
                    <p className="text-slate-600 text-sm sm:text-base">Manage your company departments</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDepartment(null);
                      setDepartmentForm({ name: '' });
                      setShowDepartmentModal(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Add Department</span>
                  </button>
                </div>
              </div>

              {/* Departments Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {departmentsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading departments...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employees</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Designations</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {departments.map((department) => (
                          <tr key={department.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                                  🏢
                                </div>
                                <div className="text-sm font-medium text-slate-900">{department.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {department._count.employees} employees
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {department.designations.length} designations
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditDepartment(department)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDepartment(department.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {departments.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                              No departments found. Add your first department to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeMenu === 'designations' && (
            <>
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Designations</h1>
                    <p className="text-slate-600 text-sm sm:text-base">Manage job titles and roles</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDesignation(null);
                      setDesignationForm({ title: '', departmentId: '' });
                      setShowDesignationModal(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Add Designation</span>
                  </button>
                </div>
              </div>

              {/* Designations Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {designationsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading designations...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employees</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {designations.map((designation) => (
                          <tr key={designation.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                                  👔
                                </div>
                                <div className="text-sm font-medium text-slate-900">{designation.title}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {designation.department?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {designation._count.employees} employees
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditDesignation(designation)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteDesignation(designation.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {designations.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                              No designations found. Add your first designation to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={employeeForm.empCode}
                    onChange={(e) => setEmployeeForm({...employeeForm, empCode: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="EMP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={employeeForm.fullName}
                    onChange={(e) => setEmployeeForm({...employeeForm, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={employeeForm.gender}
                    onChange={(e) => setEmployeeForm({...employeeForm, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={employeeForm.dob}
                    onChange={(e) => setEmployeeForm({...employeeForm, dob: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                  <input
                    type="date"
                    required
                    value={employeeForm.joinDate}
                    onChange={(e) => setEmployeeForm({...employeeForm, joinDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    value={employeeForm.salary}
                    onChange={(e) => setEmployeeForm({...employeeForm, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="50000.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={employeeForm.departmentId}
                    onChange={(e) => setEmployeeForm({...employeeForm, departmentId: e.target.value, designationId: ''})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                  <select
                    value={employeeForm.designationId}
                    onChange={(e) => setEmployeeForm({...employeeForm, designationId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!employeeForm.departmentId}
                  >
                    <option value="">Select Designation</option>
                    {departments
                      .find(dept => dept.id === employeeForm.departmentId)?.designations
                      ?.map(designation => (
                        <option key={designation.id} value={designation.id}>{designation.title}</option>
                      )) || []
                    }
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  value={employeeForm.address}
                  onChange={(e) => setEmployeeForm({...employeeForm, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Employee address"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h2>
                <button
                  onClick={() => setShowDepartmentModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleDepartmentSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={departmentForm.name}
                  onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter department name"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDepartmentModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingDepartment ? 'Update Department' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Designation Modal */}
      {showDesignationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingDesignation ? 'Edit Designation' : 'Add New Designation'}
                </h2>
                <button
                  onClick={() => setShowDesignationModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleDesignationSubmit} className="p-6 space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={designationForm.title}
                  onChange={(e) => setDesignationForm({...designationForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter designation title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  required
                  value={designationForm.departmentId}
                  onChange={(e) => setDesignationForm({...designationForm, departmentId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDesignationModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingDesignation ? 'Update Designation' : 'Add Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}