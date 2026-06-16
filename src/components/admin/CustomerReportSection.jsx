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
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Repeat as RepeatIcon,
  TrendingUp as TrendingUpIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
    newCustomers: 0,
    activeCustomers: 0,
    repeatCustomers: 0,
    retentionRate: 0,
    totalOrders: 0,
  },
  topCustomers: [],
};

function CustomerReportSection() {
  const now = new Date();
  const [customerView, setCustomerView] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [yearsBack, setYearsBack] = useState(5);
  const [customerData, setCustomerData] = useState(EMPTY_DATA);
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
    const params = { view: customerView };
    if (customerView === 'daily') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (customerView === 'monthly') {
      params.year = selectedYear;
    } else {
      params.yearsBack = yearsBack;
    }
    return params;
  }, [customerView, selectedYear, selectedMonth, yearsBack]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/reports/customers`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCustomerData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer data');
      setCustomerData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const chartData = useMemo(
    () =>
      (customerData.breakdown || []).map((row) => ({
        label: row.label,
        newCustomers: row.newCustomers,
        activeCustomers: row.activeCustomers,
        orders: row.orders,
      })),
    [customerData.breakdown]
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_URL}/reports/customers/export`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `customer-report-${customerView}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const viewDescription = {
    daily: 'Customer activity per day for the selected month',
    monthly: 'Customer activity per month for the selected year',
    yearly: 'Customer activity per year across the selected range',
  };

  const breakdownLabel =
    customerView === 'daily' ? 'Date' : customerView === 'monthly' ? 'Month' : 'Year';

  const summary = customerData.summary || EMPTY_DATA.summary;

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
            Customer Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {viewDescription[customerView]} · {customerData.periodLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={customerView}
            exclusive
            onChange={(_, val) => val && setCustomerView(val)}
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
            {customerView === 'daily' && (
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
            {customerView === 'monthly' && (
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
            {customerView === 'yearly' && (
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
            label: 'New Customers',
            value: summary.newCustomers,
            icon: PersonAddIcon,
            color: 'primary',
          },
          {
            label: 'Active Customers',
            value: summary.activeCustomers,
            icon: PeopleIcon,
            color: 'success',
          },
          {
            label: 'Repeat Customers',
            value: summary.repeatCustomers,
            icon: RepeatIcon,
            color: 'info',
          },
          {
            label: 'Retention Rate',
            value: `${summary.retentionRate}%`,
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
                {customerView === 'daily'
                  ? 'Daily Customer Activity'
                  : customerView === 'monthly'
                  ? 'Monthly Customer Activity'
                  : 'Yearly Customer Activity'}
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: customerView === 'daily' ? 10 : 12 }}
                    interval={customerView === 'daily' ? 2 : 0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="newCustomers"
                    fill="#3B82F6"
                    name="New Customers"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="activeCustomers"
                    fill="#10B981"
                    name="Active Customers"
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
                Orders Trend
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: customerView === 'daily' ? 9 : 11 }}
                    interval={customerView === 'daily' ? 3 : 0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Orders"
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
                Top Customers
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Spent</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(customerData.topCustomers || []).map((customer) => (
                      <TableRow key={customer.customerId} hover>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell align="right">{customer.orderCount}</TableCell>
                        <TableCell align="right">{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell align="right">
                          <Chip label={customer.loyaltyPoints} size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {(customerData.topCustomers || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No customer activity for this period
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
                Activity Breakdown
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{breakdownLabel}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>New</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Active</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(customerData.breakdown || []).map((row) => (
                      <TableRow key={row.date || row.label} hover>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">{row.newCustomers}</TableCell>
                        <TableCell align="right">{row.activeCustomers}</TableCell>
                        <TableCell align="right">{row.orders}</TableCell>
                      </TableRow>
                    ))}
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

export default CustomerReportSection;
