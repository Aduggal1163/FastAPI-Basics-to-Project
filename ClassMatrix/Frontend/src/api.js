const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let token = localStorage.getItem('sms_token') || null;

export const api = {
  setToken(newToken) {
    token = newToken;
    if (newToken) {
      localStorage.setItem('sms_token', newToken);
    } else {
      localStorage.removeItem('sms_token');
    }
  },

  getToken() {
    return token;
  },

  isAuthenticated() {
    return !!token;
  },

  logout() {
    this.setToken(null);
  },

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof URLSearchParams) && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, get text
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (_) {}
      }
      throw new Error(errorMessage);
    }

    // Handle empty or deleted responses
    if (response.status === 204) {
      return null;
    }

    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  },

  // Auth APIs
  async getPublicStats() {
    return this.request('/public-stats');
  },

  async login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const data = await this.request('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (data && data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  },

  async register(username, password, role = 'student', studentId = null, teacherId = null) {
    return this.request('/register', {
      method: 'POST',
      body: { 
        username, 
        password,
        role,
        student_id: studentId ? parseInt(studentId) : null,
        teacher_id: teacherId ? parseInt(teacherId) : null
      },
    });
  },

  // User Management APIs (Admin Only)
  async getUsers() {
    return this.request('/users');
  },

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: {
        role: userData.role || null,
        student_id: userData.student_id !== undefined ? parseInt(userData.student_id) : null,
        teacher_id: userData.teacher_id !== undefined ? parseInt(userData.teacher_id) : null
      }
    });
  },

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Student APIs
  async getStudents() {
    return this.request('/students');
  },

  async getStudentById(id) {
    return this.request(`/students/${id}`);
  },

  async createStudent(student) {
    return this.request('/students', {
      method: 'POST',
      body: student,
    });
  },

  async updateStudent(id, studentData) {
    return this.request(`/students/${id}`, {
      method: 'PATCH',
      body: studentData,
    });
  },

  async deleteStudent(id) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  // Teacher APIs
  async getTeachers() {
    return this.request('/teachers');
  },

  async getTeacherById(id) {
    return this.request(`/teachers/${id}`);
  },

  async createTeacher(teacher) {
    return this.request('/teachers', {
      method: 'POST',
      body: teacher,
    });
  },

  async updateTeacher(id, teacherData) {
    return this.request(`/teachers/${id}`, {
      method: 'PATCH',
      body: teacherData,
    });
  },

  async deleteTeacher(id) {
    return this.request(`/teachers/${id}`, {
      method: 'DELETE',
    });
  },

  async getStudentsOfTeacher(teacherId) {
    return this.request(`/teachers/${teacherId}/students`);
  },

  // Subject APIs
  async getSubjects() {
    return this.request('/subjects');
  },

  async createSubject(subject) {
    return this.request('/subjects', {
      method: 'POST',
      body: subject,
    });
  },

  async assignSubject(studentId, subjectId) {
    return this.request('/assign-subject', {
      method: 'POST',
      body: {
        student_id: parseInt(studentId),
        subject_id: parseInt(subjectId)
      },
    });
  },

  async getStudentSubjects(studentId) {
    return this.request(`/students/${studentId}/subjects`);
  }
};
