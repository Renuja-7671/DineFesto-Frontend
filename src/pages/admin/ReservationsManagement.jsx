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
  IconButton,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  InputAdornment,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  EventNote as ReservationIcon,
  Today as TodayIcon,
  UpcomingOutlined,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  TableRestaurant as TableIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    totalReservations: 0,
    todayReservations: 0,
    upcomingReservations: 0,
    cancelledReservations: 0,
  });
  const [formData, setFormData] = useState({
    customerId: '',
    tableNumber: '',
    reservationTime: '',
    guestCount: '',
    status: 'CONFIRMED',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];

  useEffect(() => {
    fetchReservations();
    fetchCustomers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, statusFilter]);

  useEffect(() => {
    console.log('Customers state:', customers);
  }, [customers]);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/reservations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReservations(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reservations');
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      // Fetch all customers using the auth endpoint
      const response = await axios.get(`${API_URL}/auth/customers`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      console.log('Customers fetched:', response.data);
      setCustomers(response.data.data || []);
      console.log('Customers state updated:', response.data.data?.length || 0, 'customers');
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/reservations/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((reservation) => {
        const customerName = reservation.customer?.fullName || '';
        const tableNum = reservation.tableNumber?.toString() || '';
        return (
          customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tableNum.includes(searchQuery)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((reservation) => reservation.status === statusFilter);
    }

    setFilteredReservations(filtered);
  };

  const handleOpenDialog = (reservation = null) => {
    // Refetch customers when opening dialog to ensure fresh data
    fetchCustomers();
    
    if (reservation) {
      setSelectedReservation(reservation);
      setFormData({
        customerId: reservation.customerId,
        tableNumber: reservation.tableNumber,
        reservationTime: new Date(reservation.reservationTime).toISOString().slice(0, 16),
        guestCount: reservation.guestCount,
        status: reservation.status,
      });
    } else {
      setSelectedReservation(null);
      setFormData({
        customerId: '',
        tableNumber: '',
        reservationTime: '',
        guestCount: '',
        status: 'CONFIRMED',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReservation(null);
    setError('');
  };

  const handleOpenDeleteDialog = (reservation) => {
    setSelectedReservation(reservation);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedReservation(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedReservation) {
        // Update existing reservation
        await axios.put(
          `${API_URL}/reservations/${selectedReservation.reservationId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        setSuccess('Reservation updated successfully');
      } else {
        // Create new reservation
        await axios.post(`${API_URL}/reservations`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setSuccess('Reservation created successfully');
      }
      handleCloseDialog();
      fetchReservations();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save reservation');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await axios.put(
        `${API_URL}/reservations/${reservationId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setSuccess('Reservation cancelled successfully');
      fetchReservations();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/reservations/${selectedReservation.reservationId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSuccess('Reservation deleted successfully');
      handleCloseDeleteDialog();
      fetchReservations();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete reservation');
      handleCloseDeleteDialog();
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPastReservation = (reservationTime) => {
    return new Date(reservationTime) < new Date();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Reservations Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          New Reservation
        </Button>
      </Box>

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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReservationIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Reservations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalReservations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'success.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TodayIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Today's Reservations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.todayReservations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'info.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UpcomingOutlined sx={{ fontSize: 32, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.upcomingReservations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'error.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CancelIcon sx={{ fontSize: 32, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.cancelledReservations}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by customer name or table number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Guests</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredReservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No reservations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReservations.map((reservation) => (
                  <TableRow
                    key={reservation.reservationId}
                    hover
                    sx={{
                      opacity: isPastReservation(reservation.reservationTime) ? 0.6 : 1,
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {reservation.customer?.fullName || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TableIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Table {reservation.tableNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDateTime(reservation.reservationTime)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon fontSize="small" color="action" />
                        <Typography variant="body2">{reservation.guestCount}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reservation.status}
                        color={
                          reservation.status === 'CONFIRMED'
                            ? 'success'
                            : reservation.status === 'CANCELLED'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {reservation.status === 'CONFIRMED' && (
                          <Tooltip title="Cancel Reservation">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCancelReservation(reservation.reservationId)
                              }
                              color="warning"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(reservation)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(reservation)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReservation ? 'Edit Reservation' : 'New Reservation'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Customer"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
                disabled={selectedReservation !== null}
              >
                {customers.length === 0 ? (
                  <MenuItem value="" disabled>
                    No customers available
                  </MenuItem>
                ) : (
                  customers.map((customer) => (
                    <MenuItem key={customer.customerId} value={customer.customerId}>
                      {customer.fullName} ({customer.email})
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Table Number"
                type="number"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                required
                inputProps={{ min: '1', max: '20' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                type="number"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                required
                inputProps={{ min: '1' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reservation Date & Time"
                type="datetime-local"
                value={formData.reservationTime}
                onChange={(e) =>
                  setFormData({ ...formData, reservationTime: e.target.value })
                }
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            {selectedReservation && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedReservation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this reservation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReservationsManagement;
