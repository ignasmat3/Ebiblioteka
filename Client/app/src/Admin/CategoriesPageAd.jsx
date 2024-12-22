import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css';
import { authFetch } from '../authFetch';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authFetch('https://ebiblioteka-7.onrender.com/Ebiblioteka/categories/list');
      if (!response.ok) throw new Error('Failed to fetch categories');
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
      const response = await authFetch(`https://ebiblioteka-7.onrender.com/Ebiblioteka/categories/${categoryId}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter((category) => category.id !== categoryId));
    } catch (err) {
      console.error('Error deleting category:', err);
      setErrorMsg('Failed to delete category. Please try again later.');
    }
  };

  const handleEditCategory = (categoryId) => {
    navigate(`/admin/categoriesad/${categoryId}/edit`);
  };

  return (
    <div className="page-container">
      <h2 className="section-title">Categories</h2>
      {errorMsg && <p className="error-message">{errorMsg}</p>}
      {categories.length === 0 ? (
        <p className="no-data-message">No categories available.</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <h3 className="category-name">{category.name}</h3>
              <div className="category-actions">
                <button onClick={() => handleCategoryClick(category.id)} className="submit-button view-button">
                  View
                </button>
                <button onClick={() => handleDeleteCategory(category.id)} className="submit-button delete-button">
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
