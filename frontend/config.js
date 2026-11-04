// Configuration for Presentation Tier (Netlify)
// This file can be edited or overridden via the UI settings modal.
window.APP_CONFIG = {
  // Default Render Backend URL
  // Replace this with your actual Render service URL after deploying!
  // Example: "https://student-api-xxxx.onrender.com"
  DEFAULT_API_URL: 'http://localhost:5000',

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
