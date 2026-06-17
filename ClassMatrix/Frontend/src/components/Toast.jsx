import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={containerStyle}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} color="var(--success)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--error)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--warning)" />;
      default:
        return <AlertCircle size={18} color="var(--primary)" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--error)';
      case 'warning':
        return 'var(--warning)';
      default:
        return 'var(--primary)';
    }
  };

  return (
    <div
      style={{
        ...toastStyle,
        borderLeft: `4px solid ${getBorderColor()}`,
      }}
    >
      <div style={iconStyle}>{getIcon()}</div>
      <div style={contentStyle}>
        <p style={messageStyle}>{toast.message}</p>
      </div>
      <button onClick={() => removeToast(toast.id)} style={closeButtonStyle}>
        <X size={14} />
      </button>
    </div>
  );
}

// Inline Styles for Toast
const containerStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1100,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxWidth: '350px',
  width: '100%',
};

const toastStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  background: 'rgba(17, 24, 39, 0.9)',
  backdropFilter: 'blur(8px)',
  borderRadius: 'var(--border-radius-sm)',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
  animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  color: 'var(--text-primary)',
};

const iconStyle = {
  marginRight: '12px',
  display: 'flex',
  alignItems: 'center',
};

const contentStyle = {
  flex: 1,
};

const messageStyle = {
  margin: 0,
  fontSize: '0.85rem',
  fontWeight: '500',
  lineHeight: '1.4',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '2px',
  marginLeft: '8px',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s',
};

// Keyframe styles injected dynamically
const styleSheet = document.createElement('style');
styleSheet.innerText = `
  @keyframes slideIn {
    from {
      transform: translateX(100%) translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateX(0) translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleSheet);
