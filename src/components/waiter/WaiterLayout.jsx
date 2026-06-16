import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Person as ProfileIcon,
  EventAvailable as AttendanceIcon,
  CalendarMonth as ScheduleIcon,
  BeachAccess as LeaveIcon,
  Logout as LogoutIcon,
  WorkOutline,
} from '@mui/icons-material';
import logo from '../../assets/logo.png';
import NotificationBell from '../ui/NotificationBell';

const drawerWidth = 260;

function WaiterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Role-based menu items
  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/waiter/dashboard' },
      { text: 'Orders', icon: <OrdersIcon />, path: '/waiter/orders' },
      { text: 'Profile', icon: <ProfileIcon />, path: '/waiter/profile' },
      { text: 'Attendance', icon: <AttendanceIcon />, path: '/waiter/attendance' },
    ];

    // Add schedule and leave for all staff
    const additionalItems = [
      { text: 'Schedule', icon: <ScheduleIcon />, path: '/waiter/schedule' },
      { text: 'Leave Requests', icon: <LeaveIcon />, path: '/waiter/leave' },
    ];

    return [...baseItems, ...additionalItems];
  };

  const menuItems = getMenuItems();

  const getRoleBadge = (role) => {
    const roleConfig = {
      MANAGER: { label: 'Manager', color: 'primary' },
      WAITER: { label: 'Waiter', color: 'success' },
      CHEF: { label: 'Chef', color: 'warning' },
    };
    return roleConfig[role] || { label: role, color: 'default' };
  };

  const roleBadge = getRoleBadge(user.role);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
      {/* Logo Section */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <img src={logo} alt="DineFesto Logo" style={{ height: 85, width: 'auto' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
          Waiter Portal
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 3,
                  px: 2,
                  py: 1.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  boxShadow: isActive ? '0 4px 12px rgba(25, 118, 210, 0.25)' : 'none',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'primary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            px: 2,
            py: 1.5,
            color: 'error.main',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ fontWeight: 600 }} 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              {menuItems.find((item) => item.path === location.pathname)?.text || 'Employee Portal'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              Welcome back! Ready to make today great.
            </Typography>
          </Box>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={roleBadge.label}
              color={roleBadge.color}
              size="small"
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
              }}
            />
            <NotificationBell />
            <IconButton 
              onClick={handleProfileMenuOpen}
              sx={{
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'rgba(25, 118, 210, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: 'primary.main',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                {user?.email?.[0].toUpperCase() || 'E'}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 3,
                mt: 1.5,
                minWidth: 220,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <Box sx={{ px: 3, py: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {user?.email}
              </Typography>
              <Chip 
                label={roleBadge.label} 
                size="small" 
                color={roleBadge.color}
                sx={{ 
                  mt: 1,
                  borderRadius: 1.5,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }} 
              />
            </Box>
            <Divider />
            <MenuItem 
              onClick={() => { handleProfileMenuClose(); navigate('/employee/profile'); }}
              sx={{ 
                mx: 1, 
                my: 0.5,
                borderRadius: 2,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              Profile
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                mx: 1, 
                mb: 1,
                borderRadius: 2,
                color: 'error.main',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '2px 0 12px rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 9, sm: 10 },
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default WaiterLayout;
