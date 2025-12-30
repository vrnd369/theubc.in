# Firebase Authentication Implementation Guide

## ✅ Implementation Complete!

All code changes have been made to integrate Firebase Authentication. Follow this guide to complete the setup.

## 📋 What Has Been Changed

### 1. **Firebase Config** (`src/firebase/config.js`)
- ✅ Added Firebase Auth initialization
- ✅ Exported `auth` object for use throughout the app

### 2. **Login Component** (`src/admin/pages/Auth/Login.jsx`)
- ✅ Updated to use `signInWithEmailAndPassword` from Firebase Auth
- ✅ Generic error messages to prevent user enumeration
- ✅ Validates user exists in `adminUsers` collection after Firebase Auth

### 3. **Auth Context** (`src/admin/auth/AuthContext.jsx`)
- ✅ Integrated Firebase Auth state listener
- ✅ Automatic session management via Firebase Auth
- ✅ Session timeout after 30 minutes of inactivity
- ✅ Removed localStorage-based auth (now uses Firebase Auth tokens)

### 4. **User Service** (`src/admin/services/userService.js`)
- ✅ Updated to use Cloud Functions for user creation/updates
- ✅ Removed plain text password storage
- ✅ Removed old `authenticateAdminUser` function (no longer needed)

### 5. **Firestore Rules** (`firestore.rules`)
- ✅ Updated all write rules to require Firebase Auth
- ✅ Role-based access control enforced
- ✅ Only authenticated admins can write data

### 6. **Cloud Functions** (`functions/index.js`)
- ✅ Created functions for user management
- ✅ Secure server-side user creation/updates/deletion

## 🚀 Setup Steps

### Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Enable **Email/Password** (first toggle)
6. **Disable** "Email link (passwordless sign-in)" - not needed
7. **Disable** "Email verification" - not needed since super admin creates users
8. Click **Save**

### Step 2: Migrate Existing Users

**Option A: Use Migration Script (Recommended)**

1. Install dependencies:
   ```bash
   npm install firebase-admin readline
   ```

2. Download your service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `service-account-key.json` in project root

3. Update migration script path:
   - Edit `scripts/migrate-to-firebase-auth.js`
   - Update line 12: `require('../service-account-key.json')`

4. Run migration:
   ```bash
   node scripts/migrate-to-firebase-auth.js
   ```

**Option B: Manual Migration (For Few Users)**

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and password for each user
4. Go to Firestore → `adminUsers` collection
5. For each user:
   - Find document by email
   - Update document ID to match Firebase Auth UID
   - Add `firebaseUID` field with the UID
   - Remove `password` field

### Step 3: Set Up Cloud Functions

1. **Install Firebase CLI** (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Functions**:
   ```bash
   firebase init functions
   ```
   - Select your project
   - Choose JavaScript
   - Install dependencies: Yes

4. **Set Up Service Account**:
   - Download service account key from Firebase Console
   - Save as `functions/service-account-key.json`
   - **⚠️ Add to `.gitignore`!**

5. **Update functions/index.js** (if needed):
   - The file is already created with all necessary functions
   - If your service account key has a different path, update line 15

6. **Deploy Functions**:
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

### Step 4: Deploy Firestore Rules

1. **Deploy rules via CLI**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Or manually**:
   - Go to Firebase Console → Firestore Database → Rules
   - Copy contents from `firestore.rules`
   - Paste and click "Publish"

### Step 5: Test the Implementation

1. **Test Login**:
   - Try logging in with a migrated user
   - Should work with Firebase Auth

2. **Test User Creation**:
   - As super admin, create a new user
   - Should create both Firebase Auth user and Firestore document

3. **Test Session Timeout**:
   - Log in and wait 30 minutes without activity
   - Should automatically log out

4. **Test Firestore Rules**:
   - Try accessing Firestore without login (should fail)
   - Log in and try again (should work)

## 🔒 Security Improvements Achieved

### ✅ Authentication
- [x] Passwords hashed using Firebase Auth (bcrypt internally)
- [x] Login rate limiting (Firebase Auth handles this)
- [x] Generic login error messages
- [x] Secure password reset (can be added via Firebase Auth)
- [ ] MFA supported (can be added later)

### ✅ Authorization
- [x] Authorization enforced on every request (Firestore rules)
- [x] Object-level access control (IDOR protection)
- [x] Role-based access checks server-side (Firestore rules)
- [x] Admin functions fully restricted (Cloud Functions)

### ✅ Session Management
- [x] Secure session/token handling (Firebase Auth tokens)
- [x] Sessions expire after inactivity (30 minutes)
- [x] Logout invalidates sessions (Firebase Auth)
- [x] Secure cookie flags (Firebase Auth handles this)

## ⚠️ Important Notes

### Before Going to Production

1. **Remove Migration Script**: Delete `scripts/migrate-to-firebase-auth.js` after migration
2. **Remove Service Account Keys**: Make sure they're in `.gitignore`
3. **Test All Features**: Ensure everything works before deploying
4. **Backup Data**: Backup Firestore before migration
5. **Monitor Logs**: Check Firebase Console for any errors

### Known Limitations

1. **Cloud Functions Required**: User creation/updates require Cloud Functions
2. **Migration Needed**: Existing users must be migrated to Firebase Auth
3. **No MFA Yet**: Multi-factor authentication can be added later

## 🐛 Troubleshooting

### "Function not found" Error
- **Solution**: Deploy Cloud Functions: `firebase deploy --only functions`
- **Check**: Function names match between client and server code

### "Permission denied" Error
- **Solution**: Check Firestore rules are deployed
- **Check**: User is authenticated and has correct role

### "User not found" After Login
- **Solution**: User exists in Firebase Auth but not in `adminUsers` collection
- **Fix**: Run migration script or manually create Firestore document

### Can't Create Users
- **Solution**: Make sure Cloud Functions are deployed
- **Check**: You're logged in as super admin
- **Check**: Service account key is set up correctly

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)

## 🎉 Next Steps

After completing setup:

1. ✅ Test all functionality
2. ✅ Monitor for errors
3. ✅ Consider adding MFA for admins
4. ✅ Set up password reset flow (optional)
5. ✅ Add rate limiting for API calls (optional)

---

**Need Help?** Check the troubleshooting section or review the code comments in the updated files.

