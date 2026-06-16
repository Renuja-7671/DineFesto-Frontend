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
  Snackbar,
} from '@mui/material';
import {
  Refresh,
  CheckCircle,
  Cancel,
  AccessTime,
  Login,
  Logout,
  Event,
  LocationOn,
  MyLocation,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { getDeviceLocation, getVerificationLabel } from '../../utils/geolocation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getVerificationChipColor = (atWorkplace, workplaceConfigured) => {
  if (!workplaceConfigured) return 'default';
  if (atWorkplace === true) return 'success';
  if (atWorkplace === false) return 'error';
  return 'default';
};

const formatClockTime = (hour, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit' });
};

const buildFlexiHoursMessage = (policy) => {
  if (!policy) {
    return 'Flexi check-in: on time until 30 minutes after your shift start.';
  }

  const { graceMinutes = 30, morningShiftStartHour = 6, afternoonShiftStartHour = 14 } = policy;
  const morningCutoffMinute = graceMinutes % 60;
  const morningCutoffHour = morningShiftStartHour + Math.floor(graceMinutes / 60);
  const afternoonCutoffMinute = graceMinutes % 60;
  const afternoonCutoffHour = afternoonShiftStartHour + Math.floor(graceMinutes / 60);

  return `Flexi check-in: mark on time until ${graceMinutes} minutes after shift start (e.g. ${formatClockTime(morningShiftStartHour)} – ${formatClockTime(morningCutoffHour, morningCutoffMinute)}, ${formatClockTime(afternoonShiftStartHour)} – ${formatClockTime(afternoonCutoffHour, afternoonCutoffMinute)}).`;
};

function WaiterAttendance() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [attendanceData, setAttendanceData] = useState({
    todayAttendance: null,
    attendanceHistory: [],
    stats: {
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      totalWorkingHours: 0,
    },
    locationPolicy: null,
    flexiHoursPolicy: null,
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
      setError('');
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

  const punchWithLocation = async (endpoint) => {
    const location = await getDeviceLocation();
    return axios.post(
      endpoint,
      {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const response = await punchWithLocation(`${API_URL}/employees/attendance/check-in`);
      const verification = response.data.locationVerification;
      const timing = response.data.timing;
      const statusMessage =
        timing?.status === 'LATE'
          ? 'Checked in as late (after flexi window).'
          : 'Checked in on time within flexi hours.';
      setSnackbar({
        open: true,
        message: verification?.atWorkplace === false
          ? `${statusMessage} You were outside the workplace geofence.`
          : `${statusMessage} Location recorded.`,
        severity: verification?.atWorkplace === false || timing?.status === 'LATE' ? 'warning' : 'success',
      });
      fetchAttendance();
    } catch (err) {
      console.error('Failed to check in:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to check in';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      const response = await punchWithLocation(`${API_URL}/employees/attendance/check-out`);
      const verification = response.data.locationVerification;
      setSnackbar({
        open: true,
        message: verification?.atWorkplace === false
          ? 'Checked out, but you were outside the workplace geofence.'
          : 'Checked out successfully with location recorded.',
        severity: verification?.atWorkplace === false ? 'warning' : 'success',
      });
      fetchAttendance();
    } catch (err) {
      console.error('Failed to check out:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to check out';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
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

  const renderLocationChip = (atWorkplace, distanceMeters) => {
    const workplaceConfigured = attendanceData.locationPolicy?.workplaceConfigured;
    const label = getVerificationLabel(atWorkplace, workplaceConfigured);
    const color = getVerificationChipColor(atWorkplace, workplaceConfigured);
    const distanceLabel =
      distanceMeters != null && workplaceConfigured ? ` (${distanceMeters}m)` : '';

    return (
      <Chip
        icon={<LocationOn sx={{ fontSize: 16 }} />}
        label={`${label}${distanceLabel}`}
        size="small"
        color={color}
        variant={color === 'default' ? 'outlined' : 'filled'}
        sx={{ fontWeight: 600 }}
      />
    );
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
  const locationPolicy = attendanceData.locationPolicy;
  const flexiHoursPolicy = attendanceData.flexiHoursPolicy;

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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

      <Alert severity="info" icon={<MyLocation />} sx={{ mb: 2, borderRadius: 2 }}>
        Check-in and check-out require your device location for workplace verification.
        {locationPolicy?.workplaceConfigured && locationPolicy?.enforceGeofence && (
          <> You must be within {locationPolicy.allowedRadiusMeters}m of{' '}
            {locationPolicy.locationCount > 1
              ? `any of the ${locationPolicy.locationCount} registered workplace sites`
              : 'the restaurant'}.</>
        )}
        {locationPolicy?.workplaceConfigured && !locationPolicy?.enforceGeofence && (
          <> Your location is recorded; geofence enforcement is currently disabled.</>
        )}
        {!locationPolicy?.workplaceConfigured && (
          <> Location is saved for admin review. Ask your manager to configure workplace coordinates.</>
        )}
      </Alert>

      <Alert severity="info" icon={<AccessTime />} sx={{ mb: 3, borderRadius: 2 }}>
        {buildFlexiHoursMessage(flexiHoursPolicy)}
      </Alert>

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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {todayAttendance?.status && (
                    <Chip
                      label={todayAttendance.status}
                      size="small"
                      color={getStatusColor(todayAttendance.status)}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {todayAttendance?.checkInLatitude != null && (
                    renderLocationChip(
                      todayAttendance.checkInAtWorkplace,
                      todayAttendance.checkInDistanceMeters
                    )
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
              {!isCheckedIn && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={checkingIn ? <MyLocation /> : <Login />}
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  fullWidth={isMobile}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {checkingIn ? 'Getting location...' : 'Check In'}
                </Button>
              )}
              {isCheckedIn && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={checkingOut ? <MyLocation /> : <Logout />}
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  fullWidth={isMobile}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {checkingOut ? 'Getting location...' : 'Check Out'}
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
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {record.checkInLatitude != null &&
                          renderLocationChip(record.checkInAtWorkplace, record.checkInDistanceMeters)}
                        {record.checkOutLatitude != null && (
                          <Chip
                            icon={<LocationOn sx={{ fontSize: 14 }} />}
                            label={`Out: ${getVerificationLabel(record.checkOutAtWorkplace, locationPolicy?.workplaceConfigured)}${record.checkOutDistanceMeters != null && locationPolicy?.workplaceConfigured ? ` (${record.checkOutDistanceMeters}m)` : ''}`}
                            size="small"
                            color={getVerificationChipColor(record.checkOutAtWorkplace, locationPolicy?.workplaceConfigured)}
                            variant="outlined"
                            sx={{ fontWeight: 600, width: 'fit-content' }}
                          />
                        )}
                        {record.checkInLatitude == null && record.checkOutLatitude == null && (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </Box>
                    </TableCell>
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
                  <TableCell colSpan={5} align="center">
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

export default WaiterAttendance;
