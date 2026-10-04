/**
 * Vitest Test Setup
 *
 * Runs before each test file. Sets up:
 * - jest-dom matchers for DOM assertions
 * - Cleanup between tests
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Automatically unmount React trees between tests
afterEach(() => {
  cleanup();
});
