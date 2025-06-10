import { env } from '../env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: env.VITE_BACKEND_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRIES: 2,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_ANIMATIONS: true,
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_ERROR_REPORTING: process.env.NODE_ENV === 'production',
} as const;

// Application Constants
export const APP_CONFIG = {
  MAX_CARDS_PER_SPREAD: 10,
  MIN_CARDS_PER_SPREAD: 1,
  DEFAULT_SPREAD_SIZE: 3,
  MAX_CHAT_HISTORY: 50,
  IMAGE_DIMENSIONS: {
    width: 1024,
    height: 1024,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',
  SERVER_ERROR: 'An unexpected error occurred on the server. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  CARD_LOAD_ERROR: 'Failed to load card data. Please refresh the page.',
  CHAT_ERROR: 'Failed to send message. Please try again.',
} as const;

// Logging Configuration
export const LOGGING_CONFIG = {
  LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  ENABLED: process.env.NODE_ENV === 'development',
} as const;

// Type Definitions
export type ApiConfig = typeof API_CONFIG;
export type Features = typeof FEATURES;
export type AppConfig = typeof APP_CONFIG;
export type ErrorMessages = typeof ERROR_MESSAGES;
export type LoggingConfig = typeof LOGGING_CONFIG; 