import { useState } from 'react';

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    if (editedTitle.trim() === '') return;
    onEdit(task._id, editedTitle);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-4 py-3 mb-2 shadow-sm">
      {isEditing ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-2 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          autoFocus
        />
      ) : (
        <span
          onClick={() => onToggle(task)}
          className={`cursor-pointer flex-1 ${
            task.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {task.title}
        </span>
      )}

      <div className="flex gap-2 ml-3">
        {isEditing ? (
          <button onClick={handleSave} className="text-green-600 hover:text-green-800 text-sm font-medium">
            Save
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            Edit
          </button>
        )}
        <button onClick={() => onDelete(task._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;