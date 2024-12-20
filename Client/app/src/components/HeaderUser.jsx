import React, { useState } from 'react';
import './Header.css';

function HeaderUser() {
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      try {
        const response = await fetch('http://localhost:8000/Ebiblioteka/api/logout/', {
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
        <h1 className="title">Book Explorer</h1>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li><a href="/features" className="nav-link">Home</a></li>
            <li><a href="/features/categoriesus" className="nav-link">Categories</a></li>
            <li><a href="/features/useredit" className="nav-link">Profile Info</a></li>
            <li><button onClick={logout} className="logout-button-link">Logout</button></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default HeaderUser;
