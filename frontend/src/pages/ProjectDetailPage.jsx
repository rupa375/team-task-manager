import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectByIdAPI, addMemberAPI, removeMemberAPI } from "../api/projectAPI";
import { getTasksAPI, createTaskAPI, updateTaskAPI, deleteTaskAPI } from "../api/taskAPI";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/shared/Navbar";
import { formatDate, isOverdue, getPriorityColor, getStatusLabel } from "../utils/helpers";

const s = {
  page: { minHeight: "100vh", background: "#f7fafc" },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem" },
  back: { color: "#3182ce", fontSize: "0.875rem", cursor: "pointer", marginBottom: "1rem", display: "inline-block", background: "none", border: "none", padding: 0 },
  heading: { fontSize: "1.5rem", fontWeight: "700", color: "#1a202c", marginBottom: "0.25rem" },
  desc: { color: "#718096", fontSize: "0.9rem", marginBottom: "2rem" },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "1rem" },
  memberRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #edf2f7", fontSize: "0.875rem" },
  memberInfo: { display: "flex", flexDirection: "column" },
  memberName: { fontWeight: "500", color: "#2d3748" },
  memberEmail: { color: "#a0aec0", fontSize: "0.8rem" },
  badge: (isAdmin) => ({ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "99px", background: isAdmin ? "#ebf8ff" : "#f0fff4", color: isAdmin ? "#2b6cb0" : "#276749", fontWeight: "600" }),
  removeBtn: { padding: "4px 12px", fontSize: "0.8rem", background: "#fff5f5", color: "#c53030", border: "1px solid #fed7d7", borderRadius: "6px", cursor: "pointer" },
  addRow: { display: "flex", gap: "0.75rem", marginTop: "1rem" },
  input: { flex: 1, padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none" },
  primaryBtn: { padding: "9px 18px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  label: { display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568", marginBottom: "0.3rem" },
  select: { width: "100%", padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", background: "#fff", outline: "none" },
  textarea: { width: "100%", padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none", resize: "vertical", minHeight: "60px", boxSizing: "border-box" },
  taskCard: { border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", marginBottom: "0.75rem", background: "#fff" },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" },
  taskTitle: { fontWeight: "600", color: "#2d3748", fontSize: "0.95rem" },
  taskMeta: { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.5rem" },
  pill: (color) => ({ fontSize: "0.75rem", padding: "2px 9px", borderRadius: "99px", fontWeight: "600", background: color + "22", color: color }),
  statusSelect: { fontSize: "0.8rem", padding: "4px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", cursor: "pointer" },
  deleteBtn: { padding: "4px 10px", fontSize: "0.8rem", background: "#fff5f5", color: "#c53030", border: "1px solid #fed7d7", borderRadius: "6px", cursor: "pointer" },
  dueDate: (overdue) => ({ fontSize: "0.8rem", color: overdue ? "#e53e3e" : "#a0aec0" }),
  errorBox: { color: "#c53030", background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "8px", padding: "10px", marginBottom: "1rem", fontSize: "0.85rem" },
  emptyMsg: { color: "#a0aec0", fontSize: "0.875rem", padding: "1rem 0" },
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "", description: "", dueDate: "", priority: "medium", assignedTo: "",
  });
  const [taskError, setTaskError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        getProjectByIdAPI(id),
        getTasksAPI(id),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      setError("Failed to load project.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const isAdmin = project?.admin?._id === user?._id || project?.admin === user?._id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setMemberError("");
    setMemberLoading(true);
    try {
      await addMemberAPI(id, memberEmail.trim());
      setMemberEmail("");
      fetchAll();
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await removeMemberAPI(id, memberId);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleTaskChange = (e) =>
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) { setTaskError("Task title is required"); return; }
    setTaskError("");
    setTaskLoading(true);
    try {
      const payload = { ...taskForm, project: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await createTaskAPI(payload);
      setTaskForm({ title: "", description: "", dueDate: "", priority: "medium", assignedTo: "" });
      fetchAll();
    } catch (err) {
      setTaskError(err.response?.data?.message || "Failed to create task");
    } finally {
      setTaskLoading(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskAPI(taskId, { status });
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status } : t));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTaskAPI(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  if (loading) return <div style={s.page}><Navbar /><div style={{ ...s.container, paddingTop: "4rem", color: "#718096", textAlign: "center" }}>Loading...</div></div>;
  if (error || !project) return <div style={s.page}><Navbar /><div style={{ ...s.container, paddingTop: "4rem" }}><div style={s.errorBox}>{error || "Project not found."}</div></div></div>;

  const allMembers = [
    { ...project.admin, role: "Admin" },
    ...(project.members || []).filter(m => m._id !== project.admin?._id).map(m => ({ ...m, role: "Member" })),
  ];

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <button style={s.back} onClick={() => navigate("/projects")}>← Back to Projects</button>
        <h2 style={s.heading}>{project.name}</h2>
        <p style={s.desc}>{project.description || "No description"}</p>

        {/* Members section */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Team Members</div>
          {allMembers.map((m) => (
            <div key={m._id} style={s.memberRow}>
              <div style={s.memberInfo}>
                <span style={s.memberName}>{m.name}</span>
                <span style={s.memberEmail}>{m.email}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={s.badge(m.role === "Admin")}>{m.role}</span>
                {isAdmin && m.role !== "Admin" && (
                  <button style={s.removeBtn} onClick={() => handleRemoveMember(m._id)}>Remove</button>
                )}
              </div>
            </div>
          ))}

          {isAdmin && (
            <form onSubmit={handleAddMember}>
              <div style={s.addRow}>
                <input
                  style={s.input}
                  type="email"
                  placeholder="Add member by email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
                <button style={s.primaryBtn} disabled={memberLoading}>
                  {memberLoading ? "Adding..." : "Add Member"}
                </button>
              </div>
              {memberError && <p style={{ color: "#c53030", fontSize: "0.85rem", marginTop: "0.5rem" }}>{memberError}</p>}
            </form>
          )}
        </div>

        {/* Create task form */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Create Task</div>
          <form onSubmit={handleCreateTask}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={s.label}>Title *</label>
              <input style={{ ...s.input, width: "100%", boxSizing: "border-box" }} name="title" placeholder="Task title" value={taskForm.title} onChange={handleTaskChange} required />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} name="description" placeholder="Optional description" value={taskForm.description} onChange={handleTaskChange} />
            </div>
            <div style={s.formGrid}>
              <div>
                <label style={s.label}>Due Date</label>
                <input style={{ ...s.input, width: "100%", boxSizing: "border-box" }} type="date" name="dueDate" value={taskForm.dueDate} onChange={handleTaskChange} />
              </div>
              <div>
                <label style={s.label}>Priority</label>
                <select style={s.select} name="priority" value={taskForm.priority} onChange={handleTaskChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label style={s.label}>Assign To</label>
                <select style={s.select} name="assignedTo" value={taskForm.assignedTo} onChange={handleTaskChange}>
                  <option value="">Unassigned</option>
                  {allMembers.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {taskError && <p style={{ color: "#c53030", fontSize: "0.85rem", marginTop: "0.5rem" }}>{taskError}</p>}
            <button style={{ ...s.primaryBtn, marginTop: "1rem" }} disabled={taskLoading}>
              {taskLoading ? "Creating..." : "+ Add Task"}
            </button>
          </form>
        </div>

        {/* Task list */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Tasks ({tasks.length})</div>
          {tasks.length === 0 && <p style={s.emptyMsg}>No tasks yet. Create one above.</p>}
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const canDelete = isAdmin || task.createdBy === user?._id;
            return (
              <div key={task._id} style={s.taskCard}>
                <div style={s.taskHeader}>
                  <span style={s.taskTitle}>{task.title}</span>
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
                    {canDelete && (
                      <button style={s.deleteBtn} onClick={() => handleDeleteTask(task._id)}>Delete</button>
                    )}
                  </div>
                </div>
                {task.description && <p style={{ fontSize: "0.875rem", color: "#718096", margin: "0.25rem 0" }}>{task.description}</p>}
                <div style={s.taskMeta}>
                  <span style={s.pill(getPriorityColor(task.priority))}>{task.priority}</span>
                  {task.assignedTo && <span style={{ fontSize: "0.8rem", color: "#718096" }}>👤 {task.assignedTo.name || "Assigned"}</span>}
                  {task.dueDate && <span style={s.dueDate(overdue)}>{overdue ? "⚠ " : ""}Due: {formatDate(task.dueDate)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;