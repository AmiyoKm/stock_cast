import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080/v1"
    : (process.env.NEXT_PUBLIC_API_BASE_URL) + "/v1";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            toast.error("Session expired", {
                description: "Your session has expired. Please log in again.",
                action: {
                    label: "Go to Login",
                    onClick: () => window.location.href = '/login',
                },
            });
        }

        return Promise.reject(error);
    }
);

const REALTIME_API_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:4000/v1/dse"
    : (process.env.NEXT_PUBLIC_REALTIME_API_BASE_URL) + "/v1/dse";

export const realtimeAxiosInstance = axios.create({
    baseURL: REALTIME_API_BASE_URL,
});

// realtimeAxiosInstance.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             config.headers["Authorization"] = `Bearer ${token}`;
//         } else {
//             window.location.href = '/login';
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// realtimeAxiosInstance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             localStorage.removeItem("token");
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export default axiosInstance;
