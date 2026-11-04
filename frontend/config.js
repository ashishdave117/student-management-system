// Configuration for Presentation Tier (Netlify)
// Connected to live Render Application Tier
window.APP_CONFIG = {
  // Production Render Backend URL
  DEFAULT_API_URL: 'https://student-management-system-oq04.onrender.com',

  // Function to get active API URL (checks localStorage first)
  getApiUrl: function () {
    const saved = localStorage.getItem('STUDENT_API_URL');
    if (saved && saved.trim() !== '') {
      return saved.trim().replace(/\/+$/, '');
    }
    return this.DEFAULT_API_URL.replace(/\/+$/, '');
  },

  // Save new API URL
  setApiUrl: function (url) {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem('STUDENT_API_URL', cleanUrl);
    return cleanUrl;
  },

  // Reset to default
  resetApiUrl: function () {
    localStorage.removeItem('STUDENT_API_URL');
    return this.DEFAULT_API_URL;
  },
};
