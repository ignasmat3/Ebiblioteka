import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css';

function HomePage() {
  const [allBooks, setAllBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:8000/Ebiblioteka/books/list');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setAllBooks(data);
      setDisplayedBooks(getRandomBooks(data, 5));
    } catch (err) {
      console.error('Error fetching books:', err);
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

  return (
    <div className="home-page-container">
      <div className="search-section">
        <h2 className="section-title">Search Filters</h2>
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
          <button onClick={handleSearch} className="submit-button">Search</button>
        </div>
      </div>

      <h2 className="section-title">Books</h2>
      {displayedBooks.length === 0 ? (
        <p className="no-data-message">No books found.</p>
      ) : (
        <div className="book-grid">
          {displayedBooks.map((book) => (
            <div
              key={book.id}
              className="book-card home-book-card"
              onClick={() => handleBookClick(book.id)}
            >
              <p className="book-card-title"><strong>Title:</strong> {book.title}</p>
              <p className="book-card-meta"><strong>Release Year:</strong> {book.release_year}</p>
              {book.category_name && (
                <p className="book-card-meta"><strong>Category:</strong> {book.category_name}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
