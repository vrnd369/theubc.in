import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import { useAuth } from "../../auth/useAuth";
import "../../styles/admin-global.css";
import "./AdminLayout.css";

export default function AdminLayout({
  children,
  currentPage = "dashboard",
  basePath,
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout, basePath: roleBasePath } = useAuth();
  const resolvedBasePath = basePath || roleBasePath || "/admin";

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // On mobile, sidebar should be closed by default
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className={`admin-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${isMobile ? "mobile" : ""}`}
    >
      {isMobile && sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={handleOverlayClick} />
      )}
      <Sidebar
        currentPage={currentPage}
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
        basePath={resolvedBasePath}
        isMobile={isMobile}
      />
      <div className="admin-main-content">
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              {isMobile && (
                <button
                  className="mobile-menu-toggle"
                  onClick={handleSidebarToggle}
                  aria-label="Toggle menu"
                >
                  ☰
                </button>
              )}
              <h1 className="admin-heading-2">
                CMS Dashboard {user?.role ? `(${user.role})` : ""}
              </h1>
            </div>
            <div className="admin-header-actions">
              <button
                onClick={() => navigate("/")}
                className="admin-btn admin-btn-secondary"
              >
                <span className="admin-btn-text">← Back to Website</span>
              </button>
              <button
                onClick={handleLogout}
                className="admin-btn admin-btn-primary"
              >
                <span className="admin-btn-text">Logout</span>
              </button>
            </div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

