// Environment configuration
export const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  APP_NAME: import.meta.env.VITE_APP_NAME || "Restaurant Management",
  NODE_ENV: import.meta.env.NODE_ENV || "development",
  TEMPO: import.meta.env.VITE_TEMPO === "true",
};
