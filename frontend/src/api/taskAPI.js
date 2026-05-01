import axiosInstance from "./axiosInstance";
// Add this line to taskAPI.js
export const getMyTasksAPI = () => axiosInstance.get("/tasks/my");
export const getTasksAPI = (projectId) =>
  axiosInstance.get(`/tasks?projectId=${projectId}`);
export const createTaskAPI = (data) => axiosInstance.post("/tasks", data);
export const updateTaskAPI = (id, data) => axiosInstance.put(`/tasks/${id}`, data);
export const deleteTaskAPI = (id) => axiosInstance.delete(`/tasks/${id}`);