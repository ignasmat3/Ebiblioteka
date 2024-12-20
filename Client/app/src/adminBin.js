// authFetch.js
export async function authFetch(url, options = {}) {
  let access = sessionStorage.getItem('access_token');

  // Add Authorization header if access token is available
  if (access) {
    options.headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${access}`
    };
  }

  // Always include credentials if needed
  options.credentials = 'include';

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Try refreshing the token
    const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      // Update the access token in sessionStorage
      sessionStorage.setItem('access_token', refreshData.access);

      // Retry the original request with the new token
      options.headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${refreshData.access}`
      };

      response = await fetch(url, options);
    } else {
      console.error('Token refresh failed. Please log in again.');
      sessionStorage.removeItem('access_token');
    }
  }

  return response;
}

// New utility function to fetch access token
export function getAccessToken() {
  return sessionStorage.getItem('access_token');
}
