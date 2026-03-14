import axios from "axios";

/*
 Base API URL
 If .env variable exists it will use that
 otherwise it will use localhost
*/
const API_URL = process.env.REACT_APP_API_URL || "https://ml-hackethon-cyberbullying.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   REQUEST INTERCEPTOR
   Adds JWT token automatically
================================ */

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");
    
    // If no token, use demo token for testing
    if (!token) {
      token = "demo_token";
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   RESPONSE INTERCEPTOR
   Handles authentication errors
================================ */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }

      // Server error
      if (error.response.status === 500) {
        console.error("Server Error:", error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

/* ================================
   AUTH APIs
================================ */

export const login = (data) => {
  return api.post("/auth/login", data);
};

export const register = (data) => {
  return api.post("/auth/register", data);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

/* ================================
   CYBERBULLYING ANALYSIS API
================================ */

export const analyzeMessage = (data) => {
  return api.post("/analyze", data);
};

/* ================================
   HISTORY APIs
================================ */

export const getHistory = () => {
  return api.get("/history");
};

/* ================================
   STATISTICS APIs
================================ */

export const getStatistics = () => {
  return api.get("/statistics");
};

/* ================================
   ALERTS APIs
================================ */

export const getAlerts = () => {
  return api.get("/alerts");
};

export const resolveAlert = (alertId) => {
  return api.post(`/alerts/${alertId}/resolve`);
};

/* ================================
   SAFETY TOOLS APIs
================================ */

export const getSafetyTools = () => {
  return api.get("/safety-tools");
};

export default api;
