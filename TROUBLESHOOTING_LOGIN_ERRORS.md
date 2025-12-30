# Troubleshooting Login Errors

## Error 1: "400 Bad Request" from Firebase Auth

**Error Message:**
```
identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=...:1 
Failed to load resource: the server responded with a status of 400
```

### Cause
The user doesn't exist in Firebase Authentication yet. This happens when:
- Migration from Firestore to Firebase Auth hasn't been completed
- User was created in Firestore but not in Firebase Auth

### Solution

**Option A: Migrate Existing Users (Recommended)**
1. Run the migration script:
   ```bash
   node scripts/migrate-to-firebase-auth.js
   ```

**Option B: Manually Create User in Firebase Auth**
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter the email and password
4. Make sure the email matches exactly (case-insensitive)
5. Go to Firestore → `adminUsers` collection
6. Find the user document by email
7. Update the document ID to match the Firebase Auth UID
8. Add `firebaseUID` field with the UID value
9. Remove the `password` field (no longer needed)

## Error 2: "Missing or insufficient permissions" in Firestore

**Error Message:**
```
Error fetching user data: FirebaseError: Missing or insufficient permissions.
```

### Cause
The Firestore security rules are blocking access. This can happen if:
- The user exists in Firebase Auth but not in `adminUsers` collection
- The `adminUsers` document ID doesn't match the Firebase Auth UID
- Firestore rules haven't been deployed

### Solution

**Step 1: Verify User Exists in Both Places**
1. Check Firebase Auth: Console → Authentication → Users
2. Check Firestore: Console → Firestore → `adminUsers` collection
3. Make sure:
   - Document ID in Firestore = Firebase Auth UID
   - Email matches in both places

**Step 2: Deploy Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

Or manually:
1. Go to Firebase Console → Firestore Database → Rules
2. Copy contents from `firestore.rules`
3. Paste and click "Publish"

**Step 3: Verify Document Structure**
The `adminUsers` document should have:
- Document ID = Firebase Auth UID
- Fields: `email`, `role`, `name`, `isActive`, `createdAt`
- NO `password` field (removed after migration)

## Quick Fix Checklist

If you're getting both errors:

1. ✅ **Create user in Firebase Auth**
   - Console → Authentication → Add user
   - Use same email/password as in Firestore

2. ✅ **Update Firestore document**
   - Find user in `adminUsers` by email
   - Change document ID to Firebase Auth UID
   - Remove `password` field
   - Add `firebaseUID` field (optional, for reference)

3. ✅ **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. ✅ **Test login**
   - Try logging in again
   - Should work now!

## Prevention: Use Migration Script

To avoid these issues in the future, always use the migration script when setting up Firebase Auth:

```bash
# Install dependencies
npm install firebase-admin

# Download service account key from Firebase Console
# Save as service-account-key.json

# Run migration
node scripts/migrate-to-firebase-auth.js
```

The script will:
- Create Firebase Auth users for all existing Firestore users
- Update Firestore documents to use Firebase Auth UID as document ID
- Remove plain text passwords
- Handle all edge cases automatically

## Still Having Issues?

1. **Check Firebase Console logs**
   - Console → Functions → Logs (if using Cloud Functions)
   - Console → Firestore → Usage (check for permission errors)

2. **Verify environment variables**
   - Make sure `.env` file has all Firebase config variables
   - Restart development server after changing `.env`

3. **Clear browser cache**
   - Sometimes old auth tokens cause issues
   - Clear cache and try again

4. **Check network tab**
   - Look for specific error codes in browser DevTools
   - Error codes can give more specific information

