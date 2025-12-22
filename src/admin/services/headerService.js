import { doc, getDoc, getDocFromServer, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { validateAndCompressDocument } from "../../utils/firestoreCompression";
import { isExistingUser, markUserAsExisting } from "../../utils/userCache";

const HEADER_CONFIG_DOC = "header-config";
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

// Helper function to add timeout to promises
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

// Helper function to retry with exponential backoff
const retryWithBackoff = async (fn, retries = MAX_RETRIES, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

// Extract default config to a separate function
const getDefaultHeaderConfig = () => ({
  logo: null,
  navbarBackground: "rgba(255,255,255,0.85)",
  navbarBackgroundScrolled: "#FFFFFF",
  navbarBorder: "rgba(229,231,235,0.85)",
  navbarBorderScrolled: "rgba(17,24,39,0.10)",
  navbarShadow: "0 6px 18px rgba(0,0,0,0.08)",
  navbarShadowScrolled: "0 10px 30px rgba(0,0,0,0.12)",
  navbarPaddingTop: "8px",
  navbarPaddingBottom: "8px",
  navbarPaddingLeft: "30px",
  navbarPaddingRight: "20px",
  navbarPaddingTopScrolled: "8px",
  navbarPaddingBottomScrolled: "8px",
  navbarPaddingLeftScrolled: "28px",
  navbarPaddingRightScrolled: "18px",
  navbarWrapPaddingTop: "16px",
  navbarWrapPaddingBottom: "16px",
  navbarGap: "20px",
  linkColor: "rgba(25, 29, 35, 0.6)",
  linkColorActive: "rgba(25, 29, 35, 0.9)",
  linkHoverBackground: "#F0F1F6",
  linkPadding: "10px 12px",
  linkBorderRadius: "12px",
  linkLineHeight: "21px",
  linkLetterSpacing: "0%",
  dropdownBackground: "#FFFFFF",
  dropdownBorder: "rgba(229,231,235,.7)",
  dropdownShadow: "0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)",
  dropdownItemHover: "#F7F7FB",
  dropdownBorderRadius: "16px",
  dropdownPadding: "12px 8px",
  dropdownMinWidth: "220px",
  dropdownItemPadding: "10px",
  dropdownItemBorderRadius: "10px",
  dropdownTopOffset: "calc(100% + 4px)",
  dropdownItemColor: "#374151",
  dropdownItemHoverColor: "#374151",
  dropdownCategoryHoverColor: "#1e3a8a",
  ctaBackground: "#323790",
  ctaBackgroundHover: "#1C1F52",
  ctaColor: "#FFFFFF",
  ctaShadow: "0 8px 20px rgba(50, 55, 144, 0.4)",
  ctaWidth: "154px",
  ctaHeight: "47px",
  ctaPadding: "0",
  ctaBorderRadius: "999px",
  ctaFontSize: "14px",
  ctaLineHeight: "22.5px",
  ctaLetterSpacing: "-0.19px",
  fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontSize: "14px",
  fontWeight: "400",
  logoHeight: "36px",
  logoFilter: "none",
  navbarBorderRadius: "999px",
  navbarHeight: "80px",
  navbarHeightScrolled: "80px",
  brandIconSize: "28px",
  categoryIconSize: "100px",
  submenuIconSize: "120px",
  mobileMenuBackground: "#FFFFFF",
  mobileMenuPadding: "70px 20px 20px 20px",
  mobileMenuBorderColor: "rgba(229, 231, 235, 0.5)",
  mobileMenuShadow: "0 0 40px rgba(0, 0, 0, 0.1)",
  hamburgerColor: "#374151",
  hamburgerSize: "28px",
  hamburgerBarHeight: "3px",
  hamburgerBarBorderRadius: "2px",
  transitionDuration: "0.25s",
  transitionTiming: "ease",
  containerMaxWidth: "1280px",
  containerPadding: "24px",
  submenuBorderRadius: "12px",
  submenuPadding: "8px",
  submenuMinWidth: "360px",
  submenuMaxWidth: "400px",
  submenuShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)",
  navbarZIndex: "100",
  dropdownZIndex: "1001",
  submenuZIndex: "1002",
  hamburgerZIndex: "1001",
  mobileNavZIndex: "1000",
});

/**
 * Get header/navbar configuration
 * Uses cache for existing users, server for new users
 * Includes timeout and retry logic for better reliability
 * @returns {Promise<Object>} Header configuration
 */
export const getHeaderConfig = async () => {
  try {
    const useCache = isExistingUser();
    
    // Try to fetch with timeout and retry
    const fetchDoc = async () => {
      const docRef = doc(db, "header", HEADER_CONFIG_DOC);
      const fetchPromise = useCache 
        ? getDoc(docRef)
        : getDocFromServer(docRef);
      
      return await withTimeout(fetchPromise, REQUEST_TIMEOUT);
    };

    const docSnap = await retryWithBackoff(fetchDoc);
    
    if (docSnap.exists()) {
      // Mark user as existing after first successful fetch
      if (!useCache) {
        markUserAsExisting();
      }
      return docSnap.data();
    }
    
    // Return default configuration if document doesn't exist
    return getDefaultHeaderConfig();
  } catch (error) {
    console.warn("Error fetching header config (using defaults):", error.message);
    // Return default configuration on any error
    return getDefaultHeaderConfig();
  }
};

/**
 * Set header/navbar configuration
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export const setHeaderConfig = async (config) => {
  try {
    const compressedData = await validateAndCompressDocument({
      ...config,
      updatedAt: new Date().toISOString(),
    });

    await setDoc(doc(db, "header", HEADER_CONFIG_DOC), compressedData, {
      merge: true,
    });
  } catch (error) {
    console.error("Error setting header config:", error);
    throw error;
  }
};

/**
 * Import header configuration from the current live website
 * Extracts styles from Navbar.css and current Navbar component
 * @returns {Promise<Object>} Imported header configuration
 */
export const importHeaderFromLive = async () => {
  // These defaults mirror the current Navbar.css and Navbar.jsx
  const defaultConfig = {
    logo: null, // Default logo from assets
    // Navbar colors - from Navbar.css
    navbarBackground: "rgba(255,255,255,0.85)",
    navbarBackgroundScrolled: "#FFFFFF",
    navbarBorder: "rgba(229,231,235,0.85)",
    navbarBorderScrolled: "rgba(17,24,39,0.10)",
    navbarShadow: "0 6px 18px rgba(0,0,0,0.08)",
    navbarShadowScrolled: "0 10px 30px rgba(0,0,0,0.12)",
    // Navbar padding and spacing
    navbarPaddingTop: "8px",
    navbarPaddingBottom: "8px",
    navbarPaddingLeft: "30px",
    navbarPaddingRight: "20px",
    navbarPaddingTopScrolled: "8px",
    navbarPaddingBottomScrolled: "8px",
    navbarPaddingLeftScrolled: "28px",
    navbarPaddingRightScrolled: "18px",
    navbarWrapPaddingTop: "16px",
    navbarWrapPaddingBottom: "16px",
    navbarGap: "20px",
    // Link colors - from Navbar.css .nav-links a
    linkColor: "rgba(25, 29, 35, 0.6)",
    linkColorActive: "rgba(25, 29, 35, 0.9)",
    linkHoverBackground: "#F0F1F6",
    linkPadding: "10px 12px",
    linkBorderRadius: "12px",
    linkLineHeight: "21px",
    linkLetterSpacing: "0%",
    // Dropdown colors - from Navbar.css .dropdown .menu
    dropdownBackground: "#FFFFFF",
    dropdownBorder: "rgba(229,231,235,.7)",
    dropdownShadow: "0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)",
    dropdownItemHover: "#F7F7FB",
    dropdownBorderRadius: "16px",
    dropdownPadding: "12px 8px",
    dropdownMinWidth: "220px",
    dropdownItemPadding: "10px",
    dropdownItemBorderRadius: "10px",
    dropdownTopOffset: "calc(100% + 4px)",
    dropdownItemColor: "#374151",
    dropdownItemHoverColor: "#374151",
    dropdownCategoryHoverColor: "#1e3a8a",
    // CTA button colors - from Navbar.css .btn.cta
    ctaBackground: "#323790",
    ctaBackgroundHover: "#1C1F52",
    ctaColor: "#FFFFFF",
    ctaShadow: "0 8px 20px rgba(50, 55, 144, 0.4)",
    ctaWidth: "154px",
    ctaHeight: "47px",
    ctaPadding: "0",
    ctaBorderRadius: "999px",
    ctaFontSize: "14px",
    ctaLineHeight: "22.5px",
    ctaLetterSpacing: "-0.19px",
    // Font settings - from Navbar.css
    fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    fontWeight: "400",
    // Logo settings - from Navbar.css .brand img
    logoHeight: "36px",
    logoFilter:
      "brightness(0) saturate(100%) invert(16%) sepia(85%) saturate(2500%) hue-rotate(210deg) brightness(0.65) contrast(1.15)",
    // Border radius - from Navbar.css
    navbarBorderRadius: "999px",
    // Height - from Navbar.css
    navbarHeight: "80px",
    navbarHeightScrolled: "80px",
    // Icon sizes
    brandIconSize: "28px",
    categoryIconSize: "100px",
    submenuIconSize: "120px",
    // Mobile menu
    mobileMenuBackground: "#FFFFFF",
    mobileMenuPadding: "70px 20px 20px 20px",
    mobileMenuBorderColor: "rgba(229, 231, 235, 0.5)",
    mobileMenuShadow: "0 0 40px rgba(0, 0, 0, 0.1)",
    // Hamburger menu
    hamburgerColor: "#374151",
    hamburgerSize: "28px",
    hamburgerBarHeight: "3px",
    hamburgerBarBorderRadius: "2px",
    // Transitions
    transitionDuration: "0.25s",
    transitionTiming: "ease",
    // Container
    containerMaxWidth: "1280px",
    containerPadding: "24px",
    // Submenu
    submenuBorderRadius: "12px",
    submenuPadding: "8px",
    submenuMinWidth: "360px",
    submenuMaxWidth: "400px",
    submenuShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)",
    // Z-index
    navbarZIndex: "100",
    dropdownZIndex: "1001",
    submenuZIndex: "1002",
    hamburgerZIndex: "1001",
    mobileNavZIndex: "1000",
  };

  await setHeaderConfig(defaultConfig);
  return defaultConfig;
};
