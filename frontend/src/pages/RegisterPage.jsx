/**
 * RegisterPage.jsx — New user registration
 *
 * BEGINNER TIP — Form Validation:
 *   We validate BEFORE hitting the API to give instant feedback.
 *   Client-side validation is for UX; server-side validation is for security.
 *   Always have BOTH — never trust the client alone.
 *
 * BEGINNER TIP — Error Handling:
 *   err.response?.data is the JSON body returned by Django when something
 *   goes wrong. The ?. (optional chaining) operator safely accesses nested
 *   properties without throwing if a parent is null/undefined.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/authService';

function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(form.username, form.email, form.password);
      setSuccess('Account created! Redirecting to login...');
      // Short delay so the user can read the success message
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      // Django returns field-level errors as an object, e.g.:
      //   { username: ["A user with that username already exists."] }
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        // Join all error messages into a single string
        const messages = Object.values(data).flat().join(' ');
        setError(messages);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Create an account</h1>
        <p style={styles.sub}>Start managing your tasks today</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error   && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <label style={styles.label}>Username *</label>
          <input style={styles.input} type="text"     name="username" value={form.username} onChange={handleChange} required />

          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email"    name="email"    value={form.email}    onChange={handleChange} />

          <label style={styles.label}>Password *</label>
          <input style={styles.input} type="password" name="password" value={form.password} onChange={handleChange} required />

          <label style={styles.label}>Confirm Password *</label>
          <input style={styles.input} type="password" name="confirm"  value={form.confirm}  onChange={handleChange} required />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  card:    { background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  heading: { margin: '0 0 0.25rem', fontSize: '1.75rem', color: '#1e293b' },
  sub:     { margin: '0 0 1.5rem', color: '#64748b' },
  form:    { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label:   { fontSize: '0.875rem', fontWeight: '600', color: '#374151' },
  input:   { padding: '0.6rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  button:  { marginTop: '0.5rem', padding: '0.7rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  error:   { background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  success: { background: '#f0fdf4', color: '#15803d', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  footer:  { textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.9rem' },
  link:    { color: '#4f46e5', textDecoration: 'none', fontWeight: '600' },
};

export default RegisterPage;
