import axios from "axios";
import type { User, BusinessProfile, WizardData } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ap_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ap_token");
      localStorage.removeItem("ap_user");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<{ user: User; token: string }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>("/auth/login", data),
  me: () => api.get<{ user: User }>("/auth/me"),
};

export const businessApi = {
  create: (data: WizardData) => api.post<{ profile: BusinessProfile }>("/business", data),
  list: () => api.get<{ profiles: BusinessProfile[] }>("/business"),
  get: (id: string) => api.get<{ profile: BusinessProfile }>(`/business/${id}`),
  delete: (id: string) => api.delete(`/business/${id}`),
};

export const analyzeApi = {
  run: (profileId: string) => api.post<{ profile: BusinessProfile }>(`/analyze/${profileId}`),
};

export default api;
