import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  GraduationCap, 
  User, 
  BookMarked,
  BookOpen,
  Calendar
} from 'lucide-react';

export default function StudentProfileView({ studentId, addToast }) {
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!studentId) {
        addToast('No linked student record found for this account.', 'error');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch student details
        const studentData = await api.getStudentById(studentId);
        setStudent(studentData);

        // Fetch teacher details
        if (studentData.teacher_id) {
          try {
            const teacherData = await api.getTeacherById(studentData.teacher_id);
            setTeacher(teacherData);
          } catch (err) {
            console.error('Failed to load teacher:', err);
          }
        }

        // Fetch subjects
        try {
          const subjectsData = await api.getStudentSubjects(studentId);
          setSubjects(subjectsData.subjects || []);
        } catch (err) {
          if (err.message.includes('No subject')) {
            setSubjects([]);
          }
        }
      } catch (error) {
        addToast(error.message || 'Failed to load student profile details', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [studentId]);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>My Profile</h1>
          <p style={subtitleStyle}>Academic record card and registered curriculum modules</p>
        </div>
      </header>

      {isLoading ? (
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : !student ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <GraduationCap size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>Profile not found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            We could not retrieve a student record linking to your username.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {/* Student Registry Card */}
          <div className="glass-panel" style={profileCardStyle}>
            <div style={avatarHeaderStyle}>
              <div style={avatarStyle}>
                {student.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={studentNameStyle}>{student.name}</h3>
                <span className="badge badge-primary" style={{ marginTop: '4px' }}>
                  Student Account
                </span>
              </div>
            </div>

            <div style={detailsListStyle}>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Student ID</span>
                <span style={detailValueStyle}>#{student.id}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Grade Standard</span>
                <span style={detailValueStyle}>Grade {student.standard}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Class Section</span>
                <span style={detailValueStyle}>{student.section}</span>
              </div>
              <div style={detailItemStyle}>
                <span style={detailLabelStyle}>Academic Status</span>
                <span style={{ ...detailValueStyle, color: 'var(--success)' }}>Active Enrollment</span>
              </div>
            </div>
          </div>

          {/* Teacher & Subjects Information */}
          <div style={secondaryColumnStyle}>
            {/* Teacher Info Card */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '1.5rem' }}>
              <h4 style={sectionTitleStyle}>
                <User size={18} color="var(--success)" />
                <span>Class Teacher Details</span>
              </h4>
              {teacher ? (
                <div style={teacherDetailsStyle}>
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {teacher.name}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Supervisor for Section {teacher.section} (ID #{teacher.id})
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No teacher is currently assigned to this classroom.
                </p>
              )}
            </div>

            {/* Subjects Card */}
            <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
              <h4 style={sectionTitleStyle}>
                <BookOpen size={18} color="var(--primary)" />
                <span>My Academic Subjects ({subjects.length})</span>
              </h4>
              {subjects.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '10px 0' }}>
                  No academic subjects have been assigned to your curriculum profile yet.
                </p>
              ) : (
                <div style={subjectChipsListStyle}>
                  {subjects.map((sub) => (
                    <div key={sub.id} className="badge badge-primary" style={subjectBadgeStyle}>
                      <BookMarked size={14} color="var(--primary)" />
                      <span>{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}
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

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  textAlign: 'center',
  borderStyle: 'dashed',
};

const profileCardStyle = {
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const avatarHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '24px',
  marginBottom: '24px',
};

const avatarStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  fontSize: '1.4rem',
  boxShadow: '0 0 15px var(--primary-glow)',
};

const studentNameStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const detailsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const detailItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 14px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius-sm)',
};

const detailLabelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const detailValueStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const secondaryColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '16px',
};

const teacherDetailsStyle = {
  padding: '14px',
  background: 'rgba(16, 185, 129, 0.03)',
  border: '1px solid rgba(16, 185, 129, 0.1)',
  borderRadius: 'var(--border-radius-sm)',
};

const subjectChipsListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const subjectBadgeStyle = {
  padding: '10px 16px',
  fontSize: '0.85rem',
  borderRadius: 'var(--border-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};
