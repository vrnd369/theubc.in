# Deploy Firebase Cloud Functions

## Issue
The `createAdminUser` Cloud Function is returning `functions/internal` error, which typically means:
1. The function is not deployed
2. The function is deployed but failing internally
3. There's a configuration issue

## Quick Fix Steps

### 1. Install Dependencies (if not already done)
```bash
cd functions
npm install
```

### 2. Deploy the Function
```bash
# From the project root
firebase deploy --only functions:createAdminUser
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

### 3. Check Function Logs
If the error persists after deployment, check the logs:
```bash
firebase functions:log --only createAdminUser
```

### 4. Verify Function is Deployed
Check in Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Functions** section
4. Verify `createAdminUser` function is listed and shows "Deployed" status

## Common Issues and Solutions

### Issue: "Function not found"
**Solution:** Deploy the function using step 2 above.

### Issue: "Permission denied"
**Solution:** 
- Ensure you're logged in as a Super Admin
- Check Firestore rules allow the function to read/write `adminUsers` collection
- Verify the function has proper IAM permissions

### Issue: "Internal error"
**Solution:**
1. Check Firebase Functions logs: `firebase functions:log`
2. Look for specific error messages in the logs
3. Common causes:
   - Firebase Admin SDK not initialized properly
   - Firestore permissions issue
   - Invalid input data

### Issue: Node version mismatch
The functions require Node 18, but you may have Node 22 installed. This shouldn't prevent deployment, but if you encounter issues:
- Use Node Version Manager (nvm) to switch to Node 18
- Or update `functions/package.json` to use Node 22 (if compatible)

## Testing the Function

After deployment, test by creating a new admin user through the admin panel. If it still fails:
1. Check browser console for detailed error messages
2. Check Firebase Functions logs for server-side errors
3. Verify the user creating the admin user has `super_admin` role

## Updated Error Handling

The function now includes:
- Better error logging
- More descriptive error messages
- Specific error codes for different failure scenarios

If you see a generic "internal" error, check the Firebase Functions logs for the actual error message.

