import { useEffect, useState } from "react";
import { getTasksAPI, updateTaskAPI, deleteTaskAPI } from "../api/taskAPI";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/shared/Navbar";
import { formatDate, isOverdue, getPriorityColor } from "../utils/helpers";

const s = {
  page: { minHeight: "100vh", background: "#f7fafc" },
  container: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" },
  heading: { fontSize: "1.5rem", fontWeight: "700", color: "#1a202c", marginBottom: "0.25rem" },
  subheading: { color: "#718096", fontSize: "0.9rem", marginBottom: "2rem" },
  filterRow: { display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  select: { padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", background: "#fff", outline: "none" },
  taskCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "0.75rem" },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  taskTitle: { fontWeight: "600", color: "#2d3748", fontSize: "0.95rem" },
  projectName: { fontSize: "0.8rem", color: "#a0aec0", marginTop: "2px" },
  taskMeta: { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.6rem" },
  pill: (color) => ({ fontSize: "0.75rem", padding: "2px 9px", borderRadius: "99px", fontWeight: "600", background: color + "22", color: color }),
  statusSelect: { fontSize: "0.8rem", padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer" },
  deleteBtn: { padding: "4px 10px", fontSize: "0.8rem", background: "#fff5f5", color: "#c53030", border: "1px solid #fed7d7", borderRadius: "6px", cursor: "pointer" },
  empty: { color: "#a0aec0", fontSize: "0.9rem", padding: "3rem", textAlign: "center" },
  errorBox: { color: "#c53030", background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "8px", padding: "10px", marginBottom: "1rem", fontSize: "0.85rem" },
};

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTasksAPI();
        setTasks(res.data);
      } catch (err) {
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = tasks;
    if (statusFilter !== "all") result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter((t) => t.priority === priorityFilter);
    setFiltered(result);
  }, [tasks, statusFilter, priorityFilter]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskAPI(taskId, { status });
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status } : t));
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTaskAPI(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <h2 style={s.heading}>My Tasks</h2>
        <p style={s.subheading}>All tasks assigned to you across projects</p>

        <div style={s.filterRow}>
          <select style={s.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select style={s.select} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}
        {loading && <div style={s.empty}>Loading tasks...</div>}
        {!loading && filtered.length === 0 && <div style={s.empty}>No tasks found.</div>}

        {filtered.map((task) => {
          const overdue = isOverdue(task.dueDate, task.status);
          const isCreator = task.createdBy === user?._id || task.createdBy?._id === user?._id;
          return (
            <div key={task._id} style={s.taskCard}>
              <div style={s.taskHeader}>
                <div>
                  <div style={s.taskTitle}>{task.title}</div>
                  {task.project?.name && <div style={s.projectName}>📁 {task.project.name}</div>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <select
                    style={s.statusSelect}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  {isCreator && (
                    <button style={s.deleteBtn} onClick={() => handleDelete(task._id)}>Delete</button>
                  )}
                </div>
              </div>
              {task.description && (
                <p style={{ fontSize: "0.875rem", color: "#718096", margin: "0.4rem 0 0" }}>{task.description}</p>
              )}
              <div style={s.taskMeta}>
                <span style={s.pill(getPriorityColor(task.priority))}>{task.priority}</span>
                {task.dueDate && (
                  <span style={{ fontSize: "0.8rem", color: overdue ? "#e53e3e" : "#a0aec0" }}>
                    {overdue ? "⚠ Overdue: " : "Due: "}{formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksPage;