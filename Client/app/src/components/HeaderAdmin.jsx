import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './Header.css';

function HeaderAdmin() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function

  const logout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      try {
        // Simulate API call if needed
        const response = await fetch('https://ebiblioteka-7.onrender.com/Ebiblioteka/api/logout', {
          method: 'POST',
          credentials: 'include',
        });

        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        localStorage.removeItem('user_role');

        if (response.ok) {
          navigate('/'); // Redirect using React Router
        } else {
          console.error('Logout failed');
          alert('Failed to log out. Please try again.');
        }
      } catch (error) {
        console.error('Error during logout:', error);
        alert('An error occurred while logging out. Please try again.');
      }
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="title">Book Explorer (Admin)</h1>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li><Link to="/admin" className="nav-link">Home</Link></li>
            <li><Link to="/admin/categoriesad" className="nav-link">Categories</Link></li>
            <li><Link to="/admin/usereditad" className="nav-link">Users</Link></li>
            <li>
              <button onClick={logout} className="logout-button-link">Logout</button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default HeaderAdmin;
