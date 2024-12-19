import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../authFetch';

function Header() {
  const [access, setAccess] = useState(getAccessToken());

  const logout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      sessionStorage.removeItem('access_token');
      setAccess(null); // Update state to re-render
      // Redirect after a slight delay for a better user experience
      setTimeout(() => {
        window.location.href = '/login'; // Redirect to login page
      }, 100);
    }
  };

  useEffect(() => {
    // Listen for changes in sessionStorage (e.g., token updates)
    const handleStorageChange = () => setAccess(getAccessToken());
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Book Explorer</h1>
      <nav>
        <ul style={styles.navList}>
          <li>
            <a href="/" style={styles.navLink}>Home</a>
          </li>
          <li>
            <a href="/categories" style={styles.navLink}>Categories</a>
          </li>
          {access ? (
              <li>
                <a href="#logout" style={styles.navLink} onClick={logout}>
                  Logout
                </a>
              </li>
          ) : (
              <li>
                <a href="/login" style={styles.navLink}>Login</a>
              </li>
          )}
          <li>
            <a href="/search" style={styles.navLink}>Search</a>
          </li>
          <li>
            <a href="/register" style={styles.navLink}>Register</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '1rem',
  },
  title: {
    margin: 0,
    padding: 0,
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
    padding: 0,
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
  },
};

export default Header;
