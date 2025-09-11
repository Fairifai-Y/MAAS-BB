/**
 * Utility functions for authentication and authorization
 */

/**
 * Validates if an email address belongs to one of the allowed domains
 * @param email - The email address to validate
 * @returns boolean - true if email is from an allowed domain
 */
export function isValidEmailDomain(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const allowedDomains = getAllowedEmailDomains();
  const emailLower = email.toLowerCase();
  return allowedDomains.some(domain => emailLower.endsWith(domain.toLowerCase()));
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
 * Gets the list of allowed email domains
 * @returns string[] - Array of allowed domains
 */
export function getAllowedEmailDomains(): string[] {
  const allowedDomains = [
    '@fitchannel.com',
    '@champ.nl',
    '@brightbrown.nl',
    '@e-leones.com'
  ];
  
  // Get additional allowed domains from environment variable
  const envDomains = process.env.ALLOWED_EMAIL_DOMAINS;
  if (envDomains) {
    const additionalDomains = envDomains.split(',').map(domain => 
      domain.trim().startsWith('@') ? domain.trim() : `@${domain.trim()}`
    );
    allowedDomains.push(...additionalDomains);
  }
  
  return allowedDomains;
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
 * @returns string - User-friendly error message
 */
export function getEmailDomainError(email: string): string {
  const domain = getEmailDomain(email);
  const allowedDomains = getAllowedEmailDomains();
  const domainsList = allowedDomains.join(', ');
  return `Alleen email adressen van de volgende domeinen zijn toegestaan: ${domainsList}. Uw email (${domain}) is niet toegestaan.`;
}
