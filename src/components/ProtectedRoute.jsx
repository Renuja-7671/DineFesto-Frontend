import { Navigate } from 'react-router-dom';
import { getHomeRouteForRole, getUser, isAuthenticated, hasRole } from '../utils/auth';

function ProtectedRoute({ children, allowedRoles = [] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    const user = getUser();
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
