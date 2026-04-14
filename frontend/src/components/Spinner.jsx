/**
 * Spinner.jsx — Simple loading indicator
 *
 * BEGINNER TIP:
 *   This is a "presentational" component — it receives no data,
 *   has no state, and just renders a CSS spinner.
 *   Keep UI-only components like this small and focused.
 */

import React from 'react';

function Spinner() {
  return (
    <div style={styles.overlay}>
      <div style={styles.spinner} />
    </div>
  );
}

const styles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Inject the keyframe animation into the document head once
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);

export default Spinner;
