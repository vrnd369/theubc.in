/**
 * Migration Script: Move users from Firestore to Firebase Auth
 * 
 * This script migrates existing admin users from Firestore custom auth
 * to Firebase Authentication.
 * 
 * IMPORTANT: Run this script ONCE after enabling Firebase Auth
 * 
 * Usage:
 * 1. Make sure Firebase Auth is enabled in Firebase Console
 * 2. Run: node scripts/migrate-to-firebase-auth.js
 * 
 * This script will:
 * 1. Read all users from adminUsers collection
 * 2. Create Firebase Auth accounts for each user
 * 3. Update adminUsers documents to use Firebase Auth UID as document ID
 * 4. Remove plain text passwords from Firestore
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('../path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function migrateUsers() {
  console.log('🚀 Starting migration to Firebase Auth...\n');

  try {
    // Get all admin users from Firestore
    const usersSnapshot = await db.collection('adminUsers').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found in adminUsers collection.');
      return;
    }

    console.log(`Found ${usersSnapshot.size} users to migrate.\n`);
    
    // Ask for confirmation
    const confirm = await question('⚠️  This will create Firebase Auth accounts for all users. Continue? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Migration cancelled.');
      rl.close();
      return;
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    // Process each user
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const oldDocId = doc.id;
      const email = userData.email?.toLowerCase().trim();
      const password = userData.password;

      if (!email) {
        console.log(`❌ Skipping user ${oldDocId}: No email found`);
        results.skipped.push({ id: oldDocId, reason: 'No email' });
        continue;
      }

      if (!password) {
        console.log(`❌ Skipping user ${email}: No password found`);
        results.skipped.push({ id: oldDocId, email, reason: 'No password' });
        continue;
      }

      try {
        console.log(`\n📝 Processing user: ${email}`);

        // Check if Firebase Auth user already exists
        let firebaseUser;
        try {
          firebaseUser = await auth.getUserByEmail(email);
          console.log(`   ⚠️  Firebase Auth user already exists with UID: ${firebaseUser.uid}`);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            // Create new Firebase Auth user
            firebaseUser = await auth.createUser({
              email: email,
              password: password,
              emailVerified: true, // Skip email verification since super admin creates users
              disabled: userData.isActive === false
            });
            console.log(`   ✅ Created Firebase Auth user with UID: ${firebaseUser.uid}`);
          } else {
            throw error;
          }
        }

        // Prepare user document without password
        const { password: _, ...userDataWithoutPassword } = userData;
        const updatedUserData = {
          ...userDataWithoutPassword,
          firebaseUID: firebaseUser.uid,
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
          migratedFrom: oldDocId
        };

        // Check if document with Firebase UID already exists
        const existingDoc = await db.collection('adminUsers').doc(firebaseUser.uid).get();
        
        if (existingDoc.exists && existingDoc.id !== oldDocId) {
          // Update existing document
          await db.collection('adminUsers').doc(firebaseUser.uid).update(updatedUserData);
          console.log(`   ✅ Updated existing document with Firebase UID`);
        } else if (oldDocId === firebaseUser.uid) {
          // Document ID already matches Firebase UID, just update
          await db.collection('adminUsers').doc(firebaseUser.uid).update(updatedUserData);
          console.log(`   ✅ Updated document (ID already matches Firebase UID)`);
        } else {
          // Create new document with Firebase UID as document ID
          await db.collection('adminUsers').doc(firebaseUser.uid).set(updatedUserData);
          console.log(`   ✅ Created new document with Firebase UID as document ID`);
          
          // Delete old document if it's different
          if (oldDocId !== firebaseUser.uid) {
            await db.collection('adminUsers').doc(oldDocId).delete();
            console.log(`   🗑️  Deleted old document: ${oldDocId}`);
          }
        }

        results.success.push({ email, uid: firebaseUser.uid, oldId: oldDocId });

      } catch (error) {
        console.error(`   ❌ Error migrating user ${email}:`, error.message);
        results.failed.push({ id: oldDocId, email, error: error.message });
      }
    }

    // Print summary
    console.log('\n\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⏭️  Skipped: ${results.skipped.length}`);

    if (results.failed.length > 0) {
      console.log('\n❌ Failed migrations:');
      results.failed.forEach(item => {
        console.log(`   - ${item.email || item.id}: ${item.error}`);
      });
    }

    if (results.skipped.length > 0) {
      console.log('\n⏭️  Skipped users:');
      results.skipped.forEach(item => {
        console.log(`   - ${item.email || item.id}: ${item.reason}`);
      });
    }

    console.log('\n✅ Migration completed!');
    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('1. Update your code to use Firebase Auth (see updated files)');
    console.log('2. Test login with migrated users');
    console.log('3. Update Firestore rules to require Firebase Auth');
    console.log('4. Delete this migration script after confirming everything works');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run migration
migrateUsers();

