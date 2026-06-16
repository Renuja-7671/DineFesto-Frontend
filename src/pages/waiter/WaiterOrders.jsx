import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Avatar,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import {
  Refresh,
  PersonAdd,
  Edit,
  Search,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { GridLoadingSkeleton } from '../../components/admin/TableLoadingState';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getTodayDateRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

function WaiterOrders() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/employees/profile`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setCurrentEmployeeId(response.data.data.employeeId);
      } catch (err) {
        console.error('Failed to fetch employee profile:', err);
      }
    };

    if (user.role === 'WAITER' || user.role === 'CHEF') {
      fetchEmployeeProfile();
    }
  }, [user.role]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (orderTypeFilter !== 'ALL') {
        params.type = orderTypeFilter;
      }

      if (tabValue === 0) {
        params.statusGroup = 'ACTIVE';
      } else if (tabValue === 1) {
        params.statusGroup = 'COMPLETED';
      } else if (tabValue === 2) {
        const { startDate, endDate } = getTodayDateRange();
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params,
      });

      setOrders(response.data.data || []);
      setTotalCount(response.data.pagination?.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, tabValue, searchQuery, orderTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timer);
  }, [fetchOrders, searchQuery]);

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleAttendOrder = async (order) => {
    try {
      await axios.patch(
        `${API_URL}/orders/${order.orderId}/attend`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      fetchOrders();
    } catch (err) {
      console.error('Failed to attend order:', err);
      alert(err.response?.data?.message || 'Failed to attend to order');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(
        `${API_URL}/orders/${selectedOrder.orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setUpdateDialogOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'SERVED':
        return 'success';
      case 'PREPARING':
      case 'READY':
        return 'warning';
      case 'PENDING':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAvailableStatuses = (currentStatus, userRole) => {
    if (userRole === 'CHEF') {
      const chefFlow = {
        PREPARING: ['READY', 'CANCELLED'],
        READY: ['READY'],
        PENDING: [],
        SERVED: [],
        COMPLETED: [],
        CANCELLED: [],
      };
      return chefFlow[currentStatus] || [];
    }

    const waiterFlow = {
      PENDING: [],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED', 'CANCELLED'],
      SERVED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    return waiterFlow[currentStatus] || [];
  };

  const canUpdateOrder = (order) => {
    if (user.role === 'CHEF' && order.status === 'PREPARING') {
      return true;
    }

    if (user.role === 'WAITER') {
      return order.staffId === currentEmployeeId;
    }

    return false;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, mb: 1 }}>
            Order Management
          </Typography>
          <Typography color="text.secondary">
            View and manage customer orders
          </Typography>
        </Box>
        <IconButton onClick={fetchOrders} color="primary" disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by order number, customer name, or staff name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Order Type"
              value={orderTypeFilter}
              onChange={(e) => {
                setOrderTypeFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="DINE_IN">Dine-In</MenuItem>
              <MenuItem value="TAKEAWAY">Takeaway</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? 'fullWidth' : 'standard'}>
          <Tab label="Active Orders" />
          <Tab label="Completed" />
          <Tab label="Today" />
        </Tabs>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 3 }}
          action={
            <IconButton color="inherit" size="small" onClick={fetchOrders}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <GridLoadingSkeleton items={rowsPerPage > 6 ? 6 : rowsPerPage} />
      ) : (
        <>
          <Grid container spacing={3}>
            {orders.length > 0 ? (
              orders.map((order) => (
                <Grid item xs={12} sm={6} lg={4} key={order.orderId}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              #{order.orderId}
                            </Typography>
                            {user.role === 'WAITER' && order.staffId === currentEmployeeId && (
                              <Chip
                                label="Your Order"
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={order.status}
                          size="small"
                          color={getStatusColor(order.status)}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      {order.staff && (
                        <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                            Attended by: {order.staff.fullName || order.staff.user?.fullName || 'Staff Member'}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ backgroundColor: 'primary.main', mr: 2, width: 40, height: 40 }}>
                          {order.customer?.fullName?.[0] || order.guestName?.[0] || 'G'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.customer?.fullName || order.guestName || 'Walk-in Customer'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.type} {order.tableNumber ? `• Table ${order.tableNumber}` : ''}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Order Items ({order.items?.length || 0})
                        </Typography>
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                            {item.quantity}x {item.menuItem?.name || 'Item'}
                          </Typography>
                        ))}
                        {order.items?.length > 2 && (
                          <Typography variant="caption" color="primary">
                            +{order.items.length - 2} more items
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        {order.status === 'PENDING' && user?.role === 'WAITER' && !order.staffId && (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => handleAttendOrder(order)}
                            sx={{
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #663399 100%)',
                              },
                            }}
                          >
                            Attend Order
                          </Button>
                        )}
                        {getAvailableStatuses(order.status, user?.role).length > 0 && canUpdateOrder(order) && (
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(getAvailableStatuses(order.status, user?.role)[0]);
                              setUpdateDialogOpen(true);
                            }}
                            sx={{ borderRadius: 2 }}
                          >
                            Update Status
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  No orders found in this category
                </Alert>
              </Grid>
            )}
          </Grid>

          {totalCount > 0 && (
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[6, 12, 24]}
              sx={{ mt: 2 }}
            />
          )}
        </>
      )}

      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Order #{selectedOrder?.orderId} - Current Status: {selectedOrder?.status}
            </Typography>
            <TextField
              fullWidth
              select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              {getAvailableStatuses(selectedOrder?.status || '', user?.role).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setUpdateDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WaiterOrders;
