// import React, { useState, useEffect } from 'react';
// import './App.css';
// import TodoForm from './components/TodoForm';
// import TodoList from './components/TodoList';
// import ChatBot from './components/ChatBot';
// import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// function App() {
//   const [todos, setTodos] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchTodos();
//   }, []);

//   const fetchTodos = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(`${API_URL}/todos`);
//       setTodos(response.data.data || []);
//     } catch (err) {
//       setError('Failed to fetch todos');
//       console.error('Error fetching todos:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addTodo = async (title, description) => {
//     try {
//       const response = await axios.post(`${API_URL}/todos`, { title, description });
//       setTodos([...todos, response.data.data]);
//       setError(null);
//     } catch (err) {
//       setError('Failed to add todo');
//       console.error('Error adding todo:', err);
//     }
//   };

//   const updateTodo = async (id, updates) => {
//     try {
//       const response = await axios.put(`${API_URL}/todos/${id}`, updates);
//       setTodos(todos.map(t => t.id === id ? response.data.data : t));
//       setError(null);
//     } catch (err) {
//       setError('Failed to update todo');
//       console.error('Error updating todo:', err);
//     }
//   };

//   const deleteTodo = async (id) => {
//     try {
//       await axios.delete(`${API_URL}/todos/${id}`);
//       setTodos(todos.filter(t => t.id !== id));
//       setError(null);
//     } catch (err) {
//       setError('Failed to delete todo');
//       console.error('Error deleting todo:', err);
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>📝 Todo Chatbot</h1>
//         <p>Manage your tasks with AI assistance</p>
//       </header>

//       <div className="container">
//         <div className="main-content">
//           <div className="left-panel">
//             <TodoForm onAddTodo={addTodo} />
//             {error && <div className="error-message">{error}</div>}
//             {loading ? (
//               <div className="loading">Loading todos...</div>
//             ) : (
//               <TodoList 
//                 todos={todos} 
//                 onUpdateTodo={updateTodo}
//                 onDeleteTodo={deleteTodo}
//               />
//             )}
//           </div>

//           <div className="right-panel">
//             <ChatBot apiUrl={API_URL} todosCount={todos.length} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import ChatBot from './components/ChatBot';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetchTodos ko handle karne ke liye useCallback use kiya hai taakay performance achi rahe
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (title, description) => {
    try {
      const response = await axios.post(`${API_URL}/todos`, { title, description });
      // Purane todos mein naya todo add karna
      setTodos(prev => [...prev, response.data.data]);
      setError(null);
    } catch (err) {
      setError('Failed to add todo');
      console.error('Error adding todo:', err);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${id}`, updates);
      setTodos(prev => prev.map(t => t.id === id ? response.data.data : t));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(prev => prev.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Todo Chatbot</h1>
        <p>Manage your tasks with AI assistance</p>
      </header>

      <div className="container">
        <div className="main-content">
          <div className="left-panel">
            <TodoForm onAddTodo={addTodo} />
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
              <div className="loading">Loading todos...</div>
            ) : (
              <TodoList 
                todos={todos} 
                onUpdateTodo={updateTodo}
                onDeleteTodo={deleteTodo}
              />
            )}
          </div>

          <div className="right-panel">
            {/* ChatBot ko refreshTodos function pass kar diya gaya hai */}
            <ChatBot 
              apiUrl={API_URL} 
              todosCount={todos.length} 
              refreshTodos={fetchTodos} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;