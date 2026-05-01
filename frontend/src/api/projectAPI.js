import axiosInstance from "./axiosInstance";

export const getProjectsAPI = () => axiosInstance.get("/projects");
export const getProjectByIdAPI = (id) => axiosInstance.get(`/projects/${id}`);
export const createProjectAPI = (data) => axiosInstance.post("/projects", data);
export const deleteProjectAPI = (id) => axiosInstance.delete(`/projects/${id}`);
export const addMemberAPI = (projectId, email) =>
  axiosInstance.post(`/projects/${projectId}/members`, { email });
export const removeMemberAPI = (projectId, memberId) =>
  axiosInstance.delete(`/projects/${projectId}/members/${memberId}`);