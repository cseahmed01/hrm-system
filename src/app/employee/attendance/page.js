'use client';

import { useState, useEffect } from 'react';

export default function EmployeeAttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    fetchAttendances();
  }, [selectedMonth]);

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

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();

      // Get all attendances for the selected month
      const startDate = new Date(selectedMonth + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const dates = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      const attendancePromises = dates.map(date =>
        fetch(`/api/attendances?date=${date.toISOString().split('T')[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId,
          },
        }).then(res => res.json())
      );

      const results = await Promise.all(attendancePromises);

      // Get current user info to find their employee ID
      const userRes = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const userData = await userRes.json();
      const employeeId = userData.user?.employee?.id;

      // Process attendances
      const monthAttendances = [];
      results.forEach((result, index) => {
        const date = dates[index];
        const attendance = result.attendances?.find(a => a.employeeId === employeeId);
        monthAttendances.push({
          date: date.toISOString().split('T')[0],
          attendance: attendance || null,
        });
      });

      setAttendances(monthAttendances);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async (date, action) => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();

      // Get current user info
      const userRes = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const userData = await userRes.json();
      const employeeId = userData.user?.employee?.id;

      const response = await fetch('/api/attendances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({ employeeId, action, date }),
      });

      if (response.ok) {
        fetchAttendances(); // Refresh data
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  const getTotalHours = () => {
    return attendances.reduce((total, day) => {
      return total + (day.attendance?.workHours || 0);
    }, 0);
  };

  const getPresentDays = () => {
    return attendances.filter(day => day.attendance?.checkIn).length;
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">My Attendance</h1>
            <p className="text-slate-600 text-sm sm:text-base">View and manage your attendance records</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Present Days</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{getPresentDays()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{getTotalHours().toFixed(2)}h</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              ⏰
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Working Days</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{attendances.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl">
              📅
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Calendar/List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading attendance...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {attendances.map((day) => {
                  const date = new Date(day.date);
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  const isFuture = date > new Date();

                  return (
                    <tr key={day.date} className={`hover:bg-slate-50 ${isToday ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {date.toLocaleDateString()}
                        {isToday && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Today</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {date.toLocaleDateString('en', { weekday: 'short' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {day.attendance?.checkIn ? new Date(day.attendance.checkIn).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {day.attendance?.checkOut ? new Date(day.attendance.checkOut).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {day.attendance?.workHours ? `${day.attendance.workHours.toFixed(2)}h` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          day.attendance?.checkIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {day.attendance?.checkIn ? 'Present' : 'Absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {!isFuture && (
                          <>
                            <button
                              onClick={() => handleCheckInOut(day.date, 'checkin')}
                              disabled={day.attendance?.checkIn}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                day.attendance?.checkIn
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              Check In
                            </button>
                            <button
                              onClick={() => handleCheckInOut(day.date, 'checkout')}
                              disabled={!day.attendance?.checkIn || day.attendance?.checkOut}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                !day.attendance?.checkIn || day.attendance?.checkOut
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              Check Out
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}