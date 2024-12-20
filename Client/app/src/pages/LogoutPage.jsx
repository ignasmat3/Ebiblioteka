// pages/LogoutPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutPage() {
  const [message, setMessage] = useState('Logging out...');
  const navigate = useNavigate();

  useEffect(() => {
    logoutUser();
  }, []);

  const logoutUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/Ebiblioteka/api/logout/', {
        method: 'POST',
        credentials: 'include' // Include cookies so server can invalidate session
      });

      if (response.ok) {
        // Clear the access token from sessionStorage
        sessionStorage.removeItem('access_token');
        setMessage('Logged out successfully!');
        // Redirect to login page after short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        const errData = await response.json();
        setMessage(`Logout failed: ${errData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setMessage('Error during logout. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>{message}</h2>
    </div>
  );
}

export default LogoutPage;
