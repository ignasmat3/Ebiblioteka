import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './page.css'; // Same styling as BookDetail

function RegisterPage() {
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [errorMsg, setErrorMsg]   = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== password2) {
      setErrorMsg("Passwords don't match");
      return;
    }

    const userData = { username, email, password, password2 };

    try {
      const response = await fetch('http://localhost:8000/Ebiblioteka/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setErrorMsg(null);
        setSuccessMsg('Registration successful! Redirecting to home page...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errData = await response.json();
        if (typeof errData === 'object') {
          const combinedErrors = Object.values(errData).join(' ');
          setErrorMsg(combinedErrors);
        } else {
          setErrorMsg(errData);
        }
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrorMsg('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-container">
        <h2 className="section-title">Sign Up</h2>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            className="form-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-input"
            placeholder="Confirm Password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          <button type="submit" className="submit-button">Register</button>
        </form>
        <p className="form-text">
          Already have an account? <Link to="/login" className="form-link">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
