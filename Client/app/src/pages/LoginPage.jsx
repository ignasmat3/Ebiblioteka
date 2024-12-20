import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css'; // Uses the same styling as BookDetail and HomePage

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const credentials = { username, password };

    try {
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
        const userRole = data.role;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_role', userRole);

        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/features';
        }
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
    <div className="auth-page-container">
      <div className="auth-form-container">
        <h2 className="section-title">Login</h2>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
