import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, getDocFromServer, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { ROLE, getBasePathForRole, ROLE_BASE_PATH } from "./roleConfig";

const AuthContext = createContext(null);
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

const defaultUser = null;

// Helper function to validate and normalize role
function validateRole(role) {
  if (!role) {
    return ROLE.SUB_ADMIN;
  }
  
  // Normalize role: trim whitespace and convert to lowercase
  const normalizedRole = String(role).trim().toLowerCase();
  
  // Check exact match first
  if (ROLE_BASE_PATH[normalizedRole]) {
    return normalizedRole;
  }
  
  // Try to match common variations
  const roleMap = {
    'superadmin': ROLE.SUPER_ADMIN,
    'super_admin': ROLE.SUPER_ADMIN,
    'super admin': ROLE.SUPER_ADMIN,
    'admin': ROLE.ADMIN,
    'subadmin': ROLE.SUB_ADMIN,
    'sub_admin': ROLE.SUB_ADMIN,
    'sub admin': ROLE.SUB_ADMIN,
  };
  
  if (roleMap[normalizedRole]) {
    return roleMap[normalizedRole];
  }
  
  // If still no match, check if it's one of the valid roles (case-insensitive)
  const validRoles = Object.values(ROLE);
  const matchedRole = validRoles.find(r => r.toLowerCase() === normalizedRole);
  if (matchedRole) {
    return matchedRole;
  }
  
  return ROLE.SUB_ADMIN;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore - CRITICAL: Use getDoc with specific UID (not query/list)
        const userDocRef = doc(db, 'adminUsers', firebaseUser.uid);
        
        try {
          // Use getDoc (not getDocs/query) - this matches Firestore rules that only allow reading own document
          let userDoc = await getDocFromServer(userDocRef);
          
          if (!userDoc.exists()) {
            // Document doesn't exist - auto-create it
            // Determine role based on email (for superadmin) or default to sub_admin
            const userEmail = firebaseUser.email?.toLowerCase().trim() || '';
            const isSuperAdminEmail = userEmail === 'superadmin@theubc.com';
            const defaultRole = isSuperAdminEmail ? ROLE.SUPER_ADMIN : ROLE.SUB_ADMIN;
            
            // Create the user document
            const newUserDoc = {
              email: userEmail || firebaseUser.email || '',
              role: defaultRole,
              name: firebaseUser.displayName || userEmail.split('@')[0] || 'User',
              isActive: true,
              createdAt: serverTimestamp(),
              autoCreated: true,
            };
            
            try {
              await setDoc(userDocRef, newUserDoc);
              
              // Fetch the newly created document
              userDoc = await getDocFromServer(userDocRef);
            } catch (createError) {
              // If creation fails, sign out
              await firebaseSignOut(auth);
              setUser(defaultUser);
              setLoading(false);
              return;
            }
          }

          const userData = userDoc.data();
          
          // Validate user is active
          if (userData.isActive === false) {
            await firebaseSignOut(auth);
            setUser(defaultUser);
            setLoading(false);
            return;
          }

          // Validate and normalize role
          const userRole = validateRole(userData.role);
          if (!userRole) {
            await firebaseSignOut(auth);
            setUser(defaultUser);
            setLoading(false);
            return;
          }
          
          // Create user object with validated role
          const userWithRole = {
            id: firebaseUser.uid,
            email: userData.email || firebaseUser.email,
            name: userData.name || "",
            role: userRole,
          };
          
          // Set user state - this enables the app to proceed
          setUser(userWithRole);
          
        } catch (error) {
          // Handle permission-denied errors immediately - don't retry
          if (error.code === 'permission-denied') {
            // Sign out immediately - don't retry permission errors
            await firebaseSignOut(auth);
            setUser(defaultUser);
            setLoading(false);
            return;
          }
          
          // For network errors, try cached read as fallback
          if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
            try {
              const cachedDoc = await getDoc(userDocRef);
              if (cachedDoc.exists()) {
                const userData = cachedDoc.data();
                if (userData.isActive !== false) {
                  const userRole = validateRole(userData.role);
                  if (userRole) {
                    setUser({
                      id: firebaseUser.uid,
                      email: userData.email || firebaseUser.email,
                      name: userData.name || "",
                      role: userRole,
                    });
                    setLoading(false);
                    return;
                  }
                }
              }
            } catch (cacheError) {
              // Cached read failed, continue to sign out
            }
          }
          
          // If all else fails, sign out
          await firebaseSignOut(auth);
          setUser(defaultUser);
        }
      } else {
        // No user - clear state
        setUser(defaultUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (role, profile = {}) => {
    // Login is now handled by Firebase Auth in Login component
    // This function is kept for backward compatibility but Firebase Auth
    // state listener will update the user automatically
    // IMPORTANT: Validate role to ensure it's correct
    const validatedRole = validateRole(role);
    
    const nextUser = { 
      role: validatedRole, 
      ...profile 
    };
    setUser(nextUser);
    
    // Log login event - only after user is validated and set
    // Use setTimeout to ensure it happens after state is set
    // This prevents permission errors if audit log write happens before user is fully authenticated
    setTimeout(async () => {
      try {
        const { logLogin } = await import("../services/auditLogService");
        await logLogin(nextUser);
      } catch (err) {
        // Don't block login if audit logging fails - it's non-critical
      }
    }, 100);
  }, []);

  const logout = useCallback(async () => {
    // Log logout event before signing out
    if (user) {
      try {
        const { logLogout } = await import("../services/auditLogService");
        await logLogout(user);
      } catch (err) {
        // Don't block logout if audit logging fails
      }
    }
    
    // Sign out from Firebase Auth
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      // Error signing out - continue anyway
    }
    
    setUser(defaultUser);
  }, [user]);

  // Session timeout on inactivity - Only for admin routes
  useEffect(() => {
    if (!user) return;

    // Check if we're on an admin route
    const isAdminRoute = () => {
      const path = window.location.pathname;
      return path.startsWith('/admin') || 
             path.startsWith('/superadmin') || 
             path.startsWith('/subadmin') ||
             path.startsWith('/login') ||
             path.startsWith('/unauthorized');
    };

    // Only track inactivity on admin routes
    if (!isAdminRoute()) return;

    let inactivityTimer;
    let lastActivity = Date.now();

    const resetTimer = () => {
      // Only reset if still on admin route
      if (!isAdminRoute()) {
        clearTimeout(inactivityTimer);
        return;
      }
      
      lastActivity = Date.now();
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        // Double-check we're still on admin route before showing alert
        if (!isAdminRoute()) {
          clearTimeout(inactivityTimer);
          return;
        }
        
        const timeSinceActivity = Date.now() - lastActivity;
        if (timeSinceActivity >= SESSION_TIMEOUT) {
          // Session expired due to inactivity - only show alert on admin routes
          logout();
          alert('Your session has expired due to inactivity. Please log in again.');
        }
      }, SESSION_TIMEOUT);
    };

    // Reset timer on user activity - only if on admin route
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      if (isAdminRoute()) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer();

    // Listen for route changes (React Router navigation)
    const handleRouteChange = () => {
      if (isAdminRoute()) {
        resetTimer();
      } else {
        clearTimeout(inactivityTimer);
      }
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    // Use a small interval to check for route changes (React Router doesn't trigger popstate)
    const routeCheckInterval = setInterval(() => {
      handleRouteChange();
    }, 1000);

    return () => {
      clearTimeout(inactivityTimer);
      clearInterval(routeCheckInterval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user, logout]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.role),
      loading, // Expose loading state
      login,
      logout,
      basePath: getBasePathForRole(user?.role),
    }),
    [user, loading, logout, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

