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
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
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
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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
  summary: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
  revenueByType: { DINE_IN: 0, TAKEAWAY: 0 },
};

function RevenueReportSection() {
  const now = new Date();
  const [revenueView, setRevenueView] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [yearsBack, setYearsBack] = useState(5);
  const [revenueData, setRevenueData] = useState(EMPTY_DATA);
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
    const params = { view: revenueView };
    if (revenueView === 'daily') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (revenueView === 'monthly') {
      params.year = selectedYear;
    } else {
      params.yearsBack = yearsBack;
    }
    return params;
  }, [revenueView, selectedYear, selectedMonth, yearsBack]);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/reports/revenue`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setRevenueData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revenue data');
      setRevenueData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  const revenueByTypeData = useMemo(
    () =>
      Object.entries(revenueData.revenueByType || {}).map(([type, amount]) => ({
        name: type.replace('_', ' '),
        value: amount,
      })),
    [revenueData.revenueByType]
  );

  const chartData = useMemo(
    () =>
      (revenueData.breakdown || []).map((row) => ({
        label: row.label,
        revenue: row.revenue,
        orders: row.orders,
      })),
    [revenueData.breakdown]
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_URL}/reports/revenue/export`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-report-${revenueView}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const viewDescription = {
    daily: 'Revenue per day for the selected month',
    monthly: 'Revenue per month for the selected year',
    yearly: 'Revenue per year across the selected range',
  };

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
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {viewDescription[revenueView]} · {revenueData.periodLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={revenueView}
            exclusive
            onChange={(_, val) => val && setRevenueView(val)}
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
            {revenueView === 'daily' && (
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
            {revenueView === 'monthly' && (
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
            {revenueView === 'yearly' && (
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ bgcolor: 'primary.light', borderRadius: 2, p: 1.5 }}>
                  <MoneyIcon sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatCurrency(revenueData.summary?.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ bgcolor: 'success.light', borderRadius: 2, p: 1.5 }}>
                  <CartIcon sx={{ color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {revenueData.summary?.totalOrders ?? 0}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ bgcolor: 'warning.light', borderRadius: 2, p: 1.5 }}>
                  <TrendingUpIcon sx={{ color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Order Value
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(revenueData.summary?.averageOrderValue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {revenueView === 'daily'
                  ? 'Daily Revenue'
                  : revenueView === 'monthly'
                  ? 'Monthly Revenue'
                  : 'Yearly Revenue'}
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: revenueView === 'daily' ? 10 : 12 }}
                    interval={revenueView === 'daily' ? 2 : 0}
                  />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Revenue (LKR)' ? formatCurrency(value) : value
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue (LKR)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="#10B981" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Order Type
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={revenueByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {revenueByTypeData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Breakdown
              </Typography>
              <TableContainer sx={{ maxHeight: 280 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {revenueView === 'daily'
                          ? 'Date'
                          : revenueView === 'monthly'
                          ? 'Month'
                          : 'Year'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Revenue
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Orders
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(revenueData.breakdown || []).map((row) => (
                      <TableRow key={row.date || row.label} hover>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell align="right">{row.orders}</TableCell>
                      </TableRow>
                    ))}
                    {(revenueData.breakdown || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No revenue data for this period
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

export default RevenueReportSection;
