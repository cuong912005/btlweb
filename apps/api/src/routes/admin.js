import express from 'express';
import Joi from 'joi';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import AdminService from '../services/AdminService.js';

const router = express.Router();

// Get admin dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await AdminService.getDashboardStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy thống kê'
    });
  }
});

// Validation schema for event approval/rejection
const eventApprovalSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required().messages({
    'any.only': 'Hành động phải là "approve" hoặc "reject"',
    'any.required': 'Hành động là bắt buộc'
  }),
  reason: Joi.when('action', {
    is: 'reject',
    then: Joi.string().trim().min(10).max(500).required().messages({
      'string.min': 'Lý do từ chối phải có ít nhất 10 ký tự',
      'string.max': 'Lý do từ chối không được quá 500 ký tự',
      'any.required': 'Lý do từ chối là bắt buộc khi từ chối sự kiện'
    }),
    otherwise: Joi.string().optional()
  })
});

// Get all pending events for approval (Story 2.2)
router.get('/events/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingEvents = await AdminService.getPendingEvents();

    res.json({
      message: 'Danh sách sự kiện chờ phê duyệt',
      pendingEvents,
      totalCount: pendingEvents.length
    });
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách sự kiện chờ phê duyệt'
    });
  }
});

// Approve or reject a specific event (Story 2.2)
router.patch('/events/:eventId/approval', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Validate input
    const { error, value } = eventApprovalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dữ liệu đầu vào không hợp lệ',
        details: error.details.map(detail => detail.message)
      });
    }

    const { action, reason } = value;

    // Call service to handle business logic
    const result = await AdminService.approveOrRejectEvent(eventId, action, reason, req.user.id);

    res.json({
      success: true,
      message: action === 'approve' 
        ? 'Sự kiện đã được phê duyệt thành công và kênh trao đổi đã được tạo'
        : 'Sự kiện đã bị từ chối',
      event: result,
      processedBy: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      processedAt: new Date()
    });
  } catch (error) {
    console.error('Event approval error:', error);
    
    // Handle specific service errors
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện'
      });
    }
    
    if (error.message === 'EVENT_ALREADY_PROCESSED') {
      return res.status(400).json({
        error: 'Sự kiện này đã được xử lý'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi xử lý phê duyệt sự kiện',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.'
    });
  }
});

// Bulk approval for multiple events (Story 2.2)
router.patch('/events/bulk-approval', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { eventIds, action, reason } = req.body;

    // Call service to handle business logic
    const results = await AdminService.bulkApproveOrRejectEvents(eventIds, action, reason, req.user.id);

    res.json({
      success: true,
      message: `Đã ${action === 'approve' ? 'phê duyệt' : 'từ chối'} ${results.processedCount} sự kiện`,
      processedCount: results.processedCount,
      processedEventIds: results.eventIds,
      processedBy: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      processedAt: new Date()
    });
  } catch (error) {
    console.error('Bulk approval error:', error);
    
    // Handle specific service errors
    if (error.message === 'INVALID_EVENT_IDS') {
      return res.status(400).json({
        error: 'Danh sách ID sự kiện không hợp lệ'
      });
    }
    
    if (error.message === 'INVALID_ACTION') {
      return res.status(400).json({
        error: 'Hành động phải là "approve" hoặc "reject"'
      });
    }
    
    if (error.message === 'REJECTION_REASON_REQUIRED') {
      return res.status(400).json({
        error: 'Lý do từ chối là bắt buộc và phải có ít nhất 10 ký tự'
      });
    }
    
    if (error.message === 'NO_PENDING_EVENTS') {
      return res.status(400).json({
        error: 'Không có sự kiện nào đang chờ phê duyệt trong danh sách'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi xử lý phê duyệt hàng loạt'
    });
  }
});

// Get event approval history/audit trail
router.get('/events/approval-history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const result = await AdminService.getApprovalHistory(page, limit, status);

    res.json(result);
  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy lịch sử phê duyệt'
    });
  }
});

// Export events list (Story 5.2)
router.get('/export/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({
        error: 'Định dạng không hỗ trợ. Chỉ hỗ trợ csv hoặc json'
      });
    }

    const eventsData = await AdminService.exportEvents();

    if (format === 'csv') {
      const csv = AdminService.convertToCSV(eventsData, 'events');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="events-export.csv"');
      res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
      
      return res.send('\uFEFF' + csv); // Add BOM for Vietnamese support
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="events-export.json"');
      
      return res.json({
        exportDate: new Date().toISOString(),
        totalCount: eventsData.length,
        data: eventsData
      });
    }
  } catch (error) {
    console.error('Export events error:', error);
    res.status(500).json({
      error: 'Lỗi khi xuất danh sách sự kiện'
    });
  }
});

// Export volunteers list (Story 5.2)
router.get('/export/volunteers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({
        error: 'Định dạng không hỗ trợ. Chỉ hỗ trợ csv hoặc json'
      });
    }

    const volunteersData = await AdminService.exportVolunteers();

    if (format === 'csv') {
      const csv = AdminService.convertToCSV(volunteersData, 'volunteers');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="volunteers-export.csv"');
      res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
      
      return res.send('\uFEFF' + csv); // Add BOM for Vietnamese support
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="volunteers-export.json"');
      
      return res.json({
        exportDate: new Date().toISOString(),
        totalCount: volunteersData.length,
        data: volunteersData
      });
    }
  } catch (error) {
    console.error('Export volunteers error:', error);
    res.status(500).json({
      error: 'Lỗi khi xuất danh sách tình nguyện viên'
    });
  }
});

// User Management: Get all users with filters
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    
    const result = await AdminService.getUsers(page, limit, role, status, search);

    res.json({
      success: true,
      message: 'Danh sách người dùng',
      ...result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách người dùng'
    });
  }
});

// User Management: Get user details
router.get('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await AdminService.getUserDetails(userId);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy người dùng'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi lấy thông tin người dùng'
    });
  }
});

// User Management: Toggle user active status (lock/unlock)
router.patch('/users/:userId/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await AdminService.toggleUserStatus(userId, req.user.id);

    res.json({
      success: true,
      message: result.action === 'locked' 
        ? 'Tài khoản đã bị khóa thành công' 
        : 'Tài khoản đã được mở khóa thành công',
      user: result
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy người dùng'
      });
    }
    
    if (error.message === 'CANNOT_LOCK_ADMIN') {
      return res.status(403).json({
        error: 'Không thể khóa tài khoản Admin'
      });
    }
    
    if (error.message === 'CANNOT_LOCK_SELF') {
      return res.status(403).json({
        error: 'Không thể khóa tài khoản của chính mình'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi thay đổi trạng thái tài khoản'
    });
  }
});

export default router;