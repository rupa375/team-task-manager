// frontend/src/pages/AdminPage.jsx
import { useState } from "react";
import Navbar from "../components/shared/Navbar";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const s = {
  page: { minHeight: "100vh", background: "#f7fafc" },
  container: { maxWidth: "700px", margin: "0 auto", padding: "2rem 1.5rem" },
  heading: { fontSize: "1.5rem", fontWeight: "700", color: "#1a202c", marginBottom: "0.25rem" },
  subheading: { color: "#718096", fontSize: "0.9rem", marginBottom: "2rem" },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "1rem" },
  row: { display: "flex", gap: "0.75rem", alignItems: "center" },
  input: { flex: 1, padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem", outline: "none" },
  btn: { padding: "9px 18px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" },
  successBox: { color: "#276749", background: "#c6f6d5", border: "1px solid #9ae6b4", borderRadius: "8px", padding: "10px 14px", fontSize: "0.875rem", marginTop: "1rem" },
  errorBox: { color: "#c53030", background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "8px", padding: "10px 14px", fontSize: "0.875rem", marginTop: "1rem" },
  infoBox: { background: "#ebf8ff", border: "1px solid #bee3f8", borderRadius: "8px", padding: "1rem", fontSize: "0.875rem", color: "#2b6cb0", lineHeight: "1.6" },
  roleBadge: (role) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "99px",
    fontSize: "0.75rem",
    fontWeight: "600",
    background: role === "admin" ? "#ebf8ff" : "#f0fff4",
    color: role === "admin" ? "#2b6cb0" : "#276749",
  }),
};

const AdminPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handlePromote = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSuccess("");
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.patch("/auth/promote", { email: email.trim() });
      setSuccess(res.data.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>
        <h2 style={s.heading}>Admin Panel</h2>
        <p style={s.subheading}>Manage roles and permissions</p>

        {/* Logged in as */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Your Account</div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: "2rem" }}>👤</div>
            <div>
              <div style={{ fontWeight: "600", color: "#2d3748" }}>{user?.name}</div>
              <div style={{ color: "#718096", fontSize: "0.875rem" }}>{user?.email}</div>
              <span style={s.roleBadge(user?.role)}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Role info */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Role Permissions</div>
          <div style={s.infoBox}>
            <strong>Admin</strong> — Create tasks, delete tasks, manage project members,
            assign tasks to anyone, access this Admin Panel, promote other users to admin.<br /><br />
            <strong>Member</strong> — View projects they belong to, see only their assigned tasks,
            update the status of their assigned tasks only. Cannot create, delete, or reassign tasks.
          </div>
        </div>

        {/* Promote user */}
        <div style={s.card}>
          <div style={s.sectionTitle}>Promote User to Admin</div>
          <p style={{ color: "#718096", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Enter the email address of a registered user to give them admin privileges.
          </p>
          <form onSubmit={handlePromote}>
            <div style={s.row}>
              <input
                style={s.input}
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button style={s.btn} disabled={loading}>
                {loading ? "Promoting..." : "Promote to Admin"}
              </button>
            </div>
            {success && <div style={s.successBox}>✅ {success}</div>}
            {error && <div style={s.errorBox}>❌ {error}</div>}
          </form>
        </div>

        {/* How to make first admin */}
        <div style={s.card}>
          <div style={s.sectionTitle}>How to Make Your First Admin</div>
          <div style={s.infoBox}>
            New signups are always <strong>member</strong> by default. To create your first admin,
            go to <strong>MongoDB Atlas</strong> → your <code>taskmanager</code> database →
            <code>users</code> collection → find your user document → change <code>role</code> from
            <code>"member"</code> to <code>"admin"</code> → save. Then log out and log back in.
            After that you can use this panel to promote others.
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;