export const ROLE = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SUB_ADMIN: "sub_admin",
};

// Map each role to the base path used in routing/navigation
export const ROLE_BASE_PATH = {
  [ROLE.SUPER_ADMIN]: "/superadmin",
  [ROLE.ADMIN]: "/admin",
  [ROLE.SUB_ADMIN]: "/subadmin",
};

// Modules available in the system
export const MODULES = {
  DASHBOARD: "dashboard",
  NAVIGATION: "navigation",
  HEADER: "header",
  FOOTER: "footer",
  HOME: "home",
  ABOUT: "about",
  CONTACT: "contact",
  CAREERS: "careers",
  PRODUCTS: "products",
  BRAND_PAGES: "brand-pages",
  FORM_SUBMISSIONS: "form-submissions",
  ENQUIRY_FORM: "enquiry-form",
  PRIVACY_POLICY: "privacy-policy",
  COOKIES_POLICY: "cookies-policy",
  MIGRATION: "migration",
  USER_MANAGEMENT: "user-management",
  AUDIT_LOGS: "audit-logs",
};

// Permissions per role (extendable)
export const ROLE_PERMISSIONS = {
  [ROLE.SUPER_ADMIN]: {
    allowedModules: Object.values(MODULES),
    canDelete: true,
    canManageUsers: true,
  },
  [ROLE.ADMIN]: {
    allowedModules: [
      MODULES.DASHBOARD,
      MODULES.NAVIGATION,
      MODULES.HEADER,
      MODULES.FOOTER,
      MODULES.HOME,
      MODULES.ABOUT,
      MODULES.CONTACT,
      MODULES.CAREERS,
      MODULES.PRODUCTS,
      MODULES.BRAND_PAGES,
      MODULES.FORM_SUBMISSIONS,
      MODULES.ENQUIRY_FORM,
      MODULES.PRIVACY_POLICY,
      MODULES.COOKIES_POLICY,
      MODULES.AUDIT_LOGS,
    ],
    canDelete: true,
    canManageUsers: false,
  },
  [ROLE.SUB_ADMIN]: {
    allowedModules: [
      MODULES.DASHBOARD,
      MODULES.PRODUCTS,
      MODULES.BRAND_PAGES,
      MODULES.FORM_SUBMISSIONS,
      MODULES.HOME,
      MODULES.ABOUT,
      MODULES.PRIVACY_POLICY,
      MODULES.COOKIES_POLICY,
    ],
    canDelete: true, // Sub Admin can now delete products and text
    canManageUsers: false,
  },
};

export const getBasePathForRole = (role) =>
  ROLE_BASE_PATH[role] || ROLE_BASE_PATH[ROLE.SUB_ADMIN];

export const isModuleAllowed = (role, moduleId) => {
  const config = ROLE_PERMISSIONS[role];
  if (!config) return false;
  return config.allowedModules.includes(moduleId);
};

