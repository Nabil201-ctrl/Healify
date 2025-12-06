import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "../services/AuthService";

export const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

// ✅ Create Axios instance
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Automatically attach token before every request
api.interceptors.request.use(
    async (config) => {
        // Don't add access token to refresh endpoint (it uses refresh token instead)
        if (config.url !== '/auth/refresh') {
            const token = await AsyncStorage.getItem("accessToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Handle errors globally (optional)

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Don't retry refresh endpoint itself
        if (originalRequest.url === '/auth/refresh' || !error.response) {
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const { accessToken } = await AuthService.refreshToken();
                processQueue(null, accessToken);
                originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
                // Optionally, trigger a logout or redirect to login
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
