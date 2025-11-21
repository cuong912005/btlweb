import { PrismaClient } from '@prisma/client';
import { deleteCloudinaryImage, extractPublicId } from '../config/cloudinary.js';
import NotificationService from './NotificationService.js';

const prisma = new PrismaClient();

class ChannelService {
  // Check if user has access to channel
  async checkChannelAccess(channelId, userId) {
    const channel = await prisma.communicationChannel.findUnique({
      where: { id: channelId },
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true }
            },
            participants: {
              where: { 
                volunteerId: userId,
                status: 'APPROVED'
              },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!channel) {
      throw new Error('CHANNEL_NOT_FOUND');
    }

    // Check access: organizer or approved participant - FIX: Use channel.event.organizer.id
    const isOrganizer = channel.event.organizer.id === userId;
    const isApprovedParticipant = channel.event.participants.length > 0;

    if (!isOrganizer && !isApprovedParticipant) {
      throw new Error('ACCESS_DENIED');
    }

    return {
      channel,
      isOrganizer,
      canModerate: isOrganizer
    };
  }

  // Get channel posts with pagination
  async getChannelPosts(channelId, userId, page = 1, limit = 20) {
    // Check access first
    await this.checkChannelAccess(channelId, userId);

    const skip = (page - 1) * limit;

    // Get channel with event info to determine organizer
    const channel = await prisma.communicationChannel.findUnique({
      where: { id: channelId },
      select: {
        event: {
          select: {
            organizerId: true
          }
        }
      }
    });

    const posts = await prisma.channelPost.findMany({
      where: { channelId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true
          }
        },
        likes: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
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
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalCount = await prisma.channelPost.count({
      where: { channelId }
    });

    const organizerId = channel?.event?.organizerId;

    return {
      posts: posts.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        author: {
          ...post.author,
          // Determine role in event context: if author is organizer, show ORGANIZER, else show their actual role
          roleInEvent: post.author.id === organizerId ? 'ORGANIZER' : 'VOLUNTEER'
        },
        likes: post.likes,
        comments: post.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: {
            ...comment.author,
            roleInEvent: comment.author.id === organizerId ? 'ORGANIZER' : 'VOLUNTEER'
          },
          createdAt: comment.createdAt
        })),
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLikedByUser: post.likes.some(like => like.userId === userId),
        canEdit: post.authorId === userId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      }
    };
  }

  // Create new post
  async createPost(channelId, userId, postData) {
    const { content, imageUrl } = postData;

    // Check access
    const { channel } = await this.checkChannelAccess(channelId, userId);

    const post = await prisma.channelPost.create({
      data: {
        channelId,
        authorId: userId,
        content,
        imageUrl: imageUrl || null
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true
          }
        },
        channel: {
          include: {
            event: {
              select: {
                organizerId: true
              }
            }
          }
        }
      }
    });

    const organizerId = post.channel?.event?.organizerId;

    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      author: {
        ...post.author,
        roleInEvent: post.author.id === organizerId ? 'ORGANIZER' : 'VOLUNTEER'
      },
      likes: [],
      comments: [],
      likeCount: 0,
      commentCount: 0,
      isLikedByUser: false,
      canEdit: true,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      event: post.channel.event
    };
  }

  // Like/unlike post
  async togglePostLike(postId, userId) {
    const post = await prisma.channelPost.findUnique({
      where: { id: postId },
      include: {
        channel: {
          include: {
            event: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!post) {
      throw new Error('POST_NOT_FOUND');
    }

    // Check channel access
    await this.checkChannelAccess(post.channelId, userId);

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });

    let isLiked;
    if (existingLike) {
      // Remove like
      await prisma.postLike.delete({
        where: { id: existingLike.id }
      });
      isLiked = false;
    } else {
      // Add like
      await prisma.postLike.create({
        data: { postId, userId }
      });
      isLiked = true;
    }

    // Get updated like count and likes
    const updatedPost = await prisma.channelPost.findUnique({
      where: { id: postId },
      include: {
        likes: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: { likes: true }
        }
      }
    });

    return {
      postId,
      isLiked,
      likeCount: updatedPost._count.likes,
      likes: updatedPost.likes.map(like => ({
        id: like.id,
        user: like.user
      })),
      eventId: post.channel.event.id
    };
  }

  // Add comment to post
  async addComment(postId, userId, commentData) {
    const { content } = commentData;

    const post = await prisma.channelPost.findUnique({
      where: { id: postId },
      include: {
        channel: {
          include: {
            event: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!post) {
      throw new Error('POST_NOT_FOUND');
    }

    // Check channel access
    await this.checkChannelAccess(post.channelId, userId);

    // Get organizer ID for role determination
    const channel = await prisma.communicationChannel.findUnique({
      where: { id: post.channelId },
      select: {
        event: {
          select: {
            organizerId: true
          }
        }
      }
    });

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
            avatar: true,
            role: true
          }
        }
      }
    });

    const organizerId = channel?.event?.organizerId;

    return {
      id: comment.id,
      content: comment.content,
      author: {
        ...comment.author,
        roleInEvent: comment.author.id === organizerId ? 'ORGANIZER' : 'VOLUNTEER'
      },
      createdAt: comment.createdAt,
      postId,
      eventId: post.channel.event.id
    };
  }

  // Delete post (author or moderator only)
  async deletePost(postId, userId) {
    const post = await prisma.channelPost.findUnique({
      where: { id: postId },
      include: {
        channel: {
          include: {
            event: {
              select: {
                id: true,
                organizerId: true,
                organizer: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!post) {
      throw new Error('POST_NOT_FOUND');
    }

    // Check if user can delete (author or organizer) - Can use organizerId directly here
    const isAuthor = post.authorId === userId;
    const isOrganizer = post.channel.event.organizerId === userId;

    if (!isAuthor && !isOrganizer) {
      throw new Error('DELETE_PERMISSION_DENIED');
    }

    // If post has image, extract Cloudinary public ID and delete from Cloudinary
    if (post.imageUrl) {
      try {
        const publicId = extractPublicId(post.imageUrl, 'volunteerhub/channel-images');
        if (publicId) {
          await deleteCloudinaryImage(publicId);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with post deletion even if image deletion fails
      }
    }

    await prisma.channelPost.delete({
      where: { id: postId }
    });

    return {
      postId,
      eventId: post.channel.event.id,
      deletedBy: userId,
      deletedAt: new Date()
    };
  }

  // Get channel info by event ID
  async getChannelByEventId(eventId, userId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true }
        },
        participants: {
          where: {
            volunteerId: userId,
            status: 'APPROVED'
          },
          select: { id: true }
        },
        communicationChannel: true
      }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    if (event.status !== 'APPROVED') {
      throw new Error('EVENT_NOT_APPROVED');
    }

    // Check permissions - FIX: Use event.organizer.id instead of event.organizerId
    const isOrganizer = event.organizer.id === userId;
    const isApprovedParticipant = event.participants.length > 0;

    if (!isOrganizer && !isApprovedParticipant) {
      throw new Error('ACCESS_DENIED');
    }

    if (!event.communicationChannel) {
      throw new Error('CHANNEL_NOT_CREATED');
    }

    return {
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
    };
  }

  // Get channel info
  async getChannelInfo(channelId, userId) {
    const accessInfo = await this.checkChannelAccess(channelId, userId);

    return {
      id: accessInfo.channel.id,
      eventId: accessInfo.channel.eventId,
      event: {
        id: accessInfo.channel.event.id,
        title: accessInfo.channel.event.title,
        organizer: accessInfo.channel.event.organizer
      },
      userPermissions: {
        canPost: true,
        canComment: true,
        canLike: true,
        canModerate: accessInfo.canModerate
      },
      createdAt: accessInfo.channel.createdAt
    };
  }
}

export default new ChannelService();