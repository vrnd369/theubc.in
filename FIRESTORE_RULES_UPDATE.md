# Firestore Security Rules Update

## ⚠️ Important: Authentication Required

The Firestore security rules have been updated to **require Firebase Authentication** for write operations. This is a critical security improvement.

## What Changed

### Before
- All collections allowed public read/write access (`allow read, write: if true`)
- Anyone could modify your data without authentication

### After
- **Public read access** - Website visitors can still read data (needed for the website to work)
- **Authenticated write access** - Only authenticated users can create, update, or delete data
- **Role-based access** - Admin users collection requires super admin role for writes

## Current Rules Summary

### Public Collections (Read: Public, Write: Authenticated)
- `contactPage` - Contact page content
- `navigation` - Navigation menu items
- `navigation-icons` - Navigation icons
- `homeSections` - Home page sections
- `aboutSections` - About page sections
- `images` - Image storage
- `videos` - Video storage
- `brands` - Brand information
- `categories` - Product categories
- `products` - Product information
- `brandPages` - Brand page content
- `careersPage` - Careers page content
- `header` - Header styling
- `footer` - Footer content
- `privacyPolicy` - Privacy Policy page content
- `cookiesPolicy` - Cookies Policy page content

### Form Collections (Read: Authenticated, Write: Public can create)
- `formSubmissions` - Form submissions (public can submit, admins can read/manage)
- `formSubmissionFiles` - Form file uploads (public can upload, admins can read/manage)
- `enquiry-form` - Enquiry form submissions (public can submit, admins can read/manage)

### Admin Collections (Read: Authenticated, Write: Super Admin only)
- `adminUsers` - Admin user management (only super admins can create/update/delete)
- `auditLogs` - Audit logs (authenticated users can read/write)

## ⚠️ Action Required: Integrate Firebase Authentication

**Your current authentication system uses custom authentication (storing passwords in Firestore).** To use these new security rules, you need to:

### Option 1: Integrate Firebase Authentication (Recommended)

1. **Enable Firebase Authentication** in Firebase Console:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Email/Password authentication

2. **Update your authentication system**:
   - When users log in, authenticate them with Firebase Auth
   - Store Firebase Auth UID in your `adminUsers` collection
   - Link Firebase Auth email to your admin user email

3. **Update login flow** in `src/admin/pages/Auth/Login.jsx`:
   ```javascript
   import { signInWithEmailAndPassword } from 'firebase/auth';
   import { auth } from '../../firebase/config';
   
   // After verifying user exists in adminUsers collection
   const userCredential = await signInWithEmailAndPassword(auth, email, password);
   // Then proceed with your existing login logic
   ```

4. **Update adminUsers collection structure**:
   - Add `firebaseUID` field to store Firebase Auth UID
   - Or use Firebase Auth UID as the document ID in adminUsers

### Option 2: Temporary Workaround (Not Recommended for Production)

If you need to deploy immediately without Firebase Auth integration, you can temporarily modify the rules to allow writes for authenticated users OR if a specific condition is met. However, this is **NOT SECURE** and should only be used for development.

**⚠️ DO NOT USE IN PRODUCTION:**
```javascript
// Temporary rule (INSECURE - for development only)
allow write: if true; // Allows anyone to write
```

## Testing the Rules

1. **Deploy rules to Firebase**:
   ```bash
   firebase deploy --only firestore:rules
   ```
   Or manually copy the rules from `firestore.rules` to Firebase Console → Firestore Database → Rules

2. **Test public read access**:
   - Visit your website - it should load normally
   - All public pages should display content

3. **Test authenticated write access**:
   - Try to create/update data without logging in - should fail
   - Log in as admin - should be able to create/update data

## Helper Functions in Rules

The rules include helper functions:

- `isAuthenticated()` - Checks if user is authenticated via Firebase Auth
- `isAdmin()` - Checks if user exists in adminUsers collection
- `hasRole(role)` - Checks if user has specific role (super_admin, admin, sub_admin)
- `isSuperAdmin()` - Checks if user is super admin
- `isAdminOrSuperAdmin()` - Checks if user is admin or super admin

## Role-Based Access

The rules support three admin roles:
- **super_admin** - Full access, can manage users
- **admin** - Can manage content, cannot manage users
- **sub_admin** - Limited access to specific modules

## Next Steps

1. ✅ Rules updated in `firestore.rules`
2. ⏳ Integrate Firebase Authentication
3. ⏳ Update adminUsers collection to include Firebase Auth UIDs
4. ⏳ Update login flow to use Firebase Auth
5. ⏳ Deploy rules to Firebase
6. ⏳ Test authentication and permissions

## Security Notes

- **Never commit `.env` files** with real credentials
- Use different Firebase projects for development and production
- Regularly review and update security rules
- Monitor Firebase usage and set up alerts
- Consider implementing rate limiting for write operations

## Troubleshooting

**Error: "Missing or insufficient permissions"**
- Make sure Firebase Authentication is enabled
- Verify user is authenticated before attempting writes
- Check that user exists in adminUsers collection
- Verify Firebase Auth UID matches adminUsers document

**Error: "Permission denied"**
- Check that rules are deployed to Firebase
- Verify authentication status
- Check user role in adminUsers collection

## Support

If you encounter issues:
1. Check Firebase Console → Firestore → Rules for syntax errors
2. Review browser console for detailed error messages
3. Check Firebase Authentication status in Firebase Console
4. Verify adminUsers collection structure matches expected format

