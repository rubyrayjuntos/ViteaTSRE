interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Validate environment variables
const validateBackendUrl = (url: string | undefined): string => {
  if (!url) {
    console.warn('VITE_BACKEND_URL not set, using default');
    return 'http://localhost:8000';
  }
  try {
    new URL(url);
    return url;
  } catch (e) {
    console.error('Invalid VITE_BACKEND_URL:', url);
    return 'http://localhost:8000';
  }
};

export const env = {
  VITE_BACKEND_URL: validateBackendUrl(import.meta.env.VITE_BACKEND_URL)
} as const;

// Export error messages for consistent error handling
export const ERROR_MESSAGES = {
  CARD_LOAD_ERROR: 'Failed to load card data. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const; 