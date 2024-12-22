import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function HeaderUser() {
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      try {
        const response = await fetch('https://ebiblioteka-7.onrender.com/Ebiblioteka/api/logout/', {
          method: 'POST',
          credentials: 'include',
        });

        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('username');

        if (response.ok) {
          window.location.href = '/';
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
        <h1 className="title">
          <div className="logo"></div>
          Book Explorer
        </h1>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li><Link to="/features" className="nav-link">Home</Link></li>
            <li><Link to="/features/categoriesus" className="nav-link">Categories</Link></li>
            <li><Link to="/features/useredit" className="nav-link">Profile Info</Link></li>
            <li><button onClick={logout} className="logout-button-link">Logout</button></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default HeaderUser;
