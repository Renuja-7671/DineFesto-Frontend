import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as MoneyIcon,
  RateReview as ReviewIcon,
  EventNote as ReservationIcon,
  TrendingUp as TrendingUpIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken, clearAuth } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ProfileManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editFormData, setEditFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: '',
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    delete: false,
  });

  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setProfile(response.data.data);
      setEditFormData({
        email: response.data.data.email,
        fullName: response.data.data.profile?.fullName || '',
        phoneNumber: response.data.data.profile?.phoneNumber || '',
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch profile');
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile/activity`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setActivity(response.data.data);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
  };

  const handleEditProfile = async () => {
    try {
      await axios.put(`${API_URL}/profile`, editFormData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSuccess('Profile updated successfully');
      setOpenEditDialog(false);
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/profile/password`,
        {
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setSuccess('Password changed successfully');
      setOpenPasswordDialog(false);
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        data: { password: deletePassword },
      });
      clearAuth();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setOpenDeleteDialog(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      PREPARING: 'info',
      READY: 'info',
      SERVED: 'success',
      COMPLETED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Profile
        </Typography>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        My Profile
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

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: 40,
                    mb: 2,
                  }}
                >
                  {profile?.profile?.fullName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {profile?.profile?.fullName || 'User'}
                </Typography>
                <Chip
                  label={profile?.role}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={profile?.email}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  />
                </ListItem>

                {profile?.profile?.phoneNumber && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={profile.profile.phoneNumber}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}

                {profile?.profileType === 'employee' && profile?.profile?.designation && (
                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Designation"
                      secondary={profile.profile.designation}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}

                {profile?.profileType === 'customer' && (
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Loyalty Points"
                      secondary={profile.profile.loyaltyPoints}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={formatDate(profile?.createdAt)}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenEditDialog(true)}
                  fullWidth
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => setOpenPasswordDialog(true)}
                  fullWidth
                >
                  Change Password
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDeleteDialog(true)}
                  fullWidth
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Stats */}
        <Grid item xs={12} md={8}>
          {activity && (
            <>
              {/* Customer Activity */}
              {profile?.profileType === 'customer' && (
                <>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                backgroundColor: 'primary.light',
                                borderRadius: 2,
                                p: 1.5,
                                display: 'flex',
                              }}
                            >
                              <OrderIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Total Orders
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {activity.totalOrders}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                backgroundColor: 'success.light',
                                borderRadius: 2,
                                p: 1.5,
                                display: 'flex',
                              }}
                            >
                              <MoneyIcon sx={{ fontSize: 32, color: 'success.main' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Total Spent
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {formatCurrency(activity.totalSpent)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                backgroundColor: 'warning.light',
                                borderRadius: 2,
                                p: 1.5,
                                display: 'flex',
                              }}
                            >
                              <ReviewIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Reviews
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {activity.totalReviews}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                backgroundColor: 'info.light',
                                borderRadius: 2,
                                p: 1.5,
                                display: 'flex',
                              }}
                            >
                              <ReservationIcon sx={{ fontSize: 32, color: 'info.main' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Reservations
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {activity.totalReservations}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Recent Orders */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Orders
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Order ID</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {activity.recentOrders?.length > 0 ? (
                              activity.recentOrders.map((order) => (
                                <TableRow key={order.orderId}>
                                  <TableCell>#{order.orderId}</TableCell>
                                  <TableCell>{order.type.replace('_', ' ')}</TableCell>
                                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={order.status}
                                      size="small"
                                      color={getStatusColor(order.status)}
                                    />
                                  </TableCell>
                                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  No recent orders
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Employee Activity */}
              {profile?.profileType === 'employee' && (
                <>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                backgroundColor: 'primary.light',
                                borderRadius: 2,
                                p: 1.5,
                                display: 'flex',
                              }}
                            >
                              <OrderIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Orders Processed
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                {activity.ordersProcessed}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                backgroundColor: 'success.light',
                                borderRadius: 2,
                                p: 1.5,
                                display: 'flex',
                              }}
                            >
                              <MoneyIcon sx={{ fontSize: 32, color: 'success.main' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Revenue Generated
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {formatCurrency(activity.revenueGenerated)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Recent Orders Processed - Only show for waiters */}
                  {profile?.role === 'WAITER' && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Recent Orders Processed
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Orders you have personally handled and processed
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {activity.recentOrdersProcessed?.length > 0 ? (
                                activity.recentOrdersProcessed.map((order) => (
                                  <TableRow key={order.orderId}>
                                    <TableCell>#{order.orderId}</TableCell>
                                    <TableCell>{order.type.replace('_', ' ')}</TableCell>
                                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={order.status}
                                        size="small"
                                        color={getStatusColor(order.status)}
                                      />
                                    </TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} align="center">
                                    No recent orders processed
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
              />
            </Grid>
            {profile?.profileType === 'customer' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editFormData.phoneNumber}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phoneNumber: e.target.value })
                  }
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordFormData.currentPassword}
                onChange={(e) =>
                  setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                        }
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordFormData.newPassword}
                onChange={(e) =>
                  setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                        }
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordFormData.confirmPassword}
                onChange={(e) =>
                  setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                        }
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please enter your password to confirm account deletion:
          </Typography>
          <TextField
            fullWidth
            label="Password"
            type={showPasswords.delete ? 'text' : 'password'}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, delete: !showPasswords.delete })
                    }
                    edge="end"
                  >
                    {showPasswords.delete ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} variant="contained" color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProfileManagement;
