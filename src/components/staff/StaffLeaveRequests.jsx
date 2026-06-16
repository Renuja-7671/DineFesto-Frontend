import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  MenuItem,
} from '@mui/material';
import {
  Refresh,
  Add,
  BeachAccess,
  EventAvailable,
  LocalHospital,
  CheckCircle,
  Cancel,
  Pending,
  Delete,
} from '@mui/icons-material';
import { api } from '../../lib/api';
import {
  LEAVE_TYPE_LABELS,
  LEAVE_TYPE_COLORS,
  calculateLeaveDays,
  formatLeaveDate,
} from '../../utils/leave';

function BalanceCard({ balance, icon: Icon, color }) {
  const usedPercent = ((balance.used + balance.pending) / balance.allocated) * 100;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: `${color}.light`,
        height: '100%',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Icon sx={{ fontSize: 32, color: `${color}.main` }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              {balance.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {balance.remaining}
              <Typography component="span" variant="body2" color="text.secondary">
                {' '}
                / {balance.allocated} left
              </Typography>
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(usedPercent, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 1,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: balance.remaining === 0 ? 'error.main' : `${color}.main`,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {balance.used} used · {balance.pending} pending
        </Typography>
      </CardContent>
    </Card>
  );
}

function StaffLeaveRequests({
  leaveApiBase = '/employees/leave',
  pageTitle = 'Leave Requests',
  pageSubtitle,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentYear = new Date().getFullYear();
  const subtitle =
    pageSubtitle || `${currentYear} entitlement: 14 annual · 7 casual · 7 medical days`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [balance, setBalance] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(leaveApiBase, {
        params: { year: currentYear },
      });
      setLeaveRequests(response.data.data.leaveRequests || []);
      setBalance(response.data.data.balance || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  }, [currentYear, leaveApiBase]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const selectedBalance = useMemo(() => {
    if (!balance?.balances) return null;
    return balance.balances.find((item) => item.type === formData.leaveType);
  }, [balance, formData.leaveType]);

  const requestedDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    return calculateLeaveDays(formData.startDate, formData.endDate);
  }, [formData.startDate, formData.endDate]);

  const handleSubmitLeave = async () => {
    try {
      setSubmitting(true);
      setSubmitError('');
      await api.post(leaveApiBase, formData);
      setDialogOpen(false);
      setFormData({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
      fetchLeaveRequests();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;

    try {
      setDeleting(true);
      await api.delete(`${leaveApiBase}/${selectedRequest.leaveId}`);
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete leave request');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle />;
      case 'REJECTED':
        return <Cancel />;
      case 'PENDING':
        return <Pending />;
      default:
        return null;
    }
  };

  const balanceCards = [
    { type: 'ANNUAL', icon: EventAvailable, color: 'primary' },
    { type: 'CASUAL', icon: BeachAccess, color: 'info' },
    { type: 'MEDICAL', icon: LocalHospital, color: 'secondary' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
            {pageTitle}
          </Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchLeaveRequests} color="primary">
            <Refresh />
          </IconButton>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            New Request
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {balanceCards.map(({ type, icon, color }) => {
          const item = balance?.balances?.find((entry) => entry.type === type);
          return (
            <Grid item xs={12} md={4} key={type}>
              {item ? (
                <BalanceCard balance={item} icon={icon} color={color} />
              ) : (
                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <LinearProgress />
                  </CardContent>
                </Card>
              )}
            </Grid>
          );
        })}
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          My Leave History ({currentYear})
        </Typography>

        {leaveRequests.length > 0 ? (
          leaveRequests.map((request) => (
            <Box
              key={request.leaveId}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'start', md: 'center' },
                justifyContent: 'space-between',
                py: 2,
                px: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: 'grey.50',
                gap: 2,
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip
                    label={LEAVE_TYPE_LABELS[request.leaveType]}
                    size="small"
                    color={LEAVE_TYPE_COLORS[request.leaveType]}
                  />
                  <Chip label={`${request.totalDays} day(s)`} size="small" variant="outlined" />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatLeaveDate(request.startDate)} – {formatLeaveDate(request.endDate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {request.reason}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Applied {formatLeaveDate(request.appliedAt)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={request.status}
                  color={getStatusColor(request.status)}
                  icon={getStatusIcon(request.status)}
                />
                {request.status === 'PENDING' && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedRequest(request);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))
        ) : (
          <Alert severity="info">No leave requests yet. Submit your first request above.</Alert>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Leave Request</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            <TextField
              select
              fullWidth
              label="Leave Type"
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            >
              {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            {selectedBalance && (
              <Alert severity={selectedBalance.remaining > 0 ? 'info' : 'warning'}>
                {selectedBalance.remaining} day(s) remaining for {selectedBalance.label.toLowerCase()} this year
              </Alert>
            )}

            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />

            {requestedDays > 0 && selectedBalance && (
              <Alert severity={requestedDays > selectedBalance.remaining ? 'error' : 'success'}>
                Requesting {requestedDays} day(s)
                {requestedDays > selectedBalance.remaining
                  ? ` — exceeds remaining balance (${selectedBalance.remaining})`
                  : ` — ${selectedBalance.remaining - requestedDays} will remain after approval`}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitLeave}
            variant="contained"
            disabled={
              submitting ||
              !formData.startDate ||
              !formData.endDate ||
              !formData.reason ||
              requestedDays <= 0 ||
              (selectedBalance && requestedDays > selectedBalance.remaining)
            }
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Delete Leave Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Delete this pending {LEAVE_TYPE_LABELS[selectedRequest.leaveType].toLowerCase()} request for{' '}
              {selectedRequest.totalDays} day(s)?
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteRequest} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StaffLeaveRequests;
