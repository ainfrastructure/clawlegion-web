/**
 * Email Validation Utility Tests
 *
 * Tests for validateEmail() — a simple regex-based email format validator.
 *
 * Run with: npx vitest run __tests__/lib/validate-email.test.ts
 */

import { describe, it, expect } from "vitest";
import { validateEmail } from "@/lib/validate-email";

describe("validateEmail", () => {
  // ============================================================
  // VALID EMAILS
  // ============================================================
  describe("valid emails", () => {
    const validEmails = [
      "email@example.com",
      "firstname.lastname@example.com",
      "email@subdomain.example.com",
      "firstname+lastname@example.com",
      "1234567890@example.com",
      "email@example-one.com",
      "_______@example.com",
      "email@example.name",
      "user@mail.co.uk",
      "test123@test.org",
    ];

    it.each(validEmails)("accepts '%s'", (email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  // ============================================================
  // INVALID EMAILS
  // ============================================================
  describe("invalid emails", () => {
    const invalidEmails = [
      { input: "plainaddress", reason: "no @ symbol" },
      { input: "@example.com", reason: "no local part" },
      { input: "email.example.com", reason: "no @ symbol" },
      { input: "email@example", reason: "no TLD (no dot in domain)" },
      { input: "email @example.com", reason: "space in local part" },
      { input: "email@ example.com", reason: "space in domain" },
      { input: " @example.com", reason: "space-only local part (trimmed)" },
      { input: "", reason: "empty string" },
    ];

    it.each(invalidEmails)("rejects '$input' ($reason)", ({ input }) => {
      expect(validateEmail(input)).toBe(false);
    });
  });

  // ============================================================
  // EDGE CASES
  // ============================================================
  describe("edge cases", () => {
    it("returns false for null input", () => {
      expect(validateEmail(null as unknown as string)).toBe(false);
    });

    it("returns false for undefined input", () => {
      expect(validateEmail(undefined as unknown as string)).toBe(false);
    });

    it("returns false for number input", () => {
      expect(validateEmail(123 as unknown as string)).toBe(false);
    });

    it("returns false for whitespace-only string", () => {
      expect(validateEmail("   ")).toBe(false);
    });

    it("trims leading/trailing whitespace and validates", () => {
      expect(validateEmail("  email@example.com  ")).toBe(true);
    });

    it("returns false for empty object", () => {
      expect(validateEmail({} as unknown as string)).toBe(false);
    });
  });
});
