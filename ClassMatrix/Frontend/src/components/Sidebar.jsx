import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  LogOut, 
  LogIn,
  School,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, onOpenLogin }) {
  const getMenuItems = () => {
    if (!user) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ];
    }

    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    if (user.role === 'admin') {
      items.push(
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'teachers', label: 'Teachers', icon: Users },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'admin-panel', label: 'Admin Panel', icon: ShieldAlert }
      );
    } else if (user.role === 'teacher') {
      items.push(
        { id: 'my-students', label: 'My Students', icon: Users },
        { id: 'subjects', label: 'Subjects', icon: BookOpen }
      );
    } else if (user.role === 'student') {
      items.push(
        { id: 'my-profile', label: 'My Profile', icon: GraduationCap }
      );
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside style={sidebarStyle}>
      <div style={logoContainerStyle}>
        <School size={28} color="var(--primary)" />
        <span style={logoTextStyle}>ClassMatrix</span>
      </div>

      <nav style={navStyle}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                ...navItemStyle,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
              <span>{item.label}</span>
              {isActive && <div style={activeIndicatorStyle} />}
            </button>
          );
        })}
      </nav>

      <div style={footerStyle}>
        {user ? (
          <div style={userProfileStyle}>
            <div style={avatarStyle}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div style={userInfoStyle}>
              <span style={usernameStyle}>{user.username}</span>
              <span style={roleStyle}>
                {user.role === 'admin' ? 'Administrator' : user.role === 'teacher' ? 'Teacher' : 'Student'}
              </span>
            </div>
            <button 
              onClick={onLogout} 
              style={logoutButtonStyle}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenLogin} style={loginButtonStyle}>
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}

// Inline styles for premium look
const sidebarStyle = {
  width: 'var(--sidebar-width)',
  backgroundColor: 'var(--bg-secondary)',
  borderRight: '1px solid var(--border-color)',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 100,
  boxShadow: 'var(--shadow-md)',
};

const logoContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '24px 20px',
  borderBottom: '1px solid var(--border-color)',
};

const logoTextStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  letterSpacing: '-0.5px',
  background: 'linear-gradient(to right, #ffffff, var(--text-secondary))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const navStyle = {
  flex: 1,
  padding: '24px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  border: 'none',
  borderLeft: '3px solid transparent',
  borderRadius: 'var(--border-radius-sm)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500',
  textAlign: 'left',
  transition: 'all 0.2s ease',
  position: 'relative',
};

const activeIndicatorStyle = {
  position: 'absolute',
  right: '12px',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary)',
  boxShadow: '0 0 10px var(--primary)',
};

const footerStyle = {
  padding: '20px 16px',
  borderTop: '1px solid var(--border-color)',
  backgroundColor: 'rgba(3, 7, 18, 0.2)',
};

const userProfileStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '600',
  fontSize: '0.85rem',
  boxShadow: '0 0 8px var(--primary-glow)',
};

const userInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
};

const usernameStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const roleStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
};

const logoutButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '6px',
  borderRadius: 'var(--border-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
};

const loginButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '10px',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--border-radius-sm)',
  cursor: 'pointer',
  fontWeight: '500',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)',
};
