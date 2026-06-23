import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskItem from '../components/TaskItem';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await API.get('/tasks');
    setTasks(res.data);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await API.post('/tasks', { title });
    setTasks([res.data, ...tasks]);
    setTitle('');
  };

  const handleToggle = async (task) => {
    const res = await API.put(`/tasks/${task._id}`, { completed: !task.completed });
    setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
  };

  const handleDelete = async (id) => {
    await API.delete(`/tasks/${id}`);
    setTasks(tasks.filter((t) => t._id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome, <span className="text-purple-600">{user}</span>
          </h2>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Add
          </button>
        </form>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-400">No tasks yet. Add one above!</p>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task._id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;