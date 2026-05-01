import { useEffect, useState } from "react";
import { getDashboardStatsAPI } from "../api/dashboardAPI";
import StatsCard from "../components/dashboard/StatsCard";
import Navbar from "../components/shared/Navbar";
import { formatDate, isOverdue } from "../utils/helpers";

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDashboardStatsAPI();
        setData(res.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const styles = {
    page: { minHeight: "100vh", background: "#f7fafc" },
    container: { maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem" },
    heading: { fontSize: "1.5rem", fontWeight: "700", color: "#1a202c", marginBottom: "0.25rem" },
    subheading: { color: "#718096", fontSize: "0.9rem", marginBottom: "2rem" },
    statsRow: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" },
    section: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" },
    sectionTitle: { fontSize: "1rem", fontWeight: "600", color: "#2d3748", marginBottom: "1rem" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
    th: { textAlign: "left", padding: "8px 12px", background: "#f7fafc", color: "#718096", fontWeight: "600", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" },
    td: { padding: "10px 12px", borderTop: "1px solid #edf2f7", color: "#4a5568" },
    badge: (color, bg) => ({
      display: "inline-block", padding: "2px 10px", borderRadius: "99px",
      fontSize: "0.75rem", fontWeight: "600", background: bg, color: color,
    }),
    userRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid #edf2f7", fontSize: "0.875rem", color: "#4a5568" },
    bar: (pct) => ({
      height: "8px", borderRadius: "4px", background: "#3182ce",
      width: `${Math.min(pct, 100)}%`, minWidth: "4px",
    }),
    barTrack: { flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", margin: "0 12px" },
  };

  const statusStyle = (s) => {
    if (s === "done") return styles.badge("#276749", "#c6f6d5");
    if (s === "in-progress") return styles.badge("#2b6cb0", "#bee3f8");
    return styles.badge("#744210", "#fefcbf");
  };

  const priorityStyle = (p) => {
    if (p === "high") return styles.badge("#c53030", "#fff5f5");
    if (p === "medium") return styles.badge("#c05621", "#fffaf0");
    return styles.badge("#276749", "#f0fff4");
  };

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ ...styles.container, color: "#718096", paddingTop: "4rem", textAlign: "center" }}>Loading dashboard...</div>
    </div>
  );

  if (error) return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ ...styles.container, color: "#c53030", paddingTop: "4rem", textAlign: "center" }}>{error}</div>
    </div>
  );

  const maxUserTasks = data?.tasksByUser
    ? Math.max(...Object.values(data.tasksByUser), 1)
    : 1;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Dashboard</h2>
        <p style={styles.subheading}>Your team's task overview</p>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <StatsCard label="Total Projects" value={data?.totalProjects} color="#3182ce" icon="📁" />
          <StatsCard label="Total Tasks" value={data?.totalTasks} color="#805ad5" icon="📋" />
          <StatsCard label="In Progress" value={data?.inProgressTasks} color="#d69e2e" icon="⏳" />
          <StatsCard label="Completed" value={data?.doneTasks} color="#38a169" icon="✅" />
          <StatsCard label="Overdue" value={data?.overdueTasks} color="#e53e3e" icon="⚠️" />
        </div>

        {/* Tasks per user */}
        {data?.tasksByUser && Object.keys(data.tasksByUser).length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Tasks per team member</div>
            {Object.entries(data.tasksByUser).map(([name, count]) => (
              <div key={name} style={styles.userRow}>
                <span style={{ minWidth: "120px" }}>{name}</span>
                <div style={styles.barTrack}>
                  <div style={styles.bar((count / maxUserTasks) * 100)} />
                </div>
                <span style={{ minWidth: "32px", textAlign: "right", fontWeight: "600" }}>{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent tasks */}
        {data?.recentTasks?.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Recent tasks</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Project</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Due</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTasks.map((task) => (
                  <tr key={task._id}>
                    <td style={styles.td}>{task.title}</td>
                    <td style={styles.td}>{task.project?.name || "—"}</td>
                    <td style={styles.td}><span style={statusStyle(task.status)}>{task.status}</span></td>
                    <td style={styles.td}><span style={priorityStyle(task.priority)}>{task.priority}</span></td>
                    <td style={{
                      ...styles.td,
                      color: isOverdue(task.dueDate, task.status) ? "#e53e3e" : "#4a5568",
                    }}>
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;