import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (!newTitle.trim()) return;
    setLoading(true);
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
      if (!res.ok) throw new Error('Failed to update todo');
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

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>to-do-app</h1>
      <input
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
        placeholder="Enter new todo"
        onKeyDown={e => e.key === 'Enter' && addTodo()}
        disabled={loading}
      />
      <button onClick={addTodo} disabled={loading || !newTitle.trim()}>
        Add
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              margin: '10px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => toggleCompleted(todo.id, todo.completed)}
              title="Toggle completed"
            >
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: 10 }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
