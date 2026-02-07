import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory storage
global.todos = global.todos || [];

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Backend is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/api/todos', (req, res) => {
  res.status(200).json({
    success: true,
    data: global.todos,
    count: global.todos.length
  });
});

app.post('/api/todos', (req, res) => {
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

  global.todos.push(newTodo);
  res.status(201).json({ success: true, data: newTodo });
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  const todo = global.todos.find(t => t.id === id);
  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }

  if (title) todo.title = title;
  if (description !== undefined) todo.description = description;
  if (completed !== undefined) todo.completed = completed;
  todo.updatedAt = new Date().toISOString();

  res.status(200).json({ success: true, data: todo });
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = global.todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Todo not found' });
  }

  const deletedTodo = global.todos.splice(index, 1);
  res.status(200).json({ success: true, data: deletedTodo[0] });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const lowerMessage = message.toLowerCase();
  let response = '';

  if (lowerMessage.includes('add') || lowerMessage.includes('create')) {
    response = 'I can help you create a todo. Use the form to add a new task!';
  } else if (lowerMessage.includes('list') || lowerMessage.includes('show')) {
    response = `You have ${global.todos.length} todos. Use the Get Todos button to see them all.`;
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

// Handle 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

// Export for Vercel
export default app;
