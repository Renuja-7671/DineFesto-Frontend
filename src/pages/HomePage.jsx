import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardMedia,
  CardActions,
  Stack,
  Paper,
  Avatar,
  Rating,
  Chip,
} from '@mui/material';
import {
  Restaurant,
  TakeoutDining,
  EventSeat,
  Stars,
  Schedule,
  LocalOffer,
  ArrowForward,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

function HomePage() {
  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40 }} />,
      title: 'Browse Menu',
      description: 'Explore our delicious menu with detailed descriptions and beautiful photos',
      color: '#FF6B35',
    },
    {
      icon: <TakeoutDining sx={{ fontSize: 40 }} />,
      title: 'Quick Takeaway',
      description: 'Order ahead and pick up your food fresh and ready to go',
      color: '#4ECDC4',
    },
    {
      icon: <EventSeat sx={{ fontSize: 40 }} />,
      title: 'Reserve Tables',
      description: 'Book your table in advance and enjoy a seamless dining experience',
      color: '#FFE66D',
    },
    {
      icon: <Stars sx={{ fontSize: 40 }} />,
      title: 'Loyalty Rewards',
      description: 'Earn points with every order and get exclusive discounts',
      color: '#95E1D3',
    },
  ];

  const popularDishes = [
    {
      name: 'Grilled Salmon',
      price: 'LKR 2,499',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500',
      rating: 4.8,
      category: 'Main Course',
    },
    {
      name: 'Caesar Salad',
      price: 'LKR 899',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
      rating: 4.6,
      category: 'Appetizer',
    },
    {
      name: 'Chocolate Cake',
      price: 'LKR 799',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      rating: 4.9,
      category: 'Dessert',
    },
    {
      name: 'Fresh Orange Juice',
      price: 'LKR 499',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
      rating: 4.7,
      category: 'Beverage',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      avatar: 'S',
      rating: 5,
      comment: 'Absolutely amazing food! The takeaway was quick and everything was fresh and hot. Highly recommend!',
    },
    {
      name: 'Michael Chen',
      avatar: 'M',
      rating: 5,
      comment: 'Best restaurant management system ever! Easy to order, track my food, and the loyalty program is great.',
    },
    {
      name: 'Emily Rodriguez',
      avatar: 'E',
      rating: 4,
      comment: 'Love the reservation feature. No more waiting in long queues. The food quality is consistently excellent!',
    },
  ];

  return (
    <Box>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 10 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  color: 'white',
                  mb: 2,
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Delicious Food, Delivered Fresh
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 4,
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                Experience the finest culinary delights from the comfort of your home. 
                Order now and enjoy restaurant-quality meals delivered to your door.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Order Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  View Menu
                </Button>
              </Stack>
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    1000+
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Happy Customers
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    50+
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Menu Items
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    4.8
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Average Rating
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 2, color: 'secondary.main' }}
          >
            Why Choose Us
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 6, color: 'text.secondary', fontWeight: 300 }}
          >
            Experience the best dining service with our amazing features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: 4,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: `${feature.color}20`,
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Popular Dishes Section */}
      <Box sx={{ py: 10, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 2, color: 'secondary.main' }}
          >
            Popular Dishes
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 6, color: 'text.secondary', fontWeight: 300 }}
          >
            Discover our most loved menu items
          </Typography>
          <Grid container spacing={4}>
            {popularDishes.map((dish, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={dish.image}
                    alt={dish.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip 
                      label={dish.category} 
                      size="small" 
                      sx={{ mb: 1, backgroundColor: 'primary.light', color: 'white' }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {dish.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Rating value={dish.rating} precision={0.1} size="small" readOnly />
                      <Typography variant="body2" color="text.secondary">
                        ({dish.rating})
                      </Typography>
                    </Stack>
                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                      {dish.price}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      sx={{ 
                        backgroundColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      Order Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Special Offer Banner */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <LocalOffer sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Special Offer Today!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
            Get 20% OFF on your first order. Use code: WELCOME20
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
            }}
          >
            Claim Offer
          </Button>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 2, color: 'secondary.main' }}
          >
            What Our Customers Say
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 6, color: 'text.secondary', fontWeight: 300 }}
          >
            Real reviews from real customers
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ backgroundColor: 'primary.main', width: 56, height: 56 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Rating value={testimonial.rating} size="small" readOnly />
                    </Box>
                  </Stack>
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "{testimonial.comment}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          backgroundColor: 'secondary.main',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, fontFamily: 'Playfair Display' }}>
                RMS
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Your favorite restaurant management system. Order food, reserve tables, and enjoy the best dining experience.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <Typography sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Menu
                </Typography>
                <Typography sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Reservations
                </Typography>
                <Typography sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  About Us
                </Typography>
                <Typography sx={{ opacity: 0.8, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                  Contact
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Contact Info
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Schedule />
                  <Typography sx={{ opacity: 0.8 }}>
                    Mon-Sun: 9:00 AM - 11:00 PM
                  </Typography>
                </Stack>
                <Typography sx={{ opacity: 0.8 }}>
                  📧 info@restaurant.com
                </Typography>
                <Typography sx={{ opacity: 0.8 }}>
                  📱 +1 (234) 567-8900
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <Typography sx={{ opacity: 0.8 }}>
              © 2026 Restaurant Management System. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
