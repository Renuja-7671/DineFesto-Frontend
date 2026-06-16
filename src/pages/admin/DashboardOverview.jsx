import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Alert,
  Skeleton,
} from '@mui/material';

import {
  People,
  ShoppingCart,
  AttachMoney,
  Restaurant,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { queryClient } from '../../lib/queryClient';
const COLORS = ['#FF6B35', '#004E89', '#F77F00', '#06A77D'];

function StatCard({ title, value, icon, color }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Avatar sx={{ backgroundColor: `${color}20`, color: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

const EMPTY_DASHBOARD = {
  stats: {
    totalRevenue: { value: 0, change: '0', trend: 'up' },
    totalOrders: { value: 0, change: '0', trend: 'up' },
    totalCustomers: { value: 0, change: '0', trend: 'up' },
    totalMenuItems: { value: 0, change: '0', trend: 'up' },
  },
  weeklyRevenue: [],
  monthlyRevenue: [],
  categoryDistribution: [],
  recentOrders: [],
};

function DashboardOverview() {
  const navigate = useNavigate();

  const {
    data: dashboardData = EMPTY_DASHBOARD,
    isLoading,
    error,
    isFetching,
  } = useAuthenticatedQuery(['reports', 'dashboard-overview'], '/reports/dashboard-overview');

  const refreshDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard-overview'] });
  }, []);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'COMPLETED':
      case 'SERVED':
        return 'success';
      case 'PREPARING':
      case 'READY':
        return 'warning';
      case 'PENDING':
        return 'default';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  const statsCards = useMemo(() => [
    {
      title: 'Revenue This Month',
      value: formatCurrency(dashboardData.stats.totalRevenue.value),
      change: dashboardData.stats.totalRevenue.change,
      trend: dashboardData.stats.totalRevenue.trend,
      icon: <AttachMoney />,
      color: '#FF6B35',
    },
    {
      title: 'Total Orders',
      value: dashboardData.stats.totalOrders.value,
      change: dashboardData.stats.totalOrders.change,
      trend: dashboardData.stats.totalOrders.trend,
      icon: <ShoppingCart />,
      color: '#004E89',
    },
    {
      title: 'Total Customers',
      value: dashboardData.stats.totalCustomers.value,
      change: dashboardData.stats.totalCustomers.change,
      trend: dashboardData.stats.totalCustomers.trend,
      icon: <People />,
      color: '#F77F00',
    },
    {
      title: 'Menu Items',
      value: dashboardData.stats.totalMenuItems.value,
      change: dashboardData.stats.totalMenuItems.change,
      trend: dashboardData.stats.totalMenuItems.trend,
      icon: <Restaurant />,
      color: '#06A77D',
    },
  ], [dashboardData.stats, formatCurrency]);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography color="text.secondary">
            Welcome back! Here's what's happening with your restaurant today.
          </Typography>
        </Box>
        <IconButton onClick={refreshDashboard} color="primary" disabled={isFetching}>
          <Refresh />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load dashboard data'}
        </Alert>
      )}

      {isFetching && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                    <Skeleton width="50%" height={40} />
                    <Skeleton width="70%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : statsCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                />
              </Grid>
            ))}
      </Grid>

      {!isLoading && (
        <>
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Weekly Revenue & Orders
            </Typography>
            {dashboardData.weeklyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.weeklyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF6B35"
                    strokeWidth={3}
                    name="Revenue (LKR)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#004E89"
                    strokeWidth={3}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                No data available for this week
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Sales by Category
            </Typography>
            {dashboardData.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                No category data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Revenue Chart */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Monthly Revenue
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total revenue per month — last 12 months
            </Typography>
          </Box>
          {dashboardData.monthlyRevenue.length > 0 && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF6B35' }}>
              {formatCurrency(
                dashboardData.monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
              )}
            </Typography>
          )}
        </Box>
        {dashboardData.monthlyRevenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={dashboardData.monthlyRevenue}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  new Intl.NumberFormat('en-LK', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(v)
                }
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                labelStyle={{ fontWeight: 600 }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
              />
              <Bar
                dataKey="revenue"
                fill="#FF6B35"
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
                name="Revenue (LKR)"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            No monthly revenue data available
          </Typography>
        )}
      </Paper>

      {/* Recent Orders */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Orders
          </Typography>
          <Chip 
            label="View All" 
            clickable 
            onClick={() => navigate('/admin/orders')}
            sx={{ 
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }} 
          />
        </Box>

        <Box>
          {dashboardData.recentOrders.length > 0 ? (
            dashboardData.recentOrders.map((order, index) => (
              <Box
                key={order.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: index !== dashboardData.recentOrders.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                  {order.customerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {order.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.id} • {order.items} items • {order.time}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', mr: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(order.total)}
                  </Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    color={getStatusColor(order.status)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
              No recent orders
            </Typography>
          )}
        </Box>
      </Paper>
        </>
      )}
    </Box>
  );
}

export default DashboardOverview;
