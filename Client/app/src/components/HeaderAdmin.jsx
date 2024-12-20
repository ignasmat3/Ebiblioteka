import React, { useState } from 'react';
import './Header.css';

function HeaderAdmin() {
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      localStorage.removeItem('user_role');
      setTimeout(() => {
        window.location.href = '/'; // Redirect after logout
      }, 100);
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
            <li><a href="/admin" className="nav-link">Home</a></li>
            <li><a href="/admin/categoriesad" className="nav-link">Categories</a></li>
            <li><a href="/admin/usereditad" className="nav-link">Users</a></li>
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
