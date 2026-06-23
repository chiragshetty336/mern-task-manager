function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-4 py-3 mb-2 shadow-sm">
      <span
        onClick={() => onToggle(task)}
        className={`cursor-pointer flex-1 ${
          task.completed ? 'line-through text-gray-400' : 'text-gray-800'
        }`}
      >
        {task.title}
      </span>
      <button
        onClick={() => onDelete(task._id)}
        className="text-red-500 hover:text-red-700 text-sm font-medium ml-3"
      >
        Delete
      </button>
    </div>
  );
}

export default TaskItem;