import { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  CheckCircle,
  Schedule,
  Refresh,
  AccessTime,
  EventAvailable,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 3, 
        border: '1px solid', 
        borderColor: 'divider',
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function EmployeeDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      ordersProcessed: 0,
      revenue: 0,
      completedOrders: 0,
      pendingOrders: 0,
    },
    attendanceStatus: {
      checkedIn: false,
      checkInTime: null,
      workingHours: 0,
    },
    recentActivity: [],
    upcomingLeave: null,
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees/dashboard`, {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Dashboard
        </Typography>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={fetchDashboardData}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const statsCards = [
    {
      title: 'Orders Processed',
      value: dashboardData.todayStats.ordersProcessed,
      subtitle: 'Today',
      icon: <ShoppingCart />,
      color: '#1976d2',
    },
    {
      title: 'Revenue Generated',
      value: formatCurrency(dashboardData.todayStats.revenue),
      subtitle: 'Today',
      icon: <AttachMoney />,
      color: '#2e7d32',
    },
    {
      title: 'Completed Orders',
      value: dashboardData.todayStats.completedOrders,
      subtitle: 'Successfully served',
      icon: <CheckCircle />,
      color: '#ed6c02',
    },
    {
      title: 'Pending Orders',
      value: dashboardData.todayStats.pendingOrders,
      subtitle: 'Needs attention',
      icon: <Schedule />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back! 👋
          </Typography>
          <Typography color="text.secondary">
            Here's your performance overview for today
          </Typography>
        </Box>
        <IconButton onClick={fetchDashboardData} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Attendance Status */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 3,
          border: '1px solid',
          borderColor: dashboardData.attendanceStatus.checkedIn ? 'success.main' : 'warning.main',
          backgroundColor: dashboardData.attendanceStatus.checkedIn ? 'success.50' : 'warning.50',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                backgroundColor: dashboardData.attendanceStatus.checkedIn ? 'success.main' : 'warning.main',
                width: 56,
                height: 56,
              }}
            >
              {dashboardData.attendanceStatus.checkedIn ? <CheckCircle /> : <AccessTime />}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {dashboardData.attendanceStatus.checkedIn ? 'Checked In' : 'Not Checked In'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.attendanceStatus.checkedIn 
                  ? `Since ${formatTime(dashboardData.attendanceStatus.checkInTime)} • ${dashboardData.attendanceStatus.workingHours.toFixed(1)} hrs`
                  : 'Please check in to start your shift'}
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<EventAvailable />}
            label="View Attendance"
            clickable
            color={dashboardData.attendanceStatus.checkedIn ? 'success' : 'warning'}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Recent Activity
        </Typography>
        {dashboardData.recentActivity.length > 0 ? (
          <Box>
            {dashboardData.recentActivity.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: index !== dashboardData.recentActivity.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Avatar sx={{ backgroundColor: 'primary.main', mr: 2 }}>
                  {activity.icon}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.description}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
            No recent activity
          </Typography>
        )}
      </Paper>

      {/* Upcoming Leave Alert */}
      {dashboardData.upcomingLeave && (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 3, 
            borderRadius: 3,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Upcoming Leave
          </Typography>
          <Typography variant="body2">
            You have approved leave from {new Date(dashboardData.upcomingLeave.startDate).toLocaleDateString()} 
            {' to '} {new Date(dashboardData.upcomingLeave.endDate).toLocaleDateString()}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

export default EmployeeDashboard;
