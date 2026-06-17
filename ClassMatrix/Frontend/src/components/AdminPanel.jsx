import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Users, 
  ShieldAlert, 
  Trash2, 
  Edit2, 
  X, 
  UserCheck
} from 'lucide-react';

export default function AdminPanel({ addToast, isAuthenticated }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form edit states
  const [editFormData, setEditFormData] = useState({
    role: 'student',
    student_id: '',
    teacher_id: '',
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch registered users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setEditFormData({
      role: user.role,
      student_id: user.student_id !== null ? user.student_id.toString() : '',
      teacher_id: user.teacher_id !== null ? user.teacher_id.toString() : '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const updatedData = {
        role: editFormData.role,
        student_id: editFormData.role === 'student' ? (editFormData.student_id ? parseInt(editFormData.student_id) : 0) : 0,
        teacher_id: editFormData.role === 'teacher' ? (editFormData.teacher_id ? parseInt(editFormData.teacher_id) : 0) : 0,
      };

      await api.updateUser(currentUser.id, updatedData);
      addToast('User role updated successfully!', 'success');
      setIsEditModalOpen(false);
      loadUsers();
    } catch (error) {
      addToast(error.message || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user account?')) {
      try {
        await api.deleteUser(id);
        addToast('User account deleted successfully', 'success');
        loadUsers();
      } catch (error) {
        addToast(error.message || 'Failed to delete user', 'error');
      }
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Admin Panel</h1>
          <p style={subtitleStyle}>Manage user accounts, link student/teacher IDs, and monitor authorizations</p>
        </div>
      </header>

      {isLoading ? (
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <ShieldAlert size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No registered users found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Privilege Role</th>
                <th>Mapped Record</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ fontWeight: '600' }}>{u.username}</td>
                  <td>
                    <span 
                      className={`badge ${
                        u.role === 'admin' 
                          ? 'badge-primary' 
                          : u.role === 'teacher' 
                          ? 'badge-success' 
                          : 'badge-secondary'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {u.role === 'student' && (u.student_id ? `Linked Student ID #${u.student_id}` : 'Unlinked Student')}
                    {u.role === 'teacher' && (u.teacher_id ? `Linked Teacher ID #${u.teacher_id}` : 'Unlinked Teacher')}
                    {u.role === 'admin' && 'System Admin'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={actionGroupStyle}>
                      <button 
                        className="btn-icon" 
                        title="Edit User Role"
                        onClick={() => handleOpenEditModal(u)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        title="Delete User"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Modify Account: {currentUser?.username}</h3>
              <button className="btn-icon" onClick={() => setIsEditModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select 
                    className="form-control"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {editFormData.role === 'student' && (
                  <div className="form-group">
                    <label className="form-label">Link Student ID</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Enter student ID or leave blank to unlink"
                      value={editFormData.student_id}
                      onChange={(e) => setEditFormData({ ...editFormData, student_id: e.target.value })}
                    />
                  </div>
                )}

                {editFormData.role === 'teacher' && (
                  <div className="form-group">
                    <label className="form-label">Link Teacher ID</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Enter teacher ID or leave blank to unlink"
                      value={editFormData.teacher_id}
                      onChange={(e) => setEditFormData({ ...editFormData, teacher_id: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Styles
const containerStyle = {
  animation: 'fadeIn 0.3s ease-out',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  marginBottom: '4px',
};

const subtitleStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
};

const spinnerContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '200px',
};

const spinnerStyle = {
  width: '36px',
  height: '36px',
  border: '3px solid var(--bg-tertiary)',
  borderTopColor: 'var(--primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  textAlign: 'center',
  borderStyle: 'dashed',
};

const actionGroupStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '6px',
};
