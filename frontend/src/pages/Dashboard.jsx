/**
 * Dashboard.jsx — Main task management page
 *
 * This is the most important React file in the project.
 * Read the BEGINNER TIPs carefully!
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BEGINNER TIP — useState:
 *   We use multiple useState calls, each managing a different piece of state:
 *     tasks       — the list of tasks fetched from the API
 *     loading     — whether we're currently waiting for an API response
 *     error       — any error message to display
 *     showForm    — whether the add/edit form is visible
 *     editingTask — the task currently being edited (null = creating new)
 *     filter      — 'all' | 'pending' | 'completed'
 *
 *   React re-renders this component whenever ANY of these change.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BEGINNER TIP — useEffect:
 *   useEffect(fn, [dependencies])
 *
 *   fn runs AFTER the component renders, whenever any value in the
 *   dependency array has changed since the last render.
 *
 *   Common patterns:
 *     useEffect(fn, [])        — run fn ONCE after first render (like componentDidMount)
 *     useEffect(fn, [x, y])   — run fn when x or y changes
 *     useEffect(fn)            — run fn after EVERY render (rarely what you want)
 *
 *   Here we fetch tasks when the component mounts AND when `filter` changes.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * BEGINNER TIP — How React calls APIs:
 *   1. Component renders (shows a loading spinner)
 *   2. useEffect fires → calls getTasks() from taskService.js
 *   3. axios sends GET /api/tasks/ to Django with the JWT in the header
 *   4. Django verifies the token, queries the DB, returns JSON
 *   5. axios returns the JSON; we call setTasks(data) to update state
 *   6. React re-renders, now showing the tasks list
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import Spinner from '../components/Spinner';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskService';
import { logoutUser } from '../api/authService';

function Dashboard({ onLogout }) {
  // ── State declarations ──────────────────────────────────────────────────
  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [editingTask, setEditingTask] = useState(null);   // null = creating new
  const [filter,      setFilter]      = useState('all');  // 'all' | 'pending' | 'completed'

  const navigate = useNavigate();

  // ── Fetch tasks whenever filter changes ─────────────────────────────────
  useEffect(() => {
    fetchTasks();
  }, [filter]);   // dependency array — re-run when `filter` changes

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      // Map our filter string to the API param Django expects
      const completedParam =
        filter === 'completed' ? 'true' :
        filter === 'pending'   ? 'false' :
        null;

      const { data } = await getTasks(completedParam);
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);   // always hide spinner, even if request failed
    }
  };

  // ── CRUD handlers ───────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    try {
      const { data } = await createTask(formData);
      // Optimistically add the new task to the TOP of the list
      // instead of re-fetching from the server — snappier UX
      setTasks((prev) => [data, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create task.');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const { data } = await updateTask(editingTask.id, formData);
      // Replace the old task object in state with the updated one
      setTasks((prev) =>
        prev.map((t) => (t.id === data.id ? data : t))
      );
      setEditingTask(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      // Remove from local state — no need to re-fetch
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const { data } = await updateTask(id, { completed });
      setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    // Scroll to top so the form is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = (formData) => {
    if (editingTask) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) { /* ignore — clear locally anyway */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    onLogout();
    navigate('/login');
  };

  // ── Derived values ───────────────────────────────────────────────────────
  const pendingCount   = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) =>  t.completed).length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <Navbar onLogout={handleLogout} />

      <div style={styles.container}>
        {/* Header row */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>My Tasks</h2>
            <p style={styles.stats}>
              {pendingCount} pending · {completedCount} done · {tasks.length} total
            </p>
          </div>
          <button
            style={styles.addBtn}
            onClick={() => { setEditingTask(null); setShowForm((v) => !v); }}
          >
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>
        </div>

        {/* Error banner */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Add / Edit form — conditionally rendered */}
        {showForm && (
          <TaskForm
            initialData={editingTask || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}

        {/* Filter tabs */}
        <div style={styles.filterRow}>
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {}),
              }}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <Spinner />
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>
            <p>No tasks here.</p>
            <p>Click <strong>+ New Task</strong> to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggleComplete}
            />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight: '100vh', background: '#f1f5f9' },
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title:     { margin: '0 0 0.25rem', fontSize: '1.6rem', color: '#1e293b' },
  stats:     { margin: 0, color: '#64748b', fontSize: '0.9rem' },
  addBtn:    { background: '#4f46e5', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap' },
  error:     { background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  filterRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' },
  filterBtn: { background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' },
  filterBtnActive: { background: '#4f46e5', color: '#fff' },
  empty:     { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
};

export default Dashboard;
