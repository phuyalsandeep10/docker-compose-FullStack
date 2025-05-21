require('dotenv').config(); // load .env variables at the very top

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.MYSQL_PORT || 3306,
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL!');

  // Create todos table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('❌ Failed to create todos table:', err);
      process.exit(1);
    }
    console.log('✅ Todos table checked/created.');
  });
});

// Routes

app.get('/api/todos', (req, res, next) => {
  db.query('SELECT * FROM todos ORDER BY created_at DESC', (err, results) => {
    if (err) return next(err);
    res.json(results);
  });
});

app.post('/api/todos', (req, res, next) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  db.query('INSERT INTO todos (title) VALUES (?)', [title], (err, result) => {
    if (err) return next(err);
    res.status(201).json({ id: result.insertId, title, completed: false });
  });
});

app.delete('/api/todos/:id', (req, res, next) => {
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ?', [id], (err, result) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

app.put('/api/todos/:id', (req, res, next) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  db.query('UPDATE todos SET title = ? WHERE id = ?', [title, id], (err, result) => {
    if (err) return next(err);
    res.json({ id, title });
  });
});

// PATCH route to update 'completed' status
app.patch('/api/todos/:id/completed', (req, res, next) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id], (err, result) => {
    if (err) return next(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ id: Number(id), completed });
  });
});

// Generic error handler middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Fixed: Listen on 0.0.0.0 so Docker can expose the port
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running at http://0.0.0.0:${port}`);
});

