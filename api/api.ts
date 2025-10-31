import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ✅ Create Axios instance
const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://your-backend-url.com/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Automatically attach Clerk token before every request
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Handle errors globally (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
