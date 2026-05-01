import axiosInstance from "./axiosInstance";

export const getDashboardStatsAPI = () => axiosInstance.get("/dashboard");