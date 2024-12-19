import React from 'react';

function Header() {
  const logout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      sessionStorage.removeItem('access_token');
      setTimeout(() => {
        window.location.href = '/'; // Redirect to guest page
      }, 100);
    }
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Book Explorer</h1>
      <nav>
        <ul style={styles.navList}>
          <li>
            <a href="/admin" style={styles.navLink}>Home</a>
          </li>
          <li>
            <a href="/admin/categoriesad" style={styles.navLink}>Categories</a>
          </li>
          <li>
            <a href="/admin/usereditad" style={styles.navLink}>Users</a>
          </li>
          <li>
            <button onClick={logout} style={styles.logoutButton}>Logout</button>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logoutButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
};

export default Header;
