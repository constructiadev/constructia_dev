// ConstructIA - Environment Variables Utility
// Provides consistent access to environment variables in both browser and Node.js contexts

/**
 * Get environment variable value
 * Works in both Vite (browser) and Node.js (scripts) environments
 */
export function getEnvVar(key: string): string | undefined {
  // In browser context (Vite), use import.meta.env
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key];
  }
  
  // In Node.js context (scripts), use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  return undefined;
}

/**
 * Get environment variable with fallback
 */
export function getEnvVarWithFallback(key: string, fallback: string): string {
  return getEnvVar(key) || fallback;
}

/**
 * Check if running in browser context
 */
export function isBrowserContext(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running in Node.js context
 */
export function isNodeContext(): boolean {
  return typeof process !== 'undefined' && process.versions?.node;
}