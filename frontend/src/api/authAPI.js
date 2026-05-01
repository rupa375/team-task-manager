import axiosInstance from "./axiosInstance";

export const signupAPI = (data) => axiosInstance.post("/auth/signup", data);
export const loginAPI = (data) => axiosInstance.post("/auth/login", data);
export const getMeAPI = () => axiosInstance.get("/auth/me");