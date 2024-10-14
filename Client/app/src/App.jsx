import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/Ebiblioteka/book/');
      const data = await response.json();
      setBooks(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const addBook = async () => {
    const bookData = {
      title,
      release_year: releaseYear,
    };
    try {
      const response = await fetch('http://127.0.0.1:8000/Ebiblioteka/create/', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      console.log(data);
      fetchBooks(); // Refresh the list of books
    } catch (err) {
      console.log(err);
    }
  };

  const updateTitle = async (pk) => {
    const bookToUpdate = books.find((book) => book.id === pk);
    const bookData = {
      title: newTitle,
      release_year: bookToUpdate.release_year,
    };
    try {
      const response = await fetch(`http://127.0.0.1:8000/Ebiblioteka/book/${pk}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      console.log(data);
      setBooks((prev) =>
        prev.map((book) => (book.id === pk ? data : book))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const deleteBook = async (pk) => {
    try {
      await fetch(`http://127.0.0.1:8000/Ebiblioteka/book/${pk}`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
        },
      });
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== pk));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1>Book Site</h1>
      <input
        type="text"
        placeholder="Book title..."
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="number"
        placeholder="Release year..."
        onChange={(e) => setReleaseYear(e.target.value)}
      />
      <button onClick={addBook}>Submit</button>
      {books.map((book) => (
        <div key={book.id}>
          <p>Book name: {book.title}</p>
          <p>Release Year: {book.release_year}</p>
          <input
            type="text"
            placeholder="New title..."
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button onClick={() => updateTitle(book.id)}>Change Title</button>
          <button onClick={() => deleteBook(book.id)}>DELETE</button>
        </div>
      ))}
    </>
  );
}

export default App;