import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './page.css';

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
      const response = await fetch('http://localhost:8000/Ebiblioteka/books/list');
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
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
    navigate(`/books/${bookId}`); // Navigate to the book detail page
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const accessToken = sessionStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/Ebiblioteka/books/${bookId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete book');
      }

      // Refresh the book list after deletion
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
      setErrorMsg('Failed to delete book. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Search Filters</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
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
            style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}
          >
            <p><strong>Title:</strong> {book.title}</p>
            <p><strong>Release Year:</strong> {book.release_year}</p>
            <button
              onClick={() => handleBookClick(book.id)}
              style={{
                backgroundColor: '#008CBA',
                color: 'white',
                padding: '5px 10px',
                border: 'none',
                marginRight: '5px',
                cursor: 'pointer',
              }}
            >
              View Details
            </button>
            <button
              onClick={() => handleDeleteBook(book.id)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '5px 10px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default HomePage;