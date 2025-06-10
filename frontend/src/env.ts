interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const env = {
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
} as const; 