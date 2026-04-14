/**
 * TaskForm.jsx — Form to create or edit a task
 *
 * BEGINNER TIP — Controlled Components & Form Handling:
 *   In React, a "controlled" input means that React state IS the
 *   single source of truth for the input's value.
 *
 *   Every keystroke:
 *     1. Fires the onChange handler
 *     2. Calls setState (via the `setForm` function)
 *     3. React re-renders with the new value
 *
 *   This is different from vanilla HTML where the DOM stores the value.
 *   Controlled inputs give you the current value at any time via state.
 *
 * PROPS:
 *   initialData — when editing, pre-fill the form with existing task data
 *   onSubmit    — called with { title, description } when the form is saved
 *   onCancel    — called when the user dismisses the form without saving
 */

import React, { useState } from 'react';

function TaskForm({ initialData = {}, onSubmit, onCancel }) {
  // Local state just for this form's fields
  const [form, setForm] = useState({
    title:       initialData.title       || '',
    description: initialData.description || '',
  });
  const [error, setError] = useState('');

  // Generic change handler — works for any input in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Spread operator keeps other fields unchanged, only updates the one that changed
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();   // prevent the browser from reloading the page

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setError('');
    onSubmit(form);       // pass data up to the parent (Dashboard)
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.heading}>
        {initialData.id ? 'Edit Task' : 'New Task'}
      </h3>

      {error && <p style={styles.error}>{error}</p>}

      <label style={styles.label}>Title *</label>
      <input
        style={styles.input}
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="What needs to be done?"
        autoFocus
      />

      <label style={styles.label}>Description</label>
      <textarea
        style={{ ...styles.input, height: '80px', resize: 'vertical' }}
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Optional details..."
      />

      <div style={styles.actions}>
        <button type="submit" style={styles.primaryBtn}>
          {initialData.id ? 'Update Task' : 'Add Task'}
        </button>
        <button type="button" style={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    background: '#f8faff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  heading: { margin: '0 0 0.5rem', color: '#1e293b' },
  label:   { fontSize: '0.875rem', fontWeight: '600', color: '#475569' },
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  error: { color: '#dc2626', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  primaryBtn: {
    background: '#4f46e5', color: '#fff', border: 'none',
    padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer',
    fontWeight: '600',
  },
  cancelBtn: {
    background: '#e2e8f0', color: '#475569', border: 'none',
    padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer',
  },
};

export default TaskForm;
