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
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Inventory2 as ItemsIcon,
  TrendingUp as TrendingUpIcon,
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
  summary: { totalRevenue: 0, totalQuantity: 0, totalOrders: 0, averageOrderValue: 0 },
  topSellingItems: [],
  salesByCategory: [],
};

function SalesReportSection() {
  const now = new Date();
  const [salesView, setSalesView] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [yearsBack, setYearsBack] = useState(5);
  const [salesData, setSalesData] = useState(EMPTY_DATA);
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
    const params = { view: salesView };
    if (salesView === 'daily') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (salesView === 'monthly') {
      params.year = selectedYear;
    } else {
      params.yearsBack = yearsBack;
    }
    return params;
  }, [salesView, selectedYear, selectedMonth, yearsBack]);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/reports/sales`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSalesData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales data');
      setSalesData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const chartData = useMemo(
    () =>
      (salesData.breakdown || []).map((row) => ({
        label: row.label,
        revenue: row.revenue,
        quantity: row.quantity,
        orders: row.orders,
      })),
    [salesData.breakdown]
  );

  const categoryChartData = useMemo(
    () =>
      (salesData.salesByCategory || []).map((cat) => ({
        name: cat.category,
        revenue: cat.revenue,
        quantity: cat.totalQuantity,
        orders: cat.orderCount,
      })),
    [salesData.salesByCategory]
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_URL}/reports/sales/export`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-report-${salesView}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const viewDescription = {
    daily: 'Sales per day for the selected month',
    monthly: 'Sales per month for the selected year',
    yearly: 'Sales per year across the selected range',
  };

  const breakdownLabel =
    salesView === 'daily' ? 'Date' : salesView === 'monthly' ? 'Month' : 'Year';

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
            Sales Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {viewDescription[salesView]} · {salesData.periodLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={salesView}
            exclusive
            onChange={(_, val) => val && setSalesView(val)}
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
            {salesView === 'daily' && (
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
            {salesView === 'monthly' && (
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
            {salesView === 'yearly' && (
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
          {
            label: 'Total Sales Revenue',
            value: formatCurrency(salesData.summary?.totalRevenue),
            icon: MoneyIcon,
            color: 'primary',
          },
          {
            label: 'Items Sold',
            value: salesData.summary?.totalQuantity ?? 0,
            icon: ItemsIcon,
            color: 'success',
          },
          {
            label: 'Total Orders',
            value: salesData.summary?.totalOrders ?? 0,
            icon: CartIcon,
            color: 'info',
          },
          {
            label: 'Avg. Order Value',
            value: formatCurrency(salesData.summary?.averageOrderValue),
            icon: TrendingUpIcon,
            color: 'warning',
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
                {salesView === 'daily'
                  ? 'Daily Sales'
                  : salesView === 'monthly'
                  ? 'Monthly Sales'
                  : 'Yearly Sales'}
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: salesView === 'daily' ? 10 : 12 }}
                    interval={salesView === 'daily' ? 2 : 0}
                  />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Revenue (LKR)' ? formatCurrency(value) : value
                    }
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#3B82F6"
                    name="Revenue (LKR)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="quantity"
                    fill="#10B981"
                    name="Items Sold"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales by Category
              </Typography>
              {categoryChartData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No category sales for this period
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.revenue)}`}
                      outerRadius={90}
                      dataKey="revenue"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
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
                Top Selling Items
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(salesData.topSellingItems || []).map((item) => (
                      <TableRow key={item.menuItemId} hover>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{item.totalQuantitySold}</TableCell>
                        <TableCell align="right">{formatCurrency(item.revenue)}</TableCell>
                      </TableRow>
                    ))}
                    {(salesData.topSellingItems || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No sales data for this period
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
                Sales Breakdown
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{breakdownLabel}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(salesData.breakdown || []).map((row) => (
                      <TableRow key={row.date || row.label} hover>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{row.orders}</TableCell>
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
              <Typography variant="h6" gutterBottom>
                Category Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) =>
                    name === 'Revenue (LKR)' ? formatCurrency(value) : value
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue (LKR)" />
                  <Bar yAxisId="right" dataKey="orders" fill="#10B981" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SalesReportSection;
