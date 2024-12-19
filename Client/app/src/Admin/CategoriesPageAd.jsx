// pages/CategoriesPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/Ebiblioteka/categories/list');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setErrorMsg('Failed to load categories. Please try again later.');
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/admin/categoriesad/${categoryId}`);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = sessionStorage.getItem('access_token'); // Retrieve the token from storage
      const response = await fetch(`http://localhost:8000/Ebiblioteka/categories/${categoryId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Add the Authorization header
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCategories(categories.filter((category) => category.id !== categoryId));
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setErrorMsg('Failed to delete category. Please try again later.');
    }
  };

  const handleEditCategory = (categoryId) => {
    navigate(`/admin/categoriesad/${categoryId}/edit`);
  };

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {categories.length === 0 ? (
        <p>No categories available.</p>
      ) : (
        <div className="category-list">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
            >
              <h3>{category.name}</h3>
              <div className="category-actions">
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                >
                  View
                </button>
                <button
                  onClick={() => handleEditCategory(category.id)}
                  style={{ marginRight: '10px', cursor: 'pointer', backgroundColor: '#008CBA', color: 'white' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  style={{ cursor: 'pointer', backgroundColor: '#f44336', color: 'white' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;
