import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  PlusCircle, 
  UserPlus, 
  BookMarked,
  Activity,
  ArrowUpRight,
  X
} from 'lucide-react';

export default function Dashboard({ setCurrentTab, addToast, user, onOpenLogin }) {
  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    subjectsCount: 0,
    extraInfo: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClassmatesModalOpen, setIsClassmatesModalOpen] = useState(false);
  const [classmates, setClassmates] = useState([]);
  const [isClassmatesLoading, setIsClassmatesLoading] = useState(false);

  const handleOpenClassmatesModal = async () => {
    if (!user?.student_id) return;
    setIsClassmatesModalOpen(true);
    setIsClassmatesLoading(true);
    try {
      const studentDetails = await api.getStudentById(user.student_id);
      if (studentDetails.teacher_id) {
        const res = await api.getStudentsOfTeacher(studentDetails.teacher_id);
        const filtered = (res.students || []).filter(
          s => s.standard === studentDetails.standard && s.section === studentDetails.section
        );
        setClassmates(filtered);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load classmates list', 'error');
    } finally {
      setIsClassmatesLoading(false);
    }
  };

  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [classTeachers, setClassTeachers] = useState([]);
  const [isTeachersLoading, setIsTeachersLoading] = useState(false);

  const handleOpenTeachersModal = async () => {
    if (!user?.student_id) return;
    setIsTeachersModalOpen(true);
    setIsTeachersLoading(true);
    try {
      const data = await api.getTeachers();
      setClassTeachers(data || []);
    } catch (err) {
      if (err.message.includes('No teachers')) {
        setClassTeachers([]);
      } else {
        addToast(err.message || 'Failed to load classroom teachers', 'error');
      }
    } finally {
      setIsTeachersLoading(false);
    }
  };

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        let studentsCount = 0;
        let teachersCount = 0;
        let subjectsCount = 0;
        let extraInfo = null;

        // Fetch subjects count (relevant for everyone)
        try {
          const subjects = await api.getSubjects() || [];
          subjectsCount = subjects.length;
        } catch (err) {
          if (!err.message.includes('No subject')) {
            console.error('Subjects error:', err);
          }
        }

        if (user?.role === 'admin') {
          // Admin sees total counts
          try {
            const students = await api.getStudents() || [];
            studentsCount = students.length;
          } catch (err) {
            if (!err.message.includes('No student')) console.error('Students error:', err);
          }

          try {
            const teachers = await api.getTeachers() || [];
            teachersCount = teachers.length;
          } catch (err) {
            if (!err.message.includes('No teacher')) console.error('Teachers error:', err);
          }
        } else if (user?.role === 'teacher') {
          // Teacher sees their own classroom students count & section
          if (user.teacher_id) {
            try {
              const res = await api.getStudentsOfTeacher(user.teacher_id);
              studentsCount = res.students?.length || 0;
              const teacherDetails = await api.getTeacherById(user.teacher_id);
              extraInfo = { section: teacherDetails.section };
            } catch (err) {
              console.error('Teacher stats error:', err);
            }
          }
        } else if (user?.role === 'student') {
          // Student sees classmates count, teacher name, and assigned subjects count
          if (user.student_id) {
            try {
              const studentDetails = await api.getStudentById(user.student_id);
              if (studentDetails.teacher_id) {
                const res = await api.getStudentsOfTeacher(studentDetails.teacher_id);
                const filtered = (res.students || []).filter(
                  s => s.standard === studentDetails.standard && s.section === studentDetails.section
                );
                studentsCount = filtered.length;
                extraInfo = { teacherName: res.teacher_name || '' };
              }
              try {
                const subRes = await api.getStudentSubjects(user.student_id);
                subjectsCount = subRes.subjects?.length || 0;
              } catch (err) {
                subjectsCount = 0;
              }
            } catch (err) {
              console.error('Student stats error:', err);
            }
          }
        } else {
          // Guest sees global counts via public stats
          try {
            const publicStats = await api.getPublicStats();
            studentsCount = publicStats?.students || 0;
            teachersCount = publicStats?.teachers || 0;
            subjectsCount = publicStats?.subjects || 0;
          } catch (err) {
            console.error('Public stats error:', err);
          }
        }

        setStats({
          studentsCount,
          teachersCount,
          subjectsCount,
          extraInfo
        });
      } catch (error) {
        addToast('Failed to load dashboard metrics', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [addToast, user]);

  const getCards = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: 'Total Students',
          value: stats.studentsCount,
          icon: GraduationCap,
          color: 'var(--primary)',
          shadow: 'var(--primary-glow)',
          tab: 'students',
          footer: 'View all student records'
        },
        {
          title: 'Total Teachers',
          value: stats.teachersCount,
          icon: Users,
          color: 'var(--success)',
          shadow: 'var(--success-glow)',
          tab: 'teachers',
          footer: 'View all teacher records'
        },
        {
          title: 'Active Subjects',
          value: stats.subjectsCount,
          icon: BookOpen,
          color: 'var(--warning)',
          shadow: 'rgba(245, 158, 11, 0.2)',
          tab: 'subjects',
          footer: 'Manage subject courses'
        },
      ];
    } else if (user?.role === 'teacher') {
      return [
        {
          title: 'My Classroom Students',
          value: stats.studentsCount,
          icon: GraduationCap,
          color: 'var(--primary)',
          shadow: 'var(--primary-glow)',
          tab: 'my-students',
          footer: 'View your student list'
        },
        {
          title: 'Class Section',
          value: stats.extraInfo?.section || 'N/A',
          icon: Users,
          color: 'var(--success)',
          shadow: 'var(--success-glow)',
          tab: 'my-students',
          footer: 'Supervised classroom'
        },
        {
          title: 'Active Subjects',
          value: stats.subjectsCount,
          icon: BookOpen,
          color: 'var(--warning)',
          shadow: 'rgba(245, 158, 11, 0.2)',
          tab: 'subjects',
          footer: 'View subject reference table'
        },
      ];
    } else if (user?.role === 'student') {
      return [
        {
          title: 'My Classmates',
          value: stats.studentsCount,
          icon: GraduationCap,
          color: 'var(--primary)',
          shadow: 'var(--primary-glow)',
          onClick: () => handleOpenClassmatesModal(),
          footer: 'Students in your section'
        },
        {
          title: 'Class Teacher',
          value: stats.extraInfo?.teacherName || 'N/A',
          icon: Users,
          color: 'var(--success)',
          shadow: 'var(--success-glow)',
          onClick: () => handleOpenTeachersModal(),
          footer: 'Instructors in your section'
        },
        {
          title: 'My Registered Subjects',
          value: stats.subjectsCount,
          icon: BookOpen,
          color: 'var(--warning)',
          shadow: 'rgba(245, 158, 11, 0.2)',
          tab: 'my-profile',
          footer: 'Your course modules'
        },
      ];
    } else {
      // Guest / unauthenticated
      return [
        {
          title: 'Total Students',
          value: stats.studentsCount,
          icon: GraduationCap,
          color: 'var(--primary)',
          shadow: 'var(--primary-glow)',
          tab: 'dashboard',
          footer: 'Sign in to access registry'
        },
        {
          title: 'Total Teachers',
          value: stats.teachersCount,
          icon: Users,
          color: 'var(--success)',
          shadow: 'var(--success-glow)',
          tab: 'dashboard',
          footer: 'Sign in to view teachers'
        },
        {
          title: 'Active Subjects',
          value: stats.subjectsCount,
          icon: BookOpen,
          color: 'var(--warning)',
          shadow: 'rgba(245, 158, 11, 0.2)',
          tab: 'dashboard',
          footer: 'Sign in to see subjects'
        },
      ];
    }
  };

  const cards = getCards();

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Dashboard</h1>
          <p style={subtitleStyle}>
            Welcome back, <strong style={{color: 'var(--text-primary)'}}>{user?.username || 'Guest'}</strong>. Here is the overview of your academy.
          </p>
        </div>
        <div style={badgeContainerStyle}>
          <div className="badge badge-success" style={{ gap: '6px', padding: '6px 12px' }}>
            <span style={pingStyle} />
            <span>Database Connected</span>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div 
                  key={i} 
                  className="glass-panel" 
                  style={{
                    ...cardStyle,
                    borderColor: 'var(--border-color)',
                  }}
                  onClick={() => {
                    if (card.onClick) {
                      card.onClick();
                    } else if (card.tab) {
                      setCurrentTab(card.tab);
                    }
                  }}
                >
                  <div style={cardContentStyle}>
                    <span style={cardTitleStyle}>{card.title}</span>
                    <span style={cardValueStyle}>{card.value}</span>
                  </div>
                  <div 
                    style={{
                      ...iconContainerStyle,
                      backgroundColor: `rgba(${card.color === 'var(--primary)' ? '99, 102, 241' : card.color === 'var(--success)' ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
                      border: `1px solid rgba(${card.color === 'var(--primary)' ? '99, 102, 241' : card.color === 'var(--success)' ? '16, 185, 129' : '245, 158, 11'}, 0.2)`
                    }}
                  >
                    <Icon size={24} style={{ color: card.color }} />
                  </div>
                  <div style={cardFooterStyle}>
                    <span>{card.footer || 'View all details'}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions & System Info */}
          <div className="grid-2">
            {/* Quick Actions Card */}
            <div className="glass-panel" style={sectionCardStyle}>
              {user?.role === 'admin' && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <Activity size={18} color="var(--primary)" />
                    <span>Quick Administrative Actions</span>
                  </h3>
                  <div style={actionsGridStyle}>
                    <button onClick={() => setCurrentTab('students')} style={actionButtonStyle}>
                      <PlusCircle size={20} color="var(--primary)" />
                      <div style={actionTextsStyle}>
                        <span style={actionTitleTextStyle}>Add Student</span>
                        <span style={actionDescTextStyle}>Enroll a new student to a class</span>
                      </div>
                    </button>

                    <button onClick={() => setCurrentTab('teachers')} style={actionButtonStyle}>
                      <UserPlus size={20} color="var(--success)" />
                      <div style={actionTextsStyle}>
                        <span style={actionTitleTextStyle}>Add Teacher</span>
                        <span style={actionDescTextStyle}>Register a new teacher profile</span>
                      </div>
                    </button>

                    <button onClick={() => setCurrentTab('subjects')} style={actionButtonStyle}>
                      <BookMarked size={20} color="var(--warning)" />
                      <div style={actionTextsStyle}>
                        <span style={actionTitleTextStyle}>Create Subject</span>
                        <span style={actionDescTextStyle}>Define a new academic subject course</span>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {user?.role === 'teacher' && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <Activity size={18} color="var(--success)" />
                    <span>Quick Classroom Actions</span>
                  </h3>
                  <div style={actionsGridStyle}>
                    <button onClick={() => setCurrentTab('my-students')} style={actionButtonStyle}>
                      <PlusCircle size={20} color="var(--primary)" />
                      <div style={actionTextsStyle}>
                        <span style={actionTitleTextStyle}>My Students List</span>
                        <span style={actionDescTextStyle}>View and manage students in your classroom</span>
                      </div>
                    </button>

                    <button onClick={() => setCurrentTab('subjects')} style={actionButtonStyle}>
                      <BookMarked size={20} color="var(--warning)" />
                      <div style={actionTextsStyle}>
                        <span style={actionTitleTextStyle}>Subjects reference</span>
                        <span style={actionDescTextStyle}>View subject reference database</span>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {user?.role === 'student' && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <Activity size={18} color="var(--primary)" />
                    <span>Quick Student Actions</span>
                  </h3>
                  <div style={actionsGridStyle}>
                    <button onClick={() => setCurrentTab('my-profile')} style={actionButtonStyle}>
                      <PlusCircle size={20} color="var(--primary)" />
                      <div style={actionTextsStyle}>
                        <span style={actionTitleTextStyle}>My Academic Profile</span>
                        <span style={actionDescTextStyle}>View your report card and assigned subject modules</span>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <Activity size={18} color="var(--primary)" />
                    <span>Welcome to ClassMatrix</span>
                  </h3>
                  <div style={actionsGridStyle}>
                    <button onClick={onOpenLogin} style={actionButtonStyle}>
                      <PlusCircle size={20} color="var(--primary)" />
                      <div style={actionTextsStyle}>
                        <span style={actionTitleTextStyle}>Sign In / Register</span>
                        <span style={actionDescTextStyle}>Authenticate to access your workspace portal</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Portal Information & Guidelines Card */}
            <div className="glass-panel" style={sectionCardStyle}>
              {user?.role === 'admin' && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <GraduationCap size={18} color="var(--success)" />
                    <span>Portal Information & Guidelines</span>
                  </h3>
                  <div style={guidelinesContainerStyle}>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>1</span>
                      <p style={guidelineTextStyle}>
                        First, create **Teachers** and define their teaching sections.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>2</span>
                      <p style={guidelineTextStyle}>
                        Add **Students** and assign them to their respective class teacher.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>3</span>
                      <p style={guidelineTextStyle}>
                        Create academic **Subjects** then use the Student screen to assign subjects to individual students.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {user?.role === 'teacher' && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <GraduationCap size={18} color="var(--success)" />
                    <span>Classroom Supervision Guide</span>
                  </h3>
                  <div style={guidelinesContainerStyle}>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>1</span>
                      <p style={guidelineTextStyle}>
                        Check your classroom roster under the **My Students** tab.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>2</span>
                      <p style={guidelineTextStyle}>
                        Use action icons to assign curriculum **Subjects** to your classroom students.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>3</span>
                      <p style={guidelineTextStyle}>
                        Edit student details if their standard or section changes.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {user?.role === 'student' && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <GraduationCap size={18} color="var(--success)" />
                    <span>Student Portal Guide</span>
                  </h3>
                  <div style={guidelinesContainerStyle}>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>1</span>
                      <p style={guidelineTextStyle}>
                        Review your registered standard and section on the profile card.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>2</span>
                      <p style={guidelineTextStyle}>
                        Ensure your class teacher details are displayed correctly.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>3</span>
                      <p style={guidelineTextStyle}>
                        If any assigned subjects are missing, contact your class supervisor.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {!user && (
                <>
                  <h3 style={sectionTitleStyle}>
                    <GraduationCap size={18} color="var(--success)" />
                    <span>How to Access the Portal</span>
                  </h3>
                  <div style={guidelinesContainerStyle}>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>1</span>
                      <p style={guidelineTextStyle}>
                        Click the **Sign In** button at the bottom of the sidebar or quick actions.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>2</span>
                      <p style={guidelineTextStyle}>
                        If you don't have an account, switch to **Register** tab and specify your student or teacher ID.
                      </p>
                    </div>
                    <div style={guidelineItemStyle}>
                      <span style={stepNumberStyle}>3</span>
                      <p style={guidelineTextStyle}>
                        Contact the administrator if you experience any login or ID-linkage problems.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* CLASSMATES MODAL */}
      {isClassmatesModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">My Classmates</h3>
              <button className="btn-icon" onClick={() => setIsClassmatesModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ minHeight: '150px', maxHeight: '400px', overflowY: 'auto' }}>
              {isClassmatesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                  <div style={smallSpinnerStyle} />
                </div>
              ) : classmates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No classmates found in your section.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classmates.map(student => (
                        <tr key={student.id} style={student.id === user.student_id ? { backgroundColor: 'rgba(99, 102, 241, 0.05)' } : {}}>
                          <td style={{ fontWeight: '600', color: student.id === user.student_id ? 'var(--primary)' : 'var(--text-muted)' }}>
                            #{student.id}
                          </td>
                          <td style={{ fontWeight: student.id === user.student_id ? '700' : '500' }}>
                            {student.name} {student.id === user.student_id && <span style={{fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '4px'}}>(You)</span>}
                          </td>
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
              <button type="button" className="btn btn-primary" onClick={() => setIsClassmatesModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHERS MODAL */}
      {isTeachersModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Classroom Instructors</h3>
              <button className="btn-icon" onClick={() => setIsTeachersModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ minHeight: '150px', maxHeight: '400px', overflowY: 'auto' }}>
              {isTeachersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                  <div style={smallSpinnerStyle} />
                </div>
              ) : classTeachers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No instructors found for your section.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Instructor ID</th>
                        <th>Name</th>
                        <th>Assigned Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classTeachers.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: '600', color: 'var(--success)' }}>
                            #{t.id}
                          </td>
                          <td style={{ fontWeight: '500' }}>
                            {t.name}
                          </td>
                          <td>
                            <span className="badge badge-success">Section {t.section}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setIsTeachersModalOpen(false)}>Close</button>
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
  flexWrap: 'wrap',
  gap: '16px',
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

const badgeContainerStyle = {
  display: 'flex',
  alignItems: 'center',
};

const pingStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'var(--success)',
  display: 'inline-block',
  boxShadow: '0 0 8px var(--success)',
};

const cardStyle = {
  padding: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  flexWrap: 'wrap',
  gap: '12px',
};

const cardContentStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const cardTitleStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px',
};

const cardValueStyle = {
  fontSize: '2.25rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  lineHeight: '1',
};

const iconContainerStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)',
};

const cardFooterStyle = {
  width: '100%',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '12px',
  marginTop: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  transition: 'color 0.2s',
};

const spinnerContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '250px',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
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

const sectionCardStyle = {
  padding: '24px',
  height: '100%',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '1.1rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '20px',
};

const actionsGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const actionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '14px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--border-radius-md)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s',
  width: '100%',
};

const actionTextsStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const actionTitleTextStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const actionDescTextStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
};

const guidelinesContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const guidelineItemStyle = {
  display: 'flex',
  gap: '14px',
  alignItems: 'flex-start',
};

const stepNumberStyle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: 'rgba(99, 102, 241, 0.15)',
  border: '1px solid rgba(99, 102, 241, 0.3)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8rem',
  fontWeight: '700',
  flexShrink: 0,
};

const guidelineTextStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  margin: 0,
};
