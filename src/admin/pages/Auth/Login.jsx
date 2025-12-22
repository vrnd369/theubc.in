import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { ROLE_BASE_PATH } from "../../auth/roleConfig";
import { authenticateAdminUser } from "../../services/userService";
import "../../styles/admin-global.css";
import "./Login.css";
// WikiWakyWoo Logo - Update this import if you have a local logo file
// Example: import wikiWakyWooLogo from "../../../assets/wikiwakywoo-logo.png";
// For now using URL - replace with local import if logo file is available
const wikiWakyWooLogo = "https://www.wikiwakywoo.com/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("redirect") || "/admin";
  }, [location.search]);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Normalize email and password (trim whitespace)
      const email = form.email.trim();
      const password = form.password.trim();

      if (!email || !password) {
        setError("Email and password are required.");
        setLoading(false);
        return;
      }

      // Authenticate against Firestore users only
      const authResult = await authenticateAdminUser(email, password);
      
      if (authResult.success) {
        // User found in Firestore, use their role
        const userRole = authResult.user.role;
        await login(userRole, { 
          email: authResult.user.email,
          name: authResult.user.name,
          id: authResult.user.id,
        });
        const basePath = ROLE_BASE_PATH[userRole] || "/admin";
        const target =
          redirectTo.startsWith(basePath) || redirectTo === "/"
            ? redirectTo
            : basePath;
        navigate(target, { replace: true });
      } else {
        setError(authResult.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background Shapes */}
      <div className="login-bg-shapes">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
        <div className="bg-shape bg-shape-4"></div>
      </div>

      <div className="login-card admin-card">
        <div className="login-logo-container">
          <img src={wikiWakyWooLogo} alt="WikiWakyWoo Logo" className="login-logo" onError={(e) => {
            // Fallback to text if image fails to load
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (!parent.querySelector('.logo-fallback')) {
              const fallback = document.createElement('div');
              fallback.className = 'logo-fallback';
              fallback.textContent = 'WikiWakyWoo';
              fallback.style.cssText = 'font-size: 24px; font-weight: 700; color: #323790;';
              parent.appendChild(fallback);
            }
          }} />
        </div>
        
        <div className="login-header">
          <h1 className="admin-heading-2">Welcome Back</h1>
          <p className="admin-text-sm admin-mb-md login-subtitle">
            Sign in to access your admin dashboard
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Secure Access</span>
          </div>
          <div className="login-feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Protected Data</span>
          </div>
          <div className="login-feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Encrypted</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="admin-label">
            Email
            <input
              type="email"
              name="email"
              className="admin-input"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </label>

          <label className="admin-label">
            Password
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="admin-input password-input"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <button
            type="submit"
            className="admin-btn admin-btn-primary admin-mt-md"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="login-footer-divider">
            <span>Secure Login</span>
          </div>
          <p className="login-footer-text">
            Your session is protected with industry-standard encryption
          </p>
          <p className="login-copyright">
            © {new Date().getFullYear()}{' '}
            <a 
              href="https://www.wikiwakywoo.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="login-copyright-link"
            >
              WikiWakyWoo
            </a>{' '}
            CMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

