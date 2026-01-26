import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  InputAdornment,
  Tooltip,
  Stack,
  Rating,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RateReview as ReviewIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    recentReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [formData, setFormData] = useState({
    customerId: '',
    menuItemId: '',
    rating: 5,
    comment: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchCustomers();
    fetchMenuItems();
    fetchStats();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchQuery, ratingFilter]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReviews(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reviews');
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users?role=CUSTOMER`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCustomers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/menu`);
      setMenuItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const filterReviews = () => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((review) => {
        const customerName = review.customer?.fullName?.toLowerCase() || '';
        const menuItemName = review.menuItem?.name?.toLowerCase() || '';
        const comment = review.comment?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        return (
          customerName.includes(query) ||
          menuItemName.includes(query) ||
          comment.includes(query)
        );
      });
    }

    // Rating filter
    if (ratingFilter !== 'ALL') {
      filtered = filtered.filter((review) => review.rating === parseInt(ratingFilter));
    }

    setFilteredReviews(filtered);
  };

  const handleOpenDialog = (review = null) => {
    if (review) {
      setSelectedReview(review);
      setFormData({
        customerId: review.customerId,
        menuItemId: review.menuItemId,
        rating: review.rating,
        comment: review.comment || '',
      });
    } else {
      setSelectedReview(null);
      setFormData({
        customerId: '',
        menuItemId: '',
        rating: 5,
        comment: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
    setError('');
  };

  const handleOpenDeleteDialog = (review) => {
    setSelectedReview(review);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedReview(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedReview) {
        // Update existing review
        await axios.put(
          `${API_URL}/reviews/${selectedReview.reviewId}`,
          {
            rating: formData.rating,
            comment: formData.comment,
          },
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );
        setSuccess('Review updated successfully');
      } else {
        // Create new review
        await axios.post(`${API_URL}/reviews`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setSuccess('Review created successfully');
      }
      handleCloseDialog();
      fetchReviews();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save review');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/reviews/${selectedReview.reviewId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSuccess('Review deleted successfully');
      handleCloseDeleteDialog();
      fetchReviews();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      handleCloseDeleteDialog();
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  const calculatePercentage = (count) => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Reviews Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          New Review
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'primary.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ReviewIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Reviews
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalReviews}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'warning.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.averageRating}
                    </Typography>
                    <Rating value={stats.averageRating} readOnly precision={0.1} size="small" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    backgroundColor: 'success.light',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Recent (7 days)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.recentReviews}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Rating Distribution
              </Typography>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>
                    {rating}★
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={calculatePercentage(stats.ratingDistribution[rating])}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'right' }}>
                    {stats.ratingDistribution[rating]}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by customer, menu item, or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Filter by Rating"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="ALL">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Menu Item</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Comment</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.reviewId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {review.customer?.fullName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.customer?.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RestaurantIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {review.menuItem?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Chip
                          label={review.rating}
                          color={getRatingColor(review.rating)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                        <CommentIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {review.comment || 'No comment'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(review.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(review)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDeleteDialog(review)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedReview ? 'Edit Review' : 'New Review'}</DialogTitle>
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
                select
                label="Customer"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
                disabled={selectedReview !== null}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.customerId} value={customer.customerId}>
                    {customer.fullName} ({customer.user?.email})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Menu Item"
                value={formData.menuItemId}
                onChange={(e) => setFormData({ ...formData, menuItemId: e.target.value })}
                required
                disabled={selectedReview !== null}
              >
                {menuItems.map((item) => (
                  <MenuItem key={item.itemId} value={item.itemId}>
                    {item.name} - ${item.price}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography component="legend" sx={{ mb: 1 }}>
                Rating
              </Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, rating: newValue });
                }}
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comment (Optional)"
                multiline
                rows={4}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your experience..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedReview ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReviewsManagement;
