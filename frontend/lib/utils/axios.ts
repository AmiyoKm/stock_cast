import axios from "axios";

const API_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080/v1"
    : process.env.API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && !config.url?.includes("users")) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const REALTIME_API_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:4000/v1/dse"
    : process.env.REALTIME_API_BASE_URL;

export const realtimeAxiosInstance = axios.create({
    baseURL: REALTIME_API_BASE_URL,
});

realtimeAxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

realtimeAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
