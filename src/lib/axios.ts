import Axios from "axios";

// Base URL priority:
// 1) Vite env var VITE_API_URL
// 2) Window env (if injected) window.__API_URL__
// 3) Fallback to http://localhost:8000
const baseURL =
    import.meta.env?.VITE_API_URL ||
    (typeof window !== "undefined" && (window as any).__API_URL__) ||
    "http://localhost:8000";

export const api = Axios.create({
    baseURL,
    withCredentials: true,
});

// Optional: common interceptors (helpful for auth, errors, logs)
// Add Clerk session token (if available) to all requests
api.interceptors.request.use(
    async (config) => {
        try {
            // Only attempt in browser environments
            if (typeof window !== "undefined") {
                const clerk = (window as any).Clerk;
                const token = await clerk?.session?.getToken?.();
                if (token) {
                    config.headers = config.headers ?? {};
                    (config.headers as any)[
                        "Authorization"
                    ] = `Bearer ${token}`;
                }
            }
        } catch (e) {
            // Silently ignore token errors; request proceeds without auth header
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => res,
    (error) => {
        // You can centralize API error logging/formatting here
        return Promise.reject(error);
    }
);

export default api;
