export const formatDate = (dateStr) => {
  if (!dateStr) return "No due date";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const isOverdue = (dateStr, status) => {
  if (!dateStr || status === "done") return false;
  return new Date(dateStr) < new Date();
};

export const getPriorityColor = (priority) => {
  const colors = { high: "#e53e3e", medium: "#dd6b20", low: "#38a169" };
  return colors[priority] || "#718096";
};

export const getStatusColor = (status) => {
  const colors = {
    "todo": "#718096",
    "in-progress": "#3182ce",
    "done": "#38a169",
  };
  return colors[status] || "#718096";
};

export const getStatusLabel = (status) => {
  const labels = {
    "todo": "To Do",
    "in-progress": "In Progress",
    "done": "Done",
  };
  return labels[status] || status;
};