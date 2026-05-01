import { useState, useEffect } from "react";
import { getTasksAPI } from "../api/taskAPI";

const useTasks = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await getTasksAPI(projectId);
      setTasks(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return { tasks, loading, error, refetch: fetchTasks };
};

export default useTasks;