/**
 * axiosInstance.js — Central HTTP client configuration
 *
 * BEGINNER TIP:
 *   Axios is a library that makes HTTP requests easier than the
 *   built-in fetch() API. Instead of repeating the base URL and
 *   headers in every API call, we create one shared "instance"
 *   with defaults already set.
 *
 * INTERCEPTORS:
 *   Think of interceptors as middleware for HTTP requests.
 *   The request interceptor below runs BEFORE every request is sent.
 *   It reads the JWT access token from localStorage and attaches it
 *   to the Authorization header automatically.
 *
 *   Without this, you'd have to manually add:
 *     headers: { Authorization: `Bearer ${token}` }
 *   to EVERY single API call. The interceptor removes that repetition.
 */

import axios from 'axios';

// Create an axios instance with a base URL pointing at our Django backend.
const api = axios.create({
  baseURL: 'http://localhost:8000/api',   // all paths are relative to this
});

// ------------------------------------------------------------------
// Request Interceptor — attach JWT token to every outgoing request
// ------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    // Read the access token stored after login
    const token = localStorage.getItem('access_token');

    if (token) {
      // Attach it as a Bearer token in the Authorization header.
      // Django / DRF reads this header and identifies the user.
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;   // always return the (possibly modified) config
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------------------
// Response Interceptor — handle token expiry automatically
// ------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,   // success path — just pass the response through

  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 (Unauthorized) and haven't already retried:
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;   // mark so we don't loop forever

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        // Ask Django for a new access token using our refresh token
        const { data } = await axios.post(
          'http://localhost:8000/api/auth/token/refresh/',
          { refresh: refreshToken }
        );

        // Save the new access token
        localStorage.setItem('access_token', data.access);

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token also expired — force the user to log in again
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
