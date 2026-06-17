import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Users, 
  BookOpen, 
  BookMarked,
  X
} from 'lucide-react';

export default function MyStudentsView({ teacherId, addToast }) {
  const [teacherName, setTeacherName] = useState('');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewSubjectsOpen, setIsViewSubjectsOpen] = useState(false);
  
  // Active states
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [assignSubjectId, setAssignSubjectId] = useState('');

  const loadData = async () => {
    if (!teacherId) {
      addToast('No linked teacher account detected.', 'error');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // Get teacher students
      const data = await api.getStudentsOfTeacher(teacherId);
      setTeacherName(data.teacher_name || '');
      setStudents(data.students || []);

      // Get subjects list for assignment
      try {
        const subjectList = await api.getSubjects();
        setSubjects(subjectList || []);
      } catch (err) {
        setSubjects([]);
      }
    } catch (error) {
      addToast(error.message || 'Failed to fetch student list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const handleOpenAssignModal = (student) => {
    if (subjects.length === 0) {
      addToast('No subjects available to assign.', 'warning');
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
      setStudentSubjects([]);
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignSubjectId || !currentStudent) return;

    try {
      await api.assignSubject(currentStudent.id, assignSubjectId);
      addToast('Subject assigned successfully!', 'success');
      setIsAssignModalOpen(false);
    } catch (error) {
      addToast(error.message || 'Failed to assign subject', 'error');
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>My Classroom</h1>
          <p style={subtitleStyle}>
            Welcome, Instructor <strong style={{color: 'var(--success)'}}>{teacherName || '...'}</strong>. List of students enrolled in your section.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : students.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <Users size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No students enrolled</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            No students are currently linked to your teacher record.
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
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>#{student.id}</td>
                  <td style={{ fontWeight: '500' }}>{student.name}</td>
                  <td>Grade {student.standard}</td>
                  <td>
                    <span className="badge badge-secondary">{student.section}</span>
                  </td>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No subjects assigned yet.</p>
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

// Styles
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

const smallSpinnerStyle = {
  width: '24px',
  height: '24px',
  border: '2px solid var(--bg-tertiary)',
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
