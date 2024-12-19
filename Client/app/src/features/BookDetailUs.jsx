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

  // User credentials
  const access = sessionStorage.getItem('access_token');
  const currentUsername = sessionStorage.getItem('username');
  const userRole = sessionStorage.getItem('user_role'); // "admin" or "librarian"

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
      const response = await fetch(`http://localhost:8000/Ebiblioteka/books/${id}/detail`);
      if (!response.ok) throw new Error('Failed to fetch book detail');
      const data = await response.json();
      setBook(data);
    } catch (err) {
      setErrorMsg('Error fetching book details.');
    }
  };

  const fetchBookComments = async (categoryId, bookId) => {
    try {
      const response = await fetch(
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
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await authFetch(
        `http://localhost:8000/Ebiblioteka/categories/${book.category}/books/${book.id}/comments/${commentId}/delete`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete comment.');
      fetchBookComments(book.category, book.id);
    } catch (err) {
      setErrorMsg('Error deleting comment.');
    }
  };

  const handleCommentEdit = async (commentId, updatedText) => {
    const newText = prompt('Edit your comment:', updatedText);
    if (!newText) return;

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
    }
  };

  if (!book) return <p>Loading book details...</p>;

  return (
    <div>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <h2>{book.title}</h2>
      <p><strong>Category:</strong> {book.category_name}</p>
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>Release Year:</strong> {book.release_year}</p>
      <p><strong>Description:</strong> {book.description}</p>

      <h3>Comments:</h3>
      {comments.length === 0 ? (
        <p>No comments for this book.</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <p><strong>User:</strong> {comment.user_username}</p>
            <p>{comment.text}</p>
            <p><small>{new Date(comment.date).toLocaleString()}</small></p>

            {/* Render Edit and Delete buttons */}
            {
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => handleCommentEdit(comment.id, comment.text)}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '5px 10px',
                    border: 'none',
                    marginRight: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleCommentDelete(comment.id)}
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
            }
          </div>
        ))
      )}

      {access ? (
        <form onSubmit={handleCommentSubmit} style={{ marginTop: '20px' }}>
          <h4>Add a Comment:</h4>
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write your comment here..."
            style={{ width: '100%', height: '80px', marginBottom: '10px' }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#008CBA',
              color: 'white',
              padding: '10px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Submit Comment
          </button>
        </form>
      ) : (
        <p>You must be logged in to post a comment.</p>
      )}
    </div>
  );
}

export default BookDetail;
