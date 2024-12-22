import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './page.css';
import { authFetch } from '../authFetch';

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Utility function to retrieve cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // Check if the user is authenticated
  const isAuthenticated = !!getCookie('access_token');

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  useEffect(() => {
    if (book && book.category) {
      fetchBookComments(book.category, book.id);
    }
  }, [book]);

  const fetchBookDetail = async () => {
    try {
      const response = await authFetch(`https://ebiblioteka-7.onrender.com/Ebiblioteka/books/${id}/detail`);
      if (!response.ok) throw new Error('Failed to fetch book detail');
      const data = await response.json();
      setBook(data);
    } catch (err) {
      setErrorMsg('Error fetching book details.');
    }
  };

  const fetchBookComments = async (categoryId, bookId) => {
    try {
      const response = await authFetch(
        `https://ebiblioteka-7.onrender.com/Ebiblioteka/categories/${categoryId}/books/${bookId}/comments/list`
      );
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setErrorMsg('Error fetching comments.');
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await authFetch(
        `https://ebiblioteka-7.onrender.com/Ebiblioteka/categories/${book.category}/books/${book.id}/comments/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newCommentText }),
        }
      );

      if (!response.ok) throw new Error('Failed to post comment.');
      setNewCommentText('');
      fetchBookComments(book.category, book.id);
    } catch (err) {
      setErrorMsg('Error posting comment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!book) return <p className="loading-message">Loading book details...</p>;

  return (
    <div className="book-detail-container">
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      <div className="book-info">
        <h2 className="book-title">{book.title}</h2>
        <p className="book-meta"><strong>Category:</strong> {book.category_name}</p>
        <p className="book-meta"><strong>Author:</strong> {book.author}</p>
        <p className="book-meta"><strong>Release Year:</strong> {book.release_year}</p>
        <p className="book-description"><strong>Description:</strong> {book.description}</p>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">Comments:</h3>
        {comments.length === 0 ? (
          <p className="no-comments">No comments for this book.</p>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <p className="comment-user"><strong>User:</strong> {comment.user_username}</p>
                <p className="comment-text">{comment.text}</p>
                <p className="comment-date"><small>{new Date(comment.date).toLocaleString()}</small></p>
              </div>
            ))}
          </div>
        )}

        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <h4 className="form-title">Add a Comment:</h4>
            <textarea
              className="comment-textarea"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write your comment here..."
            />
            <button
              type="submit"
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>
        ) : (
          <p className="auth-warning">
            You must be logged in to post or edit comments.
          </p>
        )}
      </div>
    </div>
  );
}

export default BookDetail;
