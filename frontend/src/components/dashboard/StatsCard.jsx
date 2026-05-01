const StatsCard = ({ label, value, color = "#3182ce", icon }) => {
  const styles = {
    card: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "1.25rem 1.5rem",
      flex: "1",
      minWidth: "140px",
      borderTop: `4px solid ${color}`,
    },
    icon: {
      fontSize: "1.5rem",
      marginBottom: "0.5rem",
    },
    value: {
      fontSize: "2rem",
      fontWeight: "700",
      color: color,
      lineHeight: 1,
      marginBottom: "0.4rem",
    },
    label: {
      fontSize: "0.85rem",
      color: "#718096",
      fontWeight: "500",
    },
  };

  return (
    <div style={styles.card}>
      {icon && <div style={styles.icon}>{icon}</div>}
      <div style={styles.value}>{value ?? "—"}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
};

export default StatsCard;