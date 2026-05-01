import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupAPI } from "../../api/authAPI";
import { useAuth } from "../../context/AuthContext";

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
    color: "#1a202c",
  },
  subtitle: {
    color: "#718096",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  },
  label: {
    display: "block",
    marginBottom: "0.3rem",
    fontWeight: "600",
    fontSize: "0.85rem",
    color: "#4a5568",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    marginBottom: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "11px",
    background: "#3182ce",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  error: {
    background: "#fff5f5",
    color: "#c53030",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginBottom: "1rem",
    border: "1px solid #feb2b2",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.25rem",
    color: "#718096",
    fontSize: "0.875rem",
  },
  footerLink: {
    color: "#3182ce",
    fontWeight: "600",
  },
};

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await signupAPI(form);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account 🚀</h2>
        <p style={styles.subtitle}>Join your team on TaskManager</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;