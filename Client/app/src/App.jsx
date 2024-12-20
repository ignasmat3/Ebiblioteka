import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Header from './components/Header';
import HeaderUser from './components/HeaderUser';
import HeaderAdmin from './components/HeaderAdmin';

// Guest Pages
import HomePage from './pages/HomePage';
import BookDetail from './pages/BookDetail';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LogoutPage from './pages/LogoutPage';

// User Features
import UserEdit from './features/UserEdit';
import BookDetailUs from './features/BookDetailUs';
import CategoriesPageUs from './features/CategoryPageUs';
import CategoryDetailPageUs from './features/CategoryDetailUs';
import HomePageUs from './features/HomePageUs';

// Admin Pages
import BookDetailAd from './Admin/BookDetailAd.jsx';
import CategoriesDetailPageAd from './Admin/CategoriesDetailPageAd.jsx';
import CategoriesPageAd from './Admin/CategoriesPageAd.jsx';
import HomePageAd from './Admin/HomePageAd.jsx';
import UserList from './Admin/UserList.jsx';

function App() {
  // Retrieve tokens and user role from local storage
  const accessToken = localStorage.getItem('access_token'); // Check if access token exists
  const userRole = localStorage.getItem('user_role'); // Retrieve user role from local storage
  const isAuthenticated = !!accessToken;

  return (
    <Router>
      <div className="App">
        {/* Render different headers based on authentication status */}
        {isAuthenticated ? (
          userRole === 'admin' ? <HeaderAdmin /> : <HeaderUser />
        ) : (
          <Header />
        )}

        <div style={{ padding: '1rem' }}>
          <Routes>
            {/* Guest Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:id" element={<CategoryDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/logout" element={<LogoutPage />} />

            {/* Protected Features for Registered Users */}
            {isAuthenticated && userRole !== 'admin' && (
              <>
                <Route path="/features/useredit" element={<UserEdit />} />
                <Route path="/features/booksus/:id" element={<BookDetailUs />} />
                <Route path="/features/categoriesus" element={<CategoriesPageUs />} />
                <Route path="/features/categoriesus/:id" element={<CategoryDetailPageUs />} />
                <Route path="/features" element={<HomePageUs />} />
              </>
            )}

            {/* Admin Routes */}
            {isAuthenticated && userRole === 'admin' && (
              <>
                <Route path="/admin" element={<HomePageAd />} />
                <Route path="/admin/usereditad" element={<UserList />} />
                <Route path="/admin/booksad/:id" element={<BookDetailAd />} />
                <Route path="/admin/categoriesad" element={<CategoriesPageAd />} />
                <Route path="/admin/categoriesad/:id" element={<CategoriesDetailPageAd />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
