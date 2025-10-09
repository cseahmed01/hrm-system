'use client';

import { useState, useEffect } from 'react';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    employeeId: '',
    startDate: '',
    endDate: '',
  });
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchLeaves();
  }, [filters]);

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

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`/api/leaves?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(leaveForm),
      });

      if (response.ok) {
        setShowLeaveModal(false);
        setLeaveForm({
          employeeId: '',
          type: '',
          startDate: '',
          endDate: '',
          reason: '',
        });
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error creating leave:', error);
    }
  };

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Leave Requests</h1>
            <p className="text-slate-600 text-sm sm:text-base">Manage employee leave requests</p>
          </div>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Leave</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Leaves Table/Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading leaves...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              {leaves.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No leave requests found.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {leave.employee.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{leave.employee.fullName}</div>
                            <div className="text-xs text-slate-500">
                              {leave.type} • {leave.days} days • {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">{leave.reason}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                              leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                              leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {leave.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateLeaveStatus(leave.id, 'approved')}
                                className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateLeaveStatus(leave.id, 'rejected')}
                                className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {leave.employee.fullName.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-slate-900">{leave.employee.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{leave.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{leave.days}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateLeaveStatus(leave.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(leave.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">Add Leave Request</h2>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select
                  required
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({...leaveForm, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                <select
                  required
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Type</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Reason for leave"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}