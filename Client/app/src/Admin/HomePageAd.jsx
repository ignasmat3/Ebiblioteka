import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css';
import { authFetch } from '../authFetch';

function HomePage() {
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await authFetch('https://ebiblioteka-7.onrender.com/Ebiblioteka/books/list');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setAllBooks(data);
      setDisplayedBooks(getRandomBooks(data, 5));
    } catch (err) {
      console.error('Error fetching books:', err);
      setErrorMsg('Failed to load books. Please try again later.');
    }
  };

  const getRandomBooks = (books, count) => {
    if (books.length <= count) return books;
    const shuffled = [...books].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleSearch = () => {
    let filtered = [...allBooks];
    if (categoryFilter.trim() !== '') {
      filtered = filtered.filter(book =>
        book.category_name && book.category_name.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    if (titleFilter.trim() !== '') {
      filtered = filtered.filter(book =>
        book.title && book.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }
    setDisplayedBooks(filtered);
  };

  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const response = await authFetch(`https://ebiblioteka-7.onrender.com/Ebiblioteka/books/${bookId}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete book');
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
      setErrorMsg('Failed to delete book. Please try again later.');
    }
  };

  return (
    <div className="page-container">
      <h2 className="section-title">Search Filters</h2>
      {errorMsg && <p className="error-message">{errorMsg}</p>}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Filter by category..."
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-input"
        />
        <input
          type="text"
          placeholder="Filter by title..."
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
          className="form-input"
        />
        <button onClick={handleSearch} className="submit-button search-button">
          Search
        </button>
      </div>

      <h2 className="section-title">Books</h2>
      {displayedBooks.length === 0 ? (
        <p className="no-data-message">No books found.</p>
      ) : (
        <div className="book-grid">
          {displayedBooks.map((book) => (
            <div key={book.id} className="book-card">
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Release Year:</strong> {book.release_year}</p>
              <div className="book-actions">
                <button onClick={() => handleBookClick(book.id)} className="submit-button view-button">
                  View Details
                </button>
                <button onClick={() => handleDeleteBook(book.id)} className="submit-button delete-button">
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

export default HomePage;
