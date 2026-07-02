import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useTasks from '../hooks/useTasks';
import TaskItem from '../components/TaskItem';
import { FilterType } from '../types/index';

function Dashboard() {
  const { tasks, loading, error, page, totalPages, addTask, toggleTask, editTask, deleteTask, goToPage } = useTasks();
  const [title, setTitle] = useState<string>('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAddTask = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask(title);
    setTitle('');
  };

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  const filters: FilterType[] = ['all', 'active', 'completed'];

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome, <span className="text-purple-600">{user}</span>
          </h2>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition">
            Logout
          </button>
        </div>

        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="New task..."
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">
            Add
          </button>
        </form>

        <div className="flex gap-2 mb-4">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium capitalize ${
                filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading tasks...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredTasks.length === 0 ? (
          <p className="text-center text-gray-400">No tasks yet. Add one above!</p>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={editTask}
            />
          ))
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-600 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;