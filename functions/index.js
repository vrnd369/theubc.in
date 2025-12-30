/**
 * Firebase Cloud Functions for Admin User Management
 * 
 * These functions handle creating, updating, and deleting Firebase Auth users
 * since these operations require admin privileges and cannot be done from client-side code.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Initialize functions: firebase init functions
 * 4. Install dependencies: cd functions && npm install
 * 5. Deploy: firebase deploy --only functions
 * 
 * Make sure to set up Firebase Admin SDK with your service account key.
 */

const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure to set up your service account key
// You can download it from Firebase Console > Project Settings > Service Accounts
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Input Sanitization Utility
 * Prevents XSS and injection attacks
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }
  return email.toLowerCase().trim().replace(/[<>]/g, '');
}

function sanitizeObject(obj, allowedFields = null) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (allowedFields && !allowedFields.includes(key)) {
      continue;
    }
    if (typeof value === 'string') {
      if (key === 'password' || key === 'newPassword' || key.includes('token')) {
        sanitized[key] = value.trim();
      } else if (key === 'email') {
        sanitized[key] = sanitizeEmail(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, allowedFields);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Rate limiting storage (in-memory, resets on function restart)
 * For production, consider using Redis or Firestore for persistent rate limiting
 */
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = `${identifier}_${Math.floor(now / windowMs)}`;
  
  const count = rateLimitStore.get(key) || 0;
  if (count >= maxRequests) {
    return false;
  }
  
  rateLimitStore.set(key, count + 1);
  
  // Clean up old entries (keep only last 10 windows)
  if (rateLimitStore.size > 100) {
    const keysToDelete = Array.from(rateLimitStore.keys()).slice(0, 50);
    keysToDelete.forEach(k => rateLimitStore.delete(k));
  }
  
  return true;
}

/**
 * Create a new admin user in Firebase Auth and Firestore
 * Only super admins can call this function
 */
const { onCall, HttpsError } = require('firebase-functions/v1/https');

// CORS configuration - restrict to your domain(s)
// Update these with your actual production domains
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:3000', // Development
  'http://localhost:3001', // Development
];

// CORS Configuration
// Note: Firebase Functions v1 onCall automatically handles CORS for authenticated requests
// For stricter CORS control in production:
// 1. Enable Firebase App Check (recommended) - https://firebase.google.com/docs/app-check
// 2. Migrate to Firebase Functions v2 which supports explicit CORS configuration
// 3. Use HTTP functions instead of onCall for more control
//
// For now, authentication requirement provides basic protection
// Update these domains for monitoring/logging purposes
const ALLOWED_ORIGINS = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:3000', // Development
  'http://localhost:3001', // Development
];

exports.createAdminUser = onCall(async (data, context) => {
  // Log CORS for monitoring (v1 onCall doesn't expose rawRequest easily)
  // For production, consider using Firebase App Check for additional security

  // Rate limiting
  const clientId = context.auth?.uid || context.rawRequest?.ip || 'anonymous';
  if (!checkRateLimit(`createAdminUser_${clientId}`, 5, 60000)) {
    throw new HttpsError(
      'resource-exhausted',
      'Too many requests. Please try again later.'
    );
  }

  // Verify authentication
  if (!context.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be logged in to create admin users.'
    );
  }

  // Verify user is super admin
  const callerDoc = await db.collection('adminUsers').doc(context.auth.uid).get();
  if (!callerDoc.exists) {
    throw new HttpsError(
      'permission-denied',
      'You are not an admin user.'
    );
  }

  const callerData = callerDoc.data();
  if (callerData.role !== 'super_admin') {
    throw new HttpsError(
      'permission-denied',
      'Only super admins can create admin users.'
    );
  }

  // Sanitize and validate input
  const allowedFields = ['email', 'password', 'role', 'name', 'isActive', 'createdBy'];
  const sanitizedData = sanitizeObject(data, allowedFields);
  
  const { email, password, role, name, isActive, createdBy } = sanitizedData;

  if (!email || !password) {
    throw new HttpsError(
      'invalid-argument',
      'Email and password are required.'
    );
  }

  if (!['super_admin', 'admin', 'sub_admin'].includes(role)) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid role specified.'
    );
  }
  // Verify authentication
  if (!context.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be logged in to create admin users.'
    );
  }

  // Verify user is super admin
  const callerDoc = await db.collection('adminUsers').doc(context.auth.uid).get();
  if (!callerDoc.exists) {
    throw new HttpsError(
      'permission-denied',
      'You are not an admin user.'
    );
  }

  const callerData = callerDoc.data();
  if (callerData.role !== 'super_admin') {
    throw new HttpsError(
      'permission-denied',
      'Only super admins can create admin users.'
    );
  }

  // Validate input
  const { email, password, role, name, isActive, createdBy } = data;

  if (!email || !password) {
    throw new HttpsError(
      'invalid-argument',
      'Email and password are required.'
    );
  }

  if (!['super_admin', 'admin', 'sub_admin'].includes(role)) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid role specified.'
    );
  }

  try {
    // Log operation start (without sensitive data)
    console.log('Creating admin user - operation started');
    
    // Check if email already exists in Firestore
    const existingUserQuery = await db.collection('adminUsers')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (!existingUserQuery.empty) {
      console.log('User creation failed: email already exists in Firestore');
      throw new HttpsError(
        'already-exists',
        'An admin user with this email already exists.'
      );
    }

    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email: email.toLowerCase().trim(),
      password: password.trim(),
      emailVerified: true, // Skip email verification since super admin creates users
      disabled: isActive === false,
    });

    // Log success (without sensitive data like password)
    console.log('Firebase Auth user created successfully');

    // Create Firestore document with Firebase Auth UID as document ID
    const userDoc = {
      email: email.toLowerCase().trim(),
      role: role,
      name: name || '',
      isActive: isActive !== false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: createdBy || context.auth.uid,
    };

    await db.collection('adminUsers').doc(firebaseUser.uid).set(userDoc);
    console.log('Admin user created successfully');

    return {
      uid: firebaseUser.uid,
      userDoc: {
        ...userDoc,
        id: firebaseUser.uid,
      },
    };
  } catch (error) {
    // Log error without sensitive data (no error.message, no error.stack)
    console.error('Error creating admin user - error code:', error.code);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'An admin user with this email already exists in Firebase Auth.'
      );
    }
    
    if (error.code === 'auth/invalid-email') {
      throw new HttpsError(
        'invalid-argument',
        'Invalid email address provided.'
      );
    }
    
    if (error.code === 'auth/weak-password') {
      throw new HttpsError(
        'invalid-argument',
        'Password is too weak. Please use a stronger password.'
      );
    }
    
    // Handle Firestore errors
    if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
      throw new HttpsError(
        'permission-denied',
        'Permission denied when creating Firestore document. Check Firestore rules.'
      );
    }
    
    // Generic error message (don't expose internal error details)
    throw new HttpsError(
      'internal',
      'Failed to create admin user. Please try again or contact support.'
    );
  }
});

/**
 * Update admin user password in Firebase Auth
 * Only super admins or the user themselves can update passwords
 */
exports.updateAdminUserPassword = onCall(async (data, context) => {
  // CORS is handled automatically by Firebase Functions v1 onCall
  // For stricter control, consider using Firebase App Check

  // Rate limiting
  const clientId = context.auth?.uid || context.rawRequest?.ip || 'anonymous';
  if (!checkRateLimit(`updatePassword_${clientId}`, 5, 60000)) {
    throw new HttpsError(
      'resource-exhausted',
      'Too many requests. Please try again later.'
    );
  }

  if (!context.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be logged in.'
    );
  }

  // Sanitize input
  const sanitizedData = sanitizeObject(data, ['uid', 'newPassword']);
  const { uid, newPassword } = sanitizedData;

  if (!uid || !newPassword) {
    throw new HttpsError(
      'invalid-argument',
      'User ID and new password are required.'
    );
  }

  // Verify user is super admin or updating their own password
  const callerDoc = await db.collection('adminUsers').doc(context.auth.uid).get();
  if (!callerDoc.exists) {
    throw new HttpsError(
      'permission-denied',
      'You are not an admin user.'
    );
  }

  const callerData = callerDoc.data();
  const isSuperAdmin = callerData.role === 'super_admin';
  const isSelf = context.auth.uid === uid;

  if (!isSuperAdmin && !isSelf) {
    throw new HttpsError(
      'permission-denied',
      'You can only update your own password or be a super admin.'
    );
  }

  try {
    await auth.updateUser(uid, {
      password: newPassword.trim(),
    });

    console.log('Password updated successfully');
    return { success: true };
  } catch (error) {
    // Log error without sensitive data
    console.error('Error updating password - error code:', error.code);
    throw new HttpsError(
      'internal',
      'Failed to update password. Please try again or contact support.'
    );
  }
});

/**
 * Automatically create Firestore document when Firebase Auth user is created
 * This triggers when a user is created in Firebase Authentication
 * Note: Commented out as it requires v2 API which may need additional configuration
 * The createAdminUser function already creates the Firestore document, so this is optional
 */
// const { beforeUserCreated } = require('firebase-functions/v2/identity');
// exports.onUserCreate = beforeUserCreated(async (event) => {
//   const user = event.data;
//   try {
//     // Check if document already exists (shouldn't happen, but safety check)
//     const userDocRef = db.collection('adminUsers').doc(user.uid);
//     const userDoc = await userDocRef.get();
//
//     if (userDoc.exists) {
//       console.log(`User document already exists for ${user.uid}`);
//       return null;
//     }
//
//     // Create default admin user document
//     // Note: This creates with default role 'sub_admin'
//     // Super admin should update this manually or use createAdminUser function
//     const defaultUserDoc = {
//       email: user.email || '',
//       role: 'sub_admin', // Default role - should be updated by super admin
//       name: user.displayName || user.email?.split('@')[0] || 'User',
//       isActive: true,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       createdBy: 'system', // System-created during migration
//       autoCreated: true, // Flag to indicate this was auto-created
//     };
//
//     await userDocRef.set(defaultUserDoc);
//     console.log(`Auto-created adminUsers document for ${user.uid}`);
//
//     return null;
//   } catch (error) {
//     console.error('Error auto-creating user document:', error);
//     // Don't throw - we don't want to block user creation
//     return null;
//   }
// });

/**
 * Delete an admin user from Firebase Auth and Firestore
 * Only super admins can delete users
 */
exports.deleteAdminUser = onCall(async (data, context) => {
  // CORS is handled automatically by Firebase Functions v1 onCall
  // For stricter control, consider using Firebase App Check

  // Rate limiting
  const clientId = context.auth?.uid || context.rawRequest?.ip || 'anonymous';
  if (!checkRateLimit(`deleteAdminUser_${clientId}`, 3, 60000)) {
    throw new HttpsError(
      'resource-exhausted',
      'Too many requests. Please try again later.'
    );
  }

  if (!context.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be logged in to delete admin users.'
    );
  }

  // Verify user is super admin
  const callerDoc = await db.collection('adminUsers').doc(context.auth.uid).get();
  if (!callerDoc.exists) {
    throw new HttpsError(
      'permission-denied',
      'You are not an admin user.'
    );
  }

  const callerData = callerDoc.data();
  if (callerData.role !== 'super_admin') {
    throw new HttpsError(
      'permission-denied',
      'Only super admins can delete admin users.'
    );
  }

  // Sanitize input
  const sanitizedData = sanitizeObject(data, ['uid']);
  const { uid } = sanitizedData;

  if (!uid) {
    throw new HttpsError(
      'invalid-argument',
      'User ID is required.'
    );
  }

  // Prevent self-deletion
  if (context.auth.uid === uid) {
    throw new HttpsError(
      'permission-denied',
      'You cannot delete your own account.'
    );
  }

  try {
    // Delete Firebase Auth user
    await auth.deleteUser(uid);

    // Delete Firestore document
    await db.collection('adminUsers').doc(uid).delete();

    console.log('Admin user deleted successfully');
    return { success: true };
  } catch (error) {
    // Log error without sensitive data
    console.error('Error deleting admin user - error code:', error.code);
    throw new HttpsError(
      'internal',
      'Failed to delete admin user. Please try again or contact support.'
    );
  }
});

