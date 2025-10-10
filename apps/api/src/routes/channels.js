import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

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

    // Get channel with event information
    const channel = await prisma.communicationChannel.findUnique({
      where: { id: channelId },
      include: {
        event: {
          include: {
            organizer: true,
            participants: {
              where: {
                status: 'APPROVED'
              },
              include: {
                volunteer: true
              }
            }
          }
        }
      }
    });

    if (!channel) {
      return res.status(404).json({
        error: 'Không tìm thấy kênh trao đổi'
      });
    }

    // Check if event is approved
    if (channel.event.status !== 'APPROVED') {
      return res.status(403).json({
        error: 'Kênh trao đổi chỉ khả dụng cho sự kiện đã được phê duyệt'
      });
    }

    // Check if user is organizer or approved participant
    const isOrganizer = channel.event.organizerId === userId;
    const isApprovedParticipant = channel.event.participants.some(
      p => p.volunteerId === userId
    );

    if (!isOrganizer && !isApprovedParticipant) {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập kênh trao đổi này'
      });
    }

    // Add channel and permissions to request
    req.channel = channel;
    req.isOrganizer = isOrganizer;
    
    next();
  } catch (error) {
    console.error('Channel access check error:', error);
    res.status(500).json({
      error: 'Lỗi khi kiểm tra quyền truy cập kênh'
    });
  }
};

// Get event channel by event ID (Story 2.3 - Channel accessibility)
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: true,
        participants: {
          where: {
            volunteerId: userId,
            status: 'APPROVED'
          }
        },
        communicationChannel: true
      }
    });

    if (!event) {
      return res.status(404).json({
        error: 'Không tìm thấy sự kiện'
      });
    }

    if (event.status !== 'APPROVED') {
      return res.status(403).json({
        error: 'Kênh trao đổi chỉ khả dụng cho sự kiện đã được phê duyệt'
      });
    }

    // Check permissions
    const isOrganizer = event.organizerId === userId;
    const isApprovedParticipant = event.participants.length > 0;

    if (!isOrganizer && !isApprovedParticipant) {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập kênh trao đổi này'
      });
    }

    if (!event.communicationChannel) {
      return res.status(404).json({
        error: 'Kênh trao đổi chưa được tạo cho sự kiện này'
      });
    }

    res.json({
      channel: {
        id: event.communicationChannel.id,
        eventId: event.id,
        eventTitle: event.title,
        createdAt: event.communicationChannel.createdAt,
        permissions: {
          isOrganizer,
          canModerate: isOrganizer,
          canPost: true,
          canComment: true
        }
      }
    });
  } catch (error) {
    console.error('Get event channel error:', error);
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
    const skip = (page - 1) * limit;

    const posts = await prisma.channelPost.findMany({
      where: { channelId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalCount = await prisma.channelPost.count({
      where: { channelId }
    });

    res.json({
      posts: posts.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: post.likes.length,
        isLiked: post.likes.some(like => like.userId === req.user.id),
        commentsCount: post.comments.length,
        comments: post.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: comment.author,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt
        }))
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      },
      channelInfo: {
        eventTitle: req.channel.event.title,
        permissions: {
          isOrganizer: req.isOrganizer,
          canModerate: req.isOrganizer
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

    const { content, imageUrl } = value;

    // Create post
    const post = await prisma.channelPost.create({
      data: {
        channelId,
        authorId: req.user.id,
        content,
        imageUrl: imageUrl || null
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        likes: true,
        comments: true
      }
    });

    // Emit real-time event to all channel participants
    const io = req.app.get('io');
    io.to(`event-${req.channel.event.id}`).emit('new-post', {
      channelId,
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        comments: []
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bài viết đã được đăng thành công',
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        comments: []
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

    // Check if post exists and user has access to its channel
    const post = await prisma.channelPost.findUnique({
      where: { id: postId },
      include: {
        channel: {
          include: {
            event: {
              include: {
                participants: {
                  where: {
                    volunteerId: userId,
                    status: 'APPROVED'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        error: 'Không tìm thấy bài viết'
      });
    }

    // Check access permissions
    const isOrganizer = post.channel.event.organizerId === userId;
    const isApprovedParticipant = post.channel.event.participants.length > 0;

    if (!isOrganizer && !isApprovedParticipant) {
      return res.status(403).json({
        error: 'Bạn không có quyền truy cập bài viết này'
      });
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    let action;
    let likesCount;

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      });
      action = 'unliked';
      likesCount = await prisma.postLike.count({ where: { postId } });
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId,
          userId
        }
      });
      action = 'liked';
      likesCount = await prisma.postLike.count({ where: { postId } });
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`event-${post.channel.event.id}`).emit('post-liked', {
      postId,
      userId,
      action,
      likesCount
    });

    res.json({
      success: true,
      action,
      likesCount,
      isLiked: action === 'liked'
    });
  } catch (error) {
    console.error('Like post error:', error);
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

    const { content } = value;

    // Check if post exists and user has access
    const post = await prisma.channelPost.findUnique({
      where: { id: postId },
      include: {
        channel: {
          include: {
            event: {
              include: {
                participants: {
                  where: {
                    volunteerId: userId,
                    status: 'APPROVED'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        error: 'Không tìm thấy bài viết'
      });
    }

    // Check access permissions
    const isOrganizer = post.channel.event.organizerId === userId;
    const isApprovedParticipant = post.channel.event.participants.length > 0;

    if (!isOrganizer && !isApprovedParticipant) {
      return res.status(403).json({
        error: 'Bạn không có quyền bình luận bài viết này'
      });
    }

    // Create comment
    const comment = await prisma.postComment.create({
      data: {
        postId,
        authorId: userId,
        content
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`event-${post.channel.event.id}`).emit('new-comment', {
      postId,
      comment: {
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bình luận đã được thêm thành công',
      comment: {
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
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

    // Get post with channel and event info
    const post = await prisma.channelPost.findUnique({
      where: { id: postId },
      include: {
        channel: {
          include: {
            event: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        error: 'Không tìm thấy bài viết'
      });
    }

    // Check if user is post author or event organizer (moderator)
    const isAuthor = post.authorId === userId;
    const isOrganizer = post.channel.event.organizerId === userId;

    if (!isAuthor && !isOrganizer) {
      return res.status(403).json({
        error: 'Bạn không có quyền xóa bài viết này'
      });
    }

    // Delete post (cascade will handle likes and comments)
    await prisma.channelPost.delete({
      where: { id: postId }
    });

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`event-${post.channel.event.id}`).emit('post-deleted', {
      postId,
      deletedBy: userId
    });

    res.json({
      success: true,
      message: 'Bài viết đã được xóa thành công'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: 'Lỗi khi xóa bài viết'
    });
  }
});

export default router;