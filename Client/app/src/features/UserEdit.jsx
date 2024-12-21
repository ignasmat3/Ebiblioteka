import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../authFetch';
import './page.css';

function UserEdit() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchCurrentUserId = async () => {
    try {
      const response = await authFetch('https://ebiblioteka-7.onrender.com/Ebiblioteka/api/user/details/');
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setUserId(data.id);
      setUsername(data.username);
      setEmail(data.email);
    } catch (err) {
      setErrorMsg('Error fetching user ID.');
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await authFetch(`https://ebiblioteka-7.onrender.com/Ebiblioteka/users/${userId}/detail`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setUsername(data.username);
      setEmail(data.email);
    } catch (err) {
      setErrorMsg('Error fetching user details.');
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const updateData = { username, email };
    if (newPassword || newPassword2) {
      updateData.password = newPassword;
      updateData.password2 = newPassword2;
    }

    try {
      const response = await authFetch(`https://ebiblioteka-7.onrender.com/Ebiblioteka/users/${userId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update user details');

      setSuccessMsg('User details updated successfully.');
      fetchUserDetails();
      setNewPassword('');
      setNewPassword2('');
    } catch (err) {
      setErrorMsg('Error updating user details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setIsLoading(true);
    try {
      const response = await authFetch(`https://ebiblioteka-7.onrender.com/Ebiblioteka/users/${userId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      navigate('/logout');
    } catch (err) {
      setErrorMsg('Error deleting user.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) return <p className="loading-message">Loading user details...</p>;

  return (
    <div className="auth-page-container">
      <div className="auth-form-container">
        <h2 className="section-title">Edit Profile</h2>

        {errorMsg && <p className="error-message">{errorMsg}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}

        <form onSubmit={handleFormSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="New Password (optional)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Confirm New Password (optional)"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            Save Changes
          </button>
        </form>

        <button
          onClick={handleDeleteUser}
          className="submit-button"
          style={{ backgroundColor: '#f44336', marginTop: '20px' }}
          disabled={isLoading}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default UserEdit;
