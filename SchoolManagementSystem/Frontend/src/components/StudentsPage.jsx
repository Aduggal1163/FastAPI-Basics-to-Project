import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Edit2, 
  Trash2, 
  BookMarked,
  X,
  GraduationCap
} from 'lucide-react';

export default function StudentsPage({ addToast, isAuthenticated, onOpenLogin }) {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewSubjectsOpen, setIsViewSubjectsOpen] = useState(false);

  // Active items for modals
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    standard: '',
    section: '',
    teacher_id: '',
  });

  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [unlinkedStudents, setUnlinkedStudents] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch all students, teachers, and subjects
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load Students
      try {
        const studentList = await api.getStudents();
        setStudents(studentList || []);
      } catch (err) {
        if (err.message.includes('No student')) {
          setStudents([]);
        } else {
          addToast('Failed to fetch students', 'error');
        }
      }

      // Load Teachers (needed for enrolling students)
      try {
        const teacherList = await api.getTeachers();
        setTeachers(teacherList || []);
      } catch (err) {
        if (err.message.includes('No teacher')) {
          setTeachers([]);
        }
      }

      // Load Subjects (needed for assignment)
      try {
        const subjectList = await api.getSubjects();
        setSubjects(subjectList || []);
      } catch (err) {
        if (err.message.includes('No subject')) {
          setSubjects([]);
        }
      }

      // Load Unlinked Student Users
      try {
        const userList = await api.getUsers();
        const unlinked = (userList || []).filter(u => u.role === 'student' && !u.student_id);
        setUnlinkedStudents(unlinked);
      } catch (err) {
        console.error('Failed to fetch unlinked student accounts:', err);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      addToast('Please login first to add a student', 'warning');
      onOpenLogin();
      return;
    }
    if (teachers.length === 0) {
      addToast('Please create at least one teacher first!', 'warning');
      return;
    }
    if (unlinkedStudents.length === 0) {
      addToast('No unlinked student accounts found. A user must register a student account first.', 'warning');
      return;
    }
    setFormData({
      id: '',
      name: '',
      standard: '',
      section: '',
      teacher_id: teachers[0]?.id || '',
    });
    setSelectedUserId(unlinkedStudents[0]?.id || '');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    if (!isAuthenticated) {
      addToast('Please login first to edit student details', 'warning');
      onOpenLogin();
      return;
    }
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      standard: student.standard,
      section: student.section,
      teacher_id: student.teacher_id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenAssignModal = (student) => {
    if (!isAuthenticated) {
      addToast('Please login first to assign subjects', 'warning');
      onOpenLogin();
      return;
    }
    if (subjects.length === 0) {
      addToast('Please create at least one subject first in the Subjects tab', 'warning');
      return;
    }
    setCurrentStudent(student);
    setAssignSubjectId(subjects[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleOpenViewSubjects = async (student) => {
    setCurrentStudent(student);
    setIsViewSubjectsOpen(true);
    setIsSubjectsLoading(true);
    try {
      const data = await api.getStudentSubjects(student.id);
      setStudentSubjects(data.subjects || []);
    } catch (err) {
      if (err.message.includes('No subject')) {
        setStudentSubjects([]);
      } else {
        addToast('Failed to load student subjects', 'error');
      }
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !formData.id || !formData.standard || !formData.section || !formData.teacher_id) {
      addToast('All fields are required', 'error');
      return;
    }

    const selectedUser = unlinkedStudents.find(u => u.id === parseInt(selectedUserId));
    if (!selectedUser) {
      addToast('Selected user account not found', 'error');
      return;
    }

    try {
      const studentId = parseInt(formData.id);
      // 1. Create the student record
      await api.createStudent({
        id: studentId,
        name: selectedUser.username,
        standard: parseInt(formData.standard),
        section: formData.section.trim(),
        teacher_id: parseInt(formData.teacher_id),
      });

      // 2. Link the user account to the student record
      await api.updateUser(selectedUser.id, {
        role: 'student',
        student_id: studentId,
      });

      addToast(`Student '${selectedUser.username}' enrolled and linked successfully!`, 'success');
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      addToast(error.message || 'Failed to add student', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.standard || !formData.section || !formData.teacher_id) {
      addToast('All fields are required', 'error');
      return;
    }

    try {
      await api.updateStudent(currentStudent.id, {
        name: formData.name.trim(),
        standard: parseInt(formData.standard),
        section: formData.section.trim(),
        teacher_id: parseInt(formData.teacher_id),
      });
      addToast('Student updated successfully!', 'success');
      setIsEditModalOpen(false);
      loadData();
    } catch (error) {
      addToast(error.message || 'Failed to update student', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignSubjectId) return;

    try {
      await api.assignSubject(currentStudent.id, assignSubjectId);
      addToast('Subject assigned successfully!', 'success');
      setIsAssignModalOpen(false);
    } catch (error) {
      addToast(error.message || 'Failed to assign subject', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      addToast('Please login first to delete students', 'warning');
      onOpenLogin();
      return;
    }

    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.deleteStudent(id);
        addToast('Student deleted successfully!', 'success');
        loadData();
      } catch (error) {
        addToast(error.message || 'Failed to delete student', 'error');
      }
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Students</h1>
          <p style={subtitleStyle}>Manage student enrollments, details, and subject curriculums</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass-panel" style={searchBarPanelStyle}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search students by name..." 
          style={searchInputStyle}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <GraduationCap size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No students found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {searchQuery ? 'Try matching another student name.' : 'Start by clicking "Add Student" to register your first record.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Standard</th>
                <th>Section</th>
                <th>Teacher ID</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>#{student.id}</td>
                  <td style={{ fontWeight: '500' }}>{student.name}</td>
                  <td>Grade {student.standard}</td>
                  <td>
                    <span className="badge badge-secondary">{student.section}</span>
                  </td>
                  <td>Teacher ID #{student.teacher_id}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={actionGroupStyle}>
                      <button 
                        className="btn-icon" 
                        title="View Assigned Subjects"
                        onClick={() => handleOpenViewSubjects(student)}
                      >
                        <BookOpen size={16} />
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Assign Subject"
                        onClick={() => handleOpenAssignModal(student)}
                      >
                        <BookMarked size={16} />
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Edit Student"
                        onClick={() => handleOpenEditModal(student)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        title="Delete Student"
                        onClick={() => handleDelete(student.id)}
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
              <h3 className="modal-title">Enroll New Student</h3>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Unlinked Student Account</label>
                  <select 
                    className="form-control"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                  >
                    {unlinkedStudents.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} (User ID #{user.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter numeric student ID"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Standard (Grade)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter grade number"
                    value={formData.standard}
                    onChange={(e) => setFormData({...formData, standard: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. A, B, C"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Class Teacher</label>
                  <select 
                    className="form-control"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    required
                  >
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} (Section {teacher.section})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Enroll Student</button>
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
              <h3 className="modal-title">Edit Student Details</h3>
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
                  <label className="form-label">Standard (Grade)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.standard}
                    onChange={(e) => setFormData({...formData, standard: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Class Teacher</label>
                  <select 
                    className="form-control"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    required
                  >
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} (Section {teacher.section})
                      </option>
                    ))}
                  </select>
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

      {/* ASSIGN SUBJECT MODAL */}
      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Assign Subject to {currentStudent?.name}</h3>
              <button className="btn-icon" onClick={() => setIsAssignModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Subject</label>
                  <select 
                    className="form-control"
                    value={assignSubjectId}
                    onChange={(e) => setAssignSubjectId(e.target.value)}
                    required
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} (ID #{subject.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SUBJECTS MODAL */}
      {isViewSubjectsOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Subjects - {currentStudent?.name}</h3>
              <button className="btn-icon" onClick={() => setIsViewSubjectsOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ minHeight: '120px' }}>
              {isSubjectsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                  <div style={smallSpinnerStyle} />
                </div>
              ) : studentSubjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No subjects assigned to this student yet.</p>
                </div>
              ) : (
                <div style={subjectChipsListStyle}>
                  {studentSubjects.map(sub => (
                    <div key={sub.id} className="badge badge-primary" style={subjectBadgeStyle}>
                      <span>{sub.name}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>ID {sub.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setIsViewSubjectsOpen(false)}>Close</button>
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

const subjectChipsListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '10px 0',
};

const subjectBadgeStyle = {
  padding: '8px 14px',
  fontSize: '0.8rem',
  borderRadius: 'var(--border-radius-sm)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '2px',
};
