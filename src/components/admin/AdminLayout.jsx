import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  MenuBook as RecipeIcon,
  EventNote as ReservationsIcon,
  RateReview as ReviewsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AdminPanelSettings,
  BeachAccess as LeaveIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { getUser, clearAuth } from '../../utils/auth';
import logo from '../../assets/logo.png';
import NotificationBell from '../ui/NotificationBell';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Employees', icon: <PeopleIcon />, path: '/admin/employees' },
  { text: 'Leave Requests', icon: <LeaveIcon />, path: '/admin/leave-requests' },
  { text: 'Menu', icon: <RestaurantIcon />, path: '/admin/menu' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/admin/orders' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/admin/inventory' },
  { text: 'Ingredients', icon: <RecipeIcon />, path: '/admin/recipes' },
  { text: 'Reservations', icon: <ReservationsIcon />, path: '/admin/reservations' },
  { text: 'Reviews', icon: <ReviewsIcon />, path: '/admin/reviews' },
  { text: 'Reports', icon: <ReportsIcon />, path: '/admin/reports' },
];

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'transparent',
          color: 'black',
        }}
      >
        <img src={logo} alt="DineFesto Logo" className="w-16 h-auto" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Hi 👋
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, mb: 2, borderColor: 'rgba(0,0,0,0.06)' }} />

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.secondary',
                  boxShadow: isActive ? '0 4px 12px rgba(25, 118, 210, 0.25)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'rgba(25, 118, 210, 0.08)',
                    transform: 'translateX(4px)',
                    boxShadow: isActive 
                      ? '0 6px 16px rgba(25, 118, 210, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'white' : 'text.secondary', 
                  minWidth: 42,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 2, my: 1.5, borderColor: 'rgba(0,0,0,0.06)' }} />

      {/* Settings & Logout */}
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            onClick={() => handleMenuClick('/admin/settings')} 
            sx={{ 
              borderRadius: 3,
              py: 1.5,
              px: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 42, color: 'text.secondary' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: '0.95rem',
                color: 'text.secondary',
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout} 
            sx={{ 
              borderRadius: 3,
              py: 1.5,
              px: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 42, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: '0.95rem',
                color: 'error.main',
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
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
              display: { sm: 'none' },
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
              {menuItems.find((item) => item.path === location.pathname)?.text || 'Admin Portal'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' } }}>
              Welcome back! Here's what's happening today.
            </Typography>
          </Box>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<AdminPanelSettings />}
              label="Admin"
              color="primary"
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
                {user?.email?.[0].toUpperCase() || 'A'}
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
                label="Administrator" 
                size="small" 
                color="primary" 
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
              onClick={() => { handleProfileMenuClose(); navigate('/admin/profile'); }}
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
            <MenuItem 
              onClick={() => { handleProfileMenuClose(); navigate('/admin/settings'); }}
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
              Settings
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
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
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
            display: { xs: 'none', sm: 'block' },
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 9, sm: 10 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;
