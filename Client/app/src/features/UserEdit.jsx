import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../authFetch';
import './page.css';

function UserEdit() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null); // Holds the user's PK (ID)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('guest');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCurrentUserId(); // First, fetch the user's ID
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserDetails(); // Fetch user details after ID is retrieved
    }
  }, [userId]);

  // Fetch the logged-in user's ID
  const fetchCurrentUserId = async () => {
    try {
      const response = await authFetch('http://localhost:8000/Ebiblioteka/api/user/details/');
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setUserId(data.id); // Extract user ID
      setUsername(data.username); // Optional: Populate username
      setEmail(data.email); // Optional: Populate email
      setRole(data.role); // Optional: Populate role
    } catch (err) {
      setErrorMsg('Error fetching user ID.');
    }
  };

  // Fetch the user details for editing
  const fetchUserDetails = async () => {
    try {
      const response = await authFetch(`http://localhost:8000/Ebiblioteka/users/${userId}/detail`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setUser(data);
      setUsername(data.username);
      setEmail(data.email);
      setRole(data.role);
    } catch (err) {
      setErrorMsg('Error fetching user details.');
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await authFetch(`http://localhost:8000/Ebiblioteka/users/${userId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, role }),
      });

      if (!response.ok) throw new Error('Failed to update user details');

      setSuccessMsg('User details updated successfully.');
      fetchUserDetails();
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
      const response = await authFetch(`http://localhost:8000/Ebiblioteka/users/${userId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      navigate('/users/list'); // Redirect to the user list after deletion
    } catch (err) {
      setErrorMsg('Error deleting user.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <p>Loading user details...</p>;

  return (
    <div>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

      <h2>Edit User</h2>

      <form onSubmit={handleFormSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="guest">Guest</option>
            <option value="reader">Reader</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#008CBA',
            color: 'white',
            padding: '10px',
            border: 'none',
            cursor: 'pointer',
          }}
          disabled={isLoading}
        >
          Save Changes
        </button>
      </form>

      <button
        onClick={handleDeleteUser}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '10px',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px',
        }}
        disabled={isLoading}
      >
        Delete User
      </button>
    </div>
  );
}

export default UserEdit;
