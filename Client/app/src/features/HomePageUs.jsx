// pages/HomePage.jsx
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
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
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
    navigate(`/features/booksus/${bookId}`); // Navigate to the book detail page
  };

  return (
    <div>
      <h2>Search Filters</h2>
      <input
        type="text"
        placeholder="Filter by category..."
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <input
        type="text"
        placeholder="Filter by title..."
        value={titleFilter}
        onChange={(e) => setTitleFilter(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleSearch}>Search</button>

      <h2>Books</h2>
      {displayedBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        displayedBooks.map((book) => (
          <div
            key={book.id}
            style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', cursor: 'pointer' }}
            onClick={() => handleBookClick(book.id)}
          >
            <p><strong>Title:</strong> {book.title}</p>
            <p><strong>Release Year:</strong> {book.release_year}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default HomePage;
