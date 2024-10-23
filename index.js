const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Allows parsing of JSON bodies in requests

// Basic GET route
app.get('/api', (req, res) => {
  res.send('Welcome to my API!');
});

// Basic POST route
app.post('/api/data', (req, res) => {
  const { name, age } = req.body;
  if (!name || !age) {
    return res.status(400).json({ message: 'Name and age are required' });
  }
  res.json({ message: `Hello, ${name}. You are ${age} years old.` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});