import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// Authentication middleware - validates JWT tokens with auto-refresh
export const authenticateToken = async (req, res, next) => {
  try {
    // Try to get token from multiple sources
    let token = req.cookies.accessToken || req.cookies.token;
    
    if (!token) {
      // Try header as fallback
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Không có token xác thực',
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'Không tìm thấy người dùng',
          message: 'Vui lòng đăng nhập lại'
        });
      }

      // Check if user account is active
      if (!user.isActive) {
        return res.status(403).json({ 
          error: 'Tài khoản đã bị khóa',
          message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
        });
      }

      req.user = user;
      next();
    } catch (tokenError) {
      // If access token expired, try to refresh
      if (tokenError.name === 'TokenExpiredError') {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res.status(401).json({ 
            error: 'Token đã hết hạn',
            message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
          });
        }

        try {
          // Verify refresh token
          const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const user = await prisma.user.findUnique({
            where: { id: refreshDecoded.userId },
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              lastName: true
            }
          });

          if (!user) {
            return res.status(404).json({ 
              error: 'Không tìm thấy người dùng',
              message: 'Vui lòng đăng nhập lại'
            });
          }

          // Generate new access token
          const newAccessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
          );

          // Get cookie maxAge from env variable
          const accessTokenMaxAge = parseJWTExpiration(process.env.JWT_EXPIRES_IN || '15m');

          // Set new access token cookie
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: accessTokenMaxAge
          });

          // Also set as 'token' for compatibility
          res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: accessTokenMaxAge
          });

          req.user = user;
          next();
        } catch (refreshError) {
          console.error('Refresh token error:', refreshError);
          return res.status(401).json({ 
            error: 'Token đã hết hạn',
            message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
          });
        }
      } else {
        throw tokenError;
      }
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({ 
      error: 'Token không hợp lệ',
      message: 'Token xác thực không hợp lệ'
    });
  }
};

// Role-based authorization middleware - checks user roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Chưa xác thực',
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }

    // Handle both array and spread syntax
    // If first argument is array, use it; otherwise use spread arguments
    const roleArray = Array.isArray(roles[0]) ? roles[0] : roles;

    // Debug logging
    console.log('RequireRole Debug:', {
      userRole: req.user.role,
      requiredRoles: roleArray,
      userId: req.user.id,
      userEmail: req.user.email,
      originalRoles: roles
    });

    if (!roleArray.includes(req.user.role)) {
      console.log('Role check failed:', {
        userRole: req.user.role,
        requiredRoles: roleArray,
        includes: roleArray.includes(req.user.role)
      });
      
      return res.status(403).json({ 
        error: 'Không có quyền truy cập',
        message: `Chức năng này chỉ dành cho: ${roleArray.join(', ')}. Bạn hiện là: ${req.user.role}`
      });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole('ADMIN');

// Organizer or Admin middleware
export const requireOrganizerOrAdmin = requireRole('ORGANIZER', 'ADMIN');

// Any authenticated user middleware (alias for authenticateToken)
export const requireAuth = authenticateToken;