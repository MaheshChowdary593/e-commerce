/**
 * Centralized API configuration.
 * When deploying to Vercel/Netlify, set the VITE_API_URL environment variable 
 * to your backend server's URL (e.g., https://your-backend.render.com).
 */

const getApiBaseUrl = () => {
    // If VITE_API_URL is set in environment, use it
    const envUrl = import.meta.env.VITE_API_URL;
    
    if (envUrl) {
        // Ensure no trailing slash
        return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }
    
    // Fallback to localhost for development
    return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

export default {
    API_BASE_URL,
    API_URL
};
