import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { authenticateToken, requireRole, requireOrganizerOrAdmin } from '../middleware/auth.js';
import EventService from '../services/EventService.js';

const router = express.Router();

// Validation schema for event creation
const createEventSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required().messages({
    'string.min': 'Tên sự kiện phải có ít nhất 5 ký tự',
    'string.max': 'Tên sự kiện không được quá 200 ký tự',
    'any.required': 'Tên sự kiện là bắt buộc'
  }),
  description: Joi.string().trim().min(20).max(2000).required().messages({
    'string.min': 'Mô tả sự kiện phải có ít nhất 20 ký tự',
    'string.max': 'Mô tả sự kiện không được quá 2000 ký tự',
    'any.required': 'Mô tả sự kiện là bắt buộc'
  }),
  location: Joi.string().trim().min(5).max(500).required().messages({
    'string.min': 'Địa điểm phải có ít nhất 5 ký tự',
    'string.max': 'Địa điểm không được quá 500 ký tự',
    'any.required': 'Địa điểm là bắt buộc'
  }),
  startDate: Joi.date().min('now').required().messages({
    'date.min': 'Ngày bắt đầu phải là ngày trong tương lai',
    'any.required': 'Ngày bắt đầu là bắt buộc'
  }),
  endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
    'date.min': 'Ngày kết thúc phải sau ngày bắt đầu',
    'any.required': 'Ngày kết thúc là bắt buộc'
  }),
  capacity: Joi.number().integer().min(1).max(10000).optional().messages({
    'number.min': 'Số lượng tham gia phải ít nhất 1 người',
    'number.max': 'Số lượng tham gia không được quá 10,000 người',
    'number.integer': 'Số lượng tham gia phải là số nguyên'
  }),
  category: Joi.string().valid(
    'Môi trường', 'Giáo dục', 'Y tế', 
    'Cộng đồng', 'Từ thiện', 'Cứu trợ thiên tai'
  ).required().messages({
    'any.only': 'Danh mục sự kiện không hợp lệ. Các danh mục được phép: Môi trường, Giáo dục, Y tế, Cộng đồng, Từ thiện, Cứu trợ thiên tai',
    'any.required': 'Danh mục sự kiện là bắt buộc'
  })
});

// Create new event (Story 2.1) - Organizer only
router.post('/', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = createEventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dữ liệu đầu vào không hợp lệ',
        details: error.details.map(detail => detail.message)
      });
    }

    // Use service to create event
    const event = await EventService.createEvent(value, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Sự kiện đã được tạo thành công và đang chờ phê duyệt',
      event
    });
  } catch (error) {
    console.error('Event creation error:', error);
    
    if (error.message === 'START_DATE_MUST_BE_FUTURE') {
      return res.status(400).json({
        error: 'Ngày bắt đầu phải là ngày trong tương lai'
      });
    }
    
    if (error.message === 'END_DATE_MUST_BE_AFTER_START') {
      return res.status(400).json({
        error: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }

    res.status(500).json({
      error: 'Lỗi máy chủ khi tạo sự kiện',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.'
    });
  }
});

// Get event categories (helper endpoint)
router.get('/categories', (req, res) => {
  const categories = [
    'Môi trường',
    'Giáo dục', 
    'Y tế',
    'Cộng đồng',
    'Từ thiện',
    'Cứu trợ thiên tai'
  ];
  
  res.json({ 
    categories,
    message: 'Danh sách các danh mục sự kiện có sẵn'
  });
});

// Get user's registrations (volunteer only) - MOVED UP to avoid conflict
router.get('/my-registrations', authenticateToken, requireRole(['VOLUNTEER']), async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.id;

    const registrations = await EventService.getUserRegistrations(userId, status);

    res.json({
      success: true,
      registrations,
      totalCount: registrations.length
    });
  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách đăng ký của bạn'
    });
  }
});

// Get volunteer's participation history and statistics (Story 3.4) - MOVED UP
router.get('/volunteers/participation-history', authenticateToken, requireRole(['VOLUNTEER']), async (req, res) => {
  try {
    const volunteerId = req.user.id;

    const historyData = await EventService.getVolunteerParticipationHistory(volunteerId);

    res.json({
      success: true,
      ...historyData
    });
  } catch (error) {
    console.error('Get volunteer participation history error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy lịch sử tham gia tình nguyện'
    });
  }
});

// Export volunteer's participation data (Story 3.4) - MOVED UP
router.get('/volunteers/participation-history/export', authenticateToken, requireRole(['VOLUNTEER']), async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const volunteerId = req.user.id;

    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({
        error: 'Định dạng không hợp lệ. Chỉ hỗ trợ json và csv'
      });
    }

    const exportData = await EventService.exportVolunteerParticipationData(volunteerId, format);

    if (format === 'csv') {
      // Return CSV data
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      
      // Convert to CSV string with UTF-8 BOM for Excel compatibility
      const csvContent = [
        '\uFEFF', // UTF-8 BOM
        exportData.headers.join(','),
        ...exportData.data.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      return res.send(csvContent);
    } else {
      // Return JSON data
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      return res.json(exportData.data);
    }
  } catch (error) {
    console.error('Export volunteer participation error:', error);
    res.status(500).json({
      error: 'Lỗi khi xuất dữ liệu tham gia tình nguyện'
    });
  }
});

// Get organizer's events - MOVED UP
router.get('/my-events', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const organizerId = req.user.id;

    const events = await EventService.getOrganizerEvents(organizerId, status);

    res.json({
      success: true,
      events,
      totalCount: events.length
    });
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách sự kiện của bạn'
    });
  }
});

// Get organizer's events with participant summaries (organizer only) - MOVED UP
router.get('/my-events-summary', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const organizerId = req.user.id;

    const events = await EventService.getOrganizerEventsWithParticipants(organizerId, status);

    res.json({
      success: true,
      events,
      totalCount: events.length
    });
  } catch (error) {
    console.error('Get organizer events with participants error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách sự kiện với thông tin người tham gia'
    });
  }
});

// Get event by ID
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Extract user ID from token if present (optional authentication)
    let userId = null;
    try {
      const token = req.cookies?.accessToken || req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      }
    } catch (tokenError) {
      // Token is invalid or expired, continue without user context
    }

    const event = await EventService.getEventById(eventId, userId);

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi lấy thông tin sự kiện'
    });
  }
});

// Register for event (volunteer only)
router.post('/:eventId/register', authenticateToken, requireRole(['VOLUNTEER']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const volunteerId = req.user.id;

    const registration = await EventService.registerForEvent(eventId, volunteerId);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tham gia sự kiện thành công! Vui lòng chờ người tổ chức phê duyệt.',
      registration
    });
  } catch (error) {
    console.error('Event registration error:', error);
    
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện'
      });
    }
    
    if (error.message === 'EVENT_NOT_APPROVED') {
      return res.status(400).json({
        error: 'Sự kiện chưa được phê duyệt'
      });
    }
    
    if (error.message === 'EVENT_FULL') {
      return res.status(400).json({
        error: 'Sự kiện đã đầy, không thể đăng ký thêm'
      });
    }
    
    if (error.message === 'ALREADY_REGISTERED') {
      return res.status(400).json({
        error: 'Bạn đã đăng ký tham gia sự kiện này rồi'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi đăng ký tham gia sự kiện'
    });
  }
});

// Cancel registration (volunteer only)
router.delete('/registrations/:registrationId', authenticateToken, requireRole(['VOLUNTEER']), async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    const result = await EventService.cancelRegistration(registrationId, userId);

    res.json({
      success: true,
      message: result.message,
      event: result.event
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    
    if (error.message === 'REGISTRATION_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy đăng ký'
      });
    }
    
    if (error.message === 'NOT_YOUR_REGISTRATION') {
      return res.status(403).json({
        error: 'Bạn không có quyền hủy đăng ký này'
      });
    }
    
    if (error.message === 'EVENT_ALREADY_STARTED') {
      return res.status(400).json({
        error: 'Không thể hủy đăng ký sau khi sự kiện đã bắt đầu'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi hủy đăng ký'
    });
  }
});

// Get event participants (organizer only)
router.get('/:eventId/participants', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const data = await EventService.getEventParticipants(eventId, organizerId);

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    console.error('Get event participants error:', error);
    
    if (error.message === 'EVENT_NOT_FOUND_OR_NOT_OWNER') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện hoặc bạn không phải là người tổ chức'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi lấy danh sách người tham gia'
    });
  }
});

// Update participant status (organizer only) - Enhanced with reason and completion marking
router.patch('/participants/:participantId/status', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const { participantId } = req.params;
    const { status, reason, isCompleted } = req.body;
    const organizerId = req.user.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        error: 'Trạng thái không hợp lệ. Chỉ được phép APPROVED hoặc REJECTED'
      });
    }

    const updatedParticipant = await EventService.updateParticipantStatus(participantId, status, organizerId, reason, isCompleted);

    res.json({
      success: true,
      message: `Đã ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} người tham gia`,
      participant: updatedParticipant
    });
  } catch (error) {
    console.error('Update participant status error:', error);
    
    if (error.message === 'PARTICIPANT_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy người tham gia'
      });
    }
    
    if (error.message === 'NOT_EVENT_ORGANIZER') {
      return res.status(403).json({
        error: 'Bạn không phải là người tổ chức sự kiện này'
      });
    }
    
    if (error.message === 'EVENT_FULL') {
      return res.status(400).json({
        error: 'Sự kiện đã đầy, không thể phê duyệt thêm người tham gia'
      });
    }
    
    if (error.message === 'REJECTION_REASON_REQUIRED') {
      return res.status(400).json({
        error: 'Lý do từ chối là bắt buộc khi từ chối người tham gia'
      });
    }

    if (error.message === 'EVENT_NOT_ENDED') {
      return res.status(400).json({
        error: 'Chỉ có thể đánh dấu hoàn thành sau khi sự kiện kết thúc'
      });
    }

    if (error.message === 'PARTICIPANT_NOT_APPROVED') {
      return res.status(400).json({
        error: 'Người tham gia chưa được phê duyệt'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi cập nhật trạng thái người tham gia'
    });
  }
});

// Bulk update participant status (organizer only) - Story 3.3 with completion marking
router.patch('/participants/bulk-status', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const { participantIds, status, reason, isCompleted } = req.body;
    const organizerId = req.user.id;

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        error: 'Danh sách ID người tham gia không hợp lệ'
      });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        error: 'Trạng thái không hợp lệ. Chỉ được phép APPROVED hoặc REJECTED'
      });
    }

    const result = await EventService.bulkUpdateParticipantStatus(participantIds, status, organizerId, reason, isCompleted);

    res.json({
      success: true,
      message: `Đã ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} ${result.updatedCount} người tham gia`,
      result
    });
  } catch (error) {
    console.error('Bulk update participant status error:', error);
    
    if (error.message === 'SOME_PARTICIPANTS_NOT_FOUND_OR_NOT_AUTHORIZED') {
      return res.status(404).json({
        error: 'Một số người tham gia không tìm thấy hoặc bạn không có quyền'
      });
    }
    
    if (error.message === 'REJECTION_REASON_REQUIRED') {
      return res.status(400).json({
        error: 'Lý do từ chối là bắt buộc khi từ chối hàng loạt'
      });
    }

    if (error.message.startsWith('EVENT_CAPACITY_EXCEEDED_FOR_')) {
      return res.status(400).json({
        error: 'Một số sự kiện sẽ vượt quá sức chứa nếu phê duyệt tất cả'
      });
    }

    if (error.message === 'SOME_EVENTS_NOT_ENDED') {
      return res.status(400).json({
        error: 'Một số sự kiện chưa kết thúc, không thể đánh dấu hoàn thành'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi cập nhật hàng loạt trạng thái người tham gia'
    });
  }
});

// Export event participants (organizer only) - Story 3.3
router.get('/:eventId/participants/export', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { format = 'json' } = req.query;
    const organizerId = req.user.id;

    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({
        error: 'Định dạng không hợp lệ. Chỉ hỗ trợ json và csv'
      });
    }

    const exportData = await EventService.exportEventParticipants(eventId, organizerId, format);

    if (format === 'csv') {
      // Return CSV data
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      
      // Convert to CSV string
      const csvContent = [
        exportData.headers.join(','),
        ...exportData.data.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      return res.send(csvContent);
    } else {
      // Return JSON data
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
      return res.json(exportData.data);
    }
  } catch (error) {
    console.error('Export participants error:', error);
    
    if (error.message === 'EVENT_NOT_FOUND_OR_NOT_OWNER') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện hoặc bạn không phải là người tổ chức'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi xuất danh sách người tham gia'
    });
  }
});

// Rate and provide feedback for completed event (Story 3.4)
router.post('/:eventId/rate', authenticateToken, requireRole(['VOLUNTEER']), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, feedback } = req.body;
    const volunteerId = req.user.id;

    const result = await EventService.rateEvent(eventId, volunteerId, rating, feedback);

    res.json({
      success: true,
      message: 'Cảm ơn bạn đã đánh giá sự kiện!',
      rating: result
    });
  } catch (error) {
    console.error('Rate event error:', error);
    
    if (error.message === 'INVALID_RATING') {
      return res.status(400).json({
        error: 'Đánh giá không hợp lệ. Vui lòng chọn từ 1 đến 5 sao'
      });
    }
    
    if (error.message === 'PARTICIPATION_NOT_FOUND') {
      return res.status(404).json({
        error: 'Bạn chưa tham gia sự kiện này'
      });
    }
    
    if (error.message === 'PARTICIPATION_NOT_APPROVED') {
      return res.status(400).json({
        error: 'Bạn chưa được phê duyệt tham gia sự kiện này'
      });
    }
    
    if (error.message === 'EVENT_NOT_COMPLETED') {
      return res.status(400).json({
        error: 'Chỉ có thể đánh giá sau khi sự kiện kết thúc'
      });
    }
    
    if (error.message === 'ALREADY_RATED') {
      return res.status(400).json({
        error: 'Bạn đã đánh giá sự kiện này rồi'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi đánh giá sự kiện'
    });
  }
});

// Get event feedback and ratings (organizer only) - Story 3.4
router.get('/:eventId/feedback', authenticateToken, requireOrganizerOrAdmin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const feedbackData = await EventService.getEventFeedback(eventId, organizerId);

    res.json({
      success: true,
      ...feedbackData
    });
  } catch (error) {
    console.error('Get event feedback error:', error);
    
    if (error.message === 'EVENT_NOT_FOUND_OR_NOT_OWNER') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện hoặc bạn không phải là người tổ chức'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi lấy đánh giá sự kiện'
    });
  }
});

// Get public event feedback and ratings (accessible to all) - Public ratings display
router.get('/:eventId/public-feedback', async (req, res) => {
  try {
    const { eventId } = req.params;

    const feedbackData = await EventService.getPublicEventFeedback(eventId);

    res.json({
      success: true,
      ...feedbackData
    });
  } catch (error) {
    console.error('Get public event feedback error:', error);
    
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi lấy đánh giá sự kiện'
    });
  }
});

// List events with enhanced filtering and search (Story 3.1)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      location, 
      search, 
      startDate, 
      endDate, 
      sortBy,
      sortOrder,
      page, 
      limit,
      availability,
      eventStatus,
      registrationStatus
    } = req.query;

    // Try to get userId from token if present (for filtering registered events)
    let userId = null;
    try {
      const token = req.cookies?.accessToken || req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      }
    } catch (tokenError) {
      // Token is invalid or expired, continue without user context
    }

    const result = await EventService.getApprovedEvents({
      category,
      location,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit,
      availability,
      eventStatus,
      registrationStatus
    }, userId);

    res.json(result);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách sự kiện',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.'
    });
  }
});

export default router;