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

const PRIVACY_POLICY_COLLECTION = 'privacyPolicy';
const PRIVACY_POLICY_DOC_ID = 'default';

/**
 * Get Privacy Policy content (single document)
 * Uses cache for existing users, server for new users
 */
export const getPrivacyPolicy = async () => {
  try {
    // Try cache first
    const cached = cacheUtils.loadPrivacyPolicy();
    if (cached) {
      // Return cached data immediately, but still fetch fresh in background
      setTimeout(() => {
        fetchFreshPrivacyPolicy();
      }, 0);
      return cached;
    }

    const useCache = isExistingUser();
    const ref = doc(db, PRIVACY_POLICY_COLLECTION, PRIVACY_POLICY_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    
    if (!snap.exists()) {
      return getDefaultPrivacyPolicy();
    }
    
    // Mark user as existing after first successful fetch
    if (!useCache) {
      markUserAsExisting();
    }
    
    const data = { id: snap.id, ...snap.data() };
    cacheUtils.savePrivacyPolicy(data);
    return data;
  } catch (error) {
    console.warn('Error fetching privacy policy, using cached/default:', error);
    const cached = cacheUtils.loadPrivacyPolicy();
    if (cached) return cached;
    return getDefaultPrivacyPolicy();
  }
};

/**
 * Fetch fresh privacy policy (background update)
 */
const fetchFreshPrivacyPolicy = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, PRIVACY_POLICY_COLLECTION, PRIVACY_POLICY_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() };
      cacheUtils.savePrivacyPolicy(data);
    }
  } catch (error) {
    // Silently fail background update
  }
};

/**
 * Check if Privacy Policy exists
 */
export const hasPrivacyPolicy = async () => {
  try {
    const useCache = isExistingUser();
    const ref = doc(db, PRIVACY_POLICY_COLLECTION, PRIVACY_POLICY_DOC_ID);
    const snap = useCache ? await getDoc(ref) : await getDocFromServer(ref);
    return snap.exists();
  } catch (error) {
    console.error('Error checking privacy policy:', error);
    return false;
  }
};

/**
 * Save (create or update) Privacy Policy
 */
export const savePrivacyPolicy = async (policy) => {
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

    const ref = doc(db, PRIVACY_POLICY_COLLECTION, PRIVACY_POLICY_DOC_ID);
    await setDoc(ref, compressedData, { merge: true });
    
    // Update cache
    cacheUtils.savePrivacyPolicy({ id: PRIVACY_POLICY_DOC_ID, ...compressedData });
  } catch (error) {
    console.error('Error saving privacy policy:', error);
    throw error;
  }
};

/**
 * Get default Privacy Policy content
 */
export const getDefaultPrivacyPolicy = () => {
  return {
    id: PRIVACY_POLICY_DOC_ID,
    tagStar: '★',
    tagText: 'PRIVACY POLICY',
    sections: [
      {
        id: 'introduction',
        title: '1. Introduction',
        content: 'United Brothers Company ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.',
        order: 1
      },
      {
        id: 'information-collect',
        title: '2. Information We Collect',
        content: 'We may collect information about you in a variety of ways. The information we may collect includes:',
        listItems: [
          { text: 'Personal Data: Name, email address, phone number, postal address, and other contact information you provide when contacting us or using our services.' },
          { text: 'Usage Data: Information about how you access and use our website, including your IP address, browser type, pages visited, and time spent on pages.' },
          { text: 'Cookies and Tracking Technologies: We use cookies and similar tracking technologies to track activity on our website and store certain information.' }
        ],
        order: 2
      },
      {
        id: 'how-we-use',
        title: '3. How We Use Your Information',
        content: 'We use the information we collect for various purposes, including:',
        listItems: [
          { text: 'To provide, maintain, and improve our services' },
          { text: 'To respond to your inquiries, comments, and requests' },
          { text: 'To send you marketing communications (with your consent)' },
          { text: 'To analyze usage patterns and improve user experience' },
          { text: 'To comply with legal obligations and protect our rights' }
        ],
        order: 3
      },
      {
        id: 'information-sharing',
        title: '4. Information Sharing and Disclosure',
        content: 'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:',
        listItems: [
          { text: 'Service Providers: We may share information with third-party service providers who perform services on our behalf, such as hosting, analytics, and customer service.' },
          { text: 'Legal Requirements: We may disclose your information if required by law or in response to valid requests by public authorities.' },
          { text: 'Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.' }
        ],
        order: 4
      },
      {
        id: 'data-security',
        title: '5. Data Security',
        content: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
        order: 5
      },
      {
        id: 'your-rights',
        title: '6. Your Rights',
        content: 'Depending on your location, you may have certain rights regarding your personal information, including:',
        listItems: [
          { text: 'The right to access and receive a copy of your personal data' },
          { text: 'The right to rectify inaccurate or incomplete data' },
          { text: 'The right to request deletion of your personal data' },
          { text: 'The right to object to processing of your personal data' },
          { text: 'The right to data portability' },
          { text: 'The right to withdraw consent at any time' }
        ],
        order: 6
      },
      {
        id: 'cookies-tracking',
        title: '7. Cookies and Tracking Technologies',
        content: 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.',
        order: 7
      },
      {
        id: 'third-party-links',
        title: '8. Third-Party Links',
        content: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.',
        order: 8
      },
      {
        id: 'children-privacy',
        title: '9. Children\'s Privacy',
        content: 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.',
        order: 9
      },
      {
        id: 'changes',
        title: '10. Changes to This Privacy Policy',
        content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.',
        order: 10
      },
      {
        id: 'contact',
        title: '11. Contact Us',
        content: 'If you have any questions about this Privacy Policy or our data practices, please contact us at:',
        contactInfo: {
          email: 'marketing@soilkingfoods.com',
          phone: '+91 8143150953 | 04023399533',
          address: 'H.No. 8-2-334/60 & 61, Road No. 5, Banjara Hills, Hyderabad-500034, Telangana.'
        },
        order: 11
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Import Privacy Policy from current static page
 */
export const importPrivacyPolicyFromLive = async () => {
  const defaultPolicy = getDefaultPrivacyPolicy();
  await savePrivacyPolicy(defaultPolicy);
  return defaultPolicy;
};

