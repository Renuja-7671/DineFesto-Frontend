import { useState, useCallback, Suspense, lazy } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  AutoGraph as AutoGraphIcon,
} from '@mui/icons-material';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import PageLoader from '../../components/ui/PageLoader';

const RevenueReportSection = lazy(() => import('../../components/admin/RevenueReportSection'));
const SalesReportSection = lazy(() => import('../../components/admin/SalesReportSection'));
const CustomerReportSection = lazy(() => import('../../components/admin/CustomerReportSection'));
const InventoryReportSection = lazy(() => import('../../components/admin/InventoryReportSection'));
const EmployeeReportSection = lazy(() => import('../../components/admin/EmployeeReportSection'));
const OrderTrendsReportSection = lazy(() => import('../../components/admin/OrderTrendsReportSection'));
const ForecastReportSection = lazy(() => import('../../components/admin/ForecastReportSection'));

const EMPTY_STATS = {
  todayOrders: 0,
  todayRevenue: 0,
  totalCustomers: 0,
  lowStockItems: 0,
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="rounded" width={48} height={48} sx={{ mb: 2 }} />
        <Skeleton width="60%" />
        <Skeleton width="40%" height={36} />
      </CardContent>
    </Card>
  );
}

function ReportsManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: dashboardStats = EMPTY_STATS,
    isLoading,
    error,
  } = useAuthenticatedQuery(['reports', 'dashboard'], '/reports/dashboard');

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  }, []);

  const handleTabChange = useCallback((_event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const statCards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(dashboardStats.todayRevenue),
      icon: MoneyIcon,
      color: 'primary',
    },
    {
      label: "Today's Orders",
      value: dashboardStats.todayOrders,
      icon: CartIcon,
      color: 'success',
    },
    {
      label: 'Total Customers',
      value: dashboardStats.totalCustomers,
      icon: PeopleIcon,
      color: 'info',
    },
    {
      label: 'Low Stock Items',
      value: dashboardStats.lowStockItems,
      icon: InventoryIcon,
      color: 'warning',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Reports & Analytics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load dashboard stats'}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCardSkeleton />
              </Grid>
            ))
          : statCards.map(({ label, value, icon: Icon, color }) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          backgroundColor: `${color}.light`,
                          borderRadius: 2,
                          p: 1.5,
                          display: 'flex',
                        }}
                      >
                        <Icon sx={{ fontSize: 32, color: `${color}.main` }} />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Revenue" icon={<MoneyIcon />} iconPosition="start" />
          <Tab label="Sales" icon={<CartIcon />} iconPosition="start" />
          <Tab label="Customers" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Inventory" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="Employees" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Order Trends" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Forecast" icon={<AutoGraphIcon />} iconPosition="start" />
        </Tabs>
      </Card>

      <Suspense fallback={<PageLoader />}>
        {activeTab === 0 && <RevenueReportSection />}
        {activeTab === 1 && <SalesReportSection />}
        {activeTab === 2 && <CustomerReportSection />}
        {activeTab === 3 && <InventoryReportSection />}
        {activeTab === 4 && <EmployeeReportSection />}
        {activeTab === 5 && <OrderTrendsReportSection />}
        {activeTab === 6 && <ForecastReportSection />}
      </Suspense>
    </Box>
  );
}

export default ReportsManagement;
