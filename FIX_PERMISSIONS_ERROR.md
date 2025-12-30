# Fix "Missing or insufficient permissions" Error

## Problem

You're getting this error when trying to log in:
```
Error fetching user data: FirebaseError: Missing or insufficient permissions.
```

## Root Cause

This happens when:
1. ✅ User successfully authenticates with Firebase Auth
2. ❌ But the user document doesn't exist in Firestore `adminUsers` collection
3. ❌ OR the document ID doesn't match the Firebase Auth UID

## Solution

### Step 1: Verify User Exists in Firebase Auth

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Users**
3. Find your user by email
4. **Copy the UID** (it's shown next to the email)

### Step 2: Check Firestore `adminUsers` Collection

1. Go to **Firestore Database** → **Data**
2. Open the `adminUsers` collection
3. Check if a document exists with the **document ID = Firebase Auth UID**

### Step 3: Fix the Document

**Option A: Document doesn't exist**
1. Click "Add document" in `adminUsers` collection
2. **Document ID**: Paste the Firebase Auth UID (from Step 1)
3. Add these fields:
   ```
   email: "user@example.com" (string)
   role: "admin" or "super_admin" or "sub_admin" (string)
   name: "User Name" (string)
   isActive: true (boolean)
   createdAt: (timestamp - use Firestore timestamp)
   ```
4. Click "Save"

**Option B: Document exists but wrong ID**
1. Find the document (might be using old ID or email as ID)
2. Note down all the field values
3. Delete the old document
4. Create a new document with:
   - **Document ID** = Firebase Auth UID
   - Same field values as before

**Option C: Use Migration Script (Recommended for Multiple Users)**

Run the migration script to automatically fix all users:

```bash
# Install dependencies
npm install firebase-admin

# Download service account key from Firebase Console
# Save as service-account-key.json

# Run migration
node scripts/migrate-to-firebase-auth.js
```

## Quick Verification

After fixing, verify the setup:

1. **Firebase Auth**: User exists with email/password ✅
2. **Firestore**: Document exists in `adminUsers` with:
   - Document ID = Firebase Auth UID ✅
   - Fields: email, role, name, isActive ✅
3. **Firestore Rules**: Deployed and allow reading own document ✅

## Test

1. Try logging in again
2. Should work now! ✅

## Still Not Working?

### Check Firestore Rules

1. Go to **Firestore Database** → **Rules**
2. Verify this rule exists:
   ```
   match /adminUsers/{userId} {
     allow read: if isAuthenticated() && request.auth.uid == userId;
     ...
   }
   ```
3. If not, deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Check Browser Console

Look for more detailed error messages that might indicate:
- Specific permission denied reasons
- Network errors
- Auth token issues

### Common Issues

**Issue**: "Document doesn't exist"
- **Fix**: Create the document as described in Step 3

**Issue**: "Document ID mismatch"
- **Fix**: Update document ID to match Firebase Auth UID

**Issue**: "Rules not deployed"
- **Fix**: Deploy rules: `firebase deploy --only firestore:rules`

**Issue**: "User not authenticated"
- **Fix**: Make sure Firebase Auth login succeeded first

## Prevention

To avoid this in the future:
1. Always use the migration script when setting up Firebase Auth
2. When creating new users, use Cloud Functions (they create both Auth user and Firestore document)
3. Never manually create Firebase Auth users without creating corresponding Firestore documents
