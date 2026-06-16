import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  Paper,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Restaurant,
  Category,
  AttachMoney,
  CloudUpload,
  DeleteForever,
} from '@mui/icons-material';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { DialogLoadingSpinner, GridLoadingSkeleton } from '../../components/admin/TableLoadingState';
import { uploadMenuImage, deleteMenuImage, getMenuImageUrl } from '../../utils/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    spicyLevel: 0,
    preparationTime: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [oldImagePath, setOldImagePath] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data.data || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/menu/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  const loadFormCategories = async () => {
    setLoadingFormData(true);
    try {
      await fetchCategories();
    } finally {
      setLoadingFormData(false);
    }
  };

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  }, []);

  const handleOpenDialog = useCallback((item = null) => {
    if (item) {
      setEditMode(true);
      setFormData({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        categoryId: item.categoryId || '',
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable !== false,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        spicyLevel: item.spicyLevel || 0,
        preparationTime: item.preparationTime || '',
      });
      setImagePreview(item.imageUrl || '');
      setOldImagePath(item.imageUrl || '');
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        spicyLevel: 0,
        preparationTime: '',
      });
      setImagePreview('');
      setOldImagePath('');
    }
    setSelectedImage(null);
    setOpenDialog(true);
    setError('');
    setFormErrors({});
    loadFormCategories();
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setFormErrors({});
    setSelectedImage(null);
    setImagePreview('');
    setOldImagePath('');
  }, []);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field if it exists
    setFormErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return menuItems;
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  // Group menu items by category
  const groupedMenuItems = useMemo(() => {
    const grouped = filteredMenuItems.reduce((acc, item) => {
      const categoryName = item.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {});
    
    // Sort categories alphabetically, but put "Uncategorized" last
    return Object.keys(grouped)
      .sort((a, b) => {
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
      })
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});
  }, [filteredMenuItems]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setUploading(true);
    setError('');

    try {
      const token = getToken();
      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (selectedImage) {
        const uploadResult = await uploadMenuImage(selectedImage);
        if (uploadResult) {
          imageUrl = uploadResult.url;

          if (editMode && oldImagePath && oldImagePath.includes('supabase')) {
            await deleteMenuImage(oldImagePath);
          }
        } else {
          setError('Failed to upload image. Please try again.');
          setUploading(false);
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        imageUrl: imageUrl,
        isAvailable: formData.isAvailable,
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        spicyLevel: parseInt(formData.spicyLevel),
        preparationTime: parseInt(formData.preparationTime) || null,
      };

      if (editMode) {
        await axios.put(`${API_URL}/menu/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Menu item updated successfully!');
      } else {
        await axios.post(`${API_URL}/menu`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Menu item created successfully!');
      }

      await fetchMenuItems();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error saving menu item:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      
      // Find the item to get its image URL
      const itemToDelete = menuItems.find(item => item.id === id);
      
      // Delete from database
      await axios.delete(`${API_URL}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Delete image from storage if it exists and is from Supabase
      if (itemToDelete?.imageUrl && itemToDelete.imageUrl.includes('supabase')) {
        await deleteMenuImage(itemToDelete.imageUrl);
      }
      
      setSuccess('Menu item deleted successfully!');
      await fetchMenuItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting menu item:', err);
      setError('Failed to delete menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Menu Management
          </Typography>
          <Typography color="text.secondary">
            Manage your restaurant menu items and categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          Add Item
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
          placeholder="Search menu items..."
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

      {/* Menu Items Grid */}
      {loading ? (
        <GridLoadingSkeleton items={6} />
      ) : (
        <Box>
          {Object.entries(groupedMenuItems).map(([categoryName, items]) => (
            <Box key={categoryName} sx={{ mb: 5 }}>
              {/* Category Header */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {categoryName}
                </Typography>
                <Chip 
                  label={`${items.length} item${items.length !== 1 ? 's' : ''}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>

              {/* Category Items Grid */}
              <Grid container spacing={3}>
                {items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        image={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={item.name}
                        sx={{ 
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover'
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Chip
                            label={item.isAvailable ? 'Available' : 'Unavailable'}
                            size="small"
                            color={item.isAvailable ? 'success' : 'default'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {item.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          {item.isVegetarian && <Chip label="Vegetarian" size="small" color="success" />}
                          {item.isVegan && <Chip label="Vegan" size="small" color="success" />}
                          {item.spicyLevel > 0 && (
                            <Chip label={`🌶️ ${item.spicyLevel}`} size="small" color="error" />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                            {formatCurrency(parseFloat(item.price))}
                          </Typography>
                          <Box>
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(item)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          {/* Empty State */}
          {Object.keys(groupedMenuItems).length === 0 && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 8, 
                textAlign: 'center', 
                borderRadius: 3, 
                border: '2px dashed', 
                borderColor: 'divider' 
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No menu items found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try adjusting your search' : 'Add your first menu item to get started'}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loadingFormData ? (
            <DialogLoadingSpinner />
          ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Restaurant />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      LKR
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                error={!!formErrors.categoryId}
                helperText={formErrors.categoryId}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  border: '2px dashed', 
                  borderColor: 'divider',
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Menu Item Image
                </Typography>
                
                {/* Image Preview */}
                {imagePreview && (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }} 
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'white',
                        '&:hover': { backgroundColor: '#ffebee' }
                      }}
                    >
                      <DeleteForever />
                    </IconButton>
                  </Box>
                )}

                {/* Upload Button */}
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageSelect}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                </label>
                
                <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                  Max file size: 5MB. Supported formats: JPG, PNG, GIF
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL (Optional - if not uploading)"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Spicy Level"
                name="spicyLevel"
                value={formData.spicyLevel}
                onChange={handleChange}
              >
                <MenuItem value={0}>Not Spicy</MenuItem>
                <MenuItem value={1}>🌶️ Mild</MenuItem>
                <MenuItem value={2}>🌶️🌶️ Medium</MenuItem>
                <MenuItem value={3}>🌶️🌶️🌶️ Hot</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preparation Time (minutes)"
                name="preparationTime"
                type="number"
                value={formData.preparationTime}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    name="isAvailable"
                    color="success"
                  />
                }
                label="Available"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isVegetarian}
                    onChange={handleChange}
                    name="isVegetarian"
                    color="success"
                  />
                }
                label="Vegetarian"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isVegan}
                    onChange={handleChange}
                    name="isVegan"
                    color="success"
                  />
                }
                label="Vegan"
              />
            </Grid>
          </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loadingFormData}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading || loadingFormData}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MenuManagement;
