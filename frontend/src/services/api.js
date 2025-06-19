import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (usernameOrEmail, password) =>
    api.post("/auth/login", { usernameOrEmail, password }),
  signup: (username, email, password, role) =>
    api.post("/auth/signup", { username, email, password, role }),
};

export const medicationAPI = {
  getMedications: () => api.get("/medications"),
  addMedication: (medication) => api.post("/medications", medication),
  updateMedication: (id, medication) =>
    api.put(`/medications/${id}`, medication),
  deleteMedication: (id) => api.delete(`/medications/${id}`),
  markAsTaken: (medicationId, date, photo) => {
    const formData = new FormData();
    formData.append("date", date);
    if (photo) {
      formData.append("photo", photo);
    }
    return api.post(`/medications/${medicationId}/mark-taken`, formData);
  },
  getMedicationLogs: (medicationId) =>
    api.get(`/medications/${medicationId}/logs`),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

export const analyticsAPI = {
  getAdherenceData: (period = "week") =>
    api.get(`/analytics/adherence?period=${period}`),
};

export const caretakerAPI = {
  getPatients: () => api.get("/caretaker/patients"),
  addPatient: (patientUsername) =>
    api.post("/caretaker/patients", { patientUsername }),
  getPatientMedications: (patientId) =>
    api.get(`/caretaker/patients/${patientId}/medications`),
  markPatientMedicationAsTaken: (patientId, medicationId, date) =>
    api.post(
      `/caretaker/patients/${patientId}/medications/${medicationId}/mark-taken`,
      { date }
    ),
};

export const uploadAPI = {
  uploadMedicationPhoto: (medicationLogId, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("medicationLogId", medicationLogId);

    return api.post("/uploads/medication-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getMedicationPhotos: (medicationLogId) =>
    api.get(`/uploads/medication-photos/${medicationLogId}`),
};

export default api;
