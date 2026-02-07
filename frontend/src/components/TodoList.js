import React, { useState } from 'react';
import './TodoList.css';

function TodoList({ todos, onUpdateTodo, onDeleteTodo }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const handleEditSave = async (id) => {
    if (editTitle.trim()) {
      await onUpdateTodo(id, { title: editTitle });
      setEditingId(null);
    }
  };

  const handleToggle = async (todo) => {
    await onUpdateTodo(todo.id, { completed: !todo.completed });
  };

  return (
    <div className="todo-list">
      <h2>📋 Your Todos</h2>
      {todos.length === 0 ? (
        <div className="empty-state">
          <p>No todos yet. Create one to get started!</p>
        </div>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                  className="todo-checkbox"
                />
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    className="todo-edit-input"
                    onBlur={() => handleEditSave(todo.id)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleEditSave(todo.id);
                    }}
                  />
                ) : (
                  <div className="todo-text">
                    <span className="todo-title">{todo.title}</span>
                    {todo.description && (
                      <span className="todo-description">{todo.description}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="todo-actions">
                <button
                  onClick={() => handleEditStart(todo)}
                  className="btn-edit"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="btn-delete"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;
