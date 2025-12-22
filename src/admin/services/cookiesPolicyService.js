import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { validateAndCompressDocument } from '../../utils/firestoreCompression';
import { isExistingUser, markUserAsExisting } from '../../utils/userCache';
import { cacheUtils } from '../../utils/localStorageUtils';

const COOKIES_POLICY_COLLECTION = 'cookiesPolicy';
const COOKIES_POLICY_DOC_ID = 'default';

/**
 * Get Cookies Policy content (single document)
 * Uses cache for existing users, server for new users
 */
export const getCookiesPolicy = async () => {
  try {
    // Try cache first
    const cached = cacheUtils.loadCookiesPolicy();
    if (cached) {
      // Return cached data immediately, but still fetch fresh in background
      setTimeout(() => {
        fetchFreshCookiesPolicy();
      }, 0);
      return cached;
    }

    const useCache = isExistingUser();
    const ref = doc(db, COOKIES_POLICY_COLLECTION, COOKIES_POLICY_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    
    if (!snap.exists()) {
      return getDefaultCookiesPolicy();
    }
    
    // Mark user as existing after first successful fetch
    if (!useCache) {
      markUserAsExisting();
    }
    
    const data = { id: snap.id, ...snap.data() };
    cacheUtils.saveCookiesPolicy(data);
    return data;
  } catch (error) {
    console.warn('Error fetching cookies policy, using cached/default:', error);
    const cached = cacheUtils.loadCookiesPolicy();
    if (cached) return cached;
    return getDefaultCookiesPolicy();
  }
};

/**
 * Fetch fresh cookies policy (background update)
 */
const fetchFreshCookiesPolicy = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, COOKIES_POLICY_COLLECTION, COOKIES_POLICY_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() };
      cacheUtils.saveCookiesPolicy(data);
    }
  } catch (error) {
    // Silently fail background update
  }
};

/**
 * Check if Cookies Policy exists
 */
export const hasCookiesPolicy = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, COOKIES_POLICY_COLLECTION, COOKIES_POLICY_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    return snap.exists();
  } catch (error) {
    console.error('Error checking cookies policy:', error);
    return false;
  }
};

/**
 * Save (create or update) Cookies Policy
 */
export const saveCookiesPolicy = async (policy) => {
  try {
    const now = new Date().toISOString();
    const payload = {
      ...policy,
      updatedAt: now
    };
    if (!policy.createdAt) {
      payload.createdAt = now;
    }

    const compressedData = await validateAndCompressDocument(payload);

    const ref = doc(db, COOKIES_POLICY_COLLECTION, COOKIES_POLICY_DOC_ID);
    await setDoc(ref, compressedData, { merge: true });
    
    // Update cache
    cacheUtils.saveCookiesPolicy({ id: COOKIES_POLICY_DOC_ID, ...compressedData });
  } catch (error) {
    console.error('Error saving cookies policy:', error);
    throw error;
  }
};

/**
 * Get default Cookies Policy content
 */
export const getDefaultCookiesPolicy = () => {
  return {
    id: COOKIES_POLICY_DOC_ID,
    tagStar: '★',
    tagText: 'COOKIES POLICY',
    sections: [
      {
        id: 'what-are-cookies',
        title: '1. What Are Cookies',
        content: 'Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.',
        order: 1
      },
      {
        id: 'how-we-use',
        title: '2. How We Use Cookies',
        content: 'We use cookies and similar tracking technologies for the following purposes:',
        listItems: [
          { text: 'Essential Cookies: These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.' },
          { text: 'Performance Cookies: These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.' },
          { text: 'Functionality Cookies: These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.' },
          { text: 'Local Storage: We use browser local storage to cache website data for faster loading and offline functionality.' }
        ],
        order: 2
      },
      {
        id: 'types-of-cookies',
        title: '3. Types of Cookies We Use',
        subsections: [
          {
            id: 'essential-cookies',
            title: '3.1 Essential Cookies',
            content: 'These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.',
            order: 1
          },
          {
            id: 'local-storage',
            title: '3.2 Local Storage',
            content: 'We use browser local storage to store:',
            listItems: [
              { text: 'Navigation configuration cache' },
              { text: 'Header configuration cache' },
              { text: 'Logo and image URLs' },
              { text: 'User preferences' }
            ],
            additionalContent: 'This helps improve website performance and allows the site to work offline or with slow connections. Local storage data is stored on your device and can be cleared through your browser settings.',
            order: 2
          }
        ],
        order: 3
      },
      {
        id: 'managing-cookies',
        title: '4. Managing Cookies',
        content: 'Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your ability to use our website. You can:',
        listItems: [
          { text: 'Delete cookies from your browser settings' },
          { text: 'Block cookies through your browser settings' },
          { text: 'Clear local storage through your browser\'s developer tools' },
          { text: 'Set your browser to notify you when cookies are being set' }
        ],
        additionalContent: 'Note: Disabling cookies may affect the functionality of our website, including the ability to cache data for faster loading and offline access. Some features may not work properly if cookies are disabled.',
        order: 4
      },
      {
        id: 'third-party-cookies',
        title: '5. Third-Party Cookies',
        content: 'We may use third-party services that set cookies on your device. These services help us analyze website traffic and improve our services. We do not control these third-party cookies. Please refer to the privacy policies of these third-party services for more information about their cookie practices.',
        order: 5
      },
      {
        id: 'cookie-duration',
        title: '6. Cookie Duration',
        content: 'We use both session cookies and persistent cookies:',
        listItems: [
          { text: 'Session Cookies: These are temporary cookies that expire when you close your browser. They help maintain your session while you navigate our website.' },
          { text: 'Persistent Cookies: These cookies remain on your device for a set period or until you delete them. They help us remember your preferences and improve your experience on future visits.' }
        ],
        order: 6
      },
      {
        id: 'updates',
        title: '7. Updates to This Policy',
        content: 'We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Cookies Policy on this page and updating the "Last updated" date. You are advised to review this Cookies Policy periodically for any changes.',
        order: 7
      },
      {
        id: 'contact',
        title: '8. Contact Us',
        content: 'If you have any questions about our use of cookies or this Cookies Policy, please contact us:',
        contactInfo: {
          email: 'marketing@soilkingfoods.com',
          phone: '+91 8143150953 | 04023399533',
          address: 'H.No. 8-2-334/60 & 61, Road No. 5, Banjara Hills, Hyderabad-500034, Telangana.',
          contactPageLink: '/contact'
        },
        order: 8
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Import Cookies Policy from current static page
 */
export const importCookiesPolicyFromLive = async () => {
  const defaultPolicy = getDefaultCookiesPolicy();
  await saveCookiesPolicy(defaultPolicy);
  return defaultPolicy;
};

