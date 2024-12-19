import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './page.css';

function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchCategoryDetail();
  }, [id]);

  const fetchCategoryDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8000/Ebiblioteka/categories/${id}/detail`);
      if (!response.ok) {
        throw new Error('Failed to fetch category detail');
      }
      const data = await response.json();
      setCategory(data);
    } catch (err) {
      console.error('Error fetching category detail:', err);
      setErrorMsg('Failed to load category details. Please try again later.');
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/admin/booksad/${bookId}`);
  };

  const handleEditBook = (bookId) => {
    navigate(`/admin/booksad/${bookId}/edit`);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`http://localhost:8000/Ebiblioteka/books/${bookId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      // Refresh the category details after successful deletion
      fetchCategoryDetail();
    } catch (err) {
      console.error('Error deleting book:', err);
      setErrorMsg('Failed to delete book. Please try again later.');
    }
  };

  if (!category) {
    return <p>Loading category details...</p>;
  }

  return (
    <div className="category-detail-container">
      <h2>Category: {category.name}</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <h3>Books in {category.name}</h3>
      {(!category.books || category.books.length === 0) ? (
        <p>No books found in this category.</p>
      ) : (
        <div className="book-grid">
          {category.books.map((book) => (
            <div key={book.id} className="book-card">
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Release Year:</strong> {book.release_year}</p>
              <div className="book-actions">
                <button
                  onClick={() => handleBookClick(book.id)}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                >
                  View
                </button>
                <button
                  onClick={() => handleEditBook(book.id)}
                  style={{
                    marginRight: '10px',
                    cursor: 'pointer',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBook(book.id)}
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

export default CategoryDetailPage;
