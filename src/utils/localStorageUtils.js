/**
 * Centralized localStorage utility with expiration and error handling
 * Provides a consistent API for caching data across the application
 */

// Default cache expiration times (in milliseconds)
const DEFAULT_EXPIRY = {
  NAV_ITEMS: 30 * 60 * 1000,        // 30 minutes
  HEADER_CONFIG: 60 * 60 * 1000,    // 1 hour
  LOGO: 24 * 60 * 60 * 1000,       // 24 hours
  ICONS: 5 * 60 * 1000,             // 5 minutes
  PRODUCTS: 15 * 60 * 1000,         // 15 minutes
  HOME_SECTIONS: 30 * 60 * 1000,    // 30 minutes
  ABOUT_SECTIONS: 30 * 60 * 1000,   // 30 minutes
  CAREERS: 60 * 60 * 1000,          // 1 hour
  CONTACT: 60 * 60 * 1000,          // 1 hour
};

// Maximum cache size (5MB - localStorage limit is typically 5-10MB)
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
const isStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get the size of a string in bytes
 * @param {string} str - String to measure
 * @returns {number} Size in bytes
 */
const getStringSize = (str) => {
  return new Blob([str]).size;
};

/**
 * Get total size of all localStorage items
 * @returns {number} Total size in bytes
 */
const getTotalStorageSize = () => {
  let total = 0;
  try {
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += getStringSize(localStorage[key]) + getStringSize(key);
      }
    }
  } catch (e) {
    // Ignore errors
  }
  return total;
};

/**
 * Clear oldest cache entries if storage is getting full
 * @param {number} targetSize - Target size to free up (in bytes)
 */
const clearOldestCache = (targetSize = 1024 * 1024) => {
  try {
    const entries = [];
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('ubc_')) {
        const value = localStorage.getItem(key);
        let timestamp = null;
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.timestamp) {
            timestamp = parsed.timestamp;
          }
        } catch (e) {
          // Not a timestamped entry
        }
        entries.push({ key, size: getStringSize(value), timestamp });
      }
    }
    
    // Sort by timestamp (oldest first) or size (largest first if no timestamp)
    entries.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      if (a.timestamp) return -1;
      if (b.timestamp) return 1;
      return b.size - a.size;
    });
    
    let freed = 0;
    for (const entry of entries) {
      if (freed >= targetSize) break;
      localStorage.removeItem(entry.key);
      freed += entry.size;
    }
  } catch (e) {
    console.warn('Error clearing old cache:', e);
  }
};

/**
 * Save data to localStorage with optional expiration
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @param {number} [expiryMs] - Expiration time in milliseconds
 * @returns {boolean} True if saved successfully
 */
export const saveToCache = (key, value, expiryMs = null) => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const data = {
      value,
      timestamp: Date.now(),
      ...(expiryMs && { expiry: expiryMs }),
    };

    const jsonString = JSON.stringify(data);
    const size = getStringSize(jsonString) + getStringSize(key);

    // Check if we need to free up space
    const currentSize = getTotalStorageSize();
    if (currentSize + size > MAX_CACHE_SIZE) {
      clearOldestCache(size);
    }

    localStorage.setItem(key, jsonString);
    return true;
  } catch (e) {
    // Handle quota exceeded error
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn(`Storage quota exceeded for key: ${key}. Clearing old cache...`);
      clearOldestCache();
      try {
        const data = {
          value,
          timestamp: Date.now(),
          ...(expiryMs && { expiry: expiryMs }),
        };
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (e2) {
        console.error(`Failed to save ${key} after clearing cache:`, e2);
        return false;
      }
    }
    console.error(`Error saving to cache (${key}):`, e);
    return false;
  }
};

/**
 * Load data from localStorage with expiration check
 * @param {string} key - Storage key
 * @param {*} [defaultValue] - Default value if not found or expired
 * @returns {*} Cached value or defaultValue
 */
export const loadFromCache = (key, defaultValue = null) => {
  if (!isStorageAvailable()) {
    return defaultValue;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return defaultValue;
    }

    const data = JSON.parse(raw);

    // Check if data has expiration
    if (data.expiry && data.timestamp) {
      const age = Date.now() - data.timestamp;
      if (age > data.expiry) {
        // Expired - remove it
        localStorage.removeItem(key);
        return defaultValue;
      }
    }

    return data.value !== undefined ? data.value : defaultValue;
  } catch (e) {
    console.error(`Error loading from cache (${key}):`, e);
    // Try to clean up corrupted data
    try {
      localStorage.removeItem(key);
    } catch (e2) {
      // Ignore cleanup errors
    }
    return defaultValue;
  }
};

/**
 * Remove item from cache
 * @param {string} key - Storage key
 * @returns {boolean} True if removed successfully
 */
export const removeFromCache = (key) => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`Error removing from cache (${key}):`, e);
    return false;
  }
};

/**
 * Clear all UBC-related cache entries
 * @returns {boolean} True if cleared successfully
 */
export const clearAllCache = () => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const keysToRemove = [];
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('ubc_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (e) {
    console.error('Error clearing cache:', e);
    return false;
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  if (!isStorageAvailable()) {
    return { totalSize: 0, itemCount: 0, items: [] };
  }

  try {
    const items = [];
    let totalSize = 0;
    let itemCount = 0;

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('ubc_')) {
        const value = localStorage.getItem(key);
        const size = getStringSize(value) + getStringSize(key);
        totalSize += size;
        itemCount++;

        let age = null;
        let expired = false;
        try {
          const parsed = JSON.parse(value);
          if (parsed && parsed.timestamp) {
            age = Date.now() - parsed.timestamp;
            if (parsed.expiry && age > parsed.expiry) {
              expired = true;
            }
          }
        } catch (e) {
          // Not a timestamped entry
        }

        items.push({
          key,
          size,
          age,
          expired,
        });
      }
    }

    return {
      totalSize,
      itemCount,
      items: items.sort((a, b) => b.size - a.size),
    };
  } catch (e) {
    console.error('Error getting cache stats:', e);
    return { totalSize: 0, itemCount: 0, items: [] };
  }
};

/**
 * Convenience functions for common cache operations with default expiry
 */
export const cacheUtils = {
  // Navigation items
  saveNavItems: (items) => saveToCache('ubc_nav_items', items, DEFAULT_EXPIRY.NAV_ITEMS),
  loadNavItems: () => loadFromCache('ubc_nav_items', []),

  // Header config
  saveHeaderConfig: (config) => saveToCache('ubc_header_config', config, DEFAULT_EXPIRY.HEADER_CONFIG),
  loadHeaderConfig: () => loadFromCache('ubc_header_config', null),

  // Logo
  saveLogo: (logoUrl) => saveToCache('ubc_header_logo_resolved', logoUrl, DEFAULT_EXPIRY.LOGO),
  loadLogo: () => loadFromCache('ubc_header_logo_resolved', null),

  // Navigation icons
  saveNavIcons: (icons) => saveToCache('ubc_nav_icons', icons, DEFAULT_EXPIRY.ICONS),
  loadNavIcons: () => loadFromCache('ubc_nav_icons', {}),

  // Products
  saveProducts: (products) => saveToCache('ubc_products_data', products, DEFAULT_EXPIRY.PRODUCTS),
  loadProducts: () => loadFromCache('ubc_products_data', null),

  // Home sections
  saveHomeSections: (sections) => saveToCache('ubc_home_sections', sections, DEFAULT_EXPIRY.HOME_SECTIONS),
  loadHomeSections: () => loadFromCache('ubc_home_sections', null),

  // About sections
  saveAboutSections: (sections) => saveToCache('ubc_about_sections', sections, DEFAULT_EXPIRY.ABOUT_SECTIONS),
  loadAboutSections: () => loadFromCache('ubc_about_sections', null),

  // Careers
  saveCareers: (careers) => saveToCache('ubc_careers_config', careers, DEFAULT_EXPIRY.CAREERS),
  loadCareers: () => loadFromCache('ubc_careers_config', null),

  // Contact
  saveContact: (contact) => saveToCache('ubc_contact_config', contact, DEFAULT_EXPIRY.CONTACT),
  loadContact: () => loadFromCache('ubc_contact_config', null),

  // Privacy Policy
  savePrivacyPolicy: (policy) => saveToCache('ubc_privacy_policy', policy, DEFAULT_EXPIRY.CAREERS),
  loadPrivacyPolicy: () => loadFromCache('ubc_privacy_policy', null),

  // Cookies Policy
  saveCookiesPolicy: (policy) => saveToCache('ubc_cookies_policy', policy, DEFAULT_EXPIRY.CAREERS),
  loadCookiesPolicy: () => loadFromCache('ubc_cookies_policy', null),
};

/**
 * Legacy compatibility functions (for backward compatibility)
 * These maintain the old API while using the new implementation
 */
export const loadJSON = (key) => {
  return loadFromCache(key, null);
};

export const saveJSON = (key, value) => {
  // Use default expiry based on key
  let expiry = null;
  if (key === 'ubc_nav_items') expiry = DEFAULT_EXPIRY.NAV_ITEMS;
  else if (key === 'ubc_header_config') expiry = DEFAULT_EXPIRY.HEADER_CONFIG;
  else if (key === 'ubc_header_logo_resolved') expiry = DEFAULT_EXPIRY.LOGO;
  else if (key === 'ubc_nav_icons') expiry = DEFAULT_EXPIRY.ICONS;
  
  return saveToCache(key, value, expiry);
};

