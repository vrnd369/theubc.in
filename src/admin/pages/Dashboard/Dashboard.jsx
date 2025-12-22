import React, { useMemo, useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { useAuth } from "../../auth/useAuth";
import { MODULES, ROLE_PERMISSIONS, ROLE } from "../../auth/roleConfig";
import { getModuleVisibility, setModuleVisibility } from "../../services/moduleVisibilityService";

export default function Dashboard({ basePath = "/admin" }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Ensure we have a valid role, default to SUB_ADMIN if not set
  const role = user?.role || ROLE.SUB_ADMIN;
  const isSuperAdmin = role === ROLE.SUPER_ADMIN;
  const [moduleVisibility, setModuleVisibilityState] = useState({});
  const [updating, setUpdating] = useState(false);

  const allowedModules = useMemo(() => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions?.allowedModules || [];
  }, [role]);

  // Load module visibility settings (for all users to enable filtering)
  useEffect(() => {
    const loadVisibility = async () => {
      try {
        const visibility = await getModuleVisibility();
        setModuleVisibilityState(visibility);
      } catch (error) {
        console.error("Error loading module visibility:", error);
        // Default to empty object (will use defaults from service)
        setModuleVisibilityState({});
      }
    };
    loadVisibility();
  }, []);

  // Handle toggle visibility
  const handleToggleVisibility = async (moduleId, currentValue) => {
    if (!isSuperAdmin) return;
    
    setUpdating(true);
    try {
      const newValue = !currentValue;
      await setModuleVisibility(moduleId, newValue);
      setModuleVisibilityState((prev) => ({
        ...prev,
        [moduleId]: newValue,
      }));
      // Reload page to update sidebar
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error toggling module visibility:", error);
      alert("Failed to update module visibility. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Get all menu items for module management (same as Sidebar)
  const allMenuItems = useMemo(() => [
    { id: MODULES.DASHBOARD, label: "Dashboard", icon: "📊" },
    { id: MODULES.NAVIGATION, label: "Navigation", icon: "🧭" },
    { id: MODULES.HEADER, label: "Header Styling", icon: "🎨" },
    { id: MODULES.FOOTER, label: "Footer Management", icon: "🔽" },
    { id: MODULES.HOME, label: "Home Management", icon: "🏠" },
    { id: MODULES.ABOUT, label: "About Management", icon: "📄" },
    { id: MODULES.CONTACT, label: "Contact Management", icon: "☎️" },
    { id: MODULES.CAREERS, label: "Careers Management", icon: "💼" },
    { id: MODULES.PRODUCTS, label: "Product Management", icon: "📦" },
    { id: MODULES.BRAND_PAGES, label: "Brand Pages", icon: "📄" },
    { id: MODULES.FORM_SUBMISSIONS, label: "Form Submissions", icon: "✉️" },
    { id: MODULES.ENQUIRY_FORM, label: "Enquiry Form", icon: "📝" },
    { id: MODULES.PRIVACY_POLICY, label: "Privacy Policy", icon: "🔒" },
    { id: MODULES.COOKIES_POLICY, label: "Cookies Policy", icon: "🍪" },
    { id: MODULES.MIGRATION, label: "Data Migration", icon: "🔄" },
    { id: MODULES.USER_MANAGEMENT, label: "User Management", icon: "👥" },
    { id: MODULES.AUDIT_LOGS, label: "Audit Logs", icon: "📋" },
  ], []);

  const quickActions = useMemo(() => [
    {
      id: MODULES.NAVIGATION,
      title: "Navigation Management",
      description: "Manage your website navigation menu, dropdowns, and submenus",
      icon: "🧭",
      path: `${basePath}/navigation`,
      color: "blue",
    },
    {
      id: MODULES.HEADER,
      title: "Header Styling",
      description: "Customize your website header: logo, colors, fonts, and styling options",
      icon: "🎨",
      path: `${basePath}/header`,
      color: "indigo",
    },
    {
      id: MODULES.HOME,
      title: "Home Management",
      description: "Manage all home page sections: text, images, videos, alignment, and more",
      icon: "🏠",
      path: `${basePath}/home`,
      color: "green",
    },
    {
      id: MODULES.ABOUT,
      title: "About Management",
      description: "Manage all About Us page sections: text, images, icons, alignment, dimensions, and more",
      icon: "📄",
      path: `${basePath}/about`,
      color: "orange",
    },
    {
      id: MODULES.CONTACT,
      title: "Contact Management",
      description: "Control every detail of your Contact page: text, fonts, images, maps, and layout.",
      icon: "☎️",
      path: `${basePath}/contact`,
      color: "red",
    },
    {
      id: MODULES.CAREERS,
      title: "Careers Management",
      description: "Manage Careers hero, Why Join Us content, job openings, and Join Us form settings.",
      icon: "💼",
      path: `${basePath}/careers`,
      color: "yellow",
    },
    {
      id: MODULES.PRODUCTS,
      title: "Product Management",
      description: "Manage brands, categories, and products. Changes reflect across navbar, product pages, and all related pages.",
      icon: "📦",
      path: `${basePath}/products`,
      color: "purple",
    },
    {
      id: MODULES.BRAND_PAGES,
      title: "Brand Pages Management",
      description: "Create and manage dedicated brand pages. Use templates or import from existing pages.",
      icon: "🏷️",
      path: `${basePath}/brand-pages`,
      color: "teal",
    },
    {
      id: MODULES.FOOTER,
      title: "Footer Management",
      description: "Manage footer: logo, navigation links, contact info, social media, addresses, and styling.",
      icon: "🔽",
      path: `${basePath}/footer`,
      color: "slate",
    },
    {
      id: MODULES.ENQUIRY_FORM,
      title: "Enquiry Form Management",
      description: "Customize the enquiry form in the navbar: edit fields, labels, placeholders, and messages.",
      icon: "📝",
      path: `${basePath}/enquiry-form`,
      color: "pink",
    },
    {
      id: MODULES.USER_MANAGEMENT,
      title: "User Management",
      description: "Create and manage Admin and Sub Admin accounts. Control access and permissions.",
      icon: "👥",
      path: `${basePath}/user-management`,
      color: "indigo",
    },
    {
      id: MODULES.AUDIT_LOGS,
      title: "Audit Logs",
      description: "View login and activity logs. Track user access and system events.",
      icon: "📋",
      path: `${basePath}/audit-logs`,
      color: "slate",
    },
  ], [basePath]);

  const filteredActions = useMemo(() => {
    return quickActions.filter((action) => {
      // Check role permissions first
      if (!allowedModules.includes(action.id)) {
        return false;
      }
      
      // Dashboard should always be visible
      if (action.id === MODULES.DASHBOARD) {
        return true;
      }
      
      // Check module visibility settings (for all roles)
      // Default to true if not set (backward compatibility)
      if (moduleVisibility.hasOwnProperty(action.id)) {
        return moduleVisibility[action.id] !== false;
      }
      
      // Default: show if in allowed modules
      return true;
    });
  }, [allowedModules, quickActions, moduleVisibility]);

  // Show loading state if not authenticated yet
  if (!isAuthenticated) {
    return (
      <AdminLayout currentPage="dashboard" basePath={basePath}>
        <div className="admin-dashboard">
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-text">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="dashboard" basePath={basePath}>
      <div className="admin-dashboard" style={{ minHeight: '100vh', backgroundColor: 'var(--admin-bg, #f8fafc)' }}>
        <div className="dashboard-header">
          <h1 className="admin-heading-1">Dashboard</h1>
          <p className="admin-text-sm admin-mt-sm">
            Welcome to your CMS Dashboard. Manage your website content from
            here.
          </p>
        </div>

        {/* Module Visibility Management - Only for Super Admin */}
        {isSuperAdmin && (
          <div className="admin-card" style={{ marginBottom: 'var(--admin-spacing-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--admin-spacing-md)' }}>
              <div>
                <h2 className="admin-heading-2" style={{ margin: 0 }}>Module Visibility Management</h2>
                <p className="admin-text-sm admin-mt-xs" style={{ color: 'var(--admin-text-light)' }}>
                  Control which modules appear in the sidebar, dashboard, and main website. Only visible to Super Admin.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '12px',
              marginBottom: 'var(--admin-spacing-md)'
            }}>
              {allMenuItems
                .filter(item => item.id !== MODULES.DASHBOARD) // Dashboard is always visible
                .map((item) => {
                  const isVisible = moduleVisibility[item.id] !== false;
                  const moduleInfo = quickActions.find(a => a.id === item.id);
                  
                  return (
                    <div 
                      key={item.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: isVisible ? 'var(--admin-bg-light, #f8fafc)' : 'var(--admin-bg-disabled, #f0f0f0)',
                        borderRadius: '8px',
                        border: `2px solid ${isVisible ? 'transparent' : 'var(--admin-border, #e5e7eb)'}`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '20px' }}>{item.icon}</span>
                          <h3 className="admin-heading-3" style={{ margin: 0, fontSize: '16px' }}>
                            {item.label}
                          </h3>
                        </div>
                        {moduleInfo && (
                          <p className="admin-text-sm" style={{ 
                            margin: '4px 0 0 0', 
                            color: 'var(--admin-text-light)',
                            fontSize: '12px'
                          }}>
                            {moduleInfo.description?.substring(0, 60)}...
                          </p>
                        )}
                      </div>
                      <label style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        gap: '4px', 
                        cursor: 'pointer',
                        marginLeft: '16px'
                      }}>
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => handleToggleVisibility(item.id, isVisible)}
                          disabled={updating}
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            cursor: 'pointer'
                          }}
                        />
                        <span className="admin-text-sm" style={{ 
                          fontSize: '11px',
                          color: isVisible ? 'var(--admin-success, #10b981)' : 'var(--admin-text-light)',
                          fontWeight: isVisible ? '600' : '400'
                        }}>
                          {isVisible ? 'ON' : 'OFF'}
                        </span>
                      </label>
                    </div>
                  );
                })}
            </div>
            
            {updating && (
              <div style={{ 
                padding: '12px',
                backgroundColor: 'var(--admin-bg-light, #f8fafc)',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <p className="admin-text-sm" style={{ color: 'var(--admin-text-light)', margin: 0 }}>
                  ⏳ Updating module visibility...
                </p>
              </div>
            )}
            
            <div style={{ 
              marginTop: 'var(--admin-spacing-md)',
              padding: '12px',
              backgroundColor: 'var(--admin-alert-info-bg, #eff6ff)',
              borderRadius: '4px',
              border: '1px solid var(--admin-alert-info-border, #bfdbfe)'
            }}>
              <p className="admin-text-sm" style={{ margin: 0, color: 'var(--admin-text-light)' }}>
                <strong>💡 Note:</strong> Changes to Product Management and Brand Pages will also affect the main website navigation. 
                Hidden modules will be removed from the sidebar, dashboard, and website navbar.
              </p>
            </div>
          </div>
        )}

        <div className="dashboard-quick-actions">
          <h2 className="admin-heading-2 admin-mb-lg">Quick Actions</h2>
          {filteredActions.length === 0 ? (
            <div className="admin-alert admin-alert-info">
              <p>No modules available for your role ({role}).</p>
            </div>
          ) : (
            <div className="quick-actions-grid">
              {filteredActions.map((action, index) => (
                <div
                  key={action.id || index}
                  className={`quick-action-card admin-card action-${action.color}`}
                  onClick={() => navigate(action.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className="admin-heading-3">{action.title}</h3>
                  <p className="admin-text-sm">{action.description}</p>
                  <button className="admin-btn admin-btn-primary admin-mt-md">
                    Manage →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
