import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const styles = {
  nav: {
    background: "#1a202c",
    color: "#fff",
    padding: "0 2rem",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontWeight: "700",
    fontSize: "1.1rem",
    color: "#63b3ed",
  },
  links: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  link: {
    color: "#cbd5e0",
    fontSize: "0.9rem",
    transition: "color 0.2s",
  },
  btn: {
    background: "#e53e3e",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  userTag: {
    color: "#a0aec0",
    fontSize: "0.85rem",
  },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>📋 TaskManager</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>
        <Link to="/tasks" style={styles.link}>Tasks</Link>
        {user?.role === "admin" && (
          <Link to="/admin" style={{ ...styles.link, color: "#f6ad55" }}>⚙ Admin</Link>
        )}
        <span style={styles.userTag}>👤 {user?.name} ({user?.role})</span>
        <button style={styles.btn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;