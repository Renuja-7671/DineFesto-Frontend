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
  People as PeopleIcon,
  Badge as BadgeIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
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
    totalEmployees: 0,
    activeEmployeesInPeriod: 0,
    totalOrders: 0,
    totalRevenue: 0,
    peakActiveEmployees: 0,
    avgOrdersPerPeriod: 0,
  },
  topPerformers: [],
  performanceByRole: [],
  employeesByRole: [],
};

function EmployeeReportSection() {
  const now = new Date();
  const [employeeView, setEmployeeView] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [yearsBack, setYearsBack] = useState(5);
  const [employeeData, setEmployeeData] = useState(EMPTY_DATA);
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
    const params = { view: employeeView };
    if (employeeView === 'daily') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (employeeView === 'monthly') {
      params.year = selectedYear;
    } else {
      params.yearsBack = yearsBack;
    }
    return params;
  }, [employeeView, selectedYear, selectedMonth, yearsBack]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/reports/employees`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setEmployeeData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employee data');
      setEmployeeData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const chartData = useMemo(
    () =>
      (employeeData.breakdown || []).map((row) => ({
        label: row.label,
        orders: row.orders,
        activeEmployees: row.activeEmployees,
        revenue: row.revenue,
      })),
    [employeeData.breakdown]
  );

  const roleChartData = useMemo(
    () =>
      (employeeData.performanceByRole || []).map((row) => ({
        name: row.role,
        value: row.orders,
      })),
    [employeeData.performanceByRole]
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_URL}/reports/employees/export`, {
        params: buildParams(),
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `employee-report-${employeeView}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const viewDescription = {
    daily: 'Staff performance per day for the selected month',
    monthly: 'Staff performance per month for the selected year',
    yearly: 'Staff performance per year across the selected range',
  };

  const breakdownLabel =
    employeeView === 'daily' ? 'Date' : employeeView === 'monthly' ? 'Month' : 'Year';

  const summary = employeeData.summary || EMPTY_DATA.summary;

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
            Employee Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {viewDescription[employeeView]} · {employeeData.periodLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={employeeView}
            exclusive
            onChange={(_, val) => val && setEmployeeView(val)}
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
            {employeeView === 'daily' && (
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
            {employeeView === 'monthly' && (
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
            {employeeView === 'yearly' && (
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
            label: 'Total Staff',
            value: summary.totalEmployees,
            icon: PeopleIcon,
            color: 'primary',
          },
          {
            label: 'Active in Period',
            value: summary.activeEmployeesInPeriod,
            icon: BadgeIcon,
            color: 'success',
          },
          {
            label: 'Orders Handled',
            value: summary.totalOrders,
            icon: CartIcon,
            color: 'info',
          },
          {
            label: 'Revenue Generated',
            value: formatCurrency(summary.totalRevenue),
            icon: MoneyIcon,
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
                {employeeView === 'daily'
                  ? 'Daily Staff Activity'
                  : employeeView === 'monthly'
                  ? 'Monthly Staff Activity'
                  : 'Yearly Staff Activity'}
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: employeeView === 'daily' ? 10 : 12 }}
                    interval={employeeView === 'daily' ? 2 : 0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="orders"
                    fill="#3B82F6"
                    name="Orders Handled"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="activeEmployees"
                    fill="#10B981"
                    name="Active Staff"
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
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: employeeView === 'daily' ? 9 : 11 }}
                    interval={employeeView === 'daily' ? 3 : 0}
                  />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {roleChartData.length > 0 && (
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Orders by Role
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={roleChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {roleChartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={roleChartData.length > 0 ? 6 : 12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Performers
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(employeeData.topPerformers || []).map((employee) => (
                      <TableRow key={employee.employeeId} hover>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell>
                          <Chip label={employee.role} size="small" color="info" />
                        </TableCell>
                        <TableCell align="right">{employee.ordersProcessed}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(employee.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(employeeData.topPerformers || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No employee activity for this period
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
                Performance Breakdown
              </Typography>
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{breakdownLabel}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Active Staff</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(employeeData.breakdown || []).map((row) => (
                      <TableRow key={row.date || row.label} hover>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right">{row.orders}</TableCell>
                        <TableCell align="right">{row.activeEmployees}</TableCell>
                        <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {(employeeData.performanceByRole || []).length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance by Role
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Staff</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(employeeData.performanceByRole || []).map((row) => (
                        <TableRow key={row.role} hover>
                          <TableCell>
                            <Chip label={row.role} size="small" />
                          </TableCell>
                          <TableCell align="right">{row.employees}</TableCell>
                          <TableCell align="right">{row.orders}</TableCell>
                          <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default EmployeeReportSection;
