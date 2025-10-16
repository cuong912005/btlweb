import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

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

// Helper functions
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Parse JWT expiration to milliseconds for cookie maxAge
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

    const { email, password, firstName, lastName, phone, location } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Email đã được sử dụng',
        message: 'Tài khoản với email này đã tồn tại. Vui lòng sử dụng email khác hoặc đăng nhập.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user - all public registrations are VOLUNTEER role
    // ORGANIZER and ADMIN roles must be manually set in database by administrators
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'VOLUNTEER', // Fixed role for public registration
        firstName,
        lastName,
        phone: phone || null,
        location: location || null
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        location: true,
        createdAt: true
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Get cookie maxAge from env variables
    const accessTokenMaxAge = parseJWTExpiration(process.env.JWT_EXPIRES_IN || '15m');
    const refreshTokenMaxAge = parseJWTExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    // Set cookies (both accessToken and token for compatibility)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Chào mừng bạn đến với VolunteerHub.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Get cookie maxAge from env variables
    const accessTokenMaxAge = parseJWTExpiration(process.env.JWT_EXPIRES_IN || '15m');
    const refreshTokenMaxAge = parseJWTExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    // Set cookies (both accessToken and token for compatibility)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      location: user.location,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Đăng nhập thành công',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Lỗi máy chủ khi đăng nhập'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Đăng xuất thành công' });
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

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'Không tìm thấy người dùng',
        message: 'Vui lòng đăng nhập lại'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

    // Get cookie maxAge from env variables
    const accessTokenMaxAge = parseJWTExpiration(process.env.JWT_EXPIRES_IN || '15m');
    const refreshTokenMaxAge = parseJWTExpiration(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    // Set new cookies (both accessToken and token for compatibility)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: accessTokenMaxAge
    });

    res.cookie('refreshToken', newRefreshToken, {
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
    res.status(401).json({ 
      error: 'Refresh token không hợp lệ',
      message: 'Vui lòng đăng nhập lại'
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