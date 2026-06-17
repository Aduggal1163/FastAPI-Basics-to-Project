import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';
import TeachersPage from './components/TeachersPage';
import SubjectsPage from './components/SubjectsPage';
import AdminPanel from './components/AdminPanel';
import MyStudentsView from './components/MyStudentsView';
import StudentProfileView from './components/StudentProfileView';
import Login from './components/Login';
import ToastContainer from './components/Toast';
import { api } from './api';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Check auth state on load
  useEffect(() => {
    const token = localStorage.getItem('sms_token');
    const username = localStorage.getItem('sms_username');
    const role = localStorage.getItem('sms_role');
    const student_id = localStorage.getItem('sms_student_id');
    const teacher_id = localStorage.getItem('sms_teacher_id');
    if (token && username) {
      api.setToken(token);
      setUser({ 
        username, 
        role, 
        student_id: student_id ? parseInt(student_id) : null, 
        teacher_id: teacher_id ? parseInt(teacher_id) : null 
      });
    }
  }, []);

  // Toast Helpers
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (token, username, role, student_id, teacher_id) => {
    const studentIdInt = student_id ? parseInt(student_id) : null;
    const teacherIdInt = teacher_id ? parseInt(teacher_id) : null;
    
    setUser({ 
      username, 
      role, 
      student_id: studentIdInt, 
      teacher_id: teacherIdInt 
    });
    
    localStorage.setItem('sms_username', username);
    localStorage.setItem('sms_role', role);
    if (studentIdInt) localStorage.setItem('sms_student_id', studentIdInt.toString());
    if (teacherIdInt) localStorage.setItem('sms_teacher_id', teacherIdInt.toString());
    
    addToast(`Welcome back, ${username}!`, 'success');
    setIsLoginOpen(false);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('sms_username');
    localStorage.removeItem('sms_role');
    localStorage.removeItem('sms_student_id');
    localStorage.removeItem('sms_teacher_id');
    setUser(null);
    addToast('Logged out successfully', 'success');
    setCurrentTab('dashboard');
  };

  const renderContent = () => {
    const commonProps = {
      addToast,
      isAuthenticated: !!user,
      onOpenLogin: () => setIsLoginOpen(true),
    };

    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentTab={setCurrentTab} 
            addToast={addToast} 
            user={user} 
            onOpenLogin={commonProps.onOpenLogin}
          />
        );
      case 'students':
        return <StudentsPage {...commonProps} />;
      case 'teachers':
        return <TeachersPage {...commonProps} />;
      case 'subjects':
        return <SubjectsPage {...commonProps} />;
      case 'admin-panel':
        return <AdminPanel {...commonProps} />;
      case 'my-students':
        return <MyStudentsView teacherId={user?.teacher_id} addToast={addToast} />;
      case 'my-profile':
        return <StudentProfileView studentId={user?.student_id} addToast={addToast} />;
      default:
        return (
          <Dashboard 
            setCurrentTab={setCurrentTab} 
            addToast={addToast} 
            user={user} 
            onOpenLogin={commonProps.onOpenLogin}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Login / Register Modal */}
      {isLoginOpen && (
        <Login
          onSuccess={handleLoginSuccess}
          onClose={() => setIsLoginOpen(false)}
          addToast={addToast}
        />
      )}
    </div>
  );
}

export default App;
