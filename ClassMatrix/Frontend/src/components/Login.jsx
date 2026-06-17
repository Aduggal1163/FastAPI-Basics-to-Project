import React, { useState } from 'react';
import { api } from '../api';
import { LogIn, UserPlus, Lock, User, Eye, EyeOff, X, GraduationCap, Users, ShieldAlert } from 'lucide-react';

export default function Login({ onSuccess, onClose, addToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast('Username and password are required', 'error');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const data = await api.login(username.trim(), password);
        addToast('Login successful!', 'success');
        onSuccess(data.access_token, username.trim(), data.role, data.student_id, data.teacher_id);
        if (onClose) onClose();
      } else {
        await api.register(
          username.trim(), 
          password, 
          role, 
          null, 
          null
        );
        addToast('Registration successful! You can now log in.', 'success');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      addToast(error.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div className="glass-panel" style={cardStyle}>
        {onClose && (
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={18} />
          </button>
        )}

        <div style={headerStyle}>
          <div style={logoIconStyle}>
            <Lock size={24} color="var(--primary)" />
          </div>
          <h2 style={titleStyle}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={subtitleStyle}>
            {isLogin 
              ? 'Sign in to access your school portal dashboard' 
              : role === 'admin' 
              ? 'Register a new administrative staff account' 
              : role === 'teacher' 
              ? 'Register a new teacher portal account' 
              : 'Register a new student portal account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={tabContainerStyle}>
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setPassword(''); setConfirmPassword(''); }}
            style={{
              ...tabItemStyle,
              borderBottomColor: isLogin ? 'var(--primary)' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <LogIn size={16} />
            <span>Login</span>
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setPassword(''); setConfirmPassword(''); }}
            style={{
              ...tabItemStyle,
              borderBottomColor: !isLogin ? 'var(--primary)' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Username</label>
            <div style={inputContainerStyle}>
              <User size={16} style={inputIconStyle} />
              <input 
                type="text" 
                className="form-control" 
                style={inputWithIconStyle}
                placeholder="Enter username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={inputContainerStyle}>
              <Lock size={16} style={inputIconStyle} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                style={inputWithIconStyle}
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={inputContainerStyle}>
                  <Lock size={16} style={inputIconStyle} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control" 
                    style={inputWithIconStyle}
                    placeholder="Confirm password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select 
                  className="form-control" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  {/* <option value="admin">Administrator</option> */}
                </select>
              </div>

            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={submitButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={spinnerStyle} />
            ) : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Inline styles for glassmorphism authentication card
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(3, 7, 18, 0.85)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1000,
};

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  padding: '40px 30px',
  position: 'relative',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), var(--shadow-glow)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
};

const logoIconStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  backgroundColor: 'rgba(99, 102, 241, 0.15)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  border: '1px solid rgba(99, 102, 241, 0.3)',
};

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  marginBottom: '8px',
  color: 'var(--text-primary)',
};

const subtitleStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.4',
};

const tabContainerStyle = {
  display: 'flex',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '24px',
};

const tabItemStyle = {
  flex: 1,
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  padding: '12px 0',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const inputIconStyle = {
  position: 'absolute',
  left: '12px',
  color: 'var(--text-muted)',
};

const inputWithIconStyle = {
  paddingLeft: '38px',
};

const eyeButtonStyle = {
  position: 'absolute',
  right: '12px',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s',
};

const submitButtonStyle = {
  marginTop: '12px',
  padding: '12px',
  fontWeight: '600',
  fontSize: '0.95rem',
};

const spinnerStyle = {
  width: '20px',
  height: '20px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTopColor: '#ffffff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

// Inject spin keyframes
const style = document.createElement('style');
style.innerText = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
