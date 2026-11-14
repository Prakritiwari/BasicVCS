import axios from "axios";
import { API_URL } from "./config";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthScreen = window.location.pathname.startsWith("/auth");
    if (
      error.response?.status === 401 &&
      localStorage.getItem("token") &&
      !isAuthScreen
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.assign("/auth");
    }
    return Promise.reject(error);
  }
);

export default api;
