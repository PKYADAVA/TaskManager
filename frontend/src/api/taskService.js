/**
 * taskService.js — Task CRUD API calls
 *
 * BEGINNER TIP:
 *   Every function here returns a Promise.
 *   In your components you'll use async/await to handle them:
 *
 *     const { data } = await getTasks();
 *     setTasks(data);
 *
 *   The access token is attached automatically by the axios interceptor
 *   in axiosInstance.js — you don't need to think about it here.
 */

import api from './axiosInstance';

/**
 * Get all tasks for the logged-in user.
 * Optional filter: pass 'true' or 'false' to filter by completed status.
 * @param {string|null} completedFilter — 'true' | 'false' | null
 */
export const getTasks = (completedFilter = null) => {
  const params = completedFilter !== null ? { completed: completedFilter } : {};
  return api.get('/tasks/', { params });
};

/**
 * Create a new task.
 * @param {{ title: string, description: string }} taskData
 */
export const createTask = (taskData) =>
  api.post('/tasks/', taskData);

/**
 * Update an existing task (partial update — only send changed fields).
 * @param {number} id — task ID
 * @param {object} taskData — fields to update
 */
export const updateTask = (id, taskData) =>
  api.patch(`/tasks/${id}/`, taskData);

/**
 * Delete a task.
 * @param {number} id — task ID
 */
export const deleteTask = (id) =>
  api.delete(`/tasks/${id}/`);
