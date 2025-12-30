# Debug: Why Document Isn't Being Found

## Quick Check

Since you can see the document in Firebase Console, let's verify:

### 1. Check Document ID
The document ID **MUST** be exactly: `fDwGOVZCS6YlDK5VlAksmrA9N6P2`

**Common issues:**
- ❌ Document ID is the email: `superadmin@theubc.com`
- ❌ Document ID is something else
- ✅ Document ID should be: `fDwGOVZCS6YlDK5VlAksmrA9N6P2`

### 2. Check Document Location
- Collection: `adminUsers` (exact spelling, case-sensitive)
- Document ID: `fDwGOVZCS6YlDK5VlAksmrA9N6P2`

### 3. Check Firestore Rules
Make sure rules are deployed:
```bash
firebase deploy --only firestore:rules
```

### 4. Check Browser Console
After the update, the console will show:
- ✅ "Found user document:" - if document is found
- ❌ "Permission denied" - if rules are blocking
- ❌ "Auto-creating document..." - if document doesn't exist

## What I Fixed

1. **Now uses `getDocFromServer()`** - Bypasses cache to get fresh data
2. **Better error handling** - Distinguishes between "not found" vs "permission denied"
3. **More detailed logging** - Shows exactly what's happening

## Next Steps

1. **Refresh your browser** (to get the updated code)
2. **Try logging in again**
3. **Check browser console** - it will show detailed information:
   - If document is found: "Found user document: {uid, email, role}"
   - If permission denied: "Permission denied" with troubleshooting steps
   - If not found: "Auto-creating document..."

## If Still Not Working

### Check Document ID in Firebase Console
1. Go to Firestore → Data → `adminUsers`
2. Find your document
3. **Check the Document ID** (the leftmost column)
4. It should be: `fDwGOVZCS6YlDK5VlAksmrA9N6P2`

### If Document ID is Different
1. Note all field values from the existing document
2. Delete the old document
3. Create new document with:
   - **Document ID**: `fDwGOVZCS6YlDK5VlAksmrA9N6P2` (exact UID)
   - **Fields**: Copy from old document

### Verify Rules Are Deployed
1. Go to Firestore → Rules
2. Check if this rule exists:
   ```
   match /adminUsers/{userId} {
     allow read: if isAuthenticated() && request.auth.uid == userId;
     ...
   }
   ```
3. If not, deploy: `firebase deploy --only firestore:rules`

## Expected Console Output

**If document exists and is readable:**
```
Found user document: {uid: "fDwGOVZCS6YlDK5VlAksmrA9N6P2", email: "superadmin@theubc.com", role: "super_admin", isActive: true}
User logged in successfully: {id: "...", email: "...", role: "..."}
```

**If permission denied:**
```
❌ Error fetching user data: FirebaseError: Missing or insufficient permissions
⚠️ Permission denied. Possible causes:
1. Firestore rules not deployed
2. Document exists but rules don't allow reading
```

**If document doesn't exist:**
```
Auto-creating document...
✅ Auto-created adminUsers document for fDwGOVZCS6YlDK5VlAksmrA9N6P2
```

