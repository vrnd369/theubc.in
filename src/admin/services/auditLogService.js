import { collection, addDoc, query, orderBy, getDocs, limit } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

const COLLECTION_NAME = "auditLogs";

/**
 * Log an audit event (login, logout, action, etc.)
 */
export async function logAuditEvent(eventData) {
  try {
    // Check if user is authenticated before logging
    // This prevents permission errors when logging events
    if (!auth.currentUser) {
      console.warn("Cannot log audit event: user not authenticated");
      return false;
    }

    const logEntry = {
      ...eventData,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    await addDoc(collection(db, COLLECTION_NAME), logEntry);
    return true;
  } catch (error) {
    // Only log errors that aren't permission-related (those are expected in some cases)
    if (error.code !== 'permission-denied') {
      console.error("Error logging audit event:", error);
    } else {
      console.warn("Permission denied when logging audit event (this may be expected):", error.message);
    }
    // Don't throw - audit logging shouldn't break the app
    return false;
  }
}

/**
 * Log a login event
 */
export async function logLogin(userData) {
  return await logAuditEvent({
    type: "login",
    userId: userData.id || null,
    email: userData.email || null,
    role: userData.role || null,
    name: userData.name || null,
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent || null,
  });
}

/**
 * Log a logout event
 */
export async function logLogout(userData) {
  return await logAuditEvent({
    type: "logout",
    userId: userData.id || null,
    email: userData.email || null,
    role: userData.role || null,
    name: userData.name || null,
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent || null,
  });
}

/**
 * Log a create operation
 */
export async function logCreate(userData, module, itemName, itemId = null) {
  return await logAuditEvent({
    type: "create",
    userId: userData.id || null,
    email: userData.email || null,
    role: userData.role || null,
    name: userData.name || null,
    module: module || null, // e.g., "products", "navigation", "users"
    itemName: itemName || null, // e.g., "Brand: Soil King"
    itemId: itemId || null,
    action: "created",
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent || null,
  });
}

/**
 * Log an update operation
 */
export async function logUpdate(userData, module, itemName, itemId = null) {
  return await logAuditEvent({
    type: "update",
    userId: userData.id || null,
    email: userData.email || null,
    role: userData.role || null,
    name: userData.name || null,
    module: module || null,
    itemName: itemName || null,
    itemId: itemId || null,
    action: "updated",
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent || null,
  });
}

/**
 * Log a delete operation
 */
export async function logDelete(userData, module, itemName, itemId = null) {
  return await logAuditEvent({
    type: "delete",
    userId: userData.id || null,
    email: userData.email || null,
    role: userData.role || null,
    name: userData.name || null,
    module: module || null,
    itemName: itemName || null,
    itemId: itemId || null,
    action: "deleted",
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent || null,
  });
}

/**
 * Get audit logs with optional filtering
 * Uses in-memory filtering to avoid complex Firestore index requirements
 */
export async function getAuditLogs(filters = {}) {
  try {
    // Always fetch all logs and filter in memory to avoid index issues
    // This is more reliable and doesn't require composite indexes
    let q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));

    // Apply limit if specified (but fetch more if we need to filter)
    if (filters.limit && !filters.role && !filters.type && !filters.startDate && !filters.endDate) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    let logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Apply filters in memory
    if (filters.role) {
      logs = logs.filter(log => log.role === filters.role);
    }

    if (filters.type) {
      logs = logs.filter(log => log.type === filters.type);
    }

    if (filters.startDate) {
      const start = filters.startDate instanceof Date ? filters.startDate : new Date(filters.startDate);
      logs = logs.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp || log.createdAt);
        return logDate >= start;
      });
    }

    if (filters.endDate) {
      const end = filters.endDate instanceof Date ? filters.endDate : new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      logs = logs.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp || log.createdAt);
        return logDate <= end;
      });
    }

    // Apply limit after filtering
    if (filters.limit && (filters.role || filters.type || filters.startDate || filters.endDate)) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    // If orderBy fails, try without it and sort in memory
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.warn("Firestore index may be missing. Fetching all logs without ordering...");
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        let logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort in memory by timestamp (newest first)
        logs.sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || a.createdAt || 0);
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || b.createdAt || 0);
          return dateB - dateA;
        });

        // Apply filters in memory
        if (filters.role) {
          logs = logs.filter(log => log.role === filters.role);
        }

        if (filters.type) {
          logs = logs.filter(log => log.type === filters.type);
        }

        if (filters.startDate) {
          const start = filters.startDate instanceof Date ? filters.startDate : new Date(filters.startDate);
          logs = logs.filter(log => {
            const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp || log.createdAt);
            return logDate >= start;
          });
        }

        if (filters.endDate) {
          const end = filters.endDate instanceof Date ? filters.endDate : new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          logs = logs.filter(log => {
            const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp || log.createdAt);
            return logDate <= end;
          });
        }

        // Apply limit after filtering
        if (filters.limit) {
          logs = logs.slice(0, filters.limit);
        }

        return logs;
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        // Return empty array instead of throwing to prevent infinite loops
        return [];
      }
    }
    // Return empty array instead of throwing to prevent crashes
    console.error("Failed to fetch audit logs, returning empty array");
    return [];
  }
}

/**
 * Get client IP address (simplified - may not work in all environments)
 */
async function getClientIP() {
  // Try to get IP from a service (optional)
  // For now, return a placeholder or try to get from headers if available
  return "N/A"; // In production, you might want to get this from your backend
}

/**
 * Get login statistics
 */
export async function getLoginStats(filters = {}) {
  try {
    const logs = await getAuditLogs({ ...filters, type: "login" });
    
    const stats = {
      totalLogins: logs.length,
      byRole: {},
      byDate: {},
      recentLogins: logs.slice(0, 10),
    };

    logs.forEach((log) => {
      // Count by role
      const role = log.role || "unknown";
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;

      // Count by date
      const date = log.timestamp?.toDate
        ? log.timestamp.toDate().toISOString().split("T")[0]
        : new Date(log.timestamp || log.createdAt).toISOString().split("T")[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("Error getting login stats:", error);
    throw error;
  }
}

