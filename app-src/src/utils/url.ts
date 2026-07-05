/**
 * Returns the base URL for the application.
 * Uses the VITE_APP_URL environment variable if set, otherwise falls back to window.location.origin.
 */
export const getAppUrl = (): string => {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && typeof envUrl === 'string') {
    // Strip trailing slash if present to avoid double slashes
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return window.location.origin;
};
