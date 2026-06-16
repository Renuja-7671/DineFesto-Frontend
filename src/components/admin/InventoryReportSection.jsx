import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  SwapVert as SwapVertIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const EMPTY_DATA = {
  view: 'daily',
  periodLabel: '',
  breakdown: [],
  summary: {
    totalItems: 0,
    lowStockCount: 0,
    totalInventoryValue: 0,
    totalMovements: 0,
    totalConsumed: 0,
    totalRestocked: 0,
    netChange: 0,
    lowStockItems: [],
  },
  topConsumedItems: [],
  movementsByType: [],
};

const formatMovementType = (type) => type.replace(/_/g, ' ');

function InventoryReportSection() {
  const now = new Date();
  const [inventoryView, setInventoryView] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [yearsBack, setYearsBack] = useState(5);
  const [inventoryData, setInventoryData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const yearOptions = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 8 }, (_, i) => current - i);
  }, []);

  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0),
    []
  );

  const buildParams = useCallback(() => {
    const params = { view: inventoryView };
    if (inventoryView === 'daily') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (inventoryView === 'monthly') {
      params.year = selectedYear;
    } else {
      params.yearsBack = yearsBack;
    }
    return params;
  }, [inventoryView, selectedYear, selectedMonth, yearsBack]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/reports/inventory`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setInventoryData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory data');
      setInventoryData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const chartData = useMemo(
    () =>
      (inventoryData.breakdown || []).map((row) => ({
        label: row.label,
        consumed: row.consumed,
        restocked: row.restocked,
        movements: row.movements,
      })),
    [inventoryData.breakdown]
  );

  const movementTypeData = useMemo(
    () =>
      (inventoryData.movementsByType || []).map((row) => ({
        name: formatMovementType(row.type),
        value: row.count,
        quantity: row.totalQuantity,
      })),
    [inventoryData.movementsByType]
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_URL}/reports/inventory/export`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-report-${inventoryView}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const viewDescription = {
    daily: 'Inventory movements per day for the selected month',
    monthly: 'Inventory movements per month for the selected year',
    yearly: 'Inventory movements per year across the selected range',
  };

  const breakdownLabel =
    inventoryView === 'daily' ? 'Date' : inventoryView === 'monthly' ? 'Month' : 'Year';

  const summary = inventoryData.summary || EMPTY_DATA.summary;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Inventory Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {viewDescription[inventoryView]} · {inventoryData.periodLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={inventoryView}
            exclusive
            onChange={(_, val) => val && setInventoryView(val)}
            size="small"
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={exporting ? <CircularProgress size={16} /> : <PdfIcon />}
            onClick={handleExportPdf}
            disabled={exporting || loading}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {inventoryView === 'daily' && (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    size="small"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    size="small"
                  >
                    {yearOptions.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
            {inventoryView === 'monthly' && (
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  size="small"
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {inventoryView === 'yearly' && (
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Years to include"
                  value={yearsBack}
                  onChange={(e) => setYearsBack(Number(e.target.value))}
                  size="small"
                >
                  {[3, 5, 7, 10].map((n) => (
                    <MenuItem key={n} value={n}>
                      Last {n} years
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Items', value: summary.totalItems, icon: InventoryIcon, color: 'primary' },
          {
            label: 'Low Stock',
            value: summary.lowStockCount,
            icon: WarningIcon,
            color: 'error',
          },
          {
            label: 'Inventory Value',
            value: formatCurrency(summary.totalInventoryValue),
            icon: MoneyIcon,
            color: 'success',
          },
          {
            label: 'Period Movements',
            value: summary.totalMovements,
            icon: SwapVertIcon,
            color: 'info',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ bgcolor: `${color}.light`, borderRadius: 2, p: 1.5 }}>
                    <Icon sx={{ color: `${color}.main` }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Consumption vs Restocking
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: inventoryView === 'daily' ? 10 : 12 }}
                    interval={inventoryView === 'daily' ? 2 : 0}
                  />
                  <YAxis allowDecimals />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumed" fill="#EF4444" name="Consumed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="restocked" fill="#10B981" name="Restocked" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Movements by Type
              </Typography>
              {movementTypeData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No movements for this period
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={movementTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {movementTypeData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Consumed Items
              </Typography>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Consumed</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(inventoryData.topConsumedItems || []).map((item) => (
                      <TableRow key={item.inventoryId} hover>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">{item.consumed}</TableCell>
                      </TableRow>
                    ))}
                    {(inventoryData.topConsumedItems || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No consumption recorded for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Movement Breakdown
              </Typography>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{breakdownLabel}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Consumed</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Restocked</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Net</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(inventoryData.breakdown || []).map((row) => (
                      <TableRow key={row.date || row.label} hover>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">{row.consumed}</TableCell>
                        <TableCell align="right">{row.restocked}</TableCell>
                        <TableCell align="right">{row.netChange}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Low Stock Items (Requires Attention)
              </Typography>
              {(summary.lowStockItems || []).length === 0 ? (
                <Alert severity="success">All items are above reorder level</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Current</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Reorder Level</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(summary.lowStockItems || []).map((item) => (
                        <TableRow key={item.inventoryId} hover>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.reorderLevel}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(parseFloat(item.stockPercentage), 100)}
                                color={
                                  parseFloat(item.stockPercentage) < 50 ? 'error' : 'warning'
                                }
                                sx={{ width: 80, height: 8, borderRadius: 1 }}
                              />
                              <Chip
                                label={`${item.stockPercentage}%`}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default InventoryReportSection;
