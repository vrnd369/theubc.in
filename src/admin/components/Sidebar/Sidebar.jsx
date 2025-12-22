import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../../auth/useAuth";
import { MODULES, ROLE_PERMISSIONS, ROLE } from "../../auth/roleConfig";
import { getModuleVisibility } from "../../services/moduleVisibilityService";

export default function Sidebar({
  currentPage,
  isOpen = true,
  onToggle,
  basePath = "/admin",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;
  const [moduleVisibility, setModuleVisibility] = useState({});

  // Load module visibility settings
  useEffect(() => {
    const loadVisibility = async () => {
      try {
        const visibility = await getModuleVisibility();
        setModuleVisibility(visibility);
      } catch (error) {
        console.error("Error loading module visibility:", error);
        // Default to all visible on error (will be handled by getDefaultVisibility)
        setModuleVisibility({});
      }
    };
    loadVisibility();
  }, []);

  const allMenuItems = useMemo(
    () => [
      { id: MODULES.DASHBOARD, label: "Dashboard", path: `${basePath}`, icon: "📊" },
      {
        id: MODULES.NAVIGATION,
        label: "Navigation",
        path: `${basePath}/navigation`,
        icon: "🧭",
      },
      {
        id: MODULES.HEADER,
        label: "Header Styling",
        path: `${basePath}/header`,
        icon: "🎨",
      },
      {
        id: MODULES.FOOTER,
        label: "Footer Management",
        path: `${basePath}/footer`,
        icon: "🔽",
      },
      {
        id: MODULES.HOME,
        label: "Home Management",
        path: `${basePath}/home`,
        icon: "🏠",
      },
      {
        id: MODULES.ABOUT,
        label: "About Management",
        path: `${basePath}/about`,
        icon: "📄",
      },
      {
        id: MODULES.CAREERS,
        label: "Careers Management",
        path: `${basePath}/careers`,
        icon: "💼",
      },
      {
        id: MODULES.CONTACT,
        label: "Contact Management",
        path: `${basePath}/contact`,
        icon: "☎️",
      },
      {
        id: MODULES.PRODUCTS,
        label: "Product Management",
        path: `${basePath}/products`,
        icon: "📦",
      },
      {
        id: MODULES.BRAND_PAGES,
        label: "Brand Pages",
        path: `${basePath}/brand-pages`,
        icon: "📄",
      },
      {
        id: MODULES.FORM_SUBMISSIONS,
        label: "Form Submissions",
        path: `${basePath}/form-submissions`,
        icon: "✉️",
      },
      {
        id: MODULES.ENQUIRY_FORM,
        label: "Enquiry Form",
        path: `${basePath}/enquiry-form`,
        icon: "📝",
      },
      {
        id: MODULES.PRIVACY_POLICY,
        label: "Privacy Policy",
        path: `${basePath}/privacy-policy`,
        icon: "🔒",
      },
      {
        id: MODULES.COOKIES_POLICY,
        label: "Cookies Policy",
        path: `${basePath}/cookies-policy`,
        icon: "🍪",
      },
      {
        id: MODULES.MIGRATION,
        label: "Data Migration",
        path: `${basePath}/migration`,
        icon: "🔄",
      },
      {
        id: MODULES.USER_MANAGEMENT,
        label: "User Management",
        path: `${basePath}/user-management`,
        icon: "👥",
      },
      {
        id: MODULES.AUDIT_LOGS,
        label: "Audit Logs",
        path: `${basePath}/audit-logs`,
        icon: "📋",
      },
    ],
    [basePath]
  );

  const allowedIds = ROLE_PERMISSIONS[role]?.allowedModules || [];
  const menuItems = allMenuItems.filter((item) => {
    // Check role permissions first
    if (!allowedIds.includes(item.id)) {
      return false;
    }
    
    // Dashboard should always be visible
    if (item.id === MODULES.DASHBOARD) {
      return true;
    }
    
    // For super admin, check module visibility settings for all modules
    if (role === ROLE.SUPER_ADMIN) {
      // Check if module visibility is set, default to true if not set
      return moduleVisibility[item.id] !== false;
    }
    
    // For other roles, check module visibility if set, otherwise use role permissions
    // Non-super admin roles: respect visibility settings if they exist
    if (moduleVisibility.hasOwnProperty(item.id)) {
      return moduleVisibility[item.id] !== false;
    }
    
    // Default: show if in allowed modules
    return true;
  });

  const isActive = (path) => {
    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`admin-sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-logo">{isOpen ? "CMS Admin" : "CMS"}</h2>
      </div>
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`admin-sidebar-item ${
              isActive(item.path) ? "active" : ""
            }`}
            title={!isOpen ? item.label : ""}
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            {isOpen && (
              <span className="admin-sidebar-label">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-toggle-wrapper">
          {isOpen && (
            <div className="admin-sidebar-toggle-note">
              <span className="note-icon">💡</span>
              <span className="note-text">Click to collapse sidebar</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="admin-sidebar-toggle"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <span className="admin-sidebar-icon">{isOpen ? "◀" : "▶"}</span>
            {isOpen && <span className="admin-sidebar-label">Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
