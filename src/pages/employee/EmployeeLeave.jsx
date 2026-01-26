import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Refresh,
  Add,
  BeachAccess,
  CalendarMonth,
  CheckCircle,
  Cancel,
  Pending,
  Delete,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function EmployeeLeave() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees/leave`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLeaveRequests(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      setError('Failed to load leave requests');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleSubmitLeave = async () => {
    try {
      setSubmitting(true);
      await axios.post(
        `${API_URL}/employees/leave`,
        formData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setDialogOpen(false);
      setFormData({ startDate: '', endDate: '', reason: '' });
      fetchLeaveRequests();
      setSubmitting(false);
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      alert('Failed to submit leave request');
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (request) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;

    try {
      setDeleting(true);
      await axios.delete(
        `${API_URL}/employees/leave/${selectedRequest.leaveId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      handleCloseDeleteDialog();
      fetchLeaveRequests();
      setDeleting(false);
    } catch (err) {
      console.error('Failed to delete leave request:', err);
      alert('Failed to delete leave request');
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

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Leave Requests
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Leave Requests
        </Typography>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={fetchLeaveRequests}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const pendingRequests = leaveRequests.filter(r => r.status === 'PENDING');
  const approvedRequests = leaveRequests.filter(r => r.status === 'APPROVED');
  const rejectedRequests = leaveRequests.filter(r => r.status === 'REJECTED');

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
            Leave Requests
          </Typography>
          <Typography color="text.secondary">
            Manage your leave applications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton onClick={fetchLeaveRequests} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            New Request
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'warning.main', backgroundColor: 'warning.50' }}>
            <CardContent>
              <Pending sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {pendingRequests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'success.main', backgroundColor: 'success.50' }}>
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {approvedRequests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'error.main', backgroundColor: 'error.50' }}>
            <CardContent>
              <Cancel sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {rejectedRequests.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Requests List */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          All Leave Requests
        </Typography>
        {leaveRequests.length > 0 ? (
          <Box>
            {leaveRequests.map((request) => (
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: `${getStatusColor(request.status)}.main`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {getStatusIcon(request.status)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {calculateDays(request.startDate, request.endDate)} day(s) • {request.reason}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Applied on {new Date(request.appliedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'start', md: 'end' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      icon={getStatusIcon(request.status)}
                      sx={{ fontWeight: 600 }}
                    />
                    {request.status === 'PENDING' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(request)}
                        sx={{ ml: 1 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  {request.adminComment && (
                    <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200 }}>
                      Admin: {request.adminComment}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No leave requests found. Click "New Request" to submit your first leave application.
          </Alert>
        )}
      </Paper>

      {/* New Leave Request Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BeachAccess /> New Leave Request
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ borderRadius: 2 }}
            />
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for your leave request..."
              sx={{ borderRadius: 2 }}
            />
            {formData.startDate && formData.endDate && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                You are requesting {calculateDays(formData.startDate, formData.endDate)} day(s) of leave
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => {
              setDialogOpen(false);
              setFormData({ startDate: '', endDate: '', reason: '' });
            }} 
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitLeave} 
            variant="contained" 
            disabled={submitting || !formData.startDate || !formData.endDate || !formData.reason}
            sx={{ borderRadius: 2 }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Delete /> Delete Leave Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 1 }}>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                Are you sure you want to delete this leave request? This action cannot be undone.
              </Alert>
              <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Leave Period:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}
                  <Chip 
                    label={`${calculateDays(selectedRequest.startDate, selectedRequest.endDate)} day(s)`} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Reason:</strong>
                </Typography>
                <Typography variant="body2">
                  {selectedRequest.reason}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            disabled={deleting}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteRequest} 
            variant="contained" 
            color="error"
            disabled={deleting}
            startIcon={<Delete />}
            sx={{ borderRadius: 2 }}
          >
            {deleting ? 'Deleting...' : 'Delete Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmployeeLeave;
