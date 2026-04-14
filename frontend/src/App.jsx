/**
 * App.jsx — Root component, routing, and authentication gating
 *
 * BEGINNER TIP — React Router:
 *   React is a Single Page Application (SPA). There's only one HTML file
 *   (index.html), but React Router makes it FEEL like multiple pages by
 *   swapping components based on the URL — without actually reloading.
 *
 *   <BrowserRouter>  — enables routing (reads the browser URL)
 *   <Routes>         — container for all route definitions
 *   <Route>          — maps a URL path to a component
 *   <Navigate>       — programmatically redirects to another path
 *
 * BEGINNER TIP — ProtectedRoute:
 *   We create a small wrapper component that checks if a token exists.
 *   If not logged in, it redirects to /login.
 *   If logged in, it renders the actual child component (<Dashboard>).
 *   This is the standard pattern for auth-guarded routes in React.
 *
 * BEGINNER TIP — useState for global auth state:
 *   `isAuthenticated` lives in App.jsx so every child can read it.
 *   We initialise it by checking localStorage on first render — this
 *   way the user stays "logged in" even after a page refresh.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard    from './pages/Dashboard';

// ── ProtectedRoute — only renders children if logged in ──────────────────
function ProtectedRoute({ isAuthenticated, children }) {
  // If there's no token → redirect to login immediately
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ── App — root component ─────────────────────────────────────────────────
function App() {
  // Check localStorage on first render to restore session across page refreshes
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('access_token'))
  );

  const handleLogin  = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — accessible without a token */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />   // already logged in → go to dashboard
              : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <RegisterPage />
          }
        />

        {/* Protected route — requires authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
