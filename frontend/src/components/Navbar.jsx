/**
 * Navbar.jsx — Top navigation bar
 *
 * BEGINNER TIP — Props:
 *   Props (short for "properties") are how a parent component
 *   passes data DOWN to a child component.
 *   Here, the parent (App.jsx) passes `onLogout` — a function —
 *   as a prop. The Navbar calls it when the user clicks Logout.
 *
 *   This pattern is called "lifting state up": the actual logout
 *   logic lives in App.jsx (which owns the auth state), but the
 *   Navbar just triggers it via a callback prop.
 */

import React from 'react';

function Navbar({ onLogout }) {
  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>Task Manager</span>
      <button style={styles.button} onClick={onLogout}>
        Logout
      </button>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#4f46e5',
    color: '#fff',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  button: {
    background: 'transparent',
    border: '1px solid #fff',
    color: '#fff',
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default Navbar;
