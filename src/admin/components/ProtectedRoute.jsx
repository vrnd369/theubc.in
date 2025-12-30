import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ROLE } from "../auth/roleConfig";
import "../styles/admin-global.css";

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="admin-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  const role = user?.role || ROLE.SUB_ADMIN;
  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return (
      <Navigate
        to={`/unauthorized?from=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
}

