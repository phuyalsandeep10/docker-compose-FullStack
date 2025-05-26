import React, { useEffect, useState } from 'react';
import './App.css'; // Make sure you import your CSS file

const API_URL = process.env.REACT_APP_API_URL;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New states for editing functionality
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  async function fetchTodos() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/todos`);
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  async function addTodo() {
    if (!newTitle.trim()) {
      setError('Todo title cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      const todo = await res.json();
      setTodos(prev => [todo, ...prev]);
      setNewTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCompleted(id, completed) {
    try {
      const res = await fetch(`${API_URL}/todos/${id}/completed`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error('Failed to update todo status');
      const updated = await res.json();
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? { ...todo, completed: updated.completed } : todo))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTodo(id) {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete todo');
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  // --- New Functions for Editing ---

  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditedTitle(todo.title);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditedTitle('');
    setError(null); // Clear error on cancel
  };

  const handleSaveEdit = async (id) => {
    if (!editedTitle.trim()) {
      setError('Edited title cannot be empty.');
      return;
    }
    setError(null); // Clear error on save attempt
    setLoading(true); // Indicate loading for this specific action (could be more granular)
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PATCH', // Assuming your backend accepts PATCH for title updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle }),
      });
      if (!res.ok) throw new Error('Failed to update todo title');
      const updatedTodo = await res.json(); // Backend might return the updated todo
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? { ...todo, title: updatedTodo.title } : todo))
      );
      setEditingTodoId(null); // Exit editing mode
      setEditedTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="todo-container">
      <h1>to-do-app</h1>

      <div className="add-todo-form">
        <input
          className="todo-input"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Enter new todo"
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          disabled={loading}
        />
        <button
          className="add-button"
          onClick={addTodo}
          disabled={loading || !newTitle.trim()}
        >
          Add
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p className="loading-message">Loading...</p>}

      {!loading && !error && todos.length === 0 && (
        <p className="empty-state">No todos yet! Add one above.</p>
      )}

      <ul className="todo-list">
        {todos.map(todo => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
          >
            {/* Conditional rendering for editing mode */}
            {editingTodoId === todo.id ? (
              <div className="edit-mode-controls">
                <input
                  className="edit-input"
                  value={editedTitle}
                  onChange={e => setEditedTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveEdit(todo.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  className="save-button"
                  onClick={() => handleSaveEdit(todo.id)}
                  disabled={!editedTitle.trim()}
                >
                  Save
                </button>
                <button
                  className="cancel-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span
                  className="todo-title"
                  onClick={() => toggleCompleted(todo.id, todo.completed)} // Still toggle on click
                  onDoubleClick={() => handleEditClick(todo)} // New: Double click to edit
                  title="Double click to edit, click to toggle completed"
                >
                  {todo.title}
                </span>
                <div className="todo-actions"> {/* Group buttons */}
                    <button
                        className="edit-button" // New: Explicit Edit button
                        onClick={() => handleEditClick(todo)}
                        title="Edit todo"
                    >
                        Edit
                    </button>
                    <button
                        className="delete-button"
                        onClick={() => deleteTodo(todo.id)}
                    >
                        Delete
                    </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}