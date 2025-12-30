# Firebase Cloud Functions Setup Guide

## Overview

Cloud Functions are required to create, update, and delete Firebase Auth users because these operations require admin privileges and cannot be performed from client-side code.

## Prerequisites

1. Node.js 18+ installed
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Firebase project initialized

## Setup Steps

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Functions

```bash
firebase init functions
```

When prompted:
- Select your Firebase project
- Choose JavaScript (or TypeScript if you prefer)
- Install dependencies: Yes
- Use ESLint: Yes (optional)

### 4. Install Dependencies

```bash
cd functions
npm install
```

### 5. Set Up Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `functions/service-account-key.json` (or update the path in `functions/index.js`)

**⚠️ IMPORTANT:** Add `service-account-key.json` to `.gitignore` to prevent committing secrets!

### 6. Update functions/index.js

The `functions/index.js` file is already created with the necessary functions. If you saved your service account key with a different name or path, update the initialization code:

```javascript
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### 7. Deploy Functions

```bash
firebase deploy --only functions
```

Or deploy a specific function:

```bash
firebase deploy --only functions:createAdminUser
```

## Available Functions

### 1. `createAdminUser`
Creates a new Firebase Auth user and Firestore document.

**Called from:** `src/admin/services/userService.js` → `createAdminUser()`

**Permissions:** Only super admins can create users

### 2. `updateAdminUserPassword`
Updates a user's password in Firebase Auth.

**Called from:** `src/admin/services/userService.js` → `updateAdminUser()`

**Permissions:** Super admins or the user themselves

### 3. `deleteAdminUser`
Deletes a Firebase Auth user and Firestore document.

**Called from:** `src/admin/services/userService.js` → `deleteAdminUser()`

**Permissions:** Only super admins can delete users

## Testing Functions Locally

### Start Emulator

```bash
firebase emulators:start --only functions
```

### Test Function

You can test functions using the Firebase Console or by calling them from your app in development mode.

## Troubleshooting

### Error: "Permission denied"
- Make sure you're logged in as a super admin
- Check that the caller's role is 'super_admin' in Firestore

### Error: "Function not found"
- Make sure functions are deployed: `firebase deploy --only functions`
- Check that function names match between client and server code

### Error: "Service account key not found"
- Make sure `service-account-key.json` exists in the `functions/` directory
- Or update the path in `functions/index.js`

## Security Notes

1. **Never commit service account keys** - Add to `.gitignore`
2. **Functions automatically verify permissions** - Only super admins can create/delete users
3. **Password updates are restricted** - Users can only update their own password (unless super admin)

## Next Steps

After deploying functions:
1. Test creating a new user from the admin panel
2. Verify the user can log in with Firebase Auth
3. Test updating user password
4. Test deleting a user

