const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory todo storage
let todos = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all todos
app.get('/todos', (req, res) => {
  res.status(200).json({
    success: true,
    data: todos,
    count: todos.length
  });
});

// Create a new todo
app.post('/todos', (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const newTodo = {
    id: uuidv4(),
    title,
    description: description || '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  res.status(201).json({ success: true, data: newTodo });
});

// Update a todo
app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const todo = todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }

  if (title) todo.title = title;
  if (description !== undefined) todo.description = description;
  if (completed !== undefined) todo.completed = completed;
  todo.updatedAt = new Date().toISOString();

  res.status(200).json({ success: true, data: todo });
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }

  const deletedTodo = todos.splice(index, 1);
  res.status(200).json({ success: true, data: deletedTodo[0], message: 'Todo deleted' });
});

// Chat endpoint
app.post('/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const lowerMessage = message.toLowerCase();
  let response = '';

  if (lowerMessage.includes('add') || lowerMessage.includes('create')) {
    response = 'I can help you create a todo. Use the form to add a new task!';
  } else if (lowerMessage.includes('list') || lowerMessage.includes('show')) {
    response = `You have ${todos.length} todos. Use the Get Todos button to see them all.`;
  } else if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
    response = 'I can help you delete a todo. Select a todo and click the delete button.';
  } else if (lowerMessage.includes('update') || lowerMessage.includes('edit')) {
    response = 'I can help you update a todo. Click the edit button on any todo.';
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    response = 'Hello! I am your Todo Chatbot. I can help you manage your tasks. What would you like to do?';
  } else {
    response = 'I understand you want to: ' + message + '. How can I help you manage your todos?';
  }

  res.status(200).json({
    success: true,
    userMessage: message,
    botResponse: response,
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
export default app;
