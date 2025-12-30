/**
 * Input Sanitization Utility
 * Prevents XSS and injection attacks by sanitizing user inputs
 */

/**
 * Sanitize a string input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags and escape special characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize an email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }
  
  // Basic email sanitization (Firebase Auth will validate format)
  return email.toLowerCase().trim().replace(/[<>]/g, '');
}

/**
 * Sanitize an object recursively
 * @param {object} obj - Object to sanitize
 * @param {array} allowedFields - Optional array of allowed field names
 * @returns {object} - Sanitized object
 */
export function sanitizeObject(obj, allowedFields = null) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip if field not in allowed list
    if (allowedFields && !allowedFields.includes(key)) {
      continue;
    }

    if (typeof value === 'string') {
      // Don't sanitize passwords or tokens
      if (key === 'password' || key === 'newPassword' || key.includes('token') || key.includes('Token')) {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, allowedFields);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize email format
 * @param {string} email - Email to validate
 * @returns {object} - { valid: boolean, email: string }
 */
export function validateAndSanitizeEmail(email) {
  const sanitized = sanitizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return {
    valid: emailRegex.test(sanitized),
    email: sanitized
  };
}

