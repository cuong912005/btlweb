import express from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import AuthService from '../services/AuthService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
      'any.required': 'Mật khẩu là bắt buộc'
    }),
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    'string.min': 'Tên không được để trống',
    'string.max': 'Tên không được quá 50 ký tự',
    'any.required': 'Tên là bắt buộc'
  }),
  lastName: Joi.string().trim().min(1).max(50).required().messages({
    'string.min': 'Họ không được để trống',
    'string.max': 'Họ không được quá 50 ký tự',
    'any.required': 'Họ là bắt buộc'
  }),
  phone: Joi.string().pattern(new RegExp('^(0|\\+84)(3|5|7|8|9)[0-9]{8}$')).optional().messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)'
  }),
  location: Joi.string().trim().max(255).optional().messages({
    'string.max': 'Địa chỉ không được quá 255 ký tự'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc'
  })
});

// Helper function for cookie settings
const parseJWTExpiration = (expiresIn) => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // Default 15 minutes
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
};

// CSRF Token endpoint
router.get('/csrf', (req, res) => {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  // Store CSRF token in session or cache (for now, just send it)
  res.json({ csrfToken });
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dữ liệu đầu vào không hợp lệ',
        details: error.details.map(detail => detail.message)
      });
    }

    // Use AuthService to register user
    const result = await AuthService.registerUser(value);

    // Get cookie maxAge from env variables
    const accessTokenMaxAge = parseJWTExpiration(process.env.JWT_EXPIRES_IN || '15m');
    const refreshTokenMaxAge = parseJWTExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    // Set cookies (both accessToken and token for compatibility)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Chào mừng bạn đến với VolunteerHub.',
      user: result.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        error: 'Email đã được sử dụng',
        message: 'Tài khoản với email này đã tồn tại. Vui lòng sử dụng email khác hoặc đăng nhập.'
      });
    }
    
    res.status(500).json({
      error: 'Lỗi máy chủ khi đăng ký',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dữ liệu đầu vào không hợp lệ',
        details: error.details.map(detail => detail.message)
      });
    }

    const { email, password } = value;

    // Use AuthService to login user
    const result = await AuthService.loginUser(email, password);

    // Get cookie maxAge from env variables
    const accessTokenMaxAge = parseJWTExpiration(process.env.JWT_EXPIRES_IN || '15m');
    const refreshTokenMaxAge = parseJWTExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    // Set cookies (both accessToken and token for compatibility)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge
    });

    res.json({
      message: 'Đăng nhập thành công',
      user: result.user
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        error: 'Email hoặc mật khẩu không đúng'
      });
    }

    if (error.message === 'ACCOUNT_LOCKED') {
      return res.status(403).json({
        error: 'Tài khoản đã bị khóa',
        message: 'Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ để được hỗ trợ.'
      });
    }
    
    res.status(500).json({
      error: 'Lỗi máy chủ khi đăng nhập'
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const userId = req.user?.id; // From authenticateToken middleware if available
    const refreshToken = req.cookies.refreshToken;
    
    if (userId && refreshToken) {
      await AuthService.logoutUser(userId, refreshToken);
    }
    
    res.clearCookie('accessToken');
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if Redis fails
    res.clearCookie('accessToken');
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ message: 'Đăng xuất thành công' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Không có refresh token',
        message: 'Vui lòng đăng nhập lại'
      });
    }

    // Use AuthService to refresh token
    const result = await AuthService.refreshToken(refreshToken);

    // Get cookie maxAge from env variables
    const accessTokenMaxAge = parseJWTExpiration(process.env.JWT_EXPIRES_IN || '15m');
    const refreshTokenMaxAge = parseJWTExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    // Set new cookies (both accessToken and token for compatibility)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge
    });

    res.json({
      message: 'Token được làm mới thành công',
      success: true
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    const errorMessage = error.message || 'INVALID_REFRESH_TOKEN';
    
    if (['REFRESH_TOKEN_REQUIRED', 'INVALID_REFRESH_TOKEN', 'USER_NOT_FOUND'].includes(errorMessage)) {
      return res.status(401).json({ 
        error: 'Refresh token không hợp lệ',
        message: 'Vui lòng đăng nhập lại'
      });
    }
    
    res.status(401).json({ 
      error: 'Refresh token không hợp lệ',
      message: 'Vui lòng đăng nhập lại'
    });
  }
});

// Logout from all devices endpoint (protected route)
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    await AuthService.logoutAllDevices(req.user.id);
    
    // Clear cookies for current device
    res.clearCookie('accessToken');
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    
    res.json({ 
      message: 'Đã đăng xuất khỏi tất cả thiết bị',
      success: true
    });
  } catch (error) {
    console.error('Logout all devices error:', error);
    res.status(500).json({ 
      error: 'Lỗi máy chủ',
      message: 'Không thể đăng xuất khỏi tất cả thiết bị'
    });
  }
});

// Get current user endpoint (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User đã được xác thực qua middleware, lấy thông tin chi tiết
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: 'Lỗi máy chủ',
      message: 'Không thể lấy thông tin người dùng'
    });
  }
});

export default router;