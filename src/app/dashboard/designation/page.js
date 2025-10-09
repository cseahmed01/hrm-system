'use client';

import { useState, useEffect } from 'react';

export default function DesignationPage() {
  // Designations state
  const [designations, setDesignations] = useState([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [designationForm, setDesignationForm] = useState({
    title: '',
    departmentId: '',
  });

  // Departments for form
  const [departments, setDepartments] = useState([]);

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

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch('/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Designations functions
  const fetchDesignations = async () => {
    setDesignationsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tenantId = getTenantId();
      const response = await fetch('/api/designations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
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
      const tenantId = getTenantId();
      const url = editingDesignation ? `/api/designations/${editingDesignation.id}` : '/api/designations';
      const method = editingDesignation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId,
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
        const tenantId = getTenantId();
        const response = await fetch(`/api/designations/${designationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant-id': tenantId,
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

  return (
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

      {/* Designations Table/Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {designationsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading designations...</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              {designations.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No designations found. Add your first designation to get started.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {designations.map((designation) => (
                    <div key={designation.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                            👔
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{designation.title}</div>
                            <div className="text-xs text-slate-500">
                              {designation.department?.name || 'No Department'} • {designation._count.employees} employees
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditDesignation(designation)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDesignation(designation.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
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
          </>
        )}
      </div>

      {/* Designation Modal */}
      {showDesignationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
    </>
  );
}