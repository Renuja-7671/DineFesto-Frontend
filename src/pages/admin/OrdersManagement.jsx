import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  Search,
  FilterList,
  Refresh,
  Add,
  Delete,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { DialogLoadingSpinner, TableLoadingSkeleton } from '../../components/admin/TableLoadingState';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
  }).format(amount);
};

const statusColors = {
  PENDING: 'warning',
  PREPARING: 'primary',
  READY: 'success',
  SERVED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const typeColors = {
  DINE_IN: 'primary',
  TAKEAWAY: 'secondary',
};

function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New Order Dialog States
  const [openNewOrderDialog, setOpenNewOrderDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingOrderFormData, setLoadingOrderFormData] = useState(false);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    customerId: '',
    type: 'DINE_IN',
    tableNumber: '',
    items: [],
    guestName: '',
    guestPhone: '',
  });
  const [newOrderErrors, setNewOrderErrors] = useState({});
  const [currentItem, setCurrentItem] = useState({
    menuItemId: '',
    quantity: 1,
    customization: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timer);
  }, [page, rowsPerPage, statusFilter, searchQuery]);

  const fetchCustomers = async () => {
    try {
      const token = getToken();
      const customersResponse = await axios.get(`${API_URL}/auth/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(customersResponse.data.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const availableItems = (response.data.data || []).filter((item) => item.isAvailable);
      setMenuItems(availableItems);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
  };

  const loadNewOrderFormData = async () => {
    setLoadingOrderFormData(true);
    try {
      await Promise.all([fetchCustomers(), fetchMenuItems()]);
    } finally {
      setLoadingOrderFormData(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getToken();
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

      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setOrders(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(response.data.data);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const token = getToken();
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Order status updated successfully!');
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        await handleViewOrder(orderId);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewOrderDialog = () => {
    setIsWalkIn(false);
    setNewOrderData({
      customerId: '',
      type: 'DINE_IN',
      tableNumber: '',
      items: [],
      guestName: '',
      guestPhone: '',
    });
    setCurrentItem({
      menuItemId: '',
      quantity: 1,
      customization: '',
    });
    setNewOrderErrors({});
    setOpenNewOrderDialog(true);
    loadNewOrderFormData();
  };

  const handleAddItemToOrder = () => {
    const errors = {};
    
    if (!currentItem.menuItemId) {
      errors.menuItemId = 'Please select a menu item';
    }
    
    if (currentItem.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1';
    }

    if (Object.keys(errors).length > 0) {
      setNewOrderErrors(errors);
      return;
    }

    const menuItem = menuItems.find(item => item.id === currentItem.menuItemId);
    
    setNewOrderData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          ...currentItem,
          name: menuItem.name,
          price: menuItem.price,
        },
      ],
    }));

    setCurrentItem({
      menuItemId: '',
      quantity: 1,
      customization: '',
    });
    setNewOrderErrors({});
  };

  const handleRemoveItemFromOrder = (index) => {
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateOrderTotal = () => {
    return newOrderData.items.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const handleCreateOrder = async () => {
    const errors = {};

    // Validate customer or guest info
    if (!isWalkIn && !newOrderData.customerId) {
      errors.customerId = 'Please select a customer';
    }

    if (isWalkIn) {
      if (!newOrderData.guestName || newOrderData.guestName.trim() === '') {
        errors.guestName = 'Guest name is required';
      }
      // Phone is optional for walk-in customers
    }

    if (!newOrderData.type) {
      errors.type = 'Please select order type';
    }

    if (newOrderData.type === 'DINE_IN' && !newOrderData.tableNumber) {
      errors.tableNumber = 'Table number is required for dine-in orders';
    }

    if (newOrderData.items.length === 0) {
      errors.items = 'Please add at least one item to the order';
    }

    if (Object.keys(errors).length > 0) {
      setNewOrderErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      
      // Format items for backend
      const formattedItems = newOrderData.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        customization: item.customization || null,
      }));

      // Find selected customer to check if they need a customer profile
      const selectedCustomer = customers.find(
        c => c.customerId === newOrderData.customerId || c.id === newOrderData.customerId
      );

      const orderPayload = {
        customerId: isWalkIn ? null : (selectedCustomer?.customerId || null),
        userId: (!isWalkIn && selectedCustomer?.needsCustomerProfile) ? selectedCustomer.userId : null,
        type: newOrderData.type,
        tableNumber: newOrderData.tableNumber ? parseInt(newOrderData.tableNumber) : null,
        items: formattedItems,
        guestName: isWalkIn ? newOrderData.guestName : null,
        guestPhone: isWalkIn ? newOrderData.guestPhone : null,
      };

      await axios.post(`${API_URL}/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Order created successfully!');
      setOpenNewOrderDialog(false);
      await fetchOrders();
      // Refetch customers in case a new customer profile was created for staff
      await fetchCustomers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to create order');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Orders Management
          </Typography>
          <Typography color="text.secondary">
            View and manage all restaurant orders
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenNewOrderDialog}
            disabled={loading}
          >
            New Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrders}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by order ID, customer name, or email..."
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
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Status Filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PREPARING">Preparing</MenuItem>
              <MenuItem value="READY">Ready</MenuItem>
              <MenuItem value="SERVED">Served</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableLoadingSkeleton columns={8} rows={rowsPerPage} />
              ) : (
                orders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            #{order.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.customer?.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.customer?.email || 'N/A'}
                          </Typography>
                          {order.customer?.isGuest && (
                            <Chip
                              label="Walk-in"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ ml: 1, height: '18px', fontSize: '0.65rem' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.type || 'DINE_IN'}
                            size="small"
                            color={typeColors[order.type] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order._count?.orderItems || 0} items
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(parseFloat(order.totalAmount || 0))}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status || 'PENDING'}
                            size="small"
                            color={statusColors[order.status] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Visibility />
                          </IconButton>
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
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Order Details #{selectedOrder?.id}</Typography>
            <Chip
              label={selectedOrder?.status || 'PENDING'}
              color={statusColors[selectedOrder?.status] || 'default'}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Customer Info */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Customer Information
              </Typography>
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.customer?.fullName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.customer?.email || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.customer?.phoneNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Type
                    </Typography>
                    <Chip
                      label={selectedOrder.type || 'DINE_IN'}
                      size="small"
                      color={typeColors[selectedOrder.type] || 'default'}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Order Items */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Order Items
              </Typography>
              <List sx={{ mb: 3 }}>
                {selectedOrder.orderItems?.map((item, index) => (
                  <Box key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                              {item.menuItem?.name || 'N/A'} x {item.quantity}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(parseFloat(item.unitPrice || item.price || 0) * item.quantity)}
                            </Typography>
                          </Box>
                        }
                        secondary={item.specialInstructions || item.customization}
                      />
                    </ListItem>
                    {index < selectedOrder.orderItems.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>

              {/* Order Total */}
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total Amount</Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  {formatCurrency(parseFloat(selectedOrder.totalAmount || 0))}
                </Typography>
              </Box>

              {/* Update Status */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Update Order Status
              </Typography>
              <Grid container spacing={1}>
                {['PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'].map(
                  (status) => (
                    <Grid item key={status}>
                      <Button
                        variant={selectedOrder.status === status ? 'contained' : 'outlined'}
                        size="small"
                        color={statusColors[status] || 'primary'}
                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                        disabled={loading || selectedOrder.status === status}
                      >
                        {status}
                      </Button>
                    </Grid>
                  )
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* New Order Dialog */}
      <Dialog open={openNewOrderDialog} onClose={() => setOpenNewOrderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Create New Order</Typography>
        </DialogTitle>
        <DialogContent>
          {loadingOrderFormData ? (
            <DialogLoadingSpinner />
          ) : (
          <Box sx={{ mt: 2 }}>
            {/* Walk-in Customer Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={isWalkIn}
                  onChange={(e) => {
                    setIsWalkIn(e.target.checked);
                    setNewOrderErrors({});
                  }}
                  color="primary"
                />
              }
              label="Walk-in Customer (No Registration)"
              sx={{ mb: 3 }}
            />

            {/* Customer Selection or Guest Info */}
            {!isWalkIn ? (
              <FormControl fullWidth sx={{ mb: 3 }} error={!!newOrderErrors.customerId}>
                <InputLabel>Select Customer *</InputLabel>
                <Select
                  value={newOrderData.customerId || ''}
                  onChange={(e) => {
                    setNewOrderData({ ...newOrderData, customerId: e.target.value });
                  }}
                  label="Select Customer *"
                >
                  {customers.length === 0 ? (
                    <MenuItem value="" disabled>
                      No customers available
                    </MenuItem>
                  ) : (
                    customers.map((customer) => {
                      const valueToUse = customer.needsCustomerProfile ? customer.id : customer.customerId;
                      const displayName = customer.isStaff 
                        ? `${customer.fullName} [${customer.role}]`
                        : customer.fullName;
                      
                      return (
                        <MenuItem key={customer.id || customer.customerId} value={valueToUse}>
                          {displayName} - {customer.email}
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
                {newOrderErrors.customerId && (
                  <FormHelperText>{newOrderErrors.customerId}</FormHelperText>
                )}
              </FormControl>
            ) : (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guest Name *"
                    value={newOrderData.guestName}
                    onChange={(e) => setNewOrderData({ ...newOrderData, guestName: e.target.value })}
                    error={!!newOrderErrors.guestName}
                    helperText={newOrderErrors.guestName || 'Enter customer name'}
                    placeholder="e.g., John Doe"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Guest Phone (Optional)"
                    value={newOrderData.guestPhone}
                    onChange={(e) => setNewOrderData({ ...newOrderData, guestPhone: e.target.value })}
                    placeholder="e.g., +94771234567"
                  />
                </Grid>
              </Grid>
            )}

            {/* Order Type and Table Number */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!newOrderErrors.type}>
                  <InputLabel>Order Type *</InputLabel>
                  <Select
                    value={newOrderData.type}
                    onChange={(e) => setNewOrderData({ ...newOrderData, type: e.target.value })}
                    label="Order Type *"
                  >
                    <MenuItem value="DINE_IN">Dine In</MenuItem>
                    <MenuItem value="TAKEAWAY">Takeaway</MenuItem>
                  </Select>
                  {newOrderErrors.type && (
                    <FormHelperText>{newOrderErrors.type}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Table Number"
                  value={newOrderData.tableNumber}
                  onChange={(e) => setNewOrderData({ ...newOrderData, tableNumber: e.target.value })}
                  error={!!newOrderErrors.tableNumber}
                  helperText={newOrderErrors.tableNumber || (newOrderData.type === 'DINE_IN' ? 'Required for dine-in' : 'Optional')}
                  disabled={newOrderData.type !== 'DINE_IN'}
                />
              </Grid>
            </Grid>

            {/* Add Items Section */}
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Add Items to Order
            </Typography>

            <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth error={!!newOrderErrors.menuItemId}>
                    <InputLabel>Menu Item *</InputLabel>
                    <Select
                      value={currentItem.menuItemId}
                      onChange={(e) => setCurrentItem({ ...currentItem, menuItemId: e.target.value })}
                      label="Menu Item *"
                    >
                      {menuItems.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name} - {formatCurrency(parseFloat(item.price))}
                        </MenuItem>
                      ))}
                    </Select>
                    {newOrderErrors.menuItemId && (
                      <FormHelperText>{newOrderErrors.menuItemId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity *"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                    error={!!newOrderErrors.quantity}
                    helperText={newOrderErrors.quantity}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    value={currentItem.customization}
                    onChange={(e) => setCurrentItem({ ...currentItem, customization: e.target.value })}
                    placeholder="Extra spicy, etc."
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddItemToOrder}
                    sx={{ height: '56px' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Card>

            {/* Order Items List */}
            {newOrderErrors.items && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {newOrderErrors.items}
              </Alert>
            )}

            {newOrderData.items.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Order Items ({newOrderData.items.length})
                </Typography>
                <List sx={{ mb: 3 }}>
                  {newOrderData.items.map((item, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {item.name} x {item.quantity}
                            </Typography>
                            {item.customization && (
                              <Typography variant="body2" color="text.secondary">
                                Note: {item.customization}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(parseFloat(item.price) * item.quantity)}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItemFromOrder(index)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </List>

                {/* Order Total */}
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                    {formatCurrency(calculateOrderTotal())}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenNewOrderDialog(false)} disabled={loading || loadingOrderFormData}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateOrder}
            disabled={loading || loadingOrderFormData || newOrderData.items.length === 0}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrdersManagement;
