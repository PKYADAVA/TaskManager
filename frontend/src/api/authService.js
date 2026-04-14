/**
 * authService.js — Authentication API calls
 *
 * BEGINNER TIP:
 *   Instead of writing axios.post('/auth/login', ...) directly inside
 *   a component, we group all auth-related API calls here.
 *   This keeps components clean and makes it easy to change the API
 *   logic in one place without touching every component.
 */

import api from './axiosInstance';

/**
 * Register a new user account.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise} — the newly created user object
 */
export const registerUser = (username, email, password) =>
  api.post('/auth/register/', { username, email, password });


/**
 * Log in and receive JWT tokens.
 * @param {string} username
 * @param {string} password
 * @returns {Promise} — { access: "...", refresh: "..." }
 *
 * After calling this, SAVE both tokens to localStorage so they
 * persist across page refreshes.
 */
export const loginUser = (username, password) =>
  api.post('/auth/login/', { username, password });


/**
 * Log out — blacklist the refresh token on the server.
 * @returns {Promise}
 *
 * After calling this, REMOVE tokens from localStorage.
 */
export const logoutUser = () => {
  const refresh = localStorage.getItem('refresh_token');
  return api.post('/auth/logout/', { refresh });
};
