import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Search, 
  Users, 
  Edit2, 
  Trash2, 
  X,
  GraduationCap
} from 'lucide-react';

export default function TeachersPage({ addToast, isAuthenticated, onOpenLogin }) {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);

  // Active items for modals
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    section: '',
  });
  const [unlinkedTeachers, setUnlinkedTeachers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTeachers();
      setTeachers(data || []);

      // Load Unlinked Teacher Users
      try {
        const userList = await api.getUsers();
        const unlinked = (userList || []).filter(u => u.role === 'teacher' && !u.teacher_id);
        setUnlinkedTeachers(unlinked);
      } catch (err) {
        console.error('Failed to fetch unlinked teacher accounts:', err);
      }
    } catch (err) {
      if (err.message.includes('No teachers')) {
        setTeachers([]);
      } else {
        addToast('Failed to load teachers list', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      addToast('Please login first to add a teacher', 'warning');
      onOpenLogin();
      return;
    }
    if (unlinkedTeachers.length === 0) {
      addToast('No unlinked teacher accounts found. A user must register a teacher account first.', 'warning');
      return;
    }
    setFormData({
      id: '',
      name: '',
      section: '',
    });
    setSelectedUserId(unlinkedTeachers[0]?.id || '');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (teacher) => {
    if (!isAuthenticated) {
      addToast('Please login first to edit teacher details', 'warning');
      onOpenLogin();
      return;
    }
    setCurrentTeacher(teacher);
    setFormData({
      name: teacher.name,
      section: teacher.section, // Note: backend patch only supports updating name in schema.UpdateTeacher
    });
    setIsEditModalOpen(true);
  };

  const handleOpenViewStudents = async (teacher) => {
    setCurrentTeacher(teacher);
    setIsViewStudentsOpen(true);
    setIsStudentsLoading(true);
    try {
      const data = await api.getStudentsOfTeacher(teacher.id);
      setTeacherStudents(data.students || []);
    } catch (err) {
      setTeacherStudents([]);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !formData.id || !formData.section) {
      addToast('All fields are required', 'error');
      return;
    }

    const selectedUser = unlinkedTeachers.find(u => u.id === parseInt(selectedUserId));
    if (!selectedUser) {
      addToast('Selected user account not found', 'error');
      return;
    }

    try {
      const teacherId = parseInt(formData.id);
      // 1. Create the teacher record
      await api.createTeacher({
        id: teacherId,
        name: selectedUser.username,
        section: formData.section.trim(),
      });

      // 2. Link the user account to the teacher record
      await api.updateUser(selectedUser.id, {
        role: 'teacher',
        teacher_id: teacherId,
      });

      addToast(`Teacher '${selectedUser.username}' registered and linked successfully!`, 'success');
      setIsAddModalOpen(false);
      loadTeachers();
    } catch (error) {
      addToast(error.message || 'Failed to register teacher', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.section) {
      addToast('Name and Section are required', 'error');
      return;
    }

    try {
      await api.updateTeacher(currentTeacher.id, {
        name: formData.name.trim(),
        section: formData.section.trim(),
      });
      addToast('Teacher profile updated successfully!', 'success');
      setIsEditModalOpen(false);
      loadTeachers();
    } catch (error) {
      addToast(error.message || 'Failed to update teacher profile', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      addToast('Please login first to delete teachers', 'warning');
      onOpenLogin();
      return;
    }

    if (window.confirm('Are you sure you want to delete this teacher record?')) {
      try {
        await api.deleteTeacher(id);
        addToast('Teacher deleted successfully!', 'success');
        loadTeachers();
      } catch (error) {
        // Explaining Restrict constraint error details
        const isConstraint = error.message.toLowerCase().includes('foreign key') || 
                             error.message.toLowerCase().includes('assigned') ||
                             error.message.toLowerCase().includes('cannot delete');
        const displayErr = isConstraint 
          ? 'Cannot delete: Teacher has assigned students. Please re-assign or delete those students first.'
          : error.message;
        addToast(displayErr, 'error');
      }
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Teachers</h1>
          <p style={subtitleStyle}>Register academy instructors, view departments, and student logs</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add Teacher</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass-panel" style={searchBarPanelStyle}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search teachers by name..." 
          style={searchInputStyle}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <Users size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No teachers found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {searchQuery ? 'Try matching another instructor name.' : 'Start by adding a teacher profile.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Teacher ID</th>
                <th>Instructor Name</th>
                <th>Assigned Section</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td style={{ fontWeight: '600', color: 'var(--success)' }}>#{teacher.id}</td>
                  <td style={{ fontWeight: '500' }}>{teacher.name}</td>
                  <td>
                    <span className="badge badge-success">Section {teacher.section}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={actionGroupStyle}>
                      <button 
                        className="btn-icon" 
                        title="View Enrolled Students"
                        onClick={() => handleOpenViewStudents(teacher)}
                      >
                        <GraduationCap size={16} />
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Edit Teacher"
                        onClick={() => handleOpenEditModal(teacher)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        title="Delete Teacher"
                        onClick={() => handleDelete(teacher.id)}
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

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Teacher</h3>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Unlinked Teacher Account</label>
                  <select 
                    className="form-control"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                  >
                    {unlinkedTeachers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} (User ID #{user.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Teacher ID</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter numeric teacher ID"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Department / Section</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. A, B, C"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Teacher Details</h3>
              <button className="btn-icon" onClick={() => setIsEditModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Department / Section</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENTS MODAL */}
      {isViewStudentsOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Students under {currentTeacher?.name}</h3>
              <button className="btn-icon" onClick={() => setIsViewStudentsOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ minHeight: '150px', maxHeight: '400px', overflowY: 'auto' }}>
              {isStudentsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
                  <div style={smallSpinnerStyle} />
                </div>
              ) : teacherStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <GraduationCap size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No students assigned to this teacher yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student Name</th>
                        <th>Grade</th>
                        <th>Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherStudents.map(student => (
                        <tr key={student.id}>
                          <td style={{ fontWeight: '600', color: 'var(--primary)' }}>#{student.id}</td>
                          <td>{student.name}</td>
                          <td>Grade {student.standard}</td>
                          <td>
                            <span className="badge badge-secondary">{student.section}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setIsViewStudentsOpen(false)}>Close</button>
            </div>
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

const searchBarPanelStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 18px',
  gap: '12px',
  marginBottom: '1.5rem',
  borderRadius: 'var(--border-radius-md)',
  backgroundColor: 'rgba(17, 24, 39, 0.4)',
};

const searchInputStyle = {
  border: 'none',
  background: 'none',
  outline: 'none',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  width: '100%',
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

const smallSpinnerStyle = {
  width: '24px',
  height: '24px',
  border: '2px solid var(--bg-tertiary)',
  borderTopColor: 'var(--primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const actionGroupStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '6px',
};
