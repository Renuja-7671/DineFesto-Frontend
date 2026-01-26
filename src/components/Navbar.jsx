import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  useScrollTrigger,
  Slide,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useNavigate } from 'react-router-dom';

const pages = ['Home', 'Menu', 'Reservations', 'About', 'Contact'];

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavClick = (page) => {
    if (page === 'Home') {
      navigate('/');
    } else {
      navigate(`/${page.toLowerCase()}`);
    }
    handleCloseNavMenu();
  };

  return (
    <HideOnScroll>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo - Desktop */}
            <RestaurantIcon 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                mr: 1,
                color: 'primary.main',
                fontSize: '2rem',
              }} 
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'Playfair Display',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'secondary.main',
                textDecoration: 'none',
                letterSpacing: '.1rem',
              }}
            >
              RMS
            </Typography>

            {/* Mobile Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                sx={{ color: 'secondary.main' }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={() => handleNavClick(page)}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Logo - Mobile */}
            <RestaurantIcon 
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                mr: 1,
                color: 'primary.main',
              }} 
            />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'Playfair Display',
                fontWeight: 700,
                color: 'secondary.main',
                textDecoration: 'none',
                letterSpacing: '.1rem',
              }}
            >
              RMS
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => handleNavClick(page)}
                  sx={{ 
                    my: 2, 
                    mx: 1,
                    color: 'secondary.main', 
                    display: 'block',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                    },
                  }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            {/* Auth Buttons */}
            <Box sx={{ flexGrow: 0, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ 
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(255, 107, 53, 0.04)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/signup')}
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
}

export default Navbar;
