// index.js
const express = require('express');
const app = express();
const cors = require('cors'); // To allow cross-origin requests

// Enable CORS for all routes
app.use(cors());

// Use JSON body parser middleware
app.use(express.json());

// Sample to-do list data (could be replaced with a database in real applications)
let todoList = [
    { id: 1, task: "Buy groceries", completed: false },
    { id: 2, task: "Finish homework", completed: false },
    { id: 3, task: "Clean the house", completed: true }
];

// Endpoint to get the to-do list
app.get('/get-todo', (req, res) => {
    res.json(todoList); // Return the current to-do list
});

// Endpoint to add a new to-do item
app.post('/add-todo', (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'Task is required' });
    }
    const newTask = {
        id: todoList.length + 1,
        task,
        completed: false
    };
    todoList.push(newTask);
    
    // Respond with the newly added task
    res.status(201).json(newTask);
});

// Simulate real-time updates to the to-do list by randomly toggling completion status
setInterval(() => {
    const randomIndex = Math.floor(Math.random() * todoList.length);
    todoList[randomIndex].completed = !todoList[randomIndex].completed;
    console.log('Updated todo list:', todoList); // Logs the updated list to console
}, 10000); // Every 10 seconds

// Start the server
app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
