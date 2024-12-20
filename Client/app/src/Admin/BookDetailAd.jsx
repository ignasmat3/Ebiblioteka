import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './page.css';
import { authFetch } from '../authFetch';

function BookDetailAd() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const access = localStorage.getItem('access_token');
  const currentUsername = localStorage.getItem('username');
  const userRole = localStorage.getItem('user_role');

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
      const response = await authFetch(`http://localhost:8000/Ebiblioteka/books/${id}/detail`);
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
        `http://localhost:8000/Ebiblioteka/categories/${categoryId}/books/${bookId}/comments/list`
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
    if (!access) {
      setErrorMsg('You must be logged in to post a comment.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authFetch(
        `http://localhost:8000/Ebiblioteka/categories/${book.category}/books/${book.id}/comments/create`,
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

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setIsLoading(true);
    try {
      const response = await authFetch(
        `http://localhost:8000/Ebiblioteka/categories/${book.category}/books/${book.id}/comments/${commentId}/delete`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete comment.');
      fetchBookComments(book.category, book.id);
    } catch (err) {
      setErrorMsg('Error deleting comment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentEdit = async (commentId, updatedText) => {
    const newText = prompt('Edit your comment:', updatedText);
    if (!newText) return;
    setIsLoading(true);
    try {
      const response = await authFetch(
        `http://localhost:8000/Ebiblioteka/categories/${book.category}/books/${book.id}/comments/${commentId}/update`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newText }),
        }
      );
      if (!response.ok) throw new Error('Failed to edit comment.');
      fetchBookComments(book.category, book.id);
    } catch (err) {
      setErrorMsg('Error editing comment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBook = async () => {
    const newTitle = prompt('Edit Book Title:', book.title);
    const newAuthor = prompt('Edit Book Author:', book.author);
    const newReleaseYear = prompt('Edit Release Year:', book.release_year);
    const newDescription = prompt('Edit Description:', book.description);

    if (!newTitle || !newAuthor || !newReleaseYear || !newDescription) {
      setErrorMsg('All fields are required for editing the book.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authFetch(`http://localhost:8000/Ebiblioteka/books/${id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          author: newAuthor,
          release_year: newReleaseYear,
          description: newDescription,
        }),
      });
      if (!response.ok) throw new Error('Failed to edit book.');
      fetchBookDetail();
    } catch (err) {
      setErrorMsg('Error editing book details.');
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

      {userRole === 'admin' && (
        <button
          onClick={handleEditBook}
          className="submit-button edit-button"
          disabled={isLoading}
        >
          Edit Book
        </button>
      )}

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

                {(userRole === 'admin' || comment.user_username === currentUsername) && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleCommentEdit(comment.id, comment.text)}
                      className="submit-button edit-button"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCommentDelete(comment.id)}
                      className="submit-button delete-button"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {access ? (
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
              className="submit-button"
              disabled={isLoading}
            >
              Submit Comment
            </button>
          </form>
        ) : (
          <p className="auth-warning">You must be logged in to post a comment.</p>
        )}
      </div>
    </div>
  );
}

export default BookDetailAd;
