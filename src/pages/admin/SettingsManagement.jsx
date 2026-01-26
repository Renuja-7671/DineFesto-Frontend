import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  Tabs,
  Tab,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function SettingsManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User Settings
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderNotifications: true,
    reservationNotifications: true,
    reviewNotifications: true,
    marketingEmails: false,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    restaurantName: '',
    restaurantEmail: '',
    restaurantPhone: '',
    restaurantAddress: '',
    currency: 'USD',
    timezone: 'UTC',
    taxRate: 10.0,
    serviceChargeRate: 5.0,
    orderPrefix: 'ORD',
    reservationDuration: 120,
    maxGuestsPerReservation: 10,
    advanceReservationDays: 30,
    enableOnlineOrdering: true,
    enableReservations: true,
    enableReviews: true,
    enableLoyaltyProgram: true,
    loyaltyPointsPerDollar: 1,
    maintenanceMode: false,
  });

  // Security Logs
  const [securityLogs, setSecurityLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPagination, setLogsPagination] = useState({});

  useEffect(() => {
    fetchUserSettings();
    fetchSystemSettings();
    fetchSecurityLogs();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUserSettings(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch user settings');
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/system`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSystemSettings(response.data.data);
    } catch (err) {
      console.error('Failed to fetch system settings:', err);
    }
  };

  const fetchSecurityLogs = async (page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/settings/security-logs?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSecurityLogs(response.data.data.logs);
      setLogsPagination(response.data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await axios.put(
        `${API_URL}/settings/notifications`,
        {
          emailNotifications: userSettings.emailNotifications,
          pushNotifications: userSettings.pushNotifications,
          orderNotifications: userSettings.orderNotifications,
          reservationNotifications: userSettings.reservationNotifications,
          reviewNotifications: userSettings.reviewNotifications,
          marketingEmails: userSettings.marketingEmails,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setSuccess('Notification settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notification settings');
    }
  };

  const handleSaveAppearance = async () => {
    try {
      await axios.put(
        `${API_URL}/settings/appearance`,
        {
          theme: userSettings.theme,
          language: userSettings.language,
          timezone: userSettings.timezone,
          currency: userSettings.currency,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setSuccess('Appearance settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appearance settings');
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      await axios.put(`${API_URL}/settings/system`, systemSettings, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSuccess('System settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save system settings');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      success: 'success',
      failed: 'error',
      warning: 'warning',
      info: 'info',
    };
    return colors[status.toLowerCase()] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Settings
        </Typography>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Settings
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable">
          <Tab icon={<NotificationIcon />} label="Notifications" iconPosition="start" />
          <Tab icon={<PaletteIcon />} label="Appearance" iconPosition="start" />
          <Tab icon={<BusinessIcon />} label="System" iconPosition="start" />
          <Tab icon={<SecurityIcon />} label="Security" iconPosition="start" />
        </Tabs>
      </Card>

      {/* Notifications Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <NotificationIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">Notification Preferences</Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage how you receive notifications
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  General Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.emailNotifications}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, emailNotifications: e.target.checked })
                      }
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 2 }}>
                  Receive notifications via email
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.pushNotifications}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, pushNotifications: e.target.checked })
                      }
                    />
                  }
                  label="Push Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 2 }}>
                  Receive push notifications on your device
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Specific Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.orderNotifications}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, orderNotifications: e.target.checked })
                      }
                    />
                  }
                  label="Order Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 2 }}>
                  Get notified about order updates
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.reservationNotifications}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          reservationNotifications: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Reservation Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 2 }}>
                  Get notified about reservation updates
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.reviewNotifications}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, reviewNotifications: e.target.checked })
                      }
                    />
                  }
                  label="Review Notifications"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 2 }}>
                  Get notified about new reviews
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.marketingEmails}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, marketingEmails: e.target.checked })
                      }
                    />
                  }
                  label="Marketing Emails"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mb: 2 }}>
                  Receive promotional emails and offers
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveNotifications}
                >
                  Save Notification Settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PaletteIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">Appearance Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Customize the look and feel of the application
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={userSettings.theme}
                    label="Theme"
                    onChange={(e) => setUserSettings({ ...userSettings, theme: e.target.value })}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={userSettings.language}
                    label="Language"
                    onChange={(e) => setUserSettings({ ...userSettings, language: e.target.value })}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={userSettings.timezone}
                    label="Timezone"
                    onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={userSettings.currency}
                    label="Currency"
                    onChange={(e) => setUserSettings({ ...userSettings, currency: e.target.value })}
                  >
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                    <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAppearance}
                >
                  Save Appearance Settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* System Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">System Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure system-wide settings
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Restaurant Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Restaurant Name"
                  value={systemSettings.restaurantName}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, restaurantName: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Restaurant Email"
                  type="email"
                  value={systemSettings.restaurantEmail}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, restaurantEmail: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Restaurant Phone"
                  value={systemSettings.restaurantPhone}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, restaurantPhone: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Restaurant Address"
                  value={systemSettings.restaurantAddress}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, restaurantAddress: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Financial Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={systemSettings.taxRate}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, taxRate: parseFloat(e.target.value) })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Service Charge Rate (%)"
                  type="number"
                  value={systemSettings.serviceChargeRate}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      serviceChargeRate: parseFloat(e.target.value),
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Operational Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Order Prefix"
                  value={systemSettings.orderPrefix}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, orderPrefix: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Reservation Duration (minutes)"
                  type="number"
                  value={systemSettings.reservationDuration}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      reservationDuration: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Guests per Reservation"
                  type="number"
                  value={systemSettings.maxGuestsPerReservation}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      maxGuestsPerReservation: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Advance Reservation Days"
                  type="number"
                  value={systemSettings.advanceReservationDays}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      advanceReservationDays: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Loyalty Points per Dollar"
                  type="number"
                  value={systemSettings.loyaltyPointsPerDollar}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      loyaltyPointsPerDollar: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Feature Toggles
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.enableOnlineOrdering}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          enableOnlineOrdering: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Enable Online Ordering"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.enableReservations}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          enableReservations: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Enable Reservations"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.enableReviews}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, enableReviews: e.target.checked })
                      }
                    />
                  }
                  label="Enable Reviews"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.enableLoyaltyProgram}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          enableLoyaltyProgram: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Enable Loyalty Program"
                />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Maintenance Mode
                  </Typography>
                  <Typography variant="body2">
                    When enabled, the system will be unavailable to customers
                  </Typography>
                </Alert>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })
                      }
                      color="warning"
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSystemSettings}
                >
                  Save System Settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">Security Logs</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor security events and authentication logs
                  </Typography>
                </Box>
              </Box>
              <Button
                startIcon={<RefreshIcon />}
                onClick={() => fetchSecurityLogs(logsPage)}
              >
                Refresh
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {securityLogs.length > 0 ? (
                    securityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell>
                          {log.user ? (
                            <Box>
                              <Typography variant="body2">{log.user.email}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.user.role}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Unknown
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.status}
                            size="small"
                            color={getStatusColor(log.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{log.details || '-'}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No security logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {logsPagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={logsPage === 1}
                  onClick={() => {
                    const newPage = logsPage - 1;
                    setLogsPage(newPage);
                    fetchSecurityLogs(newPage);
                  }}
                >
                  Previous
                </Button>
                <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                  Page {logsPage} of {logsPagination.pages}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={logsPage === logsPagination.pages}
                  onClick={() => {
                    const newPage = logsPage + 1;
                    setLogsPage(newPage);
                    fetchSecurityLogs(newPage);
                  }}
                >
                  Next
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default SettingsManagement;
