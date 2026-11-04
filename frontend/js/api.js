// API Communication Layer (Tier 1 -> Tier 2)
const API = {
  getBaseUrl() {
    return window.APP_CONFIG.getApiUrl();
  },

  async request(endpoint, options = {}) {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          (data && data.message) ||
          `HTTP Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(
          `Unable to reach backend server at ${baseUrl}. Ensure the Render backend is active and CORS is configured.`
        );
      }
      throw err;
    }
  },

  // Health check
  async checkHealth() {
    return this.request('/api/health');
  },

  // Get all students with optional search and filter
  async getAllStudents(search = '', department = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department && department !== 'All') params.append('department', department);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/students${query}`);
  },

  // Get single student
  async getStudentById(id) {
    return this.request(`/api/students/${encodeURIComponent(id)}`);
  },

  // Add a new student
  async createStudent(studentData) {
    return this.request('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  // Update existing student
  async updateStudent(id, studentData) {
    return this.request(`/api/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  // Delete student
  async deleteStudent(id) {
    return this.request(`/api/students/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
