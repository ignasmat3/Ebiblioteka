// pages/CategoryDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../authFetch';
import './page.css';

function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    fetchCategoryDetail();
  }, [id]);

  const fetchCategoryDetail = async () => {
    try {
      const response = await authFetch(`https://ebiblioteka-7.onrender.com/Ebiblioteka/categories/${id}/detail`);
      if (!response.ok) {
        throw new Error('Failed to fetch category detail');
      }
      const data = await response.json();
      setCategory(data);
    } catch (err) {
      console.error('Error fetching category detail:', err);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/features/booksus/${bookId}`);
  };

  if (!category) {
    return <p>Loading category details...</p>;
  }

  return (
    <div className="category-detail-container fade-in">
      <h2 className="section-title">Category: {category.name}</h2>
      <h3 className="section-subtitle">Books in {category.name}</h3>
      {(!category.books || category.books.length === 0) ? (
        <p className="no-data-message">No books found in this category.</p>
      ) : (
        <div className="book-grid">
          {category.books.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => handleBookClick(book.id)}
            >
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Release Year:</strong> {book.release_year}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryDetailPage;
