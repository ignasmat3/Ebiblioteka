import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css';

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/Ebiblioteka/users/list');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrorMsg('Failed to load users. Please try again later.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:8000/Ebiblioteka/users/${userId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setErrorMsg('Failed to delete user. Please try again later.');
    }
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/useredit/${userId}`); // Navigate to the user edit page
  };

  return (
    <div className="user-list-container">
      <h2>All Users</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    onClick={() => handleEditUser(user.id)}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      marginRight: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserListPage;
