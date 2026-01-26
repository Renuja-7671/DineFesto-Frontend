import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import MenuManagement from './pages/admin/MenuManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import ReservationsManagement from './pages/admin/ReservationsManagement';
import ReviewsManagement from './pages/admin/ReviewsManagement';
import ReportsManagement from './pages/admin/ReportsManagement';
import ProfileManagement from './pages/admin/ProfileManagement';
import SettingsManagement from './pages/admin/SettingsManagement';
import LeaveManagement from './pages/admin/LeaveManagement';

// Employee Portal
import EmployeeLayout from './components/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeOrders from './pages/employee/EmployeeOrders';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeSchedule from './pages/employee/EmployeeSchedule';
import EmployeeLeave from './pages/employee/EmployeeLeave';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="leave-requests" element={<LeaveManagement />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="reservations" element={<ReservationsManagement />} />
          <Route path="reviews" element={<ReviewsManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="profile" element={<ProfileManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
        </Route>

        {/* Employee Portal Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'WAITER', 'CHEF']}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="orders" element={<EmployeeOrders />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="schedule" element={<EmployeeSchedule />} />
          <Route path="leave" element={<EmployeeLeave />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
