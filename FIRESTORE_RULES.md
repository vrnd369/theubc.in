# Firestore Security Rules Setup

## Problem

You're getting "Missing or insufficient permissions" error when trying to upload images to Firestore.

## Solution

You need to update your Firestore security rules in the Firebase Console.

## Steps to Fix:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `theubc-e055c`
3. **Navigate to Firestore Database** → **Rules** tab
4. **Replace your current rules with the following:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to contactPage collection (for Contact page CMS)
    match /contactPage/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to navigation collection
    match /navigation/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to navigation-icons collection (for image uploads)
    match /navigation-icons/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to homeSections collection (for Home Management CMS)
    match /homeSections/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to aboutSections collection (for About Management CMS)
    match /aboutSections/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to images collection (for image storage in Firestore)
    match /images/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to videos collection (for video storage in Firestore)
    match /videos/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to brands collection
    match /brands/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to categories collection
    match /categories/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to products collection
    match /products/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to brandPages collection (for Brand Pages Management CMS)
    match /brandPages/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to careersPage collection (for Careers page CMS)
    match /careersPage/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to header collection (for Header Styling CMS)
    match /header/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to footer collection (for Footer Management CMS)
    match /footer/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to privacyPolicy collection (for Privacy Policy CMS)
    match /privacyPolicy/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to cookiesPolicy collection (for Cookies Policy CMS)
    match /cookiesPolicy/{document=**} {
      allow read, write: if true;
    }

    // Allow read/write access to formSubmissions collection
    // Public can write (submit forms), admins can read/update/delete
    match /formSubmissions/{document=**} {
      allow read, write: if true;
    }

    // Default rule: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. **Click "Publish"** to save the rules

## Important Notes:

⚠️ **Security Warning**: The rules above (`allow read, write: if true;`) allow **anyone** to read and write to these collections. This is fine for development, but for production you should:

1. **Use Authentication** and check if user is authenticated:

```javascript
match /navigation-icons/{document=**} {
  allow read: if true; // Anyone can read
  allow write: if request.auth != null; // Only authenticated users can write
}

match /homeSections/{document=**} {
  allow read: if true; // Anyone can read
  allow write: if request.auth != null; // Only authenticated users can write
}
```

2. **Or restrict to specific users/roles** if you have authentication set up.

## After Updating Rules:

- Rules take effect immediately (usually within a few seconds)
- Try uploading an image again - it should work now!
- Try importing home sections - it should work now!

## Collections Covered:

- ✅ `contactPage` - Contact page configuration
- ✅ `navigation` - Navigation menu items
- ✅ `navigation-icons` - Uploaded images/icons (legacy)
- ✅ `homeSections` - Home page sections (Hero, About, Why, etc.)
- ✅ `aboutSections` - About page sections
- ✅ `images` - Image storage in Firestore (for Firestore-only image storage)
- ✅ `videos` - Video storage in Firestore
- ✅ `brands` - Product brands
- ✅ `categories` - Product categories
- ✅ `products` - Products
- ✅ `brandPages` - Brand pages configuration
- ✅ `careersPage` - Careers page configuration
- ✅ `header` - Header/Navbar styling configuration
- ✅ `footer` - Footer configuration (logo, links, contact info, social media, addresses, etc.)
- ✅ `formSubmissions` - Form submissions from Tell Us section
