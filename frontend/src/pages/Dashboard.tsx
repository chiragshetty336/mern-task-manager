import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import useTasks from "../hooks/useTasks";
import TaskItem from "../components/TaskItem";

function Dashboard() {
  const { tasks, loading, error, page, totalPages, addTask, toggleTask, editTask, deleteTask, goToPage } = useTasks();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask(title);
    setTitle("");
  };

  const filters = ["all", "active", "completed"];

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#3B0764", margin: 0 }}>
          Welcome back, {user}
        </h1>
        <p style={{ color: "#7C3AED", fontSize: "14px", marginTop: "4px" }}>
          Manage your tasks below
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #E9D5FF" }}>
        <form onSubmit={handleAddTask} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid #DDD6FE",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#7C3AED",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </form>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid #DDD6FE",
                background: filter === f ? "#7C3AED" : "#fff",
                color: filter === f ? "#fff" : "#7C3AED",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: "20px" }}>Loading tasks...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "#EF4444", padding: "20px" }}>{error}</p>
        ) : filteredTasks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: "20px" }}>No tasks yet. Add one above!</p>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
          ))
        )}

        {!loading && !error && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" }}>
            <button onClick={() => goToPage(page - 1)} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #DDD6FE", background: "#fff", color: "#7C3AED", cursor: "pointer", opacity: page === 1 ? 0.4 : 1 }}>Previous</button>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>Page {page} of {totalPages}</span>
            <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #DDD6FE", background: "#fff", color: "#7C3AED", cursor: "pointer", opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
