import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Refresh,
  Email,
  Phone,
  Badge,
  CalendarMonth,
  AttachMoney,
  ShoppingCart,
  TrendingUp,
  WorkOutline,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function WaiterProfile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProfile(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      MANAGER: { label: 'Manager', color: 'primary' },
      WAITER: { label: 'Waiter', color: 'success' },
      CHEF: { label: 'Chef', color: 'warning' },
    };
    return roleConfig[role] || { label: role, color: 'default' };
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Profile
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Profile
        </Typography>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={fetchProfile}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const roleBadge = getRoleBadge(profile?.role);

  const stats = [
    {
      title: 'Orders Processed',
      value: profile?.stats?.ordersProcessed || 0,
      icon: <ShoppingCart />,
      color: '#1976d2',
    },
    {
      title: 'Revenue Generated',
      value: formatCurrency(profile?.stats?.revenueGenerated || 0),
      icon: <AttachMoney />,
      color: '#2e7d32',
    },
    {
      title: 'Working Days',
      value: profile?.stats?.workingDays || 0,
      icon: <CalendarMonth />,
      color: '#ed6c02',
    },
    {
      title: 'Performance',
      value: `${profile?.stats?.performanceScore || 0}%`,
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>
          My Profile
        </Typography>
        <IconButton onClick={fetchProfile} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto',
                    backgroundColor: 'primary.main',
                    fontSize: '3rem',
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {profile?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'E'}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {profile?.fullName || 'Employee'}
                </Typography>
                <Chip
                  label={roleBadge.label}
                  color={roleBadge.color}
                  sx={{ fontWeight: 600, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {profile?.designation || 'Staff Member'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Contact Information */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Badge /> Contact Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>

                {profile?.contact && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {profile.contact}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarMonth sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Join Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkOutline sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Employee ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      EMP-{profile?.employeeId}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats and Performance */}
        <Grid item xs={12} md={8}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar sx={{ backgroundColor: `${stat.color}20`, color: stat.color, width: 56, height: 56 }}>
                        {stat.icon}
                      </Avatar>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Recent Activity */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Orders Handled
            </Typography>
            {profile?.recentOrders?.length > 0 ? (
              <Box>
                {profile.recentOrders.map((order, index) => (
                  <Box
                    key={order.orderId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 2,
                      borderBottom: index !== profile.recentOrders.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ backgroundColor: 'primary.main' }}>
                        #{order.orderId}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Order #{order.orderId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(order.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                      <Chip
                        label={order.status}
                        size="small"
                        color={order.status === 'COMPLETED' ? 'success' : 'warning'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                No recent orders
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default WaiterProfile;
