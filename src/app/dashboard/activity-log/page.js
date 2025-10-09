'use client';

import { useState, useEffect } from 'react';

export default function ActivityLogPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
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

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch('/api/audit-logs?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAuditLogs(data.auditLogs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Activity Log</h1>
        <p className="text-slate-600 text-sm sm:text-base">Recent system activities and user actions</p>
      </div>

      {/* Activity Log List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading activity logs...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No activity logs found.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3 flex-shrink-0">
                          📝
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">{log.action}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {log.user ? log.user.name : 'System'} • {new Date(log.createdAt).toLocaleString()}
                          </div>
                          {log.entity && (
                            <div className="text-xs text-slate-600 mt-1">
                              Entity: {log.entity} {log.entityId ? `(${log.entityId})` : ''}
                            </div>
                          )}
                          {log.description && (
                            <div className="text-xs text-slate-600 mt-1">{log.description}</div>
                          )}
                          {log.ipAddress && (
                            <div className="text-xs text-slate-500 mt-1">IP: {log.ipAddress}</div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            📝
                          </div>
                          <div className="text-sm font-medium text-slate-900">{log.action}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {log.user ? log.user.name : 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {log.entity} {log.entityId ? `(${log.entityId})` : ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">
                        {log.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No activity logs found.
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