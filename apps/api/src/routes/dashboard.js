import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard route - chung cho tất cả user (Story 4.4)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Dashboard content adapts to user role but accessible to all
    const dashboardData = {
      message: 'Dashboard VolunteerHub',
      user: user,
      widgets: {
        notifications: {
          count: 0, // TODO: Implement notification counting
          recent: []
        },
        upcomingEvents: [], // TODO: Fetch upcoming events
        recentActivity: [], // TODO: Fetch recent activity from subscribed events
        trendingEvents: []  // TODO: Fetch trending events
      }
    };

    // Role-specific quick actions
    switch (user.role) {
      case 'VOLUNTEER':
        dashboardData.quickActions = [
          'Tìm kiếm sự kiện',
          'Xem lịch sử tham gia',
          'Cập nhật hồ sơ'
        ];
        dashboardData.roleSpecific = {
          participationStats: {
            totalEvents: 0, // TODO: Count user's registered events
            completedEvents: 0, // TODO: Count completed events
            upcomingEvents: 0 // TODO: Count upcoming registered events
          }
        };
        break;
      case 'ORGANIZER':
        dashboardData.quickActions = [
          'Tạo sự kiện mới',
          'Quản lý đăng ký',
          'Xem báo cáo'
        ];
        dashboardData.roleSpecific = {
          eventStats: {
            totalEvents: 0, // TODO: Count organizer's events
            pendingApproval: 0, // TODO: Count pending events
            activeEvents: 0 // TODO: Count active events
          }
        };
        break;
      case 'ADMIN':
        dashboardData.quickActions = [
          'Duyệt sự kiện',
          'Quản lý người dùng',
          'Xem thống kê'
        ];
        dashboardData.roleSpecific = {
          systemStats: {
            totalUsers: 0, // TODO: Count total users
            pendingEvents: 0, // TODO: Count events pending approval
            totalEvents: 0 // TODO: Count all events
          }
        };
        break;
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

export default router;