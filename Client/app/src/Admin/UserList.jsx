import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css';
import { authFetch } from '../authFetch';

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authFetch('http://localhost:8000/Ebiblioteka/users/list');
      if (!response.ok) throw new Error('Failed to fetch users');
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
      const response = await authFetch(`http://localhost:8000/Ebiblioteka/users/${userId}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setErrorMsg('Failed to delete user. Please try again later.');
    }
  };

  const handleEditUser = (userId) => {
    navigate(`/admin/useredit/${userId}`);
  };

  return (
    <div className="page-container">
      <h2 className="section-title">All Users</h2>
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {users.length === 0 ? (
        <p className="no-data-message">No users found.</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
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
                      className="submit-button edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="submit-button delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserListPage;
