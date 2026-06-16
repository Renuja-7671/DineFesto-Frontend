import { useState, useEffect, useCallback } from 'react';
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
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  TrendingDown,
  AttachMoney,
  Category as CategoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  NoMeals as NoMealsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function InventoryManagement() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAdjustDialog, setOpenAdjustDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    totalValue: 0,
  });
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: 'kg',
    reorderLevel: '',
    costPerUnit: '',
  });
  const [adjustmentData, setAdjustmentData] = useState({
    adjustment: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const units = ['kg', 'g', 'liters', 'ml', 'units', 'pieces', 'boxes', 'bottles'];

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  }, []);

  const isLowStock = useCallback((item) => {
    return parseFloat(item.quantity) <= parseFloat(item.reorderLevel);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventoryItems();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(timer);
  }, [page, rowsPerPage, searchQuery, filterLowStock]);

  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (filterLowStock) {
        params.lowStock = 'true';
      }

      const response = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        params,
      });

      setInventoryItems(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/inventory/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleOpenDialog = useCallback((item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        reorderLevel: item.reorderLevel,
        costPerUnit: item.costPerUnit,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        itemName: '',
        quantity: '',
        unit: 'kg',
        reorderLevel: '',
        costPerUnit: '',
      });
    }
    setOpenDialog(true);
    setError('');
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedItem(null);
    setError('');
  }, []);

  const handleOpenAdjustDialog = useCallback((item) => {
    setSelectedItem(item);
    setAdjustmentData({ adjustment: '', reason: '' });
    setOpenAdjustDialog(true);
    setError('');
  }, []);

  const handleCloseAdjustDialog = useCallback(() => {
    setOpenAdjustDialog(false);
    setSelectedItem(null);
    setError('');
  }, []);

  const handleOpenDeleteDialog = useCallback((item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedItem) {
        // Update existing item
        await axios.put(`${API_URL}/inventory/${selectedItem.inventoryId}`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setSuccess('Inventory item updated successfully');
      } else {
        // Create new item
        await axios.post(`${API_URL}/inventory`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setSuccess('Inventory item created successfully');
      }
      handleCloseDialog();
      fetchInventoryItems();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save inventory item');
    }
  };

  const handleAdjustQuantity = async () => {
    try {
      await axios.put(
        `${API_URL}/inventory/${selectedItem.inventoryId}/adjust`,
        { adjustment: parseFloat(adjustmentData.adjustment), reason: adjustmentData.reason },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setSuccess('Inventory quantity adjusted successfully');
      handleCloseAdjustDialog();
      fetchInventoryItems();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust inventory');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/inventory/${selectedItem.inventoryId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSuccess('Inventory item deleted successfully');
      handleCloseDeleteDialog();
      fetchInventoryItems();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete inventory item');
      handleCloseDeleteDialog();
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Add Item
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
        <Grid item xs={12} md={4}>
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
                  <InventoryIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalItems}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
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
                  <WarningIcon sx={{ fontSize: 32, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {stats.lowStockCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
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
                  <AttachMoney sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stats.totalValue)}
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
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
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
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant={filterLowStock ? 'contained' : 'outlined'}
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setFilterLowStock(!filterLowStock);
                    setPage(0);
                  }}
                  color={filterLowStock ? 'error' : 'primary'}
                >
                  Low Stock Only
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Low Stock Notification Level</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cost/Unit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Menu Items</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : inventoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                inventoryItems.map((item) => (
                  <TableRow key={item.inventoryId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.itemName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isLowStock(item) ? 'error.main' : 'text.primary',
                        }}
                      >
                        {parseFloat(item.quantity).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{parseFloat(item.reorderLevel).toFixed(2)}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(item.costPerUnit))}</TableCell>
                    <TableCell>
                      {formatCurrency(parseFloat(item.quantity) * parseFloat(item.costPerUnit))}
                    </TableCell>
                    <TableCell>
                      {parseFloat(item.quantity) <= 0 ? (
                        <Chip
                          label="Out of Stock"
                          color="error"
                          size="small"
                          icon={<WarningIcon />}
                        />
                      ) : isLowStock(item) ? (
                        <Chip
                          label="Low Stock"
                          color="warning"
                          size="small"
                          icon={<WarningIcon />}
                        />
                      ) : (
                        <Chip label="In Stock" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {(item.menuItemsUsingCount ?? 0) > 0 ? (
                        <Tooltip
                          title={
                            parseFloat(item.quantity) <= 0
                              ? `${item.menuItemsUsingCount} menu item(s) are now unavailable`
                              : `Used in ${item.menuItemsUsingCount} menu item recipe(s)`
                          }
                        >
                          <Chip
                            label={`${item.menuItemsUsingCount} item(s)`}
                            size="small"
                            color={parseFloat(item.quantity) <= 0 ? 'error' : 'default'}
                            icon={parseFloat(item.quantity) <= 0 ? <NoMealsIcon /> : undefined}
                            variant={parseFloat(item.quantity) <= 0 ? 'filled' : 'outlined'}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Adjust Quantity">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenAdjustDialog(item)}
                            color="info"
                          >
                            <CategoryIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(item)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(item)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
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
                label="Item Name"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              >
                {units.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Low Stock Notification Level"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                required
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Per Unit"
                type="number"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
                }}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Quantity Dialog */}
      <Dialog open={openAdjustDialog} onClose={handleCloseAdjustDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Inventory - {selectedItem?.itemName}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current Quantity: {selectedItem?.quantity} {selectedItem?.unit}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adjustment Amount"
                  type="number"
                  value={adjustmentData.adjustment}
                  onChange={(e) =>
                    setAdjustmentData({ ...adjustmentData, adjustment: e.target.value })
                  }
                  required
                  helperText="Use positive numbers to add stock, negative to remove"
                  inputProps={{ step: '0.01' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason (optional)"
                  multiline
                  rows={2}
                  value={adjustmentData.reason}
                  onChange={(e) =>
                    setAdjustmentData({ ...adjustmentData, reason: e.target.value })
                  }
                  placeholder="e.g., New stock delivery, Wastage, Stock correction"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdjustDialog}>Cancel</Button>
          <Button onClick={handleAdjustQuantity} variant="contained" color="primary">
            Adjust
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedItem?.itemName}</strong>? This action
            cannot be undone.
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

export default InventoryManagement;
