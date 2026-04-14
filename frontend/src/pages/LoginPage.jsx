/**
 * LoginPage.jsx
 *
 * BEGINNER TIP — useState:
 *   useState(initialValue) returns an array of two things:
 *     [currentValue, setterFunction]
 *
 *   Every time you call setterFunction(newValue), React schedules a
 *   re-render and the component sees the updated value on the next render.
 *
 * BEGINNER TIP — useEffect:
 *   Not used here, but note that LoginPage is a "pure form" — no side
 *   effects needed. You'll see useEffect in Dashboard.jsx.
 *
 * JWT FLOW (what happens when you log in):
 *   1. POST /api/auth/login/ with { username, password }
 *   2. Django checks credentials and returns { access, refresh }
 *   3. We store BOTH tokens in localStorage
 *   4. We redirect to /dashboard
 *   5. Every future API request will include the access token automatically
 *      (thanks to the axios interceptor in axiosInstance.js)
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/authService';

function LoginPage({ onLogin }) {
  // Form field state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();   // programmatic navigation (like <a href> but in JS)

  const handleSubmit = async (e) => {
    e.preventDefault();             // stop the browser from refreshing
    setError('');
    setLoading(true);

    try {
      const { data } = await loginUser(username, password);

      // Store tokens in localStorage so they survive page refreshes
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Tell App.jsx that the user is now authenticated
      onLogin();

      // Redirect to the task dashboard
      navigate('/dashboard');

    } catch (err) {
      // Django returns 401 with { detail: "No active account..." } on bad credentials
      const msg = err.response?.data?.detail || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to manage your tasks</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Error message — only shown when error is non-empty */}
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your username"
            required
            autoFocus
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  card:    { background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  heading: { margin: '0 0 0.25rem', fontSize: '1.75rem', color: '#1e293b' },
  sub:     { margin: '0 0 1.5rem', color: '#64748b' },
  form:    { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label:   { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
  input:   { padding: '0.6rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  button:  { marginTop: '0.5rem', padding: '0.7rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  error:   { background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  footer:  { textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.9rem' },
  link:    { color: '#4f46e5', textDecoration: 'none', fontWeight: '600' },
};

export default LoginPage;
