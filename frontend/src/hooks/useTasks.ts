import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Task, FilterType } from '../types/index';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string;
  page: number;
  totalPages: number;
  addTask: (title: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  editTask: (id: string, newTitle: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  goToPage: (pageNum: number) => Promise<void>;
}

function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchTasks = async (pageNum: number = page): Promise<void> => {
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

  const addTask = async (title: string): Promise<void> => {
    await API.post('/tasks', { title });
    fetchTasks(1);
  };

  const toggleTask = async (task: Task): Promise<void> => {
    const res = await API.put(`/tasks/${task._id}`, { completed: !task.completed });
    setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
  };

  const editTask = async (id: string, newTitle: string): Promise<void> => {
    const res = await API.put(`/tasks/${id}`, { title: newTitle });
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
  };

  const deleteTask = async (id: string): Promise<void> => {
    await API.delete(`/tasks/${id}`);
    fetchTasks(page);
  };

  return {
    tasks, loading, error, page, totalPages,
    addTask, toggleTask, editTask, deleteTask,
    goToPage: fetchTasks,
  };
}

export default useTasks;