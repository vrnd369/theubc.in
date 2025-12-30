# Quick Start: Firebase Auth Integration

## 🎯 What You Need to Do (5 Steps)

### 1. Enable Firebase Auth (2 minutes)
- Go to Firebase Console → Authentication → Sign-in method
- Enable **Email/Password** only
- Disable email verification

### 2. Migrate Existing Users (5-10 minutes)
**Option A: Automated (Recommended)**
```bash
# Install dependencies
npm install firebase-admin

# Download service account key from Firebase Console
# Save as service-account-key.json in project root

# Run migration
node scripts/migrate-to-firebase-auth.js
```

**Option B: Manual (For 1-2 users)**
- Create users in Firebase Console → Authentication
- Update Firestore `adminUsers` documents to use Firebase Auth UID as document ID

### 3. Set Up Cloud Functions (10 minutes)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize functions
firebase init functions

# Install dependencies
cd functions && npm install && cd ..

# Download service account key to functions/ folder
# Deploy functions
firebase deploy --only functions
```

### 4. Deploy Firestore Rules (1 minute)
```bash
firebase deploy --only firestore:rules
```

### 5. Test Everything (5 minutes)
- ✅ Login with migrated user
- ✅ Create new user (as super admin)
- ✅ Update user password
- ✅ Delete user (as super admin)
- ✅ Verify session timeout (wait 30 min or test manually)

## ✅ What's Already Done

- ✅ Code updated to use Firebase Auth
- ✅ Login component uses `signInWithEmailAndPassword`
- ✅ Auth context uses Firebase Auth state
- ✅ Session timeout (30 minutes inactivity)
- ✅ Firestore rules require authentication
- ✅ Cloud Functions created for user management
- ✅ User service updated to use Cloud Functions

## 📝 Files Changed

- `src/firebase/config.js` - Added Auth
- `src/admin/pages/Auth/Login.jsx` - Uses Firebase Auth
- `src/admin/auth/AuthContext.jsx` - Firebase Auth state management
- `src/admin/services/userService.js` - Uses Cloud Functions
- `firestore.rules` - Requires authentication
- `functions/index.js` - Cloud Functions for user management

## 🆘 Common Issues

**"Function not found"**
→ Deploy functions: `firebase deploy --only functions`

**"Permission denied"**
→ Deploy rules: `firebase deploy --only firestore:rules`

**"User not found" after login**
→ Run migration script or manually create Firestore document

## 📚 Full Documentation

See `FIREBASE_AUTH_IMPLEMENTATION_GUIDE.md` for detailed instructions.

