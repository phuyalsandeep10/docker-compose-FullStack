require('dotenv').config(); // Load .env variables early

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
}));

app.use(bodyParser.json());

let db;

async function initDb() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || localhost,
      user: process.env.DB_USER || dockerhub,
      password: process.env.DB_PASSWORD || sandy123,
      database: process.env.DB_NAME || docker,
      port: process.env.MYSQL_PORT || 3306,
    });
    console.log('✅ Connected to MySQL');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.execute(createTableQuery);
    console.log('✅ Todos table is ready');
  } catch (err) {
    console.error('❌ MySQL connection or setup failed:', err.message);
    process.exit(1);
  }
}

// Routes
app.get('/api/todos', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/todos', async (req, res, next) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const [result] = await db.execute('INSERT INTO todos (title) VALUES (?)', [title]);
    res.status(201).json({ id: result.insertId, title, completed: false });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    await db.execute('DELETE FROM todos WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

app.put('/api/todos/:id', async (req, res, next) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    await db.execute('UPDATE todos SET title = ? WHERE id = ?', [title, req.params.id]);
    res.json({ id: req.params.id, title });
  } catch (err) {
    next(err);
  }
});

app.patch('/api/todos/:id/completed', async (req, res, next) => {
  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  try {
    const [result] = await db.execute('UPDATE todos SET completed = ? WHERE id = ?', [completed, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({ id: Number(req.params.id), completed });
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.send('✅ Server is healthy');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

(async () => {
  await initDb();
  app.listen(port, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  });
})();
