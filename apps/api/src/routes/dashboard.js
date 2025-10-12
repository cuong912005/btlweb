import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import DashboardService from '../services/DashboardService.js';

const router = express.Router();

// Dashboard route - chung cho tất cả user (Story 4.4)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    const dashboardData = await DashboardService.getDashboardData(user);
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard route error:', error);
    
    // Handle specific service errors
    if (error.message === 'DASHBOARD_ERROR') {
      return res.status(500).json({ 
        error: 'Không thể tải dữ liệu dashboard',
        code: 'DASHBOARD_ERROR'
      });
    }
    
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

export default router;