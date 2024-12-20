// authFetch.js

const REFRESH_ENDPOINT = 'http://localhost:8000/Ebiblioteka/api/token/refresh/';

export async function authFetch(url, options = {}) {
  // Retrieve the current access token from localStorage
  let accessToken = localStorage.getItem('access_token');

  if (accessToken) {
    options.headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  // Make the initial request
  let response = await fetch(url, options);

  if (response.status === 401) {
    // Access token might have expired, attempt to refresh
    const refreshResponse = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      credentials: 'include', // Ensure refresh token cookie is sent
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // If refresh endpoint requires data, include it here
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      const newAccessToken = data.access;

      if (newAccessToken) {
        // Store the new access token
        localStorage.setItem('access_token', newAccessToken);

        // Retry the original request with the new token
        options.headers = {
          ...(options.headers || {}),
          'Authorization': `Bearer ${newAccessToken}`,
        };
        response = await fetch(url, options);
      } else {
        // No new token returned, session expired
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      // Refresh failed, logout
      handleLogout();
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
}

function handleLogout() {
  // Clear stored tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('username');
  // Redirect to login
  window.location.href = '/login';
}
