import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

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
    const pendingEvents = await prisma.event.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // Oldest first for fair processing
      }
    });

    res.json({
      message: 'Danh sách sự kiện chờ phê duyệt',
      pendingEvents: pendingEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        capacity: event.capacity,
        category: event.category,
        status: event.status,
        organizer: event.organizer,
        createdAt: event.createdAt,
        submittedDaysAgo: Math.floor((new Date() - new Date(event.createdAt)) / (1000 * 60 * 60 * 24))
      })),
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

    // Check if event exists and is pending
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện'
      });
    }

    if (event.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Sự kiện này đã được xử lý',
        message: `Trạng thái hiện tại: ${event.status}`
      });
    }

    // Update event status
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    
    const updatedEvent = await prisma.$transaction(async (tx) => {
      // Update event status
      const updated = await tx.event.update({
        where: { id: eventId },
        data: {
          status: newStatus,
          approvedAt: action === 'approve' ? new Date() : null,
          rejectionReason: action === 'reject' ? reason : null,
          approvedBy: req.user.id
        },
        include: {
          organizer: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // If approved, create communication channel (Story 2.3 integration)
      if (action === 'approve') {
        await tx.communicationChannel.create({
          data: {
            eventId: eventId
          }
        });
      }

      return updated;
    });

    // TODO: Send notification to event organizer (will implement in Epic 4)
    
    res.json({
      success: true,
      message: action === 'approve' 
        ? 'Sự kiện đã được phê duyệt thành công và kênh trao đổi đã được tạo'
        : 'Sự kiện đã bị từ chối',
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        status: updatedEvent.status,
        approvedAt: updatedEvent.approvedAt,
        rejectionReason: updatedEvent.rejectionReason,
        organizer: updatedEvent.organizer
      },
      processedBy: {
        id: req.user.id,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      processedAt: new Date()
    });
  } catch (error) {
    console.error('Event approval error:', error);
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

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({
        error: 'Danh sách ID sự kiện không hợp lệ'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'Hành động phải là "approve" hoặc "reject"'
      });
    }

    if (action === 'reject' && (!reason || reason.trim().length < 10)) {
      return res.status(400).json({
        error: 'Lý do từ chối là bắt buộc và phải có ít nhất 10 ký tự'
      });
    }

    // Get pending events
    const pendingEvents = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        status: 'PENDING'
      }
    });

    if (pendingEvents.length === 0) {
      return res.status(400).json({
        error: 'Không có sự kiện nào đang chờ phê duyệt trong danh sách'
      });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    
    const results = await prisma.$transaction(async (tx) => {
      // Update all events
      const updatedEvents = await tx.event.updateMany({
        where: {
          id: { in: pendingEvents.map(e => e.id) },
          status: 'PENDING'
        },
        data: {
          status: newStatus,
          approvedAt: action === 'approve' ? new Date() : null,
          rejectionReason: action === 'reject' ? reason : null,
          approvedBy: req.user.id
        }
      });

      // If approved, create communication channels
      if (action === 'approve') {
        const channelData = pendingEvents.map(event => ({
          eventId: event.id
        }));
        
        await tx.communicationChannel.createMany({
          data: channelData
        });
      }

      return { 
        processedCount: updatedEvents.count,
        eventIds: pendingEvents.map(e => e.id)
      };
    });

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
    res.status(500).json({
      error: 'Lỗi khi xử lý phê duyệt hàng loạt'
    });
  }
});

// Get event approval history/audit trail
router.get('/events/approval-history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status && ['APPROVED', 'REJECTED'].includes(status)) {
      where.status = status;
    } else {
      where.status = { in: ['APPROVED', 'REJECTED'] };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approver: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        approvedAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalCount = await prisma.event.count({ where });

    res.json({
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        status: event.status,
        organizer: event.organizer,
        approver: event.approver,
        approvedAt: event.approvedAt,
        rejectionReason: event.rejectionReason,
        createdAt: event.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy lịch sử phê duyệt'
    });
  }
});

export default router;