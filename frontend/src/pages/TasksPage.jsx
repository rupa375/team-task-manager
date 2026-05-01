import { useEffect, useState } from "react";
import { getMyTasksAPI, updateTaskAPI, deleteTaskAPI } from "../api/taskAPI";
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
  editBtn: { padding: "4px 10px", fontSize: "0.8rem", background: "#ebf8ff", color: "#2b6cb0", border: "1px solid #bee3f8", borderRadius: "6px", cursor: "pointer" },
  empty: { color: "#a0aec0", fontSize: "0.9rem", padding: "3rem", textAlign: "center" },
  errorBox: { color: "#c53030", background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "8px", padding: "10px", marginBottom: "1rem", fontSize: "0.85rem" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: "14px", padding: "2rem", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalTitle: { fontSize: "1.1rem", fontWeight: "700", color: "#1a202c", marginBottom: "1.25rem" },
  label: { display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568", marginBottom: "0.3rem" },
  input: { width: "100%", padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none", resize: "vertical", minHeight: "70px", boxSizing: "border-box" },
  modalSelect: { width: "100%", padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", background: "#fff", outline: "none" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  saveBtn: { padding: "9px 20px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer" },
  cancelBtn: { padding: "9px 20px", background: "#edf2f7", color: "#4a5568", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer" },
};

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyTasksAPI(); // ← FIXED: was getTasksAPI() with no projectId
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

  const openEdit = (task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    setEditLoading(true);
    try {
      const res = await updateTaskAPI(editTask._id, editForm);
      setTasks((prev) => prev.map((t) => t._id === editTask._id ? { ...t, ...res.data } : t));
      setEditTask(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    } finally {
      setEditLoading(false);
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
          const isAdmin = user?.role === "admin";
          const isAssignedToMe = task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
          const canChangeStatus = isAdmin || isAssignedToMe;
          return (
            <div key={task._id} style={s.taskCard}>
              <div style={s.taskHeader}>
                <div>
                  <div style={s.taskTitle}>{task.title}</div>
                  {task.project?.name && <div style={s.projectName}>📁 {task.project.name}</div>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {canChangeStatus ? (
                    <select
                      style={s.statusSelect}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  ) : (
                    <span style={{ ...s.pill("#718096"), fontSize: "0.8rem" }}>{task.status}</span>
                  )}
                  {isAdmin && (
                    <button style={s.editBtn} onClick={() => openEdit(task)}>Edit</button>
                  )}
                  {isAdmin && (
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

      {editTask && (
        <div style={s.overlay} onClick={() => setEditTask(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>✏️ Edit Task</div>
            <form onSubmit={handleEditSave}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={s.label}>Title *</label>
                <input
                  style={s.input}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={s.label}>Description</label>
                <textarea
                  style={s.textarea}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div style={{ ...s.formGrid, marginBottom: "0.75rem" }}>
                <div>
                  <label style={s.label}>Status</label>
                  <select
                    style={s.modalSelect}
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Priority</label>
                  <select
                    style={s.modalSelect}
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Due Date</label>
                  <input
                    style={s.input}
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="button" style={s.cancelBtn} onClick={() => setEditTask(null)}>
                  Cancel
                </button>
                <button type="submit" style={s.saveBtn} disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;