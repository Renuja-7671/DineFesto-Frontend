import { useState, useEffect, useMemo } from 'react';
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
  TablePagination,
  MenuItem,
  InputAdornment,
  Tooltip,
  Stack,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
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
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const DEFAULT_CONFIG = {
  totalTables: 20,
  maxGuestsPerTable: 6,
  amountPerGuest: 1000,
  durationOptionsMinutes: [60, 90, 120, 150, 180],
};

const WIZARD_STEPS = ['Date', 'Time', 'Duration', 'Guests & Tables', 'Confirm'];

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hour${hours > 1 ? 's' : ''}` : `${hours} hours`;
};

const formatMoney = (amount) =>
  `LKR ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const buildReservationDateTime = (dateStr, timeStr) => {
  const combined = new Date(`${dateStr}T${timeStr}`);
  return combined.toISOString();
};

function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [customers, setCustomers] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
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

  // Wizard state (new reservation)
  const [wizardStep, setWizardStep] = useState(0);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [guestCount, setGuestCount] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesLoaded, setTablesLoaded] = useState(false);

  // Customer / walk-in
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Edit form
  const [editFormData, setEditFormData] = useState({
    tableNumber: '',
    reservationTime: '',
    guestCount: '',
    durationMinutes: 120,
    status: 'CONFIRMED',
  });

  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statuses = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'];

  const paymentSummary = useMemo(() => {
    const guests = parseInt(guestCount, 10) || 0;
    const total = guests * config.amountPerGuest;
    return { total };
  }, [guestCount, config.amountPerGuest]);

  const reservationCustomers = useMemo(
    () => customers.filter((c) => c.customerId),
    [customers]
  );

  const selectedCustomer = useMemo(
    () => reservationCustomers.find((c) => String(c.customerId) === String(customerId)),
    [reservationCustomers, customerId]
  );

  useEffect(() => {
    fetchCustomers();
    fetchStats();
    fetchConfig();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReservations();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timer);
  }, [page, rowsPerPage, statusFilter, searchQuery]);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/reservations/config`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setConfig(response.data.data);
      setDurationMinutes(response.data.data.durationOptionsMinutes?.[2] || 120);
    } catch (err) {
      console.error('Failed to fetch reservation config:', err);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await axios.get(`${API_URL}/reservations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params,
      });

      setReservations(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/customers`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCustomers(response.data.data || []);
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

  const resetWizard = () => {
    setWizardStep(0);
    setReservationDate('');
    setReservationTime('');
    setDurationMinutes(config.durationOptionsMinutes?.[2] || 120);
    setGuestCount('');
    setSelectedTable('');
    setAvailableTables([]);
    setTablesLoaded(false);
    setIsWalkIn(false);
    setCustomerId('');
    setGuestName('');
    setGuestPhone('');
    setFormErrors({});
  };

  const handleOpenDialog = (reservation = null) => {
    fetchCustomers();

    if (reservation) {
      setSelectedReservation(reservation);
      setEditFormData({
        tableNumber: reservation.tableNumber,
        reservationTime: new Date(reservation.reservationTime).toISOString().slice(0, 16),
        guestCount: reservation.guestCount,
        durationMinutes: reservation.durationMinutes || 120,
        status: reservation.status,
      });
    } else {
      setSelectedReservation(null);
      resetWizard();
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReservation(null);
    resetWizard();
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

  const validateWizardStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!reservationDate) errors.date = 'Please select a date';
      else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(reservationDate) < today) errors.date = 'Date cannot be in the past';
      }
    }

    if (step === 1) {
      if (!reservationTime) errors.time = 'Please select a time';
      else if (reservationDate) {
        const combined = new Date(`${reservationDate}T${reservationTime}`);
        if (combined <= new Date()) errors.time = 'Reservation must be in the future';
      }
    }

    if (step === 2) {
      if (!durationMinutes) errors.duration = 'Please select a duration';
    }

    if (step === 3) {
      const guests = parseInt(guestCount, 10);
      if (!guestCount || Number.isNaN(guests)) errors.guestCount = 'Number of guests is required';
      else if (guests < 1 || guests > config.maxGuestsPerTable) {
        errors.guestCount = `Guests must be between 1 and ${config.maxGuestsPerTable} per table`;
      }
      if (!tablesLoaded) errors.tables = 'Please load available tables first';
      else if (!selectedTable) errors.table = 'Please select a table';
    }

    if (step === 4) {
      if (!isWalkIn && !customerId) errors.customerId = 'Please select a customer';
      if (isWalkIn && !guestName?.trim()) errors.guestName = 'Guest name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateWizardStep(wizardStep)) return;
    setWizardStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  };

  const handlePrevStep = () => {
    setFormErrors({});
    setWizardStep((prev) => Math.max(prev - 1, 0));
  };

  const loadAvailableTables = async () => {
    const errors = {};
    const guests = parseInt(guestCount, 10);
    if (!guestCount || Number.isNaN(guests)) {
      errors.guestCount = 'Number of guests is required';
    } else if (guests < 1 || guests > config.maxGuestsPerTable) {
      errors.guestCount = `Maximum ${config.maxGuestsPerTable} guests per table`;
    }
    if (!reservationDate || !reservationTime) {
      errors.tables = 'Date and time must be selected first';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoadingTables(true);
      setFormErrors({});
      const reservationDateTime = buildReservationDateTime(reservationDate, reservationTime);
      const response = await axios.get(`${API_URL}/reservations/available-tables`, {
        params: { reservationTime: reservationDateTime, durationMinutes },
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setAvailableTables(response.data.data.availableTables || []);
      setTablesLoaded(true);
      setSelectedTable('');
      if ((response.data.data.availableTables || []).length === 0) {
        setError('No tables available for the selected date, time, and duration');
      } else {
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load available tables');
    } finally {
      setLoadingTables(false);
    }
  };

  const handleCreateReservation = async () => {
    if (!validateWizardStep(4)) return;

    const payload = {
      tableNumber: parseInt(selectedTable, 10),
      reservationTime: buildReservationDateTime(reservationDate, reservationTime),
      durationMinutes,
      guestCount: parseInt(guestCount, 10),
      status: 'CONFIRMED',
      customerId: isWalkIn ? null : parseInt(customerId, 10) || null,
      guestName: isWalkIn ? guestName.trim() : null,
      guestPhone: isWalkIn ? guestPhone?.trim() || null : null,
    };

    try {
      await axios.post(`${API_URL}/reservations`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSuccess('Reservation created. Collect full payment at the restaurant.');
      handleCloseDialog();
      fetchReservations();
      fetchStats();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    }
  };

  const handleEditSubmit = async () => {
    const errors = {};
    if (!editFormData.tableNumber) errors.tableNumber = 'Table number is required';
    if (!editFormData.guestCount) errors.guestCount = 'Guest count is required';
    if (!editFormData.reservationTime) errors.reservationTime = 'Date and time is required';

    const guests = parseInt(editFormData.guestCount, 10);
    if (guests > config.maxGuestsPerTable) {
      errors.guestCount = `Maximum ${config.maxGuestsPerTable} guests per table`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await axios.put(
        `${API_URL}/reservations/${selectedReservation.reservationId}`,
        {
          tableNumber: parseInt(editFormData.tableNumber, 10),
          reservationTime: editFormData.reservationTime,
          guestCount: parseInt(editFormData.guestCount, 10),
          durationMinutes: parseInt(editFormData.durationMinutes, 10),
          status: editFormData.status,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Reservation updated successfully');
      handleCloseDialog();
      fetchReservations();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update reservation');
    }
  };

  const handleMarkAsPaid = async (reservationId) => {
    try {
      await axios.patch(
        `${API_URL}/reservations/${reservationId}/record-physical-payment`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Payment recorded — reservation fully paid');
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleRecordRemainingPayment = async (reservationId) => {
    try {
      await axios.patch(
        `${API_URL}/reservations/${reservationId}/record-physical-payment`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Remaining balance collected — reservation fully paid');
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await axios.put(
        `${API_URL}/reservations/${reservationId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
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

  const isPastReservation = (reservationTime) => new Date(reservationTime) < new Date();

  const getPaymentChipColor = (status) => {
    if (status === 'PAID') return 'success';
    if (status === 'PARTIAL') return 'warning';
    return 'default';
  };

  const renderWizardStep = () => {
    switch (wizardStep) {
      case 0:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Step 1 of 5 — Choose the reservation date
            </Typography>
            <TextField
              fullWidth
              label="Reservation Date *"
              type="date"
              value={reservationDate}
              onChange={(e) => {
                setReservationDate(e.target.value);
                setTablesLoaded(false);
                setAvailableTables([]);
              }}
              error={!!formErrors.date}
              helperText={formErrors.date}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Step 2 of 5 — Choose the reservation time
            </Typography>
            <TextField
              fullWidth
              label="Reservation Time *"
              type="time"
              value={reservationTime}
              onChange={(e) => {
                setReservationTime(e.target.value);
                setTablesLoaded(false);
                setAvailableTables([]);
              }}
              error={!!formErrors.time}
              helperText={formErrors.time || `Date: ${reservationDate}`}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Step 3 of 5 — How long will the table be needed?
            </Typography>
            <FormControl fullWidth error={!!formErrors.duration}>
              <InputLabel>Duration *</InputLabel>
              <Select
                value={durationMinutes}
                label="Duration *"
                onChange={(e) => {
                  setDurationMinutes(e.target.value);
                  setTablesLoaded(false);
                  setAvailableTables([]);
                }}
              >
                {config.durationOptionsMinutes.map((mins) => (
                  <MenuItem key={mins} value={mins}>
                    {formatDuration(mins)}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.duration && <FormHelperText>{formErrors.duration}</FormHelperText>}
            </FormControl>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Step 4 of 5 — Enter guests and pick an available table ({config.totalTables} tables, max{' '}
              {config.maxGuestsPerTable} guests each)
            </Typography>
            <TextField
              fullWidth
              label="Number of Guests *"
              type="number"
              value={guestCount}
              onChange={(e) => {
                setGuestCount(e.target.value);
                setTablesLoaded(false);
                setAvailableTables([]);
                setSelectedTable('');
              }}
              error={!!formErrors.guestCount}
              helperText={
                formErrors.guestCount ||
                `Maximum ${config.maxGuestsPerTable} guests per table`
              }
              inputProps={{ min: 1, max: config.maxGuestsPerTable }}
              sx={{ mb: 2 }}
            />
            <Button
              variant="outlined"
              onClick={loadAvailableTables}
              disabled={loadingTables}
              startIcon={loadingTables ? <CircularProgress size={16} /> : <TableIcon />}
              sx={{ mb: 2 }}
            >
              {loadingTables ? 'Loading...' : 'Load Available Tables'}
            </Button>
            {formErrors.tables && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.tables}
              </Alert>
            )}
            {tablesLoaded && (
              <>
                {availableTables.length === 0 ? (
                  <Alert severity="warning">
                    No tables available for this date, time, and duration. Try a different slot.
                  </Alert>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {availableTables.length} of {config.totalTables} tables available:
                    </Typography>
                    <ToggleButtonGroup
                      value={selectedTable}
                      exclusive
                      onChange={(_, val) => val && setSelectedTable(val)}
                      sx={{ flexWrap: 'wrap', gap: 1 }}
                    >
                      {availableTables.map((table) => (
                        <ToggleButton
                          key={table}
                          value={String(table)}
                          sx={{ width: 56, height: 48 }}
                        >
                          {table}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                    {formErrors.table && (
                      <FormHelperText error sx={{ mt: 1 }}>
                        {formErrors.table}
                      </FormHelperText>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Step 5 of 5 — Customer details and payment summary
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Table {selectedTable} · {reservationDate} at {reservationTime} ·{' '}
              {formatDuration(durationMinutes)} · {guestCount} guest(s)
              {!isWalkIn && selectedCustomer && (
                <> · {selectedCustomer.fullName}</>
              )}
              {isWalkIn && guestName?.trim() && (
                <> · {guestName.trim()} (Walk-in)</>
              )}
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={isWalkIn}
                  onChange={(e) => {
                    setIsWalkIn(e.target.checked);
                    setFormErrors({});
                  }}
                  color="primary"
                />
              }
              label="Walk-in Customer (No Registration)"
              sx={{ mb: 2, display: 'block' }}
            />

            {!isWalkIn ? (
              <FormControl fullWidth error={!!formErrors.customerId} sx={{ mb: 2 }}>
                <InputLabel id="reservation-customer-label">Customer *</InputLabel>
                <Select
                  labelId="reservation-customer-label"
                  value={customerId ? String(customerId) : ''}
                  onChange={(e) => setCustomerId(e.target.value)}
                  label="Customer *"
                  renderValue={(selected) => {
                    const customer = reservationCustomers.find(
                      (c) => String(c.customerId) === String(selected)
                    );
                    return customer
                      ? `${customer.fullName} (${customer.email})`
                      : '';
                  }}
                >
                  {reservationCustomers.length === 0 ? (
                    <MenuItem value="" disabled>
                      No customers available
                    </MenuItem>
                  ) : (
                    reservationCustomers.map((customer) => (
                      <MenuItem
                        key={customer.customerId}
                        value={String(customer.customerId)}
                      >
                        {customer.fullName} ({customer.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formErrors.customerId && (
                  <FormHelperText>{formErrors.customerId}</FormHelperText>
                )}
              </FormControl>
            ) : (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guest Name *"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    error={!!formErrors.guestName}
                    helperText={formErrors.guestName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guest Phone (Optional)"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </Grid>
              </Grid>
            )}

            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Payment
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  Total ({guestCount} guest{guestCount !== '1' ? 's' : ''} ×{' '}
                  {formatMoney(config.amountPerGuest)})
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatMoney(paymentSummary.total)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Full amount to be collected in person at the restaurant (cash or card).
              </Typography>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Reservations Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {config.totalTables} tables · max {config.maxGuestsPerTable} guests per table · full payment at restaurant
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          New Reservation
        </Button>
      </Box>

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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Reservations', value: stats.totalReservations, icon: ReservationIcon, color: 'primary' },
          { label: "Today's Reservations", value: stats.todayReservations, icon: TodayIcon, color: 'success' },
          { label: 'Upcoming', value: stats.upcomingReservations, icon: UpcomingOutlined, color: 'info' },
          { label: 'Cancelled', value: stats.cancelledReservations, icon: CancelIcon, color: 'error' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Grid item xs={12} md={3} key={label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: `${color}.light`, borderRadius: 2, p: 1.5, display: 'flex' }}>
                    <Icon sx={{ fontSize: 32, color: `${color}.main` }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by customer name or table number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon /></InputAdornment>
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><FilterIcon /></InputAdornment>
                  ),
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Guests</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Loading...</TableCell>
                </TableRow>
              ) : reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No reservations found</TableCell>
                </TableRow>
              ) : (
                reservations.map((reservation) => (
                  <TableRow
                    key={reservation.reservationId}
                    hover
                    sx={{ opacity: isPastReservation(reservation.reservationTime) ? 0.6 : 1 }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {reservation.customer?.fullName || reservation.guestName || 'N/A'}
                          </Typography>
                          {reservation.guestName && !reservation.customerId && (
                            <Chip label="Walk-in" size="small" color="info" variant="outlined" sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TableIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Table {reservation.tableNumber}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">{formatDateTime(reservation.reservationTime)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDuration(reservation.durationMinutes || 120)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon fontSize="small" color="action" />
                        <Typography variant="body2">{reservation.guestCount}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={reservation.paymentStatus || 'PENDING'}
                          size="small"
                          color={getPaymentChipColor(reservation.paymentStatus)}
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {Number(reservation.onlinePaidAmount) > 0
                            ? `Paid online: ${formatMoney(reservation.onlinePaidAmount)}`
                            : `Due: ${formatMoney(reservation.remainingAmount ?? reservation.reservationAmount)}`}
                        </Typography>
                        {Number(reservation.onlinePaidAmount) > 0 &&
                          Number(reservation.remainingAmount) > 0 && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Remaining: {formatMoney(reservation.remainingAmount)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reservation.status}
                        color={
                          reservation.status === 'CONFIRMED' ? 'success'
                            : reservation.status === 'CANCELLED' ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap">
                        {reservation.paymentStatus === 'PENDING' && reservation.status !== 'CANCELLED' && (
                          <Tooltip title="Mark full payment received at restaurant">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleMarkAsPaid(reservation.reservationId)}
                            >
                              Mark as Paid
                            </Button>
                          </Tooltip>
                        )}
                        {reservation.paymentStatus === 'PARTIAL' && (
                          <Tooltip title="Collect remaining balance at restaurant">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleRecordRemainingPayment(reservation.reservationId)}
                            >
                              Collect Remaining
                            </Button>
                          </Tooltip>
                        )}
                        {reservation.status === 'CONFIRMED' && (
                          <Tooltip title="Cancel">
                            <IconButton size="small" color="warning" onClick={() => handleCancelReservation(reservation.reservationId)}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(reservation)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(reservation)}>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* New Reservation Wizard Dialog */}
      <Dialog open={openDialog && !selectedReservation} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Reservation</DialogTitle>
        <DialogContent>
          <Stepper activeStep={wizardStep} alternativeLabel sx={{ mb: 3, mt: 1 }}>
            {WIZARD_STEPS.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
          {renderWizardStep()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {wizardStep > 0 && (
            <Button startIcon={<ArrowBackIcon />} onClick={handlePrevStep}>Back</Button>
          )}
          {wizardStep < WIZARD_STEPS.length - 1 ? (
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNextStep}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCreateReservation}>Create Reservation</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog open={openDialog && !!selectedReservation} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Reservation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Table Number"
                type="number"
                value={editFormData.tableNumber}
                onChange={(e) => setEditFormData({ ...editFormData, tableNumber: e.target.value })}
                error={!!formErrors.tableNumber}
                helperText={formErrors.tableNumber}
                inputProps={{ min: 1, max: config.totalTables }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Guests"
                type="number"
                value={editFormData.guestCount}
                onChange={(e) => setEditFormData({ ...editFormData, guestCount: e.target.value })}
                error={!!formErrors.guestCount}
                helperText={formErrors.guestCount || `Max ${config.maxGuestsPerTable} per table`}
                inputProps={{ min: 1, max: config.maxGuestsPerTable }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={editFormData.durationMinutes}
                  label="Duration"
                  onChange={(e) => setEditFormData({ ...editFormData, durationMinutes: e.target.value })}
                >
                  {config.durationOptionsMinutes.map((mins) => (
                    <MenuItem key={mins} value={mins}>{formatDuration(mins)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reservation Date & Time"
                type="datetime-local"
                value={editFormData.reservationTime}
                onChange={(e) => setEditFormData({ ...editFormData, reservationTime: e.target.value })}
                error={!!formErrors.reservationTime}
                helperText={formErrors.reservationTime}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Update</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this reservation? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReservationsManagement;
