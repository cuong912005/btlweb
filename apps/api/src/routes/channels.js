import express from 'express';
import Joi from 'joi';
import { authenticateToken } from '../middleware/auth.js';
import ChannelService from '../services/ChannelService.js';
import { deleteCloudinaryImage, extractPublicId } from '../config/cloudinary.js';
import { channelImageUpload, handleMulterError } from '../config/multer.js';

const router = express.Router();

// Validation schemas
const postSchema = Joi.object({
  content: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Nội dung bài viết không được để trống',
    'string.min': 'Nội dung bài viết phải có ít nhất 1 ký tự',
    'string.max': 'Nội dung bài viết không được quá 2000 ký tự',
    'any.required': 'Nội dung bài viết là bắt buộc'
  }),
  imageUrl: Joi.string().uri().optional().allow('', null).messages({
    'string.uri': 'URL hình ảnh không hợp lệ'
  })
});

const commentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Nội dung bình luận không được để trống',
    'string.min': 'Nội dung bình luận phải có ít nhất 1 ký tự',
    'string.max': 'Nội dung bình luận không được quá 500 ký tự',
    'any.required': 'Nội dung bình luận là bắt buộc'
  })
});

// Middleware to check channel access permissions
const checkChannelAccess = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const accessInfo = await ChannelService.checkChannelAccess(channelId, userId);
    
    // Attach channel info to request for use in route handlers
    req.channel = accessInfo.channel;
    req.isOrganizer = accessInfo.isOrganizer;
    req.canModerate = accessInfo.canModerate;

    next();
  } catch (error) {
    console.error('Channel access check error:', error);
    
    if (error.message === 'CHANNEL_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy kênh trao đổi'
      });
    }
    
    if (error.message === 'ACCESS_DENIED') {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập kênh trao đổi này',
        message: 'Chỉ người tổ chức sự kiện và những người tham gia đã được phê duyệt mới có thể truy cập'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi kiểm tra quyền truy cập'
    });
  }
};

// Upload image for channel posts
router.post('/:channelId/upload-image', authenticateToken, checkChannelAccess, 
  channelImageUpload.single('image'), 
  handleMulterError, 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Không có file hình ảnh được tải lên'
        });
      }

      // Cloudinary provides the secure URL directly
      const imageUrl = req.file.path;
      const publicId = req.file.filename;

      res.json({
        success: true,
        message: 'Tải lên hình ảnh thành công',
        imageUrl: imageUrl,
        publicId: publicId,
        size: req.file.size,
        format: req.file.format,
        width: req.file.width,
        height: req.file.height
      });
    } catch (error) {
      console.error('Image upload error:', error);
      
      // If there was an error and file was uploaded to Cloudinary, clean it up
      if (req.file && req.file.filename) {
        try {
          await deleteCloudinaryImage(req.file.filename);
        } catch (deleteError) {
          console.error('Error deleting uploaded file from Cloudinary:', deleteError);
        }
      }

      res.status(500).json({
        error: 'Lỗi khi tải lên hình ảnh',
        message: error.message
      });
    }
  }
);

// Delete image from Cloudinary
router.delete('/:channelId/images/:publicId', authenticateToken, checkChannelAccess, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Verify user has permission to delete (author or moderator)
    const canDelete = req.canModerate; // For now, only moderators can delete images
    
    if (!canDelete) {
      return res.status(403).json({
        error: 'Bạn không có quyền xóa hình ảnh này'
      });
    }

    // Delete from Cloudinary
    const result = await deleteCloudinaryImage(publicId);
    
    if (result) {
      res.json({
        success: true,
        message: 'Đã xóa hình ảnh thành công'
      });
    } else {
      res.status(404).json({
        error: 'Không tìm thấy hình ảnh để xóa'
      });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      error: 'Lỗi khi xóa hình ảnh',
      message: error.message
    });
  }
});

// Get event channel by event ID (Story 2.3 - Channel accessibility)
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    console.log('Fetching channel for event:', eventId, 'and user:', userId); 
    const result = await ChannelService.getChannelByEventId(eventId, userId);
    
    res.json(result);
  } catch (error) {
    if (error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện'
      });
    }
    
    if (error.message === 'EVENT_NOT_APPROVED') {
      return res.status(403).json({
        error: 'Kênh trao đổi chỉ khả dụng cho sự kiện đã được phê duyệt'
      });
    }
    
    if (error.message === 'ACCESS_DENIED') {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập kênh trao đổi này'
      });
    }
    
    if (error.message === 'CHANNEL_NOT_CREATED') {
      return res.status(404).json({
        error: 'Kênh trao đổi chưa được tạo cho sự kiện này'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi lấy thông tin kênh trao đổi'
    });
  }
});

// Get posts in channel (Story 2.3 - Basic channel structure)
router.get('/:channelId/posts', authenticateToken, checkChannelAccess, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await ChannelService.getChannelPosts(channelId, req.user.id, page, limit);

    res.json({
      posts: result.posts,
      pagination: result.pagination,
      channelInfo: {
        eventTitle: req.channel.event.title,
        permissions: {
          isOrganizer: req.isOrganizer,
          canModerate: req.canModerate
        }
      }
    });
  } catch (error) {
    console.error('Get channel posts error:', error);
    res.status(500).json({
      error: 'Lỗi khi lấy danh sách bài viết'
    });
  }
});

// Create new post in channel (Story 2.3 - Basic functionality)
router.post('/:channelId/posts', authenticateToken, checkChannelAccess, async (req, res) => {
  try {
    const { channelId } = req.params;
    
    // Validate input
    const { error, value } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dữ liệu đầu vào không hợp lệ',
        details: error.details.map(detail => detail.message)
      });
    }

    // Create post using service
    const postResult = await ChannelService.createPost(channelId, req.user.id, value);

    // Emit real-time event to all channel participants
    const io = req.app.get('io');
    io.to(`event-${postResult.event.id}`).emit('new-post', {
      channelId,
      post: {
        id: postResult.id,
        content: postResult.content,
        imageUrl: postResult.imageUrl,
        author: postResult.author,
        createdAt: postResult.createdAt,
        updatedAt: postResult.updatedAt,
        likeCount: postResult.likeCount,
        isLikedByUser: postResult.isLikedByUser,
        commentCount: postResult.commentCount,
        comments: postResult.comments
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bài viết đã được đăng thành công',
      post: {
        id: postResult.id,
        content: postResult.content,
        imageUrl: postResult.imageUrl,
        author: postResult.author,
        createdAt: postResult.createdAt,
        updatedAt: postResult.updatedAt,
        likeCount: postResult.likeCount,
        isLikedByUser: postResult.isLikedByUser,
        commentCount: postResult.commentCount,
        comments: postResult.comments
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      error: 'Lỗi khi tạo bài viết'
    });
  }
});

// Like/unlike a post (Story 2.3 - Basic functionality)
router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Use service to handle like/unlike
    const result = await ChannelService.togglePostLike(postId, userId);

    // Emit real-time event to all users in channel
    const io = req.app.get('io');
    io.to(`event-${result.eventId}`).emit('post-liked', {
      postId: result.postId,
      userId,
      action: result.isLiked ? 'liked' : 'unliked',
      likeCount: result.likeCount,
      isLiked: result.isLiked
    });

    res.json({
      success: true,
      action: result.isLiked ? 'liked' : 'unliked',
      likeCount: result.likeCount,
      isLiked: result.isLiked
    });
  } catch (error) {
    console.error('Like post error:', error);
    
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy bài viết'
      });
    }
    
    if (error.message === 'ACCESS_DENIED') {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập bài viết này'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi thích/bỏ thích bài viết'
    });
  }
});

// Add comment to post (Story 2.3 - Basic functionality)
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Validate input
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dữ liệu đầu vào không hợp lệ',
        details: error.details.map(detail => detail.message)
      });
    }

    // Use service to add comment
    const commentResult = await ChannelService.addComment(postId, userId, value);

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`event-${commentResult.eventId}`).emit('new-comment', {
      postId: commentResult.postId,
      comment: {
        id: commentResult.id,
        content: commentResult.content,
        author: commentResult.author,
        createdAt: commentResult.createdAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bình luận đã được thêm thành công',
      comment: {
        id: commentResult.id,
        content: commentResult.content,
        author: commentResult.author,
        createdAt: commentResult.createdAt
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy bài viết'
      });
    }
    
    if (error.message === 'ACCESS_DENIED') {
      return res.status(403).json({
        error: 'Bạn không có quyền bình luận bài viết này'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi tạo bình luận'
    });
  }
});

// Delete post (moderator only - organizer privilege)
router.delete('/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Use service to delete post
    const deleteResult = await ChannelService.deletePost(postId, userId);

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`event-${deleteResult.eventId}`).emit('post-deleted', {
      postId: deleteResult.postId,
      deletedBy: deleteResult.deletedBy
    });

    res.json({
      success: true,
      message: 'Bài viết đã được xóa thành công'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({
        error: 'Không tìm thấy bài viết'
      });
    }
    
    if (error.message === 'DELETE_PERMISSION_DENIED') {
      return res.status(403).json({
        error: 'Bạn không có quyền xóa bài viết này'
      });
    }

    res.status(500).json({
      error: 'Lỗi khi xóa bài viết'
    });
  }
});

export default router;