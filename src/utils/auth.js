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

export const hasRole = (allowedRoles) => {
  const user = getUser();
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};
