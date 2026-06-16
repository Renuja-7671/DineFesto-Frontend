import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Refresh, Save, WarningAmber as LowStockIcon } from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const makeRow = () => ({ inventoryId: '', quantityUsed: '' });

function RecipeManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [recipeRows, setRecipeRows] = useState([makeRow()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${getToken()}`,
    }),
    [],
  );

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        const [menuRes, inventoryRes] = await Promise.all([
          axios.get(`${API_URL}/menu`, { headers: authHeaders }),
          axios.get(`${API_URL}/inventory`, { headers: authHeaders }),
        ]);

        const menuData = menuRes.data?.data || [];
        setMenuItems(menuData);
        setInventoryItems(inventoryRes.data?.data || []);

        if (menuData.length > 0) {
          setSelectedMenuItemId(String(menuData[0].id));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load menu and inventory data');
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [authHeaders]);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!selectedMenuItemId) {
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`${API_URL}/inventory/recipes/${selectedMenuItemId}`, {
          headers: authHeaders,
        });

        const recipe = response.data?.data?.recipe || [];
        if (recipe.length === 0) {
          setRecipeRows([makeRow()]);
          return;
        }

        setRecipeRows(
          recipe.map((row) => ({
            inventoryId: String(row.inventoryId),
            quantityUsed: String(row.quantityUsed),
          })),
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load ingredients');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [selectedMenuItemId, authHeaders]);

  const handleRecipeRowChange = (index, key, value) => {
    setRecipeRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );
  };

  const handleAddRow = () => {
    setRecipeRows((prev) => [...prev, makeRow()]);
  };

  const handleRemoveRow = (index) => {
    setRecipeRows((prev) => {
      const next = prev.filter((_, rowIndex) => rowIndex !== index);
      return next.length ? next : [makeRow()];
    });
  };

  const handleReset = () => {
    setRecipeRows([makeRow()]);
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    if (!selectedMenuItemId) {
      setError('Please choose a menu item');
      return;
    }

    const cleanRows = recipeRows
      .filter((row) => row.inventoryId && row.quantityUsed)
      .map((row) => ({
        inventoryId: parseInt(row.inventoryId, 10),
        quantityUsed: parseFloat(row.quantityUsed),
      }));

    if (cleanRows.length === 0) {
      setError('Add at least one ingredient row before saving');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await axios.put(
        `${API_URL}/inventory/recipes/${selectedMenuItemId}`,
        { recipeItems: cleanRows },
        { headers: authHeaders },
      );
      setSuccess('Ingredients saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save ingredients');
    } finally {
      setSaving(false);
    }
  };

  // Derived: list shown in ingredient dropdowns
  const visibleInventoryItems = useMemo(() => {
    if (!lowStockOnly) return inventoryItems;
    return inventoryItems.filter(
      (item) => parseFloat(item.quantity) <= parseFloat(item.reorderLevel),
    );
  }, [inventoryItems, lowStockOnly]);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Ingredients
          </Typography>
          <Typography color="text.secondary">
            Define ingredients per menu item for automatic stock deduction.
          </Typography>
        </Box>

        {/* Low-stock filter toggle */}
        <Tooltip
          title="When ON, the ingredient dropdown only shows items at or below their reorder level."
          arrow
          placement="left"
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              border: '1.5px solid',
              borderColor: lowStockOnly ? 'warning.main' : 'divider',
              bgcolor: lowStockOnly ? 'rgba(255,167,38,0.08)' : 'background.paper',
              transition: 'all 0.25s ease',
              cursor: 'pointer',
            }}
            onClick={() => setLowStockOnly((v) => !v)}
          >
            <LowStockIcon
              fontSize="small"
              sx={{ color: lowStockOnly ? 'warning.main' : 'text.disabled' }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: lowStockOnly ? 'warning.dark' : 'text.secondary',
                whiteSpace: 'nowrap',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Low-stock only
            </Typography>
            <Switch
              size="small"
              checked={lowStockOnly}
              onChange={(e) => { e.stopPropagation(); setLowStockOnly(e.target.checked); }}
              color="warning"
              sx={{ ml: -0.5 }}
            />
          </Box>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                select
                label="Menu Item"
                value={selectedMenuItemId}
                onChange={(event) => setSelectedMenuItemId(event.target.value)}
                disabled={loading || menuItems.length === 0}
              >
                {menuItems.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button startIcon={<Refresh />} onClick={handleReset} variant="outlined">
                  Reset
                </Button>
                <Button startIcon={<Save />} onClick={handleSave} variant="contained" disabled={saving || loading}>
                  Save Ingredients
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Ingredient</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quantity per Portion</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipeRows.map((row, index) => {
              const selectedInventory = inventoryItems.find(
                (inventoryItem) => String(inventoryItem.inventoryId) === row.inventoryId,
              );

              return (
                <TableRow key={`recipe-row-${index}`}>
                  <TableCell>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      value={row.inventoryId}
                      onChange={(event) =>
                        handleRecipeRowChange(index, 'inventoryId', event.target.value)
                      }
                      placeholder="Choose inventory item"
                      SelectProps={{ displayEmpty: true }}
                      helperText={
                        lowStockOnly && visibleInventoryItems.length === 0
                          ? 'No low-stock items found'
                          : undefined
                      }
                    >
                      {visibleInventoryItems.length === 0 && (
                        <MenuItem value="" disabled>
                          <em>
                            {lowStockOnly
                              ? 'No low-stock items — restock needed'
                              : 'No inventory items'}
                          </em>
                        </MenuItem>
                      )}
                      {visibleInventoryItems.map((inventoryItem) => {
                        const isLow =
                          parseFloat(inventoryItem.quantity) <=
                          parseFloat(inventoryItem.reorderLevel);
                        return (
                          <MenuItem
                            key={inventoryItem.inventoryId}
                            value={String(inventoryItem.inventoryId)}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                width: '100%',
                              }}
                            >
                              <span style={{ flex: 1 }}>{inventoryItem.itemName}</span>
                              {isLow && (
                                <Chip
                                  label={`${inventoryItem.quantity} ${inventoryItem.unit}`}
                                  size="small"
                                  color="warning"
                                  icon={<LowStockIcon style={{ fontSize: 12 }} />}
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: 20,
                                    fontWeight: 700,
                                    '& .MuiChip-label': { px: 0.75 },
                                  }}
                                />
                              )}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={row.quantityUsed}
                      inputProps={{ min: '0', step: '0.001' }}
                      onChange={(event) =>
                        handleRecipeRowChange(index, 'quantityUsed', event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>{selectedInventory?.unit || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleRemoveRow(index)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button startIcon={<Add />} onClick={handleAddRow}>
            Add Ingredient
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default RecipeManagement;
