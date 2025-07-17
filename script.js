// frontend/script.js

const API_BASE_URL = 'http://localhost:3001/api/tasks'; // Points to your backend

// Function to fetch and render tasks
async function fetchTasks() {
    const tasksListDiv = document.getElementById('tasks-list');
    tasksListDiv.innerHTML = 'Loading tasks...'; // Show loading state
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tasksListDiv.innerHTML = '<p style="color: red;">Failed to load tasks. Is the backend server running and connected to PostgreSQL?</p>';
    }
}

// Function to render tasks to the DOM
function renderTasks(tasks) {
    const tasksListDiv = document.getElementById('tasks-list');
    tasksListDiv.innerHTML = ''; // Clear previous tasks

    if (tasks.length === 0) {
        tasksListDiv.innerHTML = '<p>No tasks found in the database. Add one!</p>';
        return;
    }

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        taskItem.innerHTML = `
            <span>${task.id}. ${task.title}</span>
            <div>
                <button onclick="toggleTaskCompletion(${task.id}, ${!task.completed})">
                    ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        tasksListDiv.appendChild(taskItem);
    });
}

// Function to add a new task
async function addNewTask() {
    const newTaskTitleInput = document.getElementById('newTaskTitle');
    const title = newTaskTitleInput.value.trim();

    if (!title) {
        alert('Task title cannot be empty!');
        return;
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title, completed: false }) // New tasks are incomplete by default
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        newTaskTitleInput.value = ''; // Clear input field
        fetchTasks(); // Refresh the task list
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task. Check the browser console and backend logs for details.');
    }
}

// Function to toggle task completion status
async function toggleTaskCompletion(id, currentCompletedStatus) {
    // First, get the full task details to ensure we have the original title
    let taskToUpdate;
    try {
        const getResponse = await fetch(`${API_BASE_URL}/${id}`);
        if (!getResponse.ok) {
            throw new Error(`Failed to fetch task for update: ${getResponse.status}`);
        }
        taskToUpdate = await getResponse.json();
    } catch (error) {
        console.error('Error fetching task for toggle:', error);
        alert('Could not retrieve task details for update.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT', // Use PUT to replace the entire resource
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: taskToUpdate.title, // Keep original title
                completed: currentCompletedStatus // Set new completed status
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchTasks(); // Refresh the task list
    } catch (error) {
        console.error('Error updating task completion:', error);
        alert('Failed to update task completion. Check console for details.');
    }
}

// Function to delete a task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task? This action is permanent.')) {
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            // A 204 No Content response is expected for success.
            // If the task wasn't found (e.g., already deleted), backend sends 404.
            if (response.status === 404) {
                 alert('Task not found. It might have already been deleted.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        fetchTasks(); // Refresh the task list
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Check console for details.');
    }
}

// Fetch tasks when the page loads
document.addEventListener('DOMContentLoaded', fetchTasks);