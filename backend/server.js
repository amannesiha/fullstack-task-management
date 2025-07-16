// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import our database connection module

const app = express();
const PORT = 3001; // Backend will run on port 3001

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// --- API Endpoints ---

// 1. GET /api/tasks - Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tasks ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 2. GET /api/tasks/:id - Get a single task by ID
app.get('/api/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
        const result = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        console.error(`Error fetching task ${taskId}:`, err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 3. POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
    const { title, completed } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Task title is required.' });
    }

    try {
        const result = await db.query(
            'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
            [title, completed || false] // Default completed to false
        );
        res.status(201).json(result.rows[0]); // 201 Created
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 4. PUT /api/tasks/:id - Update an existing task (full replacement)
app.put('/api/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, completed } = req.body;

    if (!title || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Title and completed status (boolean) are required.' });
    }

    try {
        const result = await db.query(
            'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
            [title, completed, taskId]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        console.error(`Error updating task ${taskId}:`, err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 5. DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
        const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [taskId]);
        if (result.rows.length > 0) {
            res.status(204).send(); // 204 No Content for successful deletion
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (err) {
        console.error(`Error deleting task ${taskId}:`, err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});