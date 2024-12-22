import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css'; // Same CSS as BookDetail

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://ebiblioteka-7.onrender.com/Ebiblioteka/categories/list');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="page-container">
      <h2 className="section-title">Categories</h2>
      {categories.length === 0 ? (
        <p className="no-data-message">No categories available.</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
            >
              <h3 className="category-name">{category.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;
