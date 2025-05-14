// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/token",
  VALIDATE_TOKEN: "/auth/validate-token",
  ME: "/auth/me",
};

// User management endpoints
export const USER_ENDPOINTS = {
  LIST: "/admin/users",
  CREATE: "/admin/users",
  UPDATE: (id: number) => `/admin/users/${id}`,
  DELETE: (id: number) => `/admin/users/${id}`,
  GET_BY_ID: (id: number) => `/admin/users/${id}`,
};

// Document management endpoints
export const DOCUMENT_ENDPOINTS = {
  LIST: "/admin/documents",
  CREATE: "/admin/documents",
  UPDATE: (id: number) => `/admin/documents/${id}`,
  DELETE: (id: number) => `/admin/documents/${id}`,
  GET_BY_ID: (id: number) => `/admin/documents/${id}`,
};

// Settings endpoints
export const SETTINGS_ENDPOINTS = {
  GET: "/admin/settings",
  UPDATE: "/admin/settings",
};

// Dashboard endpoints
export const DASHBOARD_ENDPOINTS = {
  STATS: "/admin/stats",
};

// Export all endpoints
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  DOCUMENT: DOCUMENT_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
};
