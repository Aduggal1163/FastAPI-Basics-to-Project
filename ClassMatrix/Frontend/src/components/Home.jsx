import React, { useState, useEffect } from 'react';
import { api } from '../api';
import adminAvatar from '../assets/admin_avatar.png';
import teacherAvatar from '../assets/teacher_avatar.png';
import studentAvatar from '../assets/student_avatar.png';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Database,
  Monitor,
  CheckCircle,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  PlusCircle
} from 'lucide-react';

export default function Home({ onOpenLogin, isAuthenticated, setCurrentTab, user, addToast }) {
  const [stats, setStats] = useState({ students: 0, teachers: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);
  const [hoveredPanel, setHoveredPanel] = useState(null);

  // Interactive student panel previews
  const [showClassmates, setShowClassmates] = useState(false);
  const [showTeachers, setShowTeachers] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.getPublicStats();
        if (res) {
          setStats({
            students: res.students || 0,
            teachers: res.teachers || 0,
            subjects: res.subjects || 0
          });
        }
      } catch (err) {
        console.error('Error fetching public stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user.role === 'admin') {
        setCurrentTab('dashboard');
      } else if (user.role === 'teacher') {
        setCurrentTab('my-students');
      } else {
        setCurrentTab('my-profile');
      }
    } else {
      onOpenLogin();
    }
  };

  return (
    <div style={containerStyle} className="animate-slide-up">
      
      {/* High-Tech Visual Canvas Showcase */}
      <section className="gradient-bg-hero" style={canvasSectionStyle}>
        
        {/* SVG Connection Lines in the Background */}
        <div className="svg-overlay-container">
          <svg width="100%" height="100%" viewBox="0 0 1000 450" preserveAspectRatio="none">
            {/* Admin (Left) to Central Hub */}
            <path 
              d="M 285 240 Q 390 240 500 240" 
              className="connection-path" 
              style={{
                stroke: hoveredPanel === 'admin' ? 'var(--primary)' : 'rgba(99, 102, 241, 0.2)',
                opacity: hoveredPanel === 'admin' ? 1 : 0.6
              }}
            />
            <path 
              d="M 285 240 Q 390 240 500 240" 
              className="animated-pulse-line"
              style={{
                stroke: 'var(--primary)',
                animationDuration: hoveredPanel === 'admin' ? '0.8s' : '1.8s',
                opacity: hoveredPanel === 'admin' ? 1 : 0.4
              }}
            />

            {/* Teacher (Top Center) to Central Hub */}
            <path 
              d="M 500 170 Q 500 205 500 240" 
              className="connection-path" 
              style={{
                stroke: hoveredPanel === 'teacher' ? 'var(--success)' : 'rgba(16, 185, 129, 0.2)',
                opacity: hoveredPanel === 'teacher' ? 1 : 0.6
              }}
            />
            <path 
              d="M 500 170 Q 500 205 500 240" 
              className="animated-pulse-line"
              style={{
                stroke: 'var(--success)',
                animationDuration: hoveredPanel === 'teacher' ? '0.8s' : '1.8s',
                opacity: hoveredPanel === 'teacher' ? 1 : 0.4
              }}
            />

            {/* Student (Right) to Central Hub */}
            <path 
              d="M 715 240 Q 610 240 500 240" 
              className="connection-path" 
              style={{
                stroke: hoveredPanel === 'student' ? 'var(--warning)' : 'rgba(245, 158, 11, 0.2)',
                opacity: hoveredPanel === 'student' ? 1 : 0.6
              }}
            />
            <path 
              d="M 715 240 Q 610 240 500 240" 
              className="animated-pulse-line"
              style={{
                stroke: 'var(--warning)',
                animationDuration: hoveredPanel === 'student' ? '0.8s' : '1.8s',
                opacity: hoveredPanel === 'student' ? 1 : 0.4
              }}
            />
          </svg>
        </div>

        {/* 3-Column Visualization Grid */}
        <div className="visual-canvas">
          
          {/* COLUMN 1: ADMINISTRATOR WORKSPACE PANEL */}
          <div 
            className="mock-panel mock-panel-admin"
            onMouseEnter={() => setHoveredPanel('admin')}
            onMouseLeave={() => setHoveredPanel(null)}
          >
            <div className="mock-titlebar">
              <div className="mock-window-dots">
                <div className="mock-dot mock-dot-red"></div>
                <div className="mock-dot mock-dot-yellow"></div>
                <div className="mock-dot mock-dot-green"></div>
              </div>
              <span className="mock-window-title">Administrator</span>
              <ShieldCheck size={12} color="var(--primary)" />
            </div>

            <div className="mock-body">
              <div className="mock-sidebar">
                <div className="mock-sidebar-item active"></div>
                <div className="mock-sidebar-item"></div>
                <div className="mock-sidebar-item"></div>
                <div className="mock-sidebar-item" style={{ marginTop: 'auto' }}></div>
              </div>
              
              <div className="mock-main" style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-primary)' }}>System Registry</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>CRUD</span>
                  </div>
                  
                  {/* Stats Counters */}
                  <div className="mock-admin-grid">
                    <div className="mock-admin-card" style={{ borderColor: 'rgba(99, 102, 241, 0.15)' }}>
                      <span>STUDENTS</span>
                      <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>{loading ? '2k+' : `${stats.students}`}</span>
                    </div>
                    <div className="mock-admin-card" style={{ borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                      <span>TEACHERS</span>
                      <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>{loading ? '180+' : `${stats.teachers}`}</span>
                    </div>
                    <div className="mock-admin-card" style={{ borderColor: 'rgba(245, 158, 11, 0.15)' }}>
                      <span>SUBJECTS</span>
                      <span style={{ color: 'var(--warning)', fontSize: '0.75rem' }}>{loading ? '90+' : `${stats.subjects}`}</span>
                    </div>
                  </div>

                  {/* DB Details and Action list */}
                  <div style={mockAdminFeatureStyle}>
                    <Database size={10} color="var(--primary)" />
                    <span style={{ fontSize: '0.55rem', fontWeight: '600' }}>ROLE-BASED ACCESS CONTROL (RBAC)</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: 'auto' }}>
                    <div style={mockCheckItemStyle}>
                      <CheckCircle size={8} color="var(--primary)" />
                      <span>User management Panel</span>
                    </div>
                  </div>
                </div>

                {/* Right side circular graphic */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100px', flexShrink: 0 }}>
                  <img 
                    src={adminAvatar} 
                    alt="Admin Avatar" 
                    style={{ 
                      width: '95px', 
                      height: '95px', 
                      borderRadius: '50%', 
                      border: '2.5px solid var(--primary)', 
                      boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)' 
                    }} 
                  />
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>SECURE HUB</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: CENTRAL HUB SPHERE & TEACHER PANEL (ON TOP) */}
          <div className="center-hub-column">
            
            {/* TEACHER WORKSPACE PANEL (Floating on top center) */}
            <div 
              className="mock-panel mock-panel-teacher" 
              style={{ width: '270px', height: '160px', marginBottom: '20px', flex: 'none' }}
              onMouseEnter={() => setHoveredPanel('teacher')}
              onMouseLeave={() => setHoveredPanel(null)}
            >
              <div className="mock-titlebar">
                <div className="mock-window-dots">
                  <div className="mock-dot mock-dot-red"></div>
                  <div className="mock-dot mock-dot-yellow"></div>
                  <div className="mock-dot mock-dot-green"></div>
                </div>
                <span className="mock-window-title" style={{ fontSize: '0.55rem' }}>Teacher Hub</span>
                <Users size={10} color="var(--success)" />
              </div>

              <div className="mock-body" style={{ padding: '8px', display: 'flex', flexDirection: 'row', gap: '8px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="mock-teacher-header">
                    <span style={{ fontWeight: '700', fontSize: '0.62rem' }}>MY STUDENTS (Roster 5A)</span>
                    <TrendingUp size={10} color="var(--success)" />
                  </div>
                  
                  {/* Small Trend graph representation */}
                  <div style={mockGraphContainerStyle}>
                    <svg width="100%" height="18">
                      <path d="M 0 15 L 20 12 L 40 14 L 60 5 L 80 8 L 100 2 L 120 4" fill="none" stroke="var(--success)" strokeWidth="1.5" />
                      <circle cx="100" cy="2" r="2" fill="var(--success)" />
                    </svg>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)' }}>ASSIGN SUBJECTS</span>
                    <div className="mock-avatar-stack">
                      <div className="mock-avatar-node" style={{ borderColor: 'var(--success)' }}>A</div>
                      <div className="mock-avatar-node" style={{ borderColor: 'var(--success)' }}>M</div>
                      <div className="mock-avatar-node" style={{ borderColor: 'var(--success)' }}>J</div>
                    </div>
                  </div>
                </div>

                {/* Right side circular teacher avatar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', flexShrink: 0 }}>
                  <img 
                    src={teacherAvatar} 
                    alt="Teacher Avatar" 
                    style={{ 
                      width: '75px', 
                      height: '75px', 
                      borderRadius: '50%', 
                      border: '2.5px solid var(--success)', 
                      boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)' 
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Glowing Sphere Database Core */}
            <div className="central-sphere-outer">
              <div className="central-sphere-ring1"></div>
              <div className="central-sphere-ring2"></div>
              <div className="central-sphere-core">
                <span className="central-sphere-title">CLASSMATRIX:</span>
                <span className="central-sphere-subtitle" style={{ fontSize: '0.45rem', fontWeight: 'bold' }}>SECURE PLATFORM HUB</span>
                <span style={{ fontSize: '0.35rem', color: 'var(--text-muted)', marginTop: '2px' }}>(FASTAPI & REACT)</span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: STUDENT WORKSPACE PANEL */}
          <div 
            className="mock-panel mock-panel-student"
            onMouseEnter={() => setHoveredPanel('student')}
            onMouseLeave={() => setHoveredPanel(null)}
            style={{ position: 'relative' }}
          >
            <div className="mock-titlebar">
              <div className="mock-window-dots">
                <div className="mock-dot mock-dot-red"></div>
                <div className="mock-dot mock-dot-yellow"></div>
                <div className="mock-dot mock-dot-green"></div>
              </div>
              <span className="mock-window-title">Student Profile</span>
              <GraduationCap size={12} color="var(--warning)" />
            </div>

            <div className="mock-body">
              <div className="mock-main" style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '3px' }}>
                    MY PROFILE
                  </span>

                  {/* Profile Card Mock */}
                  <div style={mockProfileCardStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>Anya Chen</span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>Grade 10 • Section S</span>
                    </div>
                  </div>

                  {/* Action buttons triggers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: 'auto' }}>
                    <button 
                      onClick={() => {
                        setShowClassmates(!showClassmates);
                        setShowTeachers(false);
                      }} 
                      style={{
                        ...mockPanelButtonStyle, 
                        backgroundColor: showClassmates ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                        borderColor: showClassmates ? 'var(--warning)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <span>{showClassmates ? 'Hide Classmates' : 'CLASSMATES'}</span>
                      <ArrowRight size={10} style={{ transform: showClassmates ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    <button 
                      onClick={() => {
                        setShowTeachers(!showTeachers);
                        setShowClassmates(false);
                      }} 
                      style={{
                        ...mockPanelButtonStyle,
                        backgroundColor: showTeachers ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                        borderColor: showTeachers ? 'var(--warning)' : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      <span>{showTeachers ? 'Hide Teachers' : 'TEACHERS'}</span>
                      <ArrowRight size={10} style={{ transform: showTeachers ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                </div>

                {/* Right side large circular student image */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100px', flexShrink: 0 }}>
                  <img 
                    src={studentAvatar} 
                    alt="Student Avatar" 
                    style={{ 
                      width: '95px', 
                      height: '95px', 
                      borderRadius: '50%', 
                      border: '2.5px solid var(--warning)', 
                      boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)' 
                    }} 
                  />
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>PORTAL</span>
                </div>
              </div>
            </div>

            {/* Clickable Classmates Dropdown Overlay */}
            <div className={`mock-slideout-card ${showClassmates ? 'visible' : ''}`} style={{ bottom: '50px', left: '10px', right: '10px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Classmates (Roster 5A)</span>
                <span style={{ color: 'var(--warning)' }}>4 Online</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={miniNodeAvatarStyle}>JD</div>
                <div style={miniNodeAvatarStyle}>LM</div>
                <div style={miniNodeAvatarStyle}>KP</div>
                <div style={miniNodeAvatarStyle}>SR</div>
              </div>
            </div>

            {/* Clickable Teachers Dropdown Overlay */}
            <div className={`mock-slideout-card ${showTeachers ? 'visible' : ''}`} style={{ bottom: '50px', left: '10px', right: '10px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Class Teachers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dr. Abhishek Duggal</span>
                  <span style={{ color: 'var(--success)', fontSize: '0.6rem' }}>Supervising</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Prof. Rachel Green</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>Mathematics</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Hero Content Section (Integrated inside) */}
        <div style={{ ...heroTypographySectionStyle, zIndex: 10, marginTop: '2.5rem' }}>
          <h2 style={heroTitleStyle}>
            CLASSMATRIX: UNIFYING SCHOOL ADMINISTRATION
          </h2>
          <p style={heroSubTitleStyle}>
            ROLE-BASED PORTALS. REAL-TIME INSIGHTS. SECURE ACCESS.
          </p>
          
          <div style={heroCtaContainerStyle}>
            <button className="btn btn-primary" onClick={handleGetStarted} style={primaryCtaButtonStyle}>
              <span>GET STARTED</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={onOpenLogin} style={secondaryCtaButtonStyle}>
              <span>REQUEST DEMO</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Footbar Section (Integrated inside) */}
        <div style={{ display: 'flex', justifyContent: 'center', zIndex: 10, marginTop: '2rem', marginBottom: '0.5rem' }}>
          <div className="hud-stats-bar animate-glow-pulse" style={{ background: 'rgba(10, 15, 28, 0.4)' }}>
            <span style={hudStatsTitleStyle}>GLOBAL PUBLIC STATS</span>
            <div style={hudStatsGridStyle}>
              <div style={hudStatItemStyle}>
                <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{loading ? '...' : stats.students}</span>
                <span>STUDENTS</span>
              </div>
              <div style={dividerStyle}>|</div>
              <div style={hudStatItemStyle}>
                <span style={{ color: 'var(--success)', fontWeight: '800' }}>{loading ? '...' : stats.teachers}</span>
                <span>TEACHERS</span>
              </div>
              <div style={dividerStyle}>|</div>
              <div style={hudStatItemStyle}>
                <span style={{ color: 'var(--warning)', fontWeight: '800' }}>{loading ? '...' : stats.subjects}</span>
                <span>SUBJECTS</span>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2.5rem',
  paddingTop: '0.5rem',
};

const canvasSectionStyle = {
  padding: '2rem 1.5rem',
  borderRadius: 'var(--border-radius-lg)',
  position: 'relative',
  overflow: 'visible',
};

const mockAdminFeatureStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255, 255, 255, 0.02)',
  padding: '5px 8px',
  borderRadius: '4px',
  border: '1px solid rgba(99, 102, 241, 0.15)',
  marginTop: '4px'
};

const mockCheckItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '0.62rem',
  color: 'var(--text-secondary)'
};

const mockGraphContainerStyle = {
  height: '24px',
  background: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255,255,255,0.03)',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  padding: '2px'
};

const mockProfileCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  padding: '6px 8px',
  borderRadius: '6px',
  marginTop: '6px'
};

const mockProfileAvatarStyle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  backgroundColor: 'rgba(245, 158, 11, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const mockPanelButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 10px',
  border: '1px solid transparent',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.62rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  transition: 'all 0.2s ease'
};

const miniNodeAvatarStyle = {
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  backgroundColor: 'rgba(245, 158, 11, 0.15)',
  border: '1px solid rgba(245, 158, 11, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.55rem',
  fontWeight: '700'
};

const heroTypographySectionStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
};

const heroTitleStyle = {
  fontSize: '1.85rem',
  fontWeight: '900',
  color: 'var(--text-primary)',
  letterSpacing: '0.5px',
  lineHeight: '1.2',
};

const heroSubTitleStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  letterSpacing: '1px',
  marginBottom: '1rem',
};

const heroCtaContainerStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap',
};

const primaryCtaButtonStyle = {
  padding: '0.75rem 2rem',
  fontSize: '0.9rem',
  fontWeight: '700',
  boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
};

const secondaryCtaButtonStyle = {
  padding: '0.75rem 2rem',
  fontSize: '0.9rem',
  fontWeight: '700',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const hudStatsTitleStyle = {
  fontSize: '0.7rem',
  fontWeight: '800',
  color: 'rgba(255, 255, 255, 0.5)',
  letterSpacing: '2px',
};

const hudStatsGridStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  fontSize: '0.85rem',
  fontWeight: '600',
};

const hudStatItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const dividerStyle = {
  color: 'rgba(255, 255, 255, 0.15)',
  fontWeight: '200',
};
