import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
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
  Avatar,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  Email,
  Phone,
  Lock,
  Badge,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const roleColors = {
  MANAGER: 'primary',
  WAITER: 'success',
  CHEF: 'warning',
};

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'WAITER',
    password: '',
    designation: '',
    salary: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter only employees (not customers or admin)
      const employeeData = response.data.data.filter(
        (emp) => emp.role !== 'CUSTOMER' && emp.role !== 'ADMIN'
      );
      setEmployees(employeeData);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditMode(true);
      setFormData({
        id: employee.id,
        fullName: employee.fullName || '',
        email: employee.email || '',
        phoneNumber: employee.phoneNumber || employee.contact || employee.employee?.contact || '',
        role: employee.role || 'WAITER',
        password: '',
        designation: employee.employee?.designation || '',
        salary: employee.employee?.salary || '',
      });
    } else {
      setEditMode(false);
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'WAITER',
        password: '',
        designation: '',
        salary: '',
      });
    }
    setOpenDialog(true);
    setError('');
    setFormErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'WAITER',
      password: '',
      designation: '',
      salary: '',
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName || formData.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Optional phone number validation
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^[0-9+\-() ]{7,20}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Invalid phone number format';
      }
    }

    if (!editMode && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.designation) {
      errors.designation = 'Designation is required';
    }

    if (!formData.salary || isNaN(formData.salary) || parseFloat(formData.salary) <= 0) {
      errors.salary = 'Valid salary is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      
      if (editMode) {
        // Update employee
        await axios.put(
          `${API_URL}/employees/${formData.id}`,
          {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            designation: formData.designation,
            salary: parseFloat(formData.salary),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Employee updated successfully!');
      } else {
        // Create new employee
        await axios.post(
          `${API_URL}/auth/employee`,
          {
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            role: formData.role,
            designation: formData.designation,
            salary: parseFloat(formData.salary),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Employee created successfully!');
      }

      await fetchEmployees();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Employee deleted successfully!');
      await fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => 
    employees.filter(
      (emp) =>
        emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [employees, searchQuery]
  );

  const paginatedEmployees = useMemo(() =>
    filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredEmployees, page, rowsPerPage]
  );

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Employee Management
          </Typography>
          <Typography color="text.secondary">
            Manage your restaurant staff and their roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          Add Employee
        </Button>
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

      {/* Search Bar */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Search employees by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Employee Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmployees.map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ backgroundColor: 'primary.main' }}>
                              {employee.fullName?.[0]?.toUpperCase() || 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {employee.fullName || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {employee.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.phoneNumber || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.role}
                            color={roleColors[employee.role] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.employee?.designation || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            LKR {employee.employee?.salary?.toLocaleString() || '0'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(employee)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEmployees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
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
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={editMode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber || 'Optional - e.g., +94771234567'}
                placeholder="+94771234567"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={editMode}
              >
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="WAITER">Waiter</MenuItem>
                <MenuItem value="CHEF">Chef</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                error={!!formErrors.designation}
                helperText={formErrors.designation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                error={!!formErrors.salary}
                helperText={formErrors.salary}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
                }}
              />
            </Grid>
            {!editMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmployeeManagement;
