import React from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  LogOut, 
  LogIn,
  School,
  ShieldAlert,
  Home as HomeIcon
} from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, user, onLogout, onOpenLogin }) {
  
  const getNavLinks = () => {
    const links = [];

    if (!user) {
      return links; // Guest gets no menu items
    }

    // Authenticated users get their role pages
    if (user.role === 'admin') {
      links.push(
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'teachers', label: 'Teachers', icon: Users },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'admin-panel', label: 'Admin Panel', icon: ShieldAlert }
      );
    } else if (user.role === 'teacher') {
      links.push(
        { id: 'my-students', label: 'My Students', icon: Users },
        { id: 'subjects', label: 'Subjects', icon: BookOpen }
      );
    } else if (user.role === 'student') {
      links.push(
        { id: 'my-profile', label: 'My Profile', icon: GraduationCap }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header className="top-navbar">
      {/* Brand logo on Left */}
      <button className="navbar-brand" onClick={() => setCurrentTab('home')}>
        <School size={26} color="var(--primary)" />
        <span className="navbar-brand-text">ClassMatrix</span>
      </button>

      {/* Nav Menu in Center */}
      <nav className="navbar-menu">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`navbar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Actions / Auth on Right */}
      <div className="navbar-actions">
        {user ? (
          <div className="navbar-user-profile">
            <div style={avatarStyle}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div style={userInfoStyle}>
              <span style={usernameStyle}>{user.username}</span>
              <span style={roleStyle}>
                {user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Teacher' : 'Student'}
              </span>
            </div>
            <button 
              onClick={onLogout} 
              style={logoutButtonStyle}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onOpenLogin} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

// Inline styles for profile segment
const avatarStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '0.75rem',
  boxShadow: '0 0 6px var(--primary-glow)',
};

const userInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  lineHeight: '1.2',
};

const usernameStyle = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const roleStyle = {
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
};

const logoutButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '4px',
  marginLeft: '4px',
  borderRadius: 'var(--border-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
};
