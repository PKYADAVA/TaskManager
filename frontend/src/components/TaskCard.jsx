/**
 * TaskCard.jsx — Renders a single task item
 *
 * BEGINNER TIP — Props & Callbacks:
 *   This component displays one task. It receives:
 *     task     — the task object (from the API)
 *     onEdit   — function to call when Edit is clicked
 *     onDelete — function to call when Delete is clicked
 *     onToggle — function to call when the checkbox is clicked
 *
 *   The ACTUAL logic for those operations lives in Dashboard.jsx.
 *   TaskCard just calls the callback with the task id — this keeps
 *   TaskCard simple and reusable (no API calls here).
 *
 * BEGINNER TIP — Conditional Rendering:
 *   `task.completed ? <strikethrough> : <normal>` is a ternary operator.
 *   React renders different JSX based on a condition — this is called
 *   conditional rendering.
 */

import React from 'react';

function TaskCard({ task, onEdit, onDelete, onToggle }) {
  return (
    <div style={{
      ...styles.card,
      borderLeft: task.completed ? '4px solid #22c55e' : '4px solid #4f46e5',
      opacity: task.completed ? 0.75 : 1,
    }}>
      {/* Checkbox to toggle completed status */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id, !task.completed)}
        style={styles.checkbox}
        title="Mark as complete"
      />

      {/* Task text */}
      <div style={styles.content}>
        <h4 style={{
          ...styles.title,
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? '#94a3b8' : '#1e293b',
        }}>
          {task.title}
        </h4>

        {task.description && (
          <p style={styles.description}>{task.description}</p>
        )}

        <span style={styles.meta}>
          Created: {new Date(task.created_at).toLocaleDateString()}
          {' · '}
          {/* Conditional rendering — show badge based on status */}
          {task.completed
            ? <span style={styles.doneBadge}>Done</span>
            : <span style={styles.pendingBadge}>Pending</span>
          }
        </span>
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <button style={styles.editBtn} onClick={() => onEdit(task)}>
          Edit
        </button>
        <button style={styles.deleteBtn} onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    background: '#fff',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    marginBottom: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  checkbox: { marginTop: '4px', cursor: 'pointer', width: '18px', height: '18px' },
  content:  { flex: 1 },
  title:    { margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: '600' },
  description: { margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.9rem' },
  meta:        { fontSize: '0.8rem', color: '#94a3b8' },
  doneBadge:   { background: '#dcfce7', color: '#15803d', padding: '1px 8px', borderRadius: '20px', fontSize: '0.75rem' },
  pendingBadge:{ background: '#ede9fe', color: '#4f46e5', padding: '1px 8px', borderRadius: '20px', fontSize: '0.75rem' },
  actions: { display: 'flex', gap: '0.5rem', flexShrink: 0 },
  editBtn: {
    background: '#e0e7ff', color: '#4338ca', border: 'none',
    padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
  deleteBtn: {
    background: '#fee2e2', color: '#dc2626', border: 'none',
    padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
};

export default TaskCard;
