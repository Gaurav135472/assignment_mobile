const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');

// Redis configuration
const REDIS_HOST = 'redis-14513.c253.us-central1-1.gce.redns.redis-cloud.com';
const REDIS_PORT = 14513;
const REDIS_PASSWORD = 'AmLCWBZo7jEQyTOWkCjaNswfp3nKIkhl';

// Server configuration
const PORT = 3001;

// Initialize Express app
const app = express();
app.use(cors()); // Allow CORS
app.use(express.json()); // Parse JSON request bodies

// Create a Redis client
const client = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  password: REDIS_PASSWORD,
});

// Connect to Redis and handle connection events
client.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1); // Exit if Redis connection fails
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis successfully!');
});

client.on('ready', () => {
  console.log('Redis client is ready to use.');
});

// Redis key to store the to-do list
const TODO_KEY = 'todos';

// Helper functions
const getTodos = async () => {
  try {
    const todos = await client.get(TODO_KEY);
    return todos ? JSON.parse(todos) : [];
  } catch (err) {
    console.error('Error fetching to-do list:', err);
    throw new Error('Error fetching to-do list');
  }
};

const saveTodos = async (todos) => {
  try {
    await client.set(TODO_KEY, JSON.stringify(todos));
  } catch (err) {
    console.error('Error saving to-do list:', err);
    throw new Error('Error saving to-do list');
  }
};

// API endpoints
app.get('/get-todo', async (req, res) => {
  try {
    const todos = await getTodos();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch to-do list' });
  }
});

app.post('/add-todo', async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  try {
    const todos = await getTodos();
    const newTodo = { id: todos.length + 1, task, completed: false };
    todos.push(newTodo);
    await saveTodos(todos);
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to-do item' });
  }
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
