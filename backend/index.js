const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Dockerized Node.js backend!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
