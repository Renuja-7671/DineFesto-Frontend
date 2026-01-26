import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Person,
  Event,
  Comment,
  FilterList,
  Search,
  BeachAccess,
  CalendarMonth,
  TrendingUp,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: Pending, 2: Approved, 3: Rejected
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees/leave/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLeaveRequests(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      setError('Failed to load leave requests');
      setLoading(false);
    }
  };

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
      
      await axios.put(
        `${API_URL}/employees/leave/${selectedRequest.leaveId}`,
        {
          status: newStatus,
          adminComment: adminComment || undefined,
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setSuccess(`Leave request ${newStatus.toLowerCase()} successfully`);
      handleCloseDialog();
      fetchLeaveRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update leave request:', err);
      setError(err.response?.data?.message || 'Failed to update leave request');
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(false);
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
        return <HourglassEmpty />;
      default:
        return null;
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter by tab
  const getFilteredByTab = () => {
    switch (tabValue) {
      case 1:
        return leaveRequests.filter((req) => req.status === 'PENDING');
      case 2:
        return leaveRequests.filter((req) => req.status === 'APPROVED');
      case 3:
        return leaveRequests.filter((req) => req.status === 'REJECTED');
      default:
        return leaveRequests;
    }
  };

  // Filter by search
  const filteredRequests = getFilteredByTab().filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    const employeeName = request.employee?.fullName?.toLowerCase() || '';
    const reason = request.reason?.toLowerCase() || '';
    return employeeName.includes(searchLower) || reason.includes(searchLower);
  });

  // Statistics
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === 'PENDING').length,
    approved: leaveRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: leaveRequests.filter((r) => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Leave Management
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Leave Management
          </Typography>
          <Typography color="text.secondary">
            Review and manage employee leave requests
          </Typography>
        </Box>
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BeachAccess sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
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
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HourglassEmpty sx={{ fontSize: 32, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pending}
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
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.approved}
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
                    backgroundColor: 'error.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Cancel sx={{ fontSize: 32, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.rejected}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Search */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${stats.total})`} />
            <Tab label={`Pending (${stats.pending})`} />
            <Tab label={`Approved (${stats.approved})`} />
            <Tab label={`Rejected (${stats.rejected})`} />
          </Tabs>
        </Box>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by employee name or reason..."
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

      {/* Leave Requests Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Leave Period</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Applied Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
                            {request.employee?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${calculateDays(request.startDate, request.endDate)} days`}
                        size="small"
                        color="info"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {request.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(request.appliedAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status}
                        size="small"
                        color={getStatusColor(request.status)}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {request.status === 'PENDING' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenDialog(request, 'approve')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDialog(request, 'reject')}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {request.adminComment ? (
                            <Tooltip title={request.adminComment}>
                              <Chip
                                icon={<Comment />}
                                label="View Comment"
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          ) : (
                            'No actions'
                          )}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: actionType === 'approve' ? 'success.main' : 'error.main',
          }}
        >
          {actionType === 'approve' ? <CheckCircle /> : <Cancel />}
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
                      Leave Period
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedRequest.startDate)} -{' '}
                      {formatDate(selectedRequest.endDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body2">
                      {calculateDays(selectedRequest.startDate, selectedRequest.endDate)} days
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

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Comment (Optional)"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add a comment for the employee..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Comment />
                    </InputAdornment>
                  ),
                }}
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
            {processing
              ? 'Processing...'
              : actionType === 'approve'
              ? 'Approve Leave'
              : 'Reject Leave'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LeaveManagement;
