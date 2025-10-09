'use client';

import { useState, useEffect } from 'react';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchEmployees();
    fetchAttendances();
  }, [selectedDate]);

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

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch(`/api/attendances?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAttendances(data.attendances);
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordAttendance = async (employeeId, action) => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch('/api/attendances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({ employeeId, action, date: selectedDate }),
      });

      if (response.ok) {
        fetchAttendances(); // Refresh the list
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  const getAttendanceForEmployee = (employeeId) => {
    return attendances.find(a => a.employeeId === employeeId) || null;
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Attendance</h1>
            <p className="text-slate-600 text-sm sm:text-base">Mark daily attendance for employees</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table/Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading attendance...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              {employees.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No employees found. Add employees first.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {employees.map((employee) => {
                    const attendance = getAttendanceForEmployee(employee.id);
                    return (
                      <div key={employee.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {employee.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{employee.fullName}</div>
                              <div className="text-xs text-slate-500">
                                {employee.department?.name || 'No Department'}
                              </div>
                              {attendance ? (
                                <div className="text-xs text-slate-600 mt-1">
                                  {attendance.checkIn && <div>Check-in: {new Date(attendance.checkIn).toLocaleTimeString()}</div>}
                                  {attendance.checkOut && <div>Check-out: {new Date(attendance.checkOut).toLocaleTimeString()}</div>}
                                  {attendance.workHours && <div>Hours: {attendance.workHours.toFixed(2)}</div>}
                                </div>
                              ) : (
                                <div className="text-xs text-slate-500 mt-1">Not checked in</div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => recordAttendance(employee.id, 'checkin')}
                              disabled={attendance?.checkIn}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                attendance?.checkIn
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              Check In
                            </button>
                            <button
                              onClick={() => recordAttendance(employee.id, 'checkout')}
                              disabled={!attendance?.checkIn || attendance?.checkOut}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                !attendance?.checkIn || attendance?.checkOut
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              Check Out
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check-in</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check-out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Work Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {employees.map((employee) => {
                    const attendance = getAttendanceForEmployee(employee.id);
                    return (
                      <tr key={employee.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {employee.fullName.charAt(0)}
                            </div>
                            <div className="text-sm font-medium text-slate-900">{employee.fullName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {employee.department?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {attendance?.checkIn ? new Date(attendance.checkIn).toLocaleTimeString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {attendance?.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {attendance?.workHours ? `${attendance.workHours.toFixed(2)}h` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => recordAttendance(employee.id, 'checkin')}
                            disabled={attendance?.checkIn}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              attendance?.checkIn
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => recordAttendance(employee.id, 'checkout')}
                            disabled={!attendance?.checkIn || attendance?.checkOut}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              !attendance?.checkIn || attendance?.checkOut
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            Check Out
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No employees found. Add employees first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}