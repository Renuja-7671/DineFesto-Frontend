import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  IconButton,
  Paper,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Cancel,
  AccessTime,
  Login,
  Logout,
  Event,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function EmployeeAttendance() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceData, setAttendanceData] = useState({
    todayAttendance: null,
    attendanceHistory: [],
    stats: {
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      totalWorkingHours: 0,
    },
  });
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees/attendance`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setAttendanceData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setError('Failed to load attendance');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      await axios.post(
        `${API_URL}/employees/attendance/check-in`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      fetchAttendance();
      setCheckingIn(false);
    } catch (err) {
      console.error('Failed to check in:', err);
      alert('Failed to check in');
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      await axios.post(
        `${API_URL}/employees/attendance/check-out`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      fetchAttendance();
      setCheckingOut(false);
    } catch (err) {
      console.error('Failed to check out:', err);
      alert('Failed to check out');
      setCheckingOut(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'LATE':
        return 'warning';
      case 'ABSENT':
        return 'error';
      case 'HALF_DAY':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Attendance
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Attendance
        </Typography>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={fetchAttendance}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const todayAttendance = attendanceData.todayAttendance;
  const isCheckedIn = todayAttendance && todayAttendance.checkInTime && !todayAttendance.checkOutTime;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
            Attendance Tracking
          </Typography>
          <Typography color="text.secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
            Shop Hours: 6:00 AM - 10:00 PM Daily
          </Typography>
        </Box>
        <IconButton onClick={fetchAttendance} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Today's Attendance Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          mb: 3,
          border: '2px solid',
          borderColor: isCheckedIn ? 'success.main' : 'grey.300',
          backgroundColor: isCheckedIn ? 'success.50' : 'grey.50',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTime sx={{ fontSize: 48, color: isCheckedIn ? 'success.main' : 'text.secondary' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {isCheckedIn ? 'You are checked in!' : 'Not checked in yet'}
                </Typography>
                {isCheckedIn && todayAttendance?.checkInTime && (
                  <Typography variant="body2" color="text.secondary">
                    Check-in time: {formatTime(todayAttendance.checkInTime)}
                  </Typography>
                )}
                {todayAttendance?.status && (
                  <Chip
                    label={todayAttendance.status}
                    size="small"
                    color={getStatusColor(todayAttendance.status)}
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
              {!isCheckedIn && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Login />}
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  fullWidth={isMobile}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </Button>
              )}
              {isCheckedIn && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Logout />}
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  fullWidth={isMobile}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {checkingOut ? 'Checking Out...' : 'Check Out'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <CheckCircle sx={{ color: 'success.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {attendanceData.stats.presentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Present Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Cancel sx={{ color: 'error.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {attendanceData.stats.absentDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Absent Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <AccessTime sx={{ color: 'warning.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {attendanceData.stats.lateDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Late Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Event sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {attendanceData.stats.totalWorkingHours}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance History */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Attendance History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Check In</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Check Out</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.attendanceHistory.length > 0 ? (
                attendanceData.attendanceHistory.map((record) => (
                  <TableRow key={record.attendanceId}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatTime(record.checkInTime)}</TableCell>
                    <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        size="small"
                        color={getStatusColor(record.status)}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No attendance history available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default EmployeeAttendance;
