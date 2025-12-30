# Create User Document in Firestore

## Your User Information
- **Firebase Auth UID**: `fDwGOVZCS6YlDK5VlAksmrA9N6P2`
- **Email**: `superadmin@theubc.com`

## Step-by-Step Instructions

### Step 1: Open Firestore Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Click on **Data** tab

### Step 2: Navigate to adminUsers Collection
1. Find the `adminUsers` collection in the list
2. Click on it to open

### Step 3: Create New Document
1. Click the **"Add document"** button (or the **+** icon)
2. **IMPORTANT**: In the "Document ID" field, paste this exact UID:
   ```
   fDwGOVZCS6YlDK5VlAksmrA9N6P2
   ```
   ⚠️ **DO NOT** use "Auto-ID" - you MUST use the exact UID above!

### Step 4: Add Fields
Click "Add field" and add these fields one by one:

| Field Name | Type | Value |
|------------|------|-------|
| `email` | string | `superadmin@theubc.com` |
| `role` | string | `super_admin` |
| `name` | string | `Super Admin` (or your name) |
| `isActive` | boolean | `true` |
| `createdAt` | timestamp | Click "Set" and use current time |

### Step 5: Save
1. Click **"Save"** button
2. The document should now appear in the collection

### Step 6: Verify
The document should look like this:
```
Document ID: fDwGOVZCS6YlDK5VlAksmrA9N6P2
Fields:
  - email: "superadmin@theubc.com"
  - role: "super_admin"
  - name: "Super Admin"
  - isActive: true
  - createdAt: [timestamp]
```

### Step 7: Test Login
1. Go back to your app
2. Try logging in again
3. Should work now! ✅

## Alternative: Use Firebase Console UI

If you prefer, you can also:
1. Go to Firestore → Data
2. Click on `adminUsers` collection
3. Click "Start collection" if it doesn't exist
4. Document ID: `fDwGOVZCS6YlDK5VlAksmrA9N6P2`
5. Add the fields as described above

## Quick Copy-Paste Values

**Document ID:**
```
fDwGOVZCS6YlDK5VlAksmrA9N6P2
```

**Fields (JSON format for reference):**
```json
{
  "email": "superadmin@theubc.com",
  "role": "super_admin",
  "name": "Super Admin",
  "isActive": true,
  "createdAt": "[use Firestore timestamp]"
}
```

## Troubleshooting

**If document already exists with different ID:**
1. Find the existing document (might be using email or old ID)
2. Note all field values
3. Delete the old document
4. Create new one with correct UID as document ID

**If you get "Document ID already exists":**
- The document might already exist - check if it has the correct fields
- If fields are wrong, update them instead of creating new

**If still getting permission errors:**
1. Verify Firestore rules are deployed
2. Check that document ID matches UID exactly (case-sensitive!)
3. Make sure `isActive` is set to `true`

