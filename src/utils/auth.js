// Authentication utility functions

export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setAuth = (token, user, remember = false) => {
  if (remember) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const ADMIN_PORTAL_ROLES = ['ADMIN', 'MANAGER'];
export const WAITER_PORTAL_ROLES = ['WAITER'];
export const CHEF_PORTAL_ROLES = ['CHEF'];
export const STAFF_PORTAL_ROLES = [...WAITER_PORTAL_ROLES, ...CHEF_PORTAL_ROLES];

export const getHomeRouteForRole = (role) => {
  if (ADMIN_PORTAL_ROLES.includes(role)) {
    return '/admin/dashboard';
  }

  if (role === 'CHEF') {
    return '/chef/leave';
  }

  if (role === 'WAITER') {
    return '/waiter/dashboard';
  }

  if (role === 'CUSTOMER') {
    return '/customer/dashboard';
  }

  return '/login';
};

export const hasRole = (allowedRoles) => {
  const user = getUser();
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

export const isAdminPortalUser = () => hasRole(ADMIN_PORTAL_ROLES);
