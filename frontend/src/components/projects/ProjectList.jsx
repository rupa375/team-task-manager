import { Link } from "react-router-dom";
import { deleteProjectAPI } from "../../api/projectAPI";
import { useAuth } from "../../context/AuthContext";

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" },
  desc: { fontSize: "0.85rem", color: "#718096", lineHeight: 1.5 },
  badge: (isAdmin) => ({
    fontSize: "0.75rem",
    padding: "2px 10px",
    borderRadius: "99px",
    fontWeight: "600",
    background: isAdmin ? "#ebf8ff" : "#f0fff4",
    color: isAdmin ? "#2b6cb0" : "#276749",
    whiteSpace: "nowrap",
  }),
  footer: { display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid #edf2f7" },
  viewBtn: {
    flex: 1,
    padding: "7px",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
  },
  deleteBtn: {
    padding: "7px 12px",
    background: "#fff5f5",
    color: "#c53030",
    border: "1px solid #feb2b2",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  empty: { color: "#a0aec0", fontSize: "0.9rem", padding: "2rem", textAlign: "center" },
  memberCount: { fontSize: "0.8rem", color: "#a0aec0" },
};

const ProjectList = ({ projects, onDeleted }) => {
  const { user } = useAuth();

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await deleteProjectAPI(id);
      if (onDeleted) onDeleted();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  if (!projects || projects.length === 0) {
    return <div style={styles.empty}>No projects yet. Create one above to get started.</div>;
  }

  return (
    <div style={styles.grid}>
      {projects.map((project) => {
        const isAdmin = project.admin?._id === user?._id || project.admin === user?._id;
        return (
          <div key={project._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.name}>{project.name}</div>
                <div style={styles.memberCount}>
                  {project.members?.length || 0} member{project.members?.length !== 1 ? "s" : ""}
                </div>
              </div>
              <span style={styles.badge(isAdmin)}>{isAdmin ? "Admin" : "Member"}</span>
            </div>
            {project.description && (
              <div style={styles.desc}>{project.description}</div>
            )}
            <div style={styles.footer}>
              <Link to={`/projects/${project._id}`} style={styles.viewBtn}>
                View Project
              </Link>
              {isAdmin && (
                <button style={styles.deleteBtn} onClick={(e) => handleDelete(project._id, e)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;