import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
          lastName: true
        }
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'Không tìm thấy người dùng',
          message: 'Vui lòng đăng nhập lại'
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
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
          );

          // Set new access token cookie
          res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
          });

          // Also set as 'token' for compatibility
          res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 hour
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

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Không có quyền truy cập',
        message: `Chức năng này chỉ dành cho: ${roles.join(', ')}`
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