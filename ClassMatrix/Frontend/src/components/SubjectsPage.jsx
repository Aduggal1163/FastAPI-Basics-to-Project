import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Search, 
  BookOpen, 
  X,
  BookMarked
} from 'lucide-react';

export default function SubjectsPage({ addToast, isAuthenticated, onOpenLogin }) {
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
  });

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSubjects();
      setSubjects(data || []);
    } catch (err) {
      if (err.message.includes('No subjects')) {
        setSubjects([]);
      } else {
        addToast('Failed to load subjects list', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      addToast('Please login first to create a subject', 'warning');
      onOpenLogin();
      return;
    }
    setFormData({
      id: '',
      name: '',
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      addToast('All fields are required', 'error');
      return;
    }

    try {
      await api.createSubject({
        id: parseInt(formData.id),
        name: formData.name.trim(),
      });
      addToast('Subject created successfully!', 'success');
      setIsAddModalOpen(false);
      loadSubjects();
    } catch (error) {
      addToast(error.message || 'Failed to create subject', 'error');
    }
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Subjects</h1>
          <p style={subtitleStyle}>Define courses, academic modules, and subject reference tables</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          <span>Create Subject</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="glass-panel" style={searchBarPanelStyle}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search subjects by name..." 
          style={searchInputStyle}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle} />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No subjects found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            {searchQuery ? 'Try matching another subject title.' : 'Start by defining your first subject module.'}
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="glass-panel" style={subjectCardStyle}>
              <div style={badgeContainerStyle}>
                <span className="badge badge-primary">ID #{subject.id}</span>
              </div>
              <div style={contentContainerStyle}>
                <BookMarked size={28} color="var(--primary)" style={{ marginBottom: '12px' }} />
                <h3 style={subjectNameStyle}>{subject.name}</h3>
                <p style={subjectDescStyle}>Core Academic Subject Course</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Define New Subject</h3>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject ID</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter unique subject ID"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Mathematics, Science"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Subject</button>
              </div>
            </form>
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

const subjectCardStyle = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  border: '1px solid var(--border-color)',
};

const badgeContainerStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
};

const contentContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: '10px',
};

const subjectNameStyle = {
  fontSize: '1.15rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '4px',
};

const subjectDescStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
};
