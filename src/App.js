import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import DynamicFooter from "./components/DynamicFooter";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import About from "./pages/About";
import Brands from "./pages/Brands";
import Wellness from "./pages/Wellness";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Dashboard from "./admin/pages/Dashboard/Dashboard";
import NavigationManagement from "./admin/pages/NavigationManagement/NavigationManagement";
import HomeManagement from "./admin/pages/HomeManagement/HomeManagement";
import AboutManagement from "./admin/pages/AboutManagement/AboutManagement";
import CareersManagement from "./admin/pages/CareersManagement/CareersManagement";
import ProductManagement from "./admin/pages/ProductManagement/ProductManagement";
import FormSubmissions from "./admin/pages/FormSubmissions/FormSubmissions";
import BrandPagesManagement from "./admin/pages/BrandPagesManagement/BrandPagesManagement";
import ContactManagement from "./admin/pages/ContactManagement/ContactManagement";
import HeaderStyling from "./admin/pages/HeaderStyling/HeaderStyling";
import FooterManagement from "./admin/pages/FooterManagement/FooterManagement";
import DataMigration from "./admin/pages/DataMigration/DataMigration";
import EnquiryFormManagement from "./admin/pages/EnquiryFormManagement/EnquiryFormManagement";
import UserManagement from "./admin/pages/UserManagement/UserManagement";
import AuditLogs from "./admin/pages/AuditLogs/AuditLogs";
import DynamicBrand from "./components/DynamicBrand";
import Login from "./admin/pages/Auth/Login";
import Unauthorized from "./admin/pages/Auth/Unauthorized";
import ProtectedRoute from "./admin/components/ProtectedRoute";
import { AuthProvider } from "./admin/auth/AuthContext";
import { ROLE, ROLE_BASE_PATH } from "./admin/auth/roleConfig";

import "./App.css";

// Layout component for public routes
function PublicLayout({ children }) {
  // Always render footer to prevent flickering
  // Children will always be a component, so we don't need to check for null

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Navbar />
      <div style={{ flex: 1, position: "relative", minHeight: "100vh" }}>
        {children}
      </div>
      <DynamicFooter />
    </div>
  );
}

export default function App() {
  // Register service worker for offline caching
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            // Service worker registration failed - silently fail
            // Caching is optional and shouldn't break the app
          });
      });
    }
  }, []);

  return (
    <div className="App">
      <ScrollToTop />
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Super Admin routes (base: /superadmin) */}
          {renderAdminRoutes({
            basePath: ROLE_BASE_PATH[ROLE.SUPER_ADMIN],
            allowedRoles: [ROLE.SUPER_ADMIN],
          })}

          {/* Admin routes (base: /admin) */}
          {renderAdminRoutes({
            basePath: ROLE_BASE_PATH[ROLE.ADMIN],
            allowedRoles: [ROLE.ADMIN, ROLE.SUPER_ADMIN],
          })}

          {/* Sub Admin routes (base: /subadmin) */}
          {renderAdminRoutes({
            basePath: ROLE_BASE_PATH[ROLE.SUB_ADMIN],
            allowedRoles: [ROLE.SUB_ADMIN, ROLE.SUPER_ADMIN],
          })}

          {/* Redirect legacy /admin root to /login for clarity */}
          <Route path="/admin" element={<Navigate to="/login" replace />} />

          {/* Public Routes - With Navbar/Footer */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <About />
              </PublicLayout>
            }
          />
          <Route
            path="/brands"
            element={
              <PublicLayout>
                <Brands />
              </PublicLayout>
            }
          />
          <Route
            path="/brands/:brandSlug"
            element={
              <PublicLayout>
                <DynamicBrand />
              </PublicLayout>
            }
          />
          <Route
            path="/brands/wellness"
            element={
              <PublicLayout>
                <Wellness />
              </PublicLayout>
            }
          />
          <Route
            path="/products"
            element={
              <PublicLayout>
                <Products />
              </PublicLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <PublicLayout>
                <ProductDetail />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <Contact />
              </PublicLayout>
            }
          />
          <Route
            path="/careers"
            element={
              <PublicLayout>
                <Careers />
              </PublicLayout>
            }
          />
          <Route
            path="/privacy"
            element={
              <PublicLayout>
                <PrivacyPolicy />
              </PublicLayout>
            }
          />
        </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

function renderAdminRoutes({ basePath, allowedRoles }) {
  return (
    <>
      <Route
        path={basePath}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Dashboard basePath={basePath} />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/navigation`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <NavigationManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/home`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <HomeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/about`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <AboutManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/careers`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <CareersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/contact`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ContactManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/products`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <ProductManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/brand-pages`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <BrandPagesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/form-submissions`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <FormSubmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/header`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <HeaderStyling />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/footer`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <FooterManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/enquiry-form`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <EnquiryFormManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/migration`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <DataMigration />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/user-management`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/audit-logs`}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />
    </>
  );
}
