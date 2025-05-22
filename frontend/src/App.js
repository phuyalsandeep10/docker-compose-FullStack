import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const fetchTodos = async () => {
    const res = await axios.get(`${API_BASE}/api/todos`);
    setTodos(res.data);
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    const res = await axios.post(`${API_BASE}/api/todos`, { title });
    setTodos([...todos, res.data]);
    setTitle('');
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_BASE}/api/todos/${id}`);
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (id) => {
    const res = await axios.put(`${API_BASE}/api/todos/${id}`, { title: editTitle });
    setTodos(todos.map(todo => (todo.id === id ? res.data : todo)));
    setEditId(null);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>✅ My Enhanced Task List</h1>

      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Add a new task here..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: '0.5rem', flex: 1, fontSize: '1rem', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <button
          onClick={addTodo}
          style={{
            marginLeft: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          ➕ Add Task
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            {editId === todo.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    fontSize: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                  }}
                />
                <button
                  onClick={() => saveEdit(todo.id)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                  }}
                >
                  💾 Save
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: '1rem' }}>{todo.title}</span>
                <button
                  onClick={() => startEdit(todo)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: '#f1c40f',
                    color: '#333',
                    border: 'none',
                    borderRadius: '5px',
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                  }}
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
