import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "../auth/token";

const api = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
  withCredentials: true,            // REQUIRED for HttpOnly cookies
});

/* Attach access token */
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Auto refresh on 401 */
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          "http://localhost:8000/auth/refresh",
          {},
          { withCredentials: true }
        );

        setAccessToken(res.data.access_token);
        processQueue(null, res.data.access_token);

        original.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api(original);

      } catch (err) {
        processQueue(err);
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
