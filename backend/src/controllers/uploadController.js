import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { db } from '../core/database.js';
import { env } from '../core/helpers.js';
import { authMiddleware } from '../middleware/auth.js';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Initialize Supabase client if configured
let supabase = null;
const supabaseUrl = env('SUPABASE_URL');
const supabaseKey = env('SUPABASE_KEY');

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase not configured. File uploads will not work.');
}

// Multer middleware
export const uploadAvatarMiddleware = upload.single('avatar');
export const uploadLogoMiddleware = upload.single('logo');

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'File upload service not configured. Set SUPABASE_URL and SUPABASE_KEY environment variables.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    try {
      // Generate unique filename
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `avatars/${req.user.id}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Update user avatar in database
      await db.execute(
        'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [avatarUrl, req.user.id]
      );

      res.json({
        success: true,
        data: {
          avatar: avatarUrl
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file: ' + error.message
      });
    }
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'File upload service not configured. Set SUPABASE_URL and SUPABASE_KEY environment variables.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    try {
      // Generate unique filename
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `logos/${req.user.id}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      const logoUrl = urlData.publicUrl;

      res.json({
        success: true,
        data: {
          logo: logoUrl
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file: ' + error.message
      });
    }
  } catch (error) {
    next(error);
  }
};

