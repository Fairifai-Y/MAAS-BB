/**
 * Utility functions for authentication and authorization
 */

/**
 * Validates if an email address belongs to the allowed domain
 * @param email - The email address to validate
 * @param allowedDomain - The allowed domain (default: @fitchannel.com)
 * @returns boolean - true if email is from allowed domain
 */
export function isValidEmailDomain(email: string, allowedDomain: string = '@fitchannel.com'): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Get allowed domain from environment variable or use default
  const domain = process.env.ALLOWED_EMAIL_DOMAIN || allowedDomain;
  
  return email.toLowerCase().endsWith(domain.toLowerCase());
}

/**
 * Extracts the domain from an email address
 * @param email - The email address
 * @returns string - The domain part of the email
 */
export function getEmailDomain(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  const parts = email.split('@');
  return parts.length > 1 ? parts[1].toLowerCase() : '';
}

/**
 * Checks if a user has admin privileges
 * @param userRole - The user's role
 * @returns boolean - true if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'ADMIN';
}

/**
 * Checks if a user has employee privileges
 * @param userRole - The user's role
 * @returns boolean - true if user is employee
 */
export function isEmployee(userRole: string): boolean {
  return userRole === 'EMPLOYEE';
}

/**
 * Checks if a user has customer privileges
 * @param userRole - The user's role
 * @returns boolean - true if user is customer
 */
export function isCustomer(userRole: string): boolean {
  return userRole === 'CUSTOMER';
}

/**
 * Gets a user-friendly error message for invalid email domain
 * @param email - The invalid email address
 * @param allowedDomain - The allowed domain
 * @returns string - User-friendly error message
 */
export function getEmailDomainError(email: string, allowedDomain: string = '@fitchannel.com'): string {
  const domain = getEmailDomain(email);
  return `Alleen ${allowedDomain} email adressen zijn toegestaan. Uw email (${domain}) is niet toegestaan.`;
}
