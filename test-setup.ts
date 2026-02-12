/**
 * Vitest Test Setup
 *
 * Configures the testing environment for React component tests:
 * - Extends expect with DOM-specific matchers (toBeInTheDocument, etc.)
 * - Cleans up rendered components after each test
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically unmount and clean up after each test
afterEach(() => {
  cleanup();
});
