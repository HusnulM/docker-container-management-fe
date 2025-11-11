import axios from "axios";

const API_BASE = "http://localhost:3000/api/containers";

export const dockerApi = {
    list: () => axios.get(API_BASE).then((res) => res.data),
    start: (id) => axios.post(`${API_BASE}/start/${id}`),
    stop: (id) => axios.post(`${API_BASE}/stop/${id}`),
    restart: (id) => axios.post(`${API_BASE}/restart/${id}`),
    remove: (id) => axios.delete(`${API_BASE}/remove/${id}`),
    logs: (id) => axios.get(`${API_BASE}/logs/${id}`).then((res) => res.data),
};
