// Configuration for Presentation Tier (Netlify)
// Multi-Server Switching Support (Server 1 & server_service_2)
window.APP_CONFIG = {
  // Configured Cloud Servers
  SERVERS: {
    server_1: {
      id: 'server_1',
      name: 'Server 1 (Primary)',
      url: 'https://student-management-system-oq04.onrender.com',
    },
    server_service_2: {
      id: 'server_service_2',
      name: 'Server 2 (server_service_2)',
      url: 'https://server-service-2.onrender.com',
    },
  },

  // Get currently active server key ('server_1' or 'server_service_2')
  getActiveServerKey: function () {
    return localStorage.getItem('ACTIVE_SERVER_KEY') || 'server_1';
  },

  // Get currently active server URL
  getApiUrl: function () {
    const key = this.getActiveServerKey();
    const customUrl = localStorage.getItem(`SERVER_URL_${key}`);
    if (customUrl && customUrl.trim() !== '') {
      return customUrl.trim().replace(/\/+$/, '');
    }
    const defaultServer = this.SERVERS[key] || this.SERVERS.server_1;
    return defaultServer.url.replace(/\/+$/, '');
  },

  // Switch active server
  switchServer: function (serverKey) {
    if (this.SERVERS[serverKey]) {
      localStorage.setItem('ACTIVE_SERVER_KEY', serverKey);
    }
    return this.getApiUrl();
  },

  // Update URL for a specific server
  setServerUrl: function (serverKey, url) {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(`SERVER_URL_${serverKey}`, cleanUrl);
    return cleanUrl;
  },

  // Reset to default configuration
  resetDefaults: function () {
    localStorage.removeItem('ACTIVE_SERVER_KEY');
    localStorage.removeItem('SERVER_URL_server_1');
    localStorage.removeItem('SERVER_URL_server_service_2');
    return this.getApiUrl();
  },
};
