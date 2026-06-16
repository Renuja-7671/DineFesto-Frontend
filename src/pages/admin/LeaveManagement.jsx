import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Stack,
  LinearProgress,
  InputAdornment,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Person,
  Comment,
  Search,
  BeachAccess,
  LocalHospital,
  EventAvailable,
  Balance,
} from '@mui/icons-material';
import { api } from '../../lib/api';
import {
  LEAVE_ALLOCATIONS,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPE_COLORS,
  formatLeaveDate,
} from '../../utils/leave';

const STATUS_COLORS = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'warning',
};

function BalanceBar({ balance }) {
  const usedPercent = (balance.used / balance.allocated) * 100;
  const pendingPercent = (balance.pending / balance.allocated) * 100;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {balance.remaining} / {balance.allocated} left
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {balance.used} used · {balance.pending} pending
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(usedPercent + pendingPercent, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            bgcolor: balance.remaining === 0 ? 'error.main' : 'primary.main',
          },
        }}
      />
    </Box>
  );
}

function LeaveManagement() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [mainTab, setMainTab] = useState(0);
  const [statusTab, setStatusTab] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employeeBalances, setEmployeeBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const yearOptions = useMemo(
    () => Array.from({ length: 4 }, (_, index) => currentYear - index),
    [currentYear]
  );

  const fetchLeaveData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/employees/leave/all', {
        params: { year: selectedYear },
      });
      setLeaveRequests(response.data.data.leaveRequests || []);
      setEmployeeBalances(response.data.data.employeeBalances || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const getEmployeeBalance = useCallback(
    (employeeId) => employeeBalances.find((item) => item.employeeId === employeeId),
    [employeeBalances]
  );

  const handleOpenDialog = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminComment('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setActionType('');
    setAdminComment('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const newStatus = actionType === 'approve' ? 'APPROVED' : 'REJECTED';

      await api.put(`/employees/leave/${selectedRequest.leaveId}`, {
        status: newStatus,
        adminComment: adminComment || undefined,
      });

      setSuccess(`Leave request ${newStatus.toLowerCase()} successfully`);
      handleCloseDialog();
      fetchLeaveData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave request');
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(false);
    }
  };

  const filteredByStatus = useMemo(() => {
    switch (statusTab) {
      case 1:
        return leaveRequests.filter((req) => req.status === 'PENDING');
      case 2:
        return leaveRequests.filter((req) => req.status === 'APPROVED');
      case 3:
        return leaveRequests.filter((req) => req.status === 'REJECTED');
      default:
        return leaveRequests;
    }
  }, [leaveRequests, statusTab]);

  const filteredRequests = filteredByStatus.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    const employeeName = request.employee?.fullName?.toLowerCase() || '';
    const reason = request.reason?.toLowerCase() || '';
    const leaveType = LEAVE_TYPE_LABELS[request.leaveType]?.toLowerCase() || '';
    return (
      employeeName.includes(searchLower) ||
      reason.includes(searchLower) ||
      leaveType.includes(searchLower)
    );
  });

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === 'PENDING').length,
    approved: leaveRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: leaveRequests.filter((r) => r.status === 'REJECTED').length,
  };

  const policyCards = [
    { type: 'ANNUAL', icon: EventAvailable, color: 'primary' },
    { type: 'CASUAL', icon: BeachAccess, color: 'info' },
    { type: 'MEDICAL', icon: LocalHospital, color: 'secondary' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Leave Management
          </Typography>
          <Typography color="text.secondary">
            Annual entitlement: 14 annual · 7 casual · 7 medical leaves per employee ({selectedYear})
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          sx={{ minWidth: 120 }}
        >
          {yearOptions.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
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
        {policyCards.map(({ type, icon: Icon, color }) => (
          <Grid item xs={12} md={4} key={type}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ bgcolor: `${color}.light`, borderRadius: 2, p: 1.5 }}>
                    <Icon sx={{ color: `${color}.main` }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {LEAVE_TYPE_LABELS[type]}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {LEAVE_ALLOCATIONS[type]} days / year
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Requests', value: stats.total, color: 'primary' },
          { label: 'Pending', value: stats.pending, color: 'warning' },
          { label: 'Approved', value: stats.approved, color: 'success' },
          { label: 'Rejected', value: stats.rejected, color: 'error' },
        ].map(({ label, value, color }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main` }}>
                  {loading ? '—' : value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <Tabs value={mainTab} onChange={(_, value) => setMainTab(value)}>
          <Tab label="Leave Requests" />
          <Tab label="Employee Balances" icon={<Balance />} iconPosition="start" />
        </Tabs>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {mainTab === 0 && (
        <>
          <Card sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={statusTab} onChange={(_, value) => setStatusTab(value)} variant="scrollable">
                <Tab label={`All (${stats.total})`} />
                <Tab label={`Pending (${stats.pending})`} />
                <Tab label={`Approved (${stats.approved})`} />
                <Tab label={`Rejected (${stats.rejected})`} />
              </Tabs>
            </Box>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search by employee, leave type, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Applied</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" py={3}>
                          No leave requests found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.leaveId} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <Person fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {request.employee?.fullName || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.employee?.designation}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={LEAVE_TYPE_LABELS[request.leaveType] || request.leaveType}
                            size="small"
                            color={LEAVE_TYPE_COLORS[request.leaveType] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {formatLeaveDate(request.startDate)} – {formatLeaveDate(request.endDate)}
                        </TableCell>
                        <TableCell>
                          <Chip label={`${request.totalDays} days`} size="small" color="info" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 180 }} noWrap>
                            {request.reason}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatLeaveDate(request.appliedAt)}</TableCell>
                        <TableCell>
                          <Chip label={request.status} size="small" color={STATUS_COLORS[request.status]} />
                        </TableCell>
                        <TableCell align="right">
                          {request.status === 'PENDING' ? (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Approve">
                                <IconButton size="small" color="success" onClick={() => handleOpenDialog(request, 'approve')}>
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton size="small" color="error" onClick={() => handleOpenDialog(request, 'reject')}>
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          ) : request.adminComment ? (
                            <Tooltip title={request.adminComment}>
                              <Chip icon={<Comment />} label="Comment" size="small" variant="outlined" />
                            </Tooltip>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {mainTab === 1 && (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Annual (14)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Casual (7)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Medical (7)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeBalances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" py={3}>
                        No employee balance data
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeBalances.map((employee) => (
                    <TableRow key={employee.employeeId} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {employee.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.designation}
                        </Typography>
                      </TableCell>
                      {['ANNUAL', 'CASUAL', 'MEDICAL'].map((type) => {
                        const balance = employee.balances.find((item) => item.type === type);
                        return (
                          <TableCell key={type}>
                            {balance ? <BalanceBar balance={balance} /> : '—'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: actionType === 'approve' ? 'success.main' : 'error.main' }}>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Employee
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedRequest.employee?.fullName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Leave Type
                    </Typography>
                    <Typography variant="body2">
                      {LEAVE_TYPE_LABELS[selectedRequest.leaveType]}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body2">{selectedRequest.totalDays} days</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Period
                    </Typography>
                    <Typography variant="body2">
                      {formatLeaveDate(selectedRequest.startDate)} – {formatLeaveDate(selectedRequest.endDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Reason
                    </Typography>
                    <Typography variant="body2">{selectedRequest.reason}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {getEmployeeBalance(selectedRequest.employee?.employeeId) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Current Balance ({selectedYear})
                  </Typography>
                  {getEmployeeBalance(selectedRequest.employee.employeeId).balances.map((balance) => (
                    <Box key={balance.type} sx={{ mb: 1.5 }}>
                      <Typography variant="caption">{balance.label}</Typography>
                      <BalanceBar balance={balance} />
                    </Box>
                  ))}
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Comment (Optional)"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={processing}
          >
            {processing ? 'Processing...' : actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LeaveManagement;
