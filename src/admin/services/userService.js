import { collection, doc, getDocs, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../firebase/config";

const COLLECTION_NAME = "adminUsers";

/**
 * Get all admin users
 * NOTE: This function requires list permissions on adminUsers collection.
 * Firestore rules must allow list operations for admin/super_admin roles.
 * If list operations are not allowed, this function will throw permission-denied.
 * 
 * Alternative: Use getAdminUser(uid) for individual users.
 */
export async function getAdminUsers() {
  try {
    // CRITICAL: This uses getDocs which requires LIST permissions
    // Firestore rules must explicitly allow list operations, not just read
    // If your rules only allow reading own document, this will fail
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    // Sort by created date (newest first)
    return users.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error("❌ Permission denied: Firestore rules don't allow listing adminUsers collection.");
      console.error("   To fix: Update firestore.rules to allow list operations for admin/super_admin roles.");
      console.error("   Or use getAdminUser(uid) to fetch individual users by UID.");
    }
    console.error("Error fetching admin users:", error);
    throw error;
  }
}

/**
 * Get a single admin user by ID
 */
export async function getAdminUser(id) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin user:", error);
    throw error;
  }
}

/**
 * Get admin user by email
 * NOTE: This function requires query permissions on adminUsers collection.
 * Firestore rules must allow query operations with where clauses.
 * If queries are not allowed, this function will throw permission-denied.
 * 
 * Alternative: Use getAdminUser(uid) if you know the user's UID.
 * To find a user by email, you need to know their Firebase Auth UID.
 */
export async function getAdminUserByEmail(email) {
  try {
    // CRITICAL: This uses getDocs with where clause which requires QUERY permissions
    // Firestore rules must explicitly allow query operations
    // If your rules only allow reading own document, this will fail
    const q = query(collection(db, COLLECTION_NAME), where("email", "==", email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return null;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error("❌ Permission denied: Firestore rules don't allow querying adminUsers by email.");
      console.error("   To fix: Update firestore.rules to allow query operations for admin/super_admin roles.");
      console.error("   Or use getAdminUser(uid) if you know the user's Firebase Auth UID.");
    }
    console.error("Error fetching admin user by email:", error);
    throw error;
  }
}

/**
 * Create a new admin user
 * This function creates both a Firebase Auth user and a Firestore document
 * Requires a Cloud Function to create the Firebase Auth user (see functions/createAdminUser.js)
 */
export async function createAdminUser(userData) {
  try {
    // Validate required fields before making any calls
    if (!userData.email || !userData.email.trim()) {
      throw new Error("Email is required.");
    }
    
    if (!userData.password || !userData.password.trim()) {
      throw new Error("Password is required.");
    }
    
    // Validate password length (Firebase Auth requires at least 6 characters)
    if (userData.password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    
    if (!userData.role) {
      throw new Error("Role is required.");
    }
    
    // Check if email already exists
    const existingUser = await getAdminUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("An admin user with this email already exists.");
    }

    // Call Cloud Function to create Firebase Auth user
    // The Cloud Function will return the Firebase Auth UID
    // Try default region first (us-central1), fallback to other common regions if needed
    let functions = getFunctions();
    let createFirebaseAuthUser = httpsCallable(functions, 'createAdminUser');
    
    // If default region fails, we'll try other regions (handled in catch block)
    const result = await createFirebaseAuthUser({
      email: userData.email.toLowerCase().trim(),
      password: userData.password.trim(),
      role: userData.role,
      name: userData.name || "",
      isActive: userData.isActive !== false,
      createdBy: userData.createdBy || null,
    });

    const { uid, userDoc } = result.data;

    // The Cloud Function already creates the Firestore document
    // Return the user data
    return {
      id: uid,
      ...userDoc,
    };
  } catch (error) {
    console.error("Error creating admin user:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
    
    // Handle network errors that might indicate function not deployed
    if (error.message?.includes('ERR_FAILED') || error.message?.includes('Failed to fetch')) {
      throw new Error("Unable to reach Cloud Function. Please ensure the function is deployed: firebase deploy --only functions:createAdminUser");
    }
    
    // Handle specific Firebase Functions errors
    if (error.code === 'functions/already-exists' || error.code === 'already-exists') {
      throw new Error("An admin user with this email already exists.");
    } else if (error.code === 'functions/invalid-argument' || error.code === 'invalid-argument') {
      throw new Error(error.message || "Invalid user data provided.");
    } else if (error.code === 'functions/permission-denied' || error.code === 'permission-denied') {
      throw new Error("You don't have permission to create admin users. Only Super Admin can create users.");
    } else if (error.code === 'functions/unauthenticated' || error.code === 'unauthenticated') {
      throw new Error("You must be logged in to create admin users.");
    } else if (error.code === 'functions/internal' || error.code === 'internal') {
      // Extract the actual error message from the Cloud Function
      let errorMessage = error.message || error.details || "Failed to create admin user.";
      
      // The Cloud Function wraps the error message, so try to extract the actual error
      if (errorMessage.includes('Failed to create admin user:')) {
        errorMessage = errorMessage.split('Failed to create admin user:')[1]?.trim() || errorMessage;
      }
      
      // If error message is just "internal", provide more helpful message
      if (errorMessage === 'internal' || errorMessage === 'Failed to create admin user.') {
        errorMessage = "An internal error occurred. Check Firebase Functions logs for details: firebase functions:log";
      }
      
      throw new Error(errorMessage);
    } else if (error.code === 'functions/not-found' || error.code === 'not-found') {
      throw new Error("Cloud Function 'createAdminUser' not found. Please deploy the function: firebase deploy --only functions:createAdminUser");
    } else if (error.code === 'functions/unavailable' || error.code === 'unavailable') {
      throw new Error("Cloud Function is unavailable. Please check your internet connection and try again.");
    }
    // For any other error, throw with the message
    throw new Error(error.message || "Failed to create admin user. Please try again.");
  }
}

/**
 * Update an admin user
 * If password is provided, it will be updated in Firebase Auth via Cloud Function
 */
export async function updateAdminUser(id, updates) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    // Don't update email if it's the same, or check for duplicates
    if (updates.email) {
      const existingUser = await getAdminUserByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("An admin user with this email already exists.");
      }
      updateData.email = updates.email.toLowerCase().trim();
    }

    // If password is provided, update it in Firebase Auth via Cloud Function
    if (updates.password !== undefined && updates.password.trim()) {
      const functions = getFunctions();
      const updateUserPassword = httpsCallable(functions, 'updateAdminUserPassword');
      
      await updateUserPassword({
        uid: id,
        newPassword: String(updates.password).trim(),
      });
      
      // Don't store password in Firestore
      delete updateData.password;
    }

    await updateDoc(docRef, updateData);
    return {
      id,
      ...updateData,
    };
  } catch (error) {
    console.error("Error updating admin user:", error);
    throw error;
  }
}

/**
 * Delete an admin user
 * This will delete both the Firebase Auth user and the Firestore document
 */
export async function deleteAdminUser(id) {
  try {
    // Call Cloud Function to delete Firebase Auth user
    const functions = getFunctions();
    const deleteFirebaseAuthUser = httpsCallable(functions, 'deleteAdminUser');
    
    await deleteFirebaseAuthUser({ uid: id });
    
    // The Cloud Function also deletes the Firestore document
    // But we'll delete it here as well for safety
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting admin user:", error);
    throw error;
  }
}

