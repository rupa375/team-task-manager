const validateSignup = (name, email, password) => {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Please provide a valid email");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
};

const validateTask = (title, status, priority) => {
  const errors = [];

  if (!title || title.trim().length < 1) {
    errors.push("Task title is required");
  }

  const validStatuses = ["todo", "in-progress", "done"];
  if (status && !validStatuses.includes(status)) {
    errors.push("Invalid status value");
  }

  const validPriorities = ["low", "medium", "high"];
  if (priority && !validPriorities.includes(priority)) {
    errors.push("Invalid priority value");
  }

  return errors;
};

module.exports = { validateSignup, validateTask };