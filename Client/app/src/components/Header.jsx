import React, { useState } from 'react';
import './Header.css'; // Make sure this file exists and is in the same directory

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/categories" className="nav-link">Categories</a></li>
            <li><a href="/login" className="nav-link">Login</a></li>
            <li><a href="/register" className="nav-link">Register</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
