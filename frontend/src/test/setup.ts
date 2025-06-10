import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';

// Mock browser APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables
const ENV_MOCK = {
  VITE_BACKEND_URL: 'http://localhost:8000',
};

vi.stubGlobal('import.meta', { env: ENV_MOCK });

// Mock fetch API
global.fetch = vi.fn();
global.AbortController = vi.fn(() => ({
  abort: vi.fn(),
  signal: vi.fn(),
})) as any;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: vi.fn(),
  warn: vi.fn(),
  // Silence debug and info in tests
  debug: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}; 