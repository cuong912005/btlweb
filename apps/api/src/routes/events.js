import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, requireOrganizerOrAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

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

    const { title, description, location, startDate, endDate, capacity, category } = value;

    // Create event with pending approval status
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        capacity: capacity || null,
        category,
        status: 'PENDING', // Automatically set to pending approval
        organizerId: req.user.id
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Sự kiện đã được tạo thành công và đang chờ phê duyệt',
      event: {
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
        createdAt: event.createdAt
      }
    });
  } catch (error) {
    console.error('Event creation error:', error);
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

// List events (basic implementation for testing)
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'APPROVED' // Only show approved events to public
      },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json({ 
      events: events.map(event => ({
        ...event,
        participantCount: event._count.participants
      }))
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách sự kiện'
    });
  }
});

export default router;