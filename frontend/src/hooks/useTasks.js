import { useState, useEffect } from 'react';
import API from '../api/axios';

function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async (pageNum = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/tasks?page=${pageNum}&limit=5`);
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages);
      setPage(res.data.currentPage);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, []);

  const addTask = async (title) => {
    await API.post('/tasks', { title });
    fetchTasks(1); // go back to page 1 to see the newest task
  };

  const toggleTask = async (task) => {
    const res = await API.put(`/tasks/${task._id}`, { completed: !task.completed });
    setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
  };

  const editTask = async (id, newTitle) => {
    const res = await API.put(`/tasks/${id}`, { title: newTitle });
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks(page); // refresh current page after delete
  };

  return {
    tasks, loading, error, page, totalPages,
    addTask, toggleTask, editTask, deleteTask,
    goToPage: fetchTasks,
  };
}

export default useTasks;