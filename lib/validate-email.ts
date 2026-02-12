/**
 * Validates email format using a simple regex pattern.
 *
 * Checks for basic structure: local@domain.tld
 * - No spaces allowed
 * - Exactly one @ symbol
 * - Domain must contain at least one dot
 *
 * @param email - Email string to validate
 * @returns boolean indicating if email format is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}
