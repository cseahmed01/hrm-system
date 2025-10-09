'use client';

import { useState, useEffect } from 'react';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [filters, setFilters] = useState({
    month: '',
    employeeId: '',
    status: '',
  });
  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    month: '',
    allowance: '',
    deduction: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
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

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const queryParams = new URLSearchParams();
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.employeeId) queryParams.append('employeeId', filters.employeeId);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`/api/payrolls?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPayrolls(data.payrolls);
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayrollSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch('/api/payrolls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify(payrollForm),
      });

      if (response.ok) {
        setShowPayrollModal(false);
        setPayrollForm({
          employeeId: '',
          month: '',
          allowance: '',
          deduction: '',
        });
        fetchPayrolls();
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
    }
  };

  const updatePayrollStatus = async (payrollId, status) => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch(`/api/payrolls/${payrollId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchPayrolls();
      }
    } catch (error) {
      console.error('Error updating payroll:', error);
    }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Payroll</h1>
            <p className="text-slate-600 text-sm sm:text-base">Generate and manage employee payrolls</p>
          </div>
          <button
            onClick={() => setShowPayrollModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Generate Payroll</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="generated">Generated</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payrolls Table/Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading payrolls...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              {payrolls.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No payrolls found.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {payrolls.map((payroll) => (
                    <div key={payroll.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {payroll.employee.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{payroll.employee.fullName}</div>
                            <div className="text-xs text-slate-500">
                              {payroll.month} • Basic: ${payroll.basicSalary}
                            </div>
                            <div className="text-xs text-slate-600">
                              Net: ${payroll.netSalary}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                              payroll.status === 'paid' ? 'bg-green-100 text-green-800' :
                              payroll.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {payroll.status === 'generated' && (
                            <button
                              onClick={() => updatePayrollStatus(payroll.id, 'approved')}
                              className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              Approve
                            </button>
                          )}
                          {payroll.status === 'approved' && (
                            <button
                              onClick={() => updatePayrollStatus(payroll.id, 'paid')}
                              className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              Mark Paid
                            </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Basic Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Allowance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deduction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {payroll.employee.fullName.charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-slate-900">{payroll.employee.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{payroll.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${payroll.basicSalary}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {payroll.allowance ? `$${payroll.allowance}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {payroll.deduction ? `$${payroll.deduction}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${payroll.netSalary}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payroll.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payroll.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {payroll.status === 'generated' && (
                          <button
                            onClick={() => updatePayrollStatus(payroll.id, 'approved')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Approve
                          </button>
                        )}
                        {payroll.status === 'approved' && (
                          <button
                            onClick={() => updatePayrollStatus(payroll.id, 'paid')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payrolls.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                        No payrolls found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900">Generate Payroll</h2>
                <button
                  onClick={() => setShowPayrollModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handlePayrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select
                  required
                  value={payrollForm.employeeId}
                  onChange={(e) => setPayrollForm({...payrollForm, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                <input
                  type="month"
                  required
                  value={payrollForm.month}
                  onChange={(e) => setPayrollForm({...payrollForm, month: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Allowance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.allowance}
                    onChange={(e) => setPayrollForm({...payrollForm, allowance: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deduction</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.deduction}
                    onChange={(e) => setPayrollForm({...payrollForm, deduction: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayrollModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Generate Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}