import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  // Function to fetch user role and redirect based on role
  const fetchUserRole = async (accessToken) => {
    try {
      const roleResponse = await fetch('http://localhost:8000/Ebiblioteka/api/user/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        const userRole = roleData.role;

        // Store the role in sessionStorage
        sessionStorage.setItem('user_role', userRole);
        console.log(roleResponse)
        // Redirect based on role
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/features');
        }
      } else {
        console.error('Failed to fetch user role');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const credentials = { username, password };

    try {
      // Authenticate user and get the access token
      const response = await fetch('http://localhost:8000/Ebiblioteka/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const accessToken = data.access;

        // Store access token in sessionStorage
        sessionStorage.setItem('access_token', accessToken);

        // Fetch user role and handle redirection
        await fetchUserRole(accessToken);

        setErrorMsg(null);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.detail || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg('Something went wrong. Please try again later.');
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '2rem auto', textAlign: 'center' }}>
      <h2>Login</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>
          Log In
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
