const express = require("express");
const { createClient } = require("redis");
const cors = require("cors");

const PORT = 3001;
const TODO_KEY = "todos";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Redis Client
const client = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

client.on("error", (err) => console.error("Redis Error:", err));

// Connect to Redis
(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis!");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  }
})();

// Helper Functions
const getTodos = async () => {
  try {
    const todos = await client.get(TODO_KEY);
    return todos ? JSON.parse(todos) : [];
  } catch (err) {
    console.error("Error fetching todos:", err);
    throw new Error("Failed to fetch todos");
  }
};

const saveTodos = async (todos) => {
  try {
    await client.set(TODO_KEY, JSON.stringify(todos));
  } catch (err) {
    console.error("Error saving todos:", err);
    throw new Error("Failed to save todos");
  }
};

// API Endpoints
app.get("/get-todo", async (req, res) => {
  try {
    const todos = await getTodos();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/add-todo", async (req, res) => {
  const { task } = req.body;

  if (!task) {
    return res.status(400).json({ error: "Task cannot be empty" });
  }

  try {
    const todos = await getTodos();
    const newTodo = {
      id: todos.length ? todos[todos.length - 1].id + 1 : 1,
      task,
      completed: false,
    };
    todos.push(newTodo);
    await saveTodos(todos);

    res.status(201).json(newTodo);
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

app.delete("/delete-todo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const todos = await getTodos();
    const updatedTodos = todos.filter((t) => t.id !== parseInt(id));

    if (todos.length === updatedTodos.length) {
      return res.status(404).json({ error: "Todo not found" });
    }

    await saveTodos(updatedTodos);
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.delete("/clear-todos", async (req, res) => {
  try {
    await client.del(TODO_KEY);
    res.status(200).json({ message: "All todos cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear todos" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
