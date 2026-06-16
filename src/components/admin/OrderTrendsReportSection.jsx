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
  ShoppingCart as CartIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
const STATUS_COLORS = {
  PENDING: '#F59E0B',
  PREPARING: '#3B82F6',
  READY: '#8B5CF6',
  SERVED: '#10B981',
  COMPLETED: '#059669',
  CANCELLED: '#EF4444',
};

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
  ordersByStatus: [],
  ordersByType: [],
  peakHours: [],
  summary: {
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    completionRate: 0,
    cancellationRate: 0,
    avgOrdersPerPeriod: 0,
    peakHour: 0,
    peakHourOrders: 0,
    busiestPeriod: '-',
    busiestPeriodOrders: 0,
  },
};

function OrderTrendsReportSection() {
  const now = new Date();
  const [trendsView, setTrendsView] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [yearsBack, setYearsBack] = useState(5);
  const [trendsData, setTrendsData] = useState(EMPTY_DATA);
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
    const params = { view: trendsView };
    if (trendsView === 'daily') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (trendsView === 'monthly') {
      params.year = selectedYear;
    } else {
      params.yearsBack = yearsBack;
    }
    return params;
  }, [trendsView, selectedYear, selectedMonth, yearsBack]);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/reports/orders`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTrendsData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order trends');
      setTrendsData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const chartData = useMemo(
    () =>
      (trendsData.breakdown || []).map((row) => ({
        label: row.label,
        orders: row.orders,
        completed: row.completed,
        cancelled: row.cancelled,
        revenue: row.revenue,
      })),
    [trendsData.breakdown]
  );

  const statusChartData = useMemo(
    () =>
      (trendsData.ordersByStatus || []).map((row) => ({
        name: row.status,
        value: row.count,
      })),
    [trendsData.ordersByStatus]
  );

  const typeChartData = useMemo(
    () =>
      (trendsData.ordersByType || []).map((row) => ({
        name: row.label,
        count: row.count,
        revenue: row.revenue,
      })),
    [trendsData.ordersByType]
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_URL}/reports/orders/export`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-trends-report-${trendsView}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const viewDescription = {
    daily: 'Order volume per day for the selected month',
    monthly: 'Order volume per month for the selected year',
    yearly: 'Order volume per year across the selected range',
  };

  const breakdownLabel =
    trendsView === 'daily' ? 'Date' : trendsView === 'monthly' ? 'Month' : 'Year';

  const summary = trendsData.summary || EMPTY_DATA.summary;

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
            Order Trends Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {viewDescription[trendsView]} · {trendsData.periodLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={trendsView}
            exclusive
            onChange={(_, val) => val && setTrendsView(val)}
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
            {trendsView === 'daily' && (
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
            {trendsView === 'monthly' && (
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
            {trendsView === 'yearly' && (
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
            label: 'Total Orders',
            value: summary.totalOrders,
            icon: CartIcon,
            color: 'primary',
          },
          {
            label: 'Completed',
            value: `${summary.completedOrders} (${summary.completionRate}%)`,
            icon: CheckIcon,
            color: 'success',
          },
          {
            label: 'Cancelled',
            value: `${summary.cancelledOrders} (${summary.cancellationRate}%)`,
            icon: CancelIcon,
            color: 'error',
          },
          {
            label: 'Peak Hour',
            value: `${summary.peakHour}:00 (${summary.peakHourOrders} orders)`,
            icon: ScheduleIcon,
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
                {trendsView === 'daily'
                  ? 'Daily Order Volume'
                  : trendsView === 'monthly'
                  ? 'Monthly Order Volume'
                  : 'Yearly Order Volume'}
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: trendsView === 'daily' ? 10 : 12 }}
                    interval={trendsView === 'daily' ? 2 : 0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="orders"
                    fill="#3B82F6"
                    name="Total Orders"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#10B981"
                    name="Completed"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="cancelled"
                    fill="#EF4444"
                    name="Cancelled"
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
                Orders by Status
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || COLORS[0]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orders by Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Peak Hours Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendsData.peakHours || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                    interval={1}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={(hour) => `${hour}:00 – ${hour + 1}:00`} />
                  <Legend />
                  <Bar dataKey="count" fill="#F59E0B" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: trendsView === 'daily' ? 10 : 12 }}
                    interval={trendsView === 'daily' ? 2 : 0}
                  />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trend Breakdown
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{breakdownLabel}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Completed</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Cancelled</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(trendsData.breakdown || []).map((row) => (
                      <TableRow key={row.date || row.label} hover>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">{row.orders}</TableCell>
                        <TableCell align="right">{row.completed}</TableCell>
                        <TableCell align="right">{row.cancelled}</TableCell>
                        <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                      </TableRow>
                    ))}
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
                Order Type Breakdown
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(trendsData.ordersByType || []).map((row) => (
                      <TableRow key={row.type} hover>
                        <TableCell>
                          <Chip label={row.label} size="small" color="info" />
                        </TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell align="right">
                          {summary.totalOrders > 0
                            ? `${((row.count / summary.totalOrders) * 100).toFixed(1)}%`
                            : '0%'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(trendsData.ordersByType || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No orders for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default OrderTrendsReportSection;
