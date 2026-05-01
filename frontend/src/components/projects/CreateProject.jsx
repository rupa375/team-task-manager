import { useState } from "react";
import { createProjectAPI } from "../../api/projectAPI";

const styles = {
  form: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  title: { fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "1rem" },
  row: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: "160px",
    padding: "9px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "9px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
    resize: "vertical",
    minHeight: "70px",
    marginTop: "0.75rem",
    boxSizing: "border-box",
  },
  btn: {
    padding: "9px 20px",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  error: {
    color: "#c53030",
    fontSize: "0.85rem",
    marginTop: "0.5rem",
  },
};

const CreateProject = ({ onCreated }) => {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Project name is required"); return; }
    setError("");
    setLoading(true);
    try {
      await createProjectAPI(form);
      setForm({ name: "", description: "" });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.form}>
      <div style={styles.title}>Create New Project</div>
      <form onSubmit={handleSubmit}>
        <div style={styles.row}>
          <input
            style={styles.input}
            name="name"
            placeholder="Project name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <button style={styles.btn} disabled={loading}>
            {loading ? "Creating..." : "+ Create Project"}
          </button>
        </div>
        <textarea
          style={styles.textarea}
          name="description"
          placeholder="Project description (optional)"
          value={form.description}
          onChange={handleChange}
        />
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default CreateProject;