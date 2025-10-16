import express from 'express';
import Joi from 'joi';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import NotificationService from '../services/NotificationService.js';

const router = express.Router();

// Validation schemas
const subscriptionSchema = Joi.object({
  endpoint: Joi.string().uri().required().messages({
    'string.uri': 'Endpoint phải là URL hợp lệ',
    'any.required': 'Endpoint là bắt buộc'
  }),
  keys: Joi.object({
    p256dh: Joi.string().required().messages({
      'any.required': 'p256dh key là bắt buộc'
    }),
    auth: Joi.string().required().messages({
      'any.required': 'auth key là bắt buộc'
    })
  }).required().messages({
    'any.required': 'Keys object là bắt buộc'
  })
});

// Story 4.2.1: Subscribe to push notifications
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { error, value } = subscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dữ liệu đăng ký không hợp lệ',
        details: error.details.map(detail => detail.message)
      });
    }

    const result = await NotificationService.subscribeToPush(req.user.id, value);

    res.status(201).json({
      success: true,
      message: 'Đăng ký nhận thông báo thành công',
      subscription: {
        id: result.id,
        endpoint: result.endpoint,
        createdAt: result.createdAt
      }
    });
  } catch (error) {
    console.error('Subscribe notification error:', error);
    
    if (error.message === 'SUBSCRIPTION_FAILED') {
      return res.status(500).json({
        error: 'Không thể đăng ký nhận thông báo',
        message: 'Vui lòng thử lại sau'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi đăng ký nhận thông báo'
    });
  }
});

// Unsubscribe from push notifications
router.delete('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({
        error: 'Endpoint là bắt buộc để hủy đăng ký'
      });
    }

    await NotificationService.unsubscribeFromPush(req.user.id, endpoint);

    res.json({
      success: true,
      message: 'Hủy đăng ký nhận thông báo thành công'
    });
  } catch (error) {
    console.error('Unsubscribe notification error:', error);
    
    if (error.message === 'UNSUBSCRIPTION_FAILED') {
      return res.status(404).json({
        error: 'Không tìm thấy đăng ký để hủy'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi hủy đăng ký nhận thông báo'
    });
  }
});

// Story 4.2.6: Get notification history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const result = await NotificationService.getNotificationHistory(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      notifications: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy lịch sử thông báo'
    });
  }
});

// Check if user has valid subscriptions
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const hasSubscriptions = await NotificationService.hasValidSubscriptions(req.user.id);
    
    res.json({
      hasValidSubscriptions: hasSubscriptions,
      message: hasSubscriptions 
        ? 'Bạn đã đăng ký nhận thông báo' 
        : 'Bạn chưa đăng ký nhận thông báo'
    });
  } catch (error) {
    console.error('Check subscription status error:', error);
    res.status(500).json({
      error: 'Lỗi khi kiểm tra trạng thái đăng ký'
    });
  }
});

// Test notification endpoint (for development)
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { title = 'Test Notification', body = 'This is a test notification' } = req.body;
    
    const payload = {
      title,
      body,
      icon: '/icons/test-notification.png',
      badge: '/icons/badge.png',
      data: {
        type: 'TEST',
        url: '/dashboard'
      }
    };

    const result = await NotificationService.sendPushNotification(req.user.id, payload);

    res.json({
      success: true,
      message: 'Thông báo test đã được gửi',
      result
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      error: 'Lỗi khi gửi thông báo test'
    });
  }
});

// Get VAPID public key for client-side registration
router.get('/vapid-public-key', (req, res) => {
  res.json({
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

export default router;