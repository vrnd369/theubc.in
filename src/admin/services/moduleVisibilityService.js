import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateAndCompressDocument } from '../../utils/firestoreCompression';
import { isExistingUser, markUserAsExisting } from '../../utils/userCache';
import { MODULES } from '../auth/roleConfig';

const MODULE_VISIBILITY_COLLECTION = 'moduleVisibility';
const MODULE_VISIBILITY_DOC_ID = 'settings';

/**
 * Get module visibility settings
 * Uses cache for existing users, server for new users
 * @returns {Promise<Object>} Object with module IDs as keys and enabled (boolean) as values
 */
export const getModuleVisibility = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, MODULE_VISIBILITY_COLLECTION, MODULE_VISIBILITY_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    
    if (!snap.exists()) {
      // Return default: all modules visible
      return getDefaultVisibility();
    }
    
    // Mark user as existing after first successful fetch
    if (!useCache) {
      markUserAsExisting();
    }
    
    const data = snap.data();
    return data.visibility || getDefaultVisibility();
  } catch (error) {
    console.warn('Error fetching module visibility, using defaults:', error);
    return getDefaultVisibility();
  }
};

/**
 * Get default visibility settings (all modules visible by default)
 * @returns {Object} Default visibility object
 */
const getDefaultVisibility = () => {
  // All modules visible by default
  const defaultVisibility = {};
  Object.values(MODULES).forEach(moduleId => {
    // Dashboard should always be visible
    if (moduleId !== MODULES.DASHBOARD) {
      defaultVisibility[moduleId] = true;
    }
  });
  return defaultVisibility;
};

/**
 * Update module visibility setting
 * @param {string} moduleId - Module ID (e.g., MODULES.PRODUCTS)
 * @param {boolean} enabled - Whether the module should be visible
 * @returns {Promise<void>}
 */
export const setModuleVisibility = async (moduleId, enabled) => {
  try {
    const currentVisibility = await getModuleVisibility();
    const updatedVisibility = {
      ...currentVisibility,
      [moduleId]: enabled
    };

    const payload = {
      visibility: updatedVisibility,
      updatedAt: new Date().toISOString()
    };

    const compressedData = await validateAndCompressDocument(payload);

    const ref = doc(db, MODULE_VISIBILITY_COLLECTION, MODULE_VISIBILITY_DOC_ID);
    await setDoc(ref, compressedData, { merge: true });
  } catch (error) {
    console.error('Error updating module visibility:', error);
    throw error;
  }
};

/**
 * Check if a module is visible
 * @param {string} moduleId - Module ID to check
 * @returns {Promise<boolean>} True if module should be visible
 */
export const isModuleVisible = async (moduleId) => {
  try {
    const visibility = await getModuleVisibility();
    // Default to true if not set (backward compatibility)
    return visibility[moduleId] !== false;
  } catch (error) {
    console.error('Error checking module visibility:', error);
    // Default to visible on error
    return true;
  }
};

