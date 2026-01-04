import { AuthService } from '../services/AuthService.js';
import validator from 'validator';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          name: name ? undefined : 'Name is required',
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required'
        }
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { email: 'Invalid email format' }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: { password: 'Password must be at least 8 characters' }
      });
    }

    const authService = new AuthService();
    const result = await authService.register({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: {
          email: email ? undefined : 'Email is required',
          password: password ? undefined : 'Password is required'
        }
      });
    }

    const authService = new AuthService();
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials'
    });
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toArray()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const token = authHeader.substring(7);
    const authService = new AuthService();
    const newToken = await authService.refreshToken(token);

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid token'
    });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'avatar', 'timezone'];
    const updateData = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    }

    const authService = new AuthService();
    const updatedUser = await authService.updateProfile(req.user.id, updateData);

    res.json({
      success: true,
      data: {
        user: updatedUser.toArray()
      }
    });
  } catch (error) {
    next(error);
  }
};





