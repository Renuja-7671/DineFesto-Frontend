import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';
import AdminLayout from './components/admin/AdminLayout';
import WaiterLayout from './components/waiter/WaiterLayout';
import ChefLayout from './components/chef/ChefLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

const DashboardOverview = lazy(() => import('./pages/admin/DashboardOverview'));
const EmployeeManagement = lazy(() => import('./pages/admin/EmployeeManagement'));
const MenuManagement = lazy(() => import('./pages/admin/MenuManagement'));
const OrdersManagement = lazy(() => import('./pages/admin/OrdersManagement'));
const InventoryManagement = lazy(() => import('./pages/admin/InventoryManagement'));
const RecipeManagement = lazy(() => import('./pages/admin/RecipeManagement'));
const ReservationsManagement = lazy(() => import('./pages/admin/ReservationsManagement'));
const ReviewsManagement = lazy(() => import('./pages/admin/ReviewsManagement'));
const ReportsManagement = lazy(() => import('./pages/admin/ReportsManagement'));
const ProfileManagement = lazy(() => import('./pages/admin/ProfileManagement'));
const SettingsManagement = lazy(() => import('./pages/admin/SettingsManagement'));
const LeaveManagement = lazy(() => import('./pages/admin/LeaveManagement'));

const WaiterDashboard = lazy(() => import('./pages/waiter/WaiterDashboard'));
const WaiterOrders = lazy(() => import('./pages/waiter/WaiterOrders'));
const WaiterProfile = lazy(() => import('./pages/waiter/WaiterProfile'));
const WaiterAttendance = lazy(() => import('./pages/waiter/WaiterAttendance'));
const WaiterSchedule = lazy(() => import('./pages/waiter/WaiterSchedule'));
const WaiterLeave = lazy(() => import('./pages/waiter/WaiterLeave'));

const ChefLeave = lazy(() => import('./pages/chef/ChefLeave'));

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LazyPage><LoginPage /></LazyPage>} />
        <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
        <Route path="/signup" element={<LazyPage><SignUpPage /></LazyPage>} />
        <Route path="/forgot-password" element={<LazyPage><ForgotPasswordPage /></LazyPage>} />
        <Route path="/reset-password" element={<LazyPage><ResetPasswordPage /></LazyPage>} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<LazyPage><DashboardOverview /></LazyPage>} />
          <Route path="employees" element={<LazyPage><EmployeeManagement /></LazyPage>} />
          <Route path="leave-requests" element={<LazyPage><LeaveManagement /></LazyPage>} />
          <Route path="menu" element={<LazyPage><MenuManagement /></LazyPage>} />
          <Route path="orders" element={<LazyPage><OrdersManagement /></LazyPage>} />
          <Route path="inventory" element={<LazyPage><InventoryManagement /></LazyPage>} />
          <Route path="recipes" element={<LazyPage><RecipeManagement /></LazyPage>} />
          <Route path="reservations" element={<LazyPage><ReservationsManagement /></LazyPage>} />
          <Route path="reviews" element={<LazyPage><ReviewsManagement /></LazyPage>} />
          <Route path="reports" element={<LazyPage><ReportsManagement /></LazyPage>} />
          <Route path="profile" element={<LazyPage><ProfileManagement /></LazyPage>} />
          <Route path="settings" element={<LazyPage><SettingsManagement /></LazyPage>} />
        </Route>

        <Route
          path="/waiter"
          element={
            <ProtectedRoute allowedRoles={['WAITER']}>
              <WaiterLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<LazyPage><WaiterDashboard /></LazyPage>} />
          <Route path="orders" element={<LazyPage><WaiterOrders /></LazyPage>} />
          <Route path="profile" element={<LazyPage><WaiterProfile /></LazyPage>} />
          <Route path="attendance" element={<LazyPage><WaiterAttendance /></LazyPage>} />
          <Route path="schedule" element={<LazyPage><WaiterSchedule /></LazyPage>} />
          <Route path="leave" element={<LazyPage><WaiterLeave /></LazyPage>} />
        </Route>

        <Route
          path="/chef"
          element={
            <ProtectedRoute allowedRoles={['CHEF']}>
              <ChefLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="leave" replace />} />
          <Route path="leave" element={<LazyPage><ChefLeave /></LazyPage>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
