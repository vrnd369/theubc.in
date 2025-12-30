# Fix Firestore Permissions Error

## Problem
You're getting "Missing or insufficient permissions" when trying to log in, even though:
- ✅ Firebase Authentication is working (you can see the UID in console)
- ✅ The document exists in Firestore
- ❌ But Firestore rules are blocking the read

## Solution: Verify Firestore Rules in Console

Since you manually updated the rules in Firebase Console, let's verify they're correct.

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select project: **theubc-bec27**
3. Go to **Firestore Database** → **Rules** tab

### Step 2: Verify the `adminUsers` Rules

Make sure your rules include this **exact** section for `adminUsers`:

```javascript
// Admin users - authenticated users can read their own document
match /adminUsers/{userId} {
  // Allow users to read their own document (needed for login)
  allow read: if isAuthenticated() && request.auth.uid == userId;
  
  // Allow admins to read all admin user documents
  allow read: if isAuthenticated() && 
                  request.auth.uid != userId &&
                  exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid)) &&
                  (get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == 'admin' ||
                   get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == 'super_admin');
  
  // Allow users to create their own document if it doesn't exist
  allow create: if isAuthenticated() && 
                   request.auth.uid == userId &&
                   !exists(/databases/$(database)/documents/adminUsers/$(userId));
  
  // Only super admins can update/delete
  allow update, delete: if isAuthenticated() &&
                           exists(/databases/$(database)/documents/adminUsers/$(request.auth.uid)) &&
                           get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == 'super_admin';
}
```

### Step 3: Check for Common Issues

**Issue 1: Missing `isAuthenticated()` function**
Make sure you have this helper function at the top:
```javascript
function isAuthenticated() {
  return request.auth != null;
}
```

**Issue 2: Rules not saved**
- Click **Publish** button after making changes
- Wait for "Rules published successfully" message

**Issue 3: Syntax errors**
- Check for red error indicators in the rules editor
- Make sure all brackets `{}` are properly closed
- Make sure all quotes are properly closed

### Step 4: Copy Complete Rules

If you're not sure, copy the **entire** rules from `firestore.rules` file in your project and paste into the Firebase Console.

The complete rules file is at: `firestore.rules`

### Step 5: Test After Publishing

1. **Publish** the rules in Firebase Console
2. Wait 10-20 seconds for rules to propagate
3. **Refresh your browser** (clear cache: Ctrl+Shift+R)
4. Try logging in again

## Quick Test

After updating rules, check browser console. You should see:
- ✅ "Found user document: {uid, email, role, isActive}"
- ❌ If still "Permission denied", the rules aren't correct

## Alternative: Deploy Rules via CLI

If you have Firebase CLI access:

```bash
# Make sure you're logged in
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## Still Not Working?

1. **Check document exists**: Firestore → Data → `adminUsers` → Document ID should be your Firebase Auth UID
2. **Check UID matches**: The document ID must exactly match `request.auth.uid`
3. **Check rules are published**: Look for "Rules published" message in console
4. **Wait for propagation**: Rules can take 10-20 seconds to propagate

