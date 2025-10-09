'use client';

import { useState, useEffect } from 'react';

export default function EmployeePayslipsPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayrolls();
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

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();

      const response = await fetch('/api/payrolls', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });
      const data = await response.json();

      // Get current user info to filter their payrolls
      const userRes = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const userData = await userRes.json();
      const employeeId = userData.user?.employee?.id;

      // Filter payrolls for current employee and only paid ones (payslips available)
      const userPayrolls = data.payrolls?.filter(payroll =>
        payroll.employeeId === employeeId && payroll.status === 'paid'
      ) || [];
      setPayrolls(userPayrolls);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = (payrollId) => {
    // In a real implementation, this would download the PDF
    alert(`Downloading payslip for payroll ${payrollId}`);
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">My Payslips</h1>
        <p className="text-slate-600 text-sm sm:text-base">View and download your salary slips</p>
      </div>

      {/* Payslips List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading payslips...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Basic Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Allowance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deduction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paid Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {payroll.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${payroll.basicSalary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {payroll.allowance ? `$${payroll.allowance}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {payroll.deduction ? `$${payroll.deduction}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      ${payroll.netSalary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(payroll.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => downloadPayslip(payroll.id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                      >
                        <span>📄</span>
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No payslips available yet. Payslips will appear here once your salary is processed and paid.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Summary Card */}
      {payrolls.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Salary Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-slate-600 text-sm">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${payrolls.reduce((sum, p) => sum + p.netSalary, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 text-sm">Average Monthly</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(payrolls.reduce((sum, p) => sum + p.netSalary, 0) / payrolls.length).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 text-sm">Last Payment</p>
              <p className="text-2xl font-bold text-slate-900">
                ${payrolls[0]?.netSalary || '0.00'}
              </p>
              <p className="text-xs text-slate-500">{payrolls[0]?.month || ''}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}