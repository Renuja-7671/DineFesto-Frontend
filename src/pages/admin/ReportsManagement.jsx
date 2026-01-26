import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  MenuItem,
  TextField,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Restaurant as RestaurantIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
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

function ReportsManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState(0);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    todayReservations: 0,
    lowStockItems: 0,
    totalMenuItems: 0,
    pendingOrders: 0,
    totalEmployees: 0,
  });

  // Revenue data
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueByDate: [],
    revenueByType: {},
  });

  // Sales data
  const [salesData, setSalesData] = useState({
    topSellingItems: [],
    salesByCategory: [],
  });

  // Customer insights
  const [customerData, setCustomerData] = useState({
    newCustomers: 0,
    totalActiveCustomers: 0,
    repeatCustomers: 0,
    retentionRate: 0,
    topCustomers: [],
  });

  // Inventory data
  const [inventoryData, setInventoryData] = useState({
    totalItems: 0,
    lowStockCount: 0,
    totalInventoryValue: 0,
    lowStockItems: [],
  });

  // Employee performance
  const [employeeData, setEmployeeData] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    employeePerformance: [],
  });

  // Order trends
  const [orderTrends, setOrderTrends] = useState({
    ordersByStatus: [],
    ordersByType: [],
    ordersByDate: [],
    peakHours: [],
  });

  useEffect(() => {
    fetchAllReports();
  }, [period]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRevenueReport(),
        fetchSalesReport(),
        fetchCustomerInsights(),
        fetchInventoryReport(),
        fetchEmployeePerformance(),
        fetchOrderTrends(),
      ]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reports');
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/dashboard`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDashboardStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/revenue?period=${period}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setRevenueData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch revenue report:', err);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/sales?period=${period}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSalesData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch sales report:', err);
    }
  };

  const fetchCustomerInsights = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/customers?period=${period}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCustomerData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch customer insights:', err);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/inventory`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setInventoryData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch inventory report:', err);
    }
  };

  const fetchEmployeePerformance = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/employees?period=${period}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setEmployeeData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch employee performance:', err);
    }
  };

  const fetchOrderTrends = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/orders?period=${period}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setOrderTrends(response.data.data);
    } catch (err) {
      console.error('Failed to fetch order trends:', err);
    }
  };

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  // Prepare chart data with useMemo
  const revenueByTypeData = useMemo(() => 
    Object.entries(revenueData.revenueByType || {}).map(
      ([type, amount]) => ({
        name: type.replace('_', ' '),
        value: amount,
      })
    ), [revenueData.revenueByType]
  );

  const salesByCategoryData = useMemo(() => 
    salesData.salesByCategory.map((cat) => ({
      name: cat.category,
      revenue: cat.revenue,
      orders: cat.orderCount,
    })), [salesData.salesByCategory]
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Reports & Analytics
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Reports & Analytics
        </Typography>
        <TextField
          select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="day">Last 24 Hours</MenuItem>
          <MenuItem value="week">Last Week</MenuItem>
          <MenuItem value="month">Last Month</MenuItem>
          <MenuItem value="year">Last Year</MenuItem>
        </TextField>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                  }}
                >
                  <MoneyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Today's Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(dashboardStats.todayRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'success.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                  }}
                >
                  <CartIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Today's Orders
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {dashboardStats.todayOrders}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'info.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 32, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {dashboardStats.totalCustomers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'warning.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {dashboardStats.lowStockItems}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Revenue" icon={<MoneyIcon />} iconPosition="start" />
          <Tab label="Sales" icon={<CartIcon />} iconPosition="start" />
          <Tab label="Customers" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Inventory" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="Employees" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Order Trends" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {/* Revenue Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {formatCurrency(revenueData.totalRevenue)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {revenueData.totalOrders}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Order Value
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(revenueData.averageOrderValue)}
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
                  Revenue Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData.revenueByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Sales Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Selling Items
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Quantity Sold</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesData.topSellingItems.map((item) => (
                        <TableRow key={item.menuItemId}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Chip label={item.category} size="small" color="primary" />
                          </TableCell>
                          <TableCell align="right">{item.totalQuantitySold}</TableCell>
                          <TableCell align="right">{item.orderCount}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.revenue)}
                          </TableCell>
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
                  Sales by Category
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue (LKR)" />
                    <Bar yAxisId="right" dataKey="orders" fill="#10B981" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Customers Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  New Customers
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {customerData.newCustomers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Active Customers
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {customerData.totalActiveCustomers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Repeat Customers
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {customerData.repeatCustomers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Retention Rate
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {customerData.retentionRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Customers
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Total Spent</TableCell>
                        <TableCell align="right">Loyalty Points</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerData.topCustomers.map((customer) => (
                        <TableRow key={customer.customerId}>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell align="right">{customer.orderCount}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(customer.totalSpent)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={customer.loyaltyPoints}
                              size="small"
                              color="success"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Inventory Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {inventoryData.totalItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Low Stock Items
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }} color="error">
                  {inventoryData.lowStockCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Inventory Value
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }} color="success.main">
                  {formatCurrency(inventoryData.totalInventoryValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Low Stock Items (Requires Attention)
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell align="right">Current Stock</TableCell>
                        <TableCell align="right">Reorder Level</TableCell>
                        <TableCell>Stock Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryData.lowStockItems.map((item) => (
                        <TableRow key={item.inventoryId}>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.reorderLevel}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(item.stockPercentage)}
                                color={
                                  parseFloat(item.stockPercentage) < 50 ? 'error' : 'warning'
                                }
                                sx={{ width: 100, height: 8, borderRadius: 1 }}
                              />
                              <Typography variant="body2">
                                {item.stockPercentage}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Employees Tab */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Employees
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {employeeData.totalEmployees}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Active Employees (Period)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {employeeData.activeEmployees}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Employee Performance
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee Name</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell align="right">Orders Processed</TableCell>
                        <TableCell align="right">Total Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employeeData.employeePerformance.map((employee) => (
                        <TableRow key={employee.employeeId}>
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
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Order Trends Tab */}
      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Orders by Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderTrends.ordersByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {orderTrends.ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <BarChart data={orderTrends.ordersByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Trends Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={orderTrends.ordersByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Peak Hours Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderTrends.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(hour) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`} />
                    <Legend />
                    <Bar dataKey="count" fill="#F59E0B" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default ReportsManagement;
