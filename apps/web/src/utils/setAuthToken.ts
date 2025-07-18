import axios from 'axios';

const setAuthToken = (token: string | null) => {
  if (token) {
    // Apply to every request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Also set workspace ID if available
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.workspaceId) {
          axios.defaults.headers.common['X-Workspace-ID'] = userData.workspaceId;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['X-Workspace-ID'];
  }
};

export default setAuthToken;