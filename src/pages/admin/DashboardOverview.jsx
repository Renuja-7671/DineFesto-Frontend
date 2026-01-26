import { useState, useEffect, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
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
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const COLORS = ['#FF6B35', '#004E89', '#F77F00', '#06A77D'];

function StatCard({ title, value, change, icon, color, trend }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ backgroundColor: `${color}20`, color: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          <Chip
            icon={trend === 'up' ? <TrendingUp /> : <TrendingDown />}
            label={change}
            size="small"
            color={trend === 'up' ? 'success' : 'error'}
          />
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

function DashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRevenue: { value: 0, change: '0', trend: 'up' },
      totalOrders: { value: 0, change: '0', trend: 'up' },
      totalCustomers: { value: 0, change: '0', trend: 'up' },
      totalMenuItems: { value: 0, change: '0', trend: 'up' },
    },
    weeklyRevenue: [],
    categoryDistribution: [],
    recentOrders: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports/dashboard-overview`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDashboardData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      title: 'Total Revenue',
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

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Dashboard Overview
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Dashboard Overview
        </Typography>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={fetchDashboardData}>
            <Refresh />
          </IconButton>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography color="text.secondary">
            Welcome back! Here's what's happening with your restaurant today.
          </Typography>
        </Box>
        <IconButton onClick={fetchDashboardData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={card.title}
              value={card.value}
              change={`${card.change >= 0 ? '+' : ''}${card.change}%`}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
            />
          </Grid>
        ))}
      </Grid>

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
    </Box>
  );
}

export default DashboardOverview;
