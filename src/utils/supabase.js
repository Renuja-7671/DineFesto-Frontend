import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Image upload will be disabled.');
  console.warn('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

// Create Supabase client (will be null if credentials missing)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage bucket name for menu images
export const MENU_IMAGES_BUCKET = 'menu_images';

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<{url: string, path: string} | null>} - The public URL and storage path or null if error
 */
export const uploadMenuImage = async (file, folder = '') => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.error('Supabase is not configured. Please check your environment variables.');
      return null;
    }

    // Generate unique filename with timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error in uploadMenuImage:', error);
    return null;
  }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - The storage path of the file to delete
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const deleteMenuImage = async (filePath) => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.warn('Supabase is not configured. Image deletion skipped.');
      return false;
    }

    // Extract the path from the URL if a full URL is provided
    let path = filePath;
    if (filePath.includes(MENU_IMAGES_BUCKET)) {
      const urlParts = filePath.split(`${MENU_IMAGES_BUCKET}/`);
      path = urlParts[urlParts.length - 1];
    }

    const { error } = await supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMenuImage:', error);
    return false;
  }
};

/**
 * Get public URL for an image in storage
 * @param {string} filePath - The storage path of the file
 * @returns {string} - The public URL
 */
export const getMenuImageUrl = (filePath) => {
  if (!filePath) return '';
  
  // If already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Check if Supabase is configured
  if (!supabase) {
    return '';
  }

  const { data: { publicUrl } } = supabase.storage
    .from(MENU_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * List all images in the bucket
 * @param {string} folder - Optional folder path to list
 * @returns {Promise<Array>} - Array of file objects
 */
export const listMenuImages = async (folder = '') => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.warn('Supabase is not configured. Cannot list images.');
      return [];
    }

    const { data, error } = await supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing images:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in listMenuImages:', error);
    return [];
  }
};
