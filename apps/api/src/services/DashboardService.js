import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class DashboardService {
  // Get dashboard data based on user role
  async getDashboardData(user) {
    try {
      const dashboardData = {
        message: 'Dashboard VolunteerHub',
        user: user,
        widgets: {
          upcomingEvents: await this.getUpcomingEvents(user),
          recentActivity: await this.getRecentActivity(user),
          newlyPublishedEvents: await this.getNewlyPublishedEvents(),
          trendingEvents: await this.getTrendingEvents(),
          recentPosts: await this.getRecentPosts(),
          trendingPosts: await this.getTrendingPosts()
        }
      };

      // Add role-specific data
      switch (user.role) {
        case 'VOLUNTEER':
          dashboardData.quickActions = [
            'Tìm kiếm sự kiện',
            'Xem lịch sử tham gia', 
            'Cập nhật hồ sơ'
          ];
          dashboardData.roleSpecific = await this.getVolunteerStats(user.id);
          break;
        case 'ORGANIZER':
          dashboardData.quickActions = [
            'Tạo sự kiện mới',
            'Quản lý đăng ký',
            'Xem báo cáo'
          ];
          dashboardData.roleSpecific = await this.getOrganizerStats(user.id);
          break;
        case 'ADMIN':
          dashboardData.quickActions = [
            'Duyệt sự kiện',
            'Quản lý người dùng',
            'Xem thống kê'
          ];
          dashboardData.roleSpecific = await this.getAdminStats();
          break;
      }

      return dashboardData;
    } catch (error) {
      console.error('DashboardService.getDashboardData error:', error);
      throw new Error('DASHBOARD_ERROR');
    }
  }

  // Get upcoming events based on user role
  async getUpcomingEvents(user) {
    try {
      const currentDate = new Date();
      
      if (user.role === 'VOLUNTEER') {
        // Get events the volunteer is registered for
        const registrations = await prisma.eventParticipant.findMany({
          where: {
            volunteerId: user.id,
            status: 'APPROVED',
            event: {
              startDate: { gte: currentDate },
              status: 'APPROVED'
            }
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                location: true
              }
            }
          },
          take: 5,
          orderBy: { event: { startDate: 'asc' } }
        });
        
        return registrations.map(reg => reg.event);
      } else if (user.role === 'ORGANIZER') {
        // Get organizer's upcoming events
        return await prisma.event.findMany({
          where: {
            organizerId: user.id,
            startDate: { gte: currentDate },
            status: { in: ['APPROVED', 'PENDING'] }
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            status: true
          },
          take: 5,
          orderBy: { startDate: 'asc' }
        });
      } else {
        // Admin sees all upcoming approved events
        return await prisma.event.findMany({
          where: {
            startDate: { gte: currentDate },
            status: 'APPROVED'
          },
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            organizer: {
              select: { 
                firstName: true,
                lastName: true
              }
            }
          },
          take: 5,
          orderBy: { startDate: 'asc' }
        });
      }
    } catch (error) {
      console.error('DashboardService.getUpcomingEvents error:', error);
      return [];
    }
  }

  // Get recent activity for the user
  async getRecentActivity(user) {
    try {
      if (user.role === 'VOLUNTEER') {
        // Get recent registrations and status changes
        const recentRegistrations = await prisma.eventParticipant.findMany({
          where: { volunteerId: user.id },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true
              }
            }
          },
          take: 5,
          orderBy: { registeredAt: 'desc' }
        });
        
        return recentRegistrations.map(reg => ({
          type: 'registration',
          message: `Đăng ký sự kiện: ${reg.event.title}`,
          date: reg.registeredAt,
          status: reg.status
        }));
      }
      
      // TODO: Implement activity tracking for other roles
      return [];
    } catch (error) {
      console.error('DashboardService.getRecentActivity error:', error);
      return [];
    }
  }

  // Get trending events based on recent registrations
  async getTrendingEvents() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const trendingEvents = await prisma.event.findMany({
        where: {
          status: 'APPROVED',
          startDate: { gte: new Date() }
        },
        include: {
          _count: {
            select: {
              participants: {
                where: {
                  registeredAt: { gte: oneWeekAgo }
                }
              }
            }
          }
        },
        orderBy: {
          participants: {
            _count: 'desc'
          }
        },
        take: 5
      });

      return trendingEvents.map(event => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        location: event.location,
        recentRegistrations: event._count.participants
      }));
    } catch (error) {
      console.error('DashboardService.getTrendingEvents error:', error);
      return [];
    }
  }

  // Get volunteer-specific statistics
  async getVolunteerStats(userId) {
    try {
      const currentDate = new Date();
      
      const [totalRegistrations, completedEvents, upcomingEvents] = await Promise.all([
        prisma.eventParticipant.count({
          where: { volunteerId: userId, status: 'APPROVED' }
        }),
        prisma.eventParticipant.count({
          where: {
            volunteerId: userId,
            status: 'APPROVED',
            event: {
              endDate: { lt: currentDate }
            }
          }
        }),
        prisma.eventParticipant.count({
          where: {
            volunteerId: userId,
            status: 'APPROVED',
            event: {
              startDate: { gte: currentDate }
            }
          }
        })
      ]);

      return {
        participationStats: {
          totalEvents: totalRegistrations,
          completedEvents,
          upcomingEvents
        }
      };
    } catch (error) {
      console.error('DashboardService.getVolunteerStats error:', error);
      return {
        participationStats: {
          totalEvents: 0,
          completedEvents: 0,
          upcomingEvents: 0
        }
      };
    }
  }

  // Get organizer-specific statistics
  async getOrganizerStats(userId) {
    try {
      const currentDate = new Date();
      
      const [totalEvents, pendingApproval, activeEvents] = await Promise.all([
        prisma.event.count({
          where: { organizerId: userId }
        }),
        prisma.event.count({
          where: { organizerId: userId, status: 'PENDING' }
        }),
        prisma.event.count({
          where: {
            organizerId: userId,
            status: 'APPROVED',
            startDate: { gte: currentDate }
          }
        })
      ]);

      return {
        eventStats: {
          totalEvents,
          pendingApproval,
          activeEvents
        }
      };
    } catch (error) {
      console.error('DashboardService.getOrganizerStats error:', error);
      return {
        eventStats: {
          totalEvents: 0,
          pendingApproval: 0,
          activeEvents: 0
        }
      };
    }
  }

  // Get admin-specific statistics
  async getAdminStats() {
    try {
      const [totalUsers, pendingEvents, totalEvents] = await Promise.all([
        prisma.user.count(),
        prisma.event.count({
          where: { status: 'PENDING' }
        }),
        prisma.event.count()
      ]);

      return {
        systemStats: {
          totalUsers,
          pendingEvents,
          totalEvents
        }
      };
    } catch (error) {
      console.error('DashboardService.getAdminStats error:', error);
      return {
        systemStats: {
          totalUsers: 0,
          pendingEvents: 0,
          totalEvents: 0
        }
      };
    }
  }

  // Get newly published events (recently approved events)
  async getNewlyPublishedEvents() {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const newEvents = await prisma.event.findMany({
        where: {
          status: 'APPROVED',
          approvedAt: { gte: threeDaysAgo },
          startDate: { gte: new Date() } // Only upcoming events
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          startDate: true,
          endDate: true,
          category: true,
          capacity: true,
          approvedAt: true,
          organizer: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              participants: {
                where: { status: 'APPROVED' }
              }
            }
          },
          communicationChannel: {
            select: {
              id: true,
              _count: {
                select: {
                  posts: true
                }
              }
            }
          }
        },
        orderBy: { approvedAt: 'desc' },
        take: 10
      });

      return newEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        category: event.category,
        capacity: event.capacity,
        approvedAt: event.approvedAt,
        organizer: event.organizer,
        participantCount: event._count.participants,
        postCount: event.communicationChannel?._count.posts || 0,
        type: 'event'
      }));
    } catch (error) {
      console.error('DashboardService.getNewlyPublishedEvents error:', error);
      return [];
    }
  }

  // Get trending events (based on recent activity: new members, posts, likes, comments)
  async getTrendingEvents() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Get events with recent activity
      const events = await prisma.event.findMany({
        where: {
          status: 'APPROVED',
          startDate: { gte: new Date() } // Only upcoming events
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          startDate: true,
          endDate: true,
          category: true,
          capacity: true,
          organizer: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              participants: {
                where: { 
                  status: 'APPROVED',
                  registeredAt: { gte: oneWeekAgo }
                }
              }
            }
          },
          communicationChannel: {
            select: {
              id: true,
              posts: {
                where: {
                  createdAt: { gte: oneWeekAgo }
                },
                select: {
                  id: true,
                  _count: {
                    select: {
                      likes: true,
                      comments: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // Calculate engagement score for each event
      const eventsWithScore = events.map(event => {
        const recentParticipants = event._count.participants;
        const recentPosts = event.communicationChannel?.posts.length || 0;
        const recentLikes = event.communicationChannel?.posts.reduce(
          (sum, post) => sum + post._count.likes, 0
        ) || 0;
        const recentComments = event.communicationChannel?.posts.reduce(
          (sum, post) => sum + post._count.comments, 0
        ) || 0;

        // Engagement score formula: weighted sum
        const engagementScore = 
          (recentParticipants * 5) +  // New members weight: 5
          (recentPosts * 3) +          // New posts weight: 3
          (recentLikes * 1) +          // Likes weight: 1
          (recentComments * 2);        // Comments weight: 2

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          startDate: event.startDate,
          endDate: event.endDate,
          category: event.category,
          capacity: event.capacity,
          organizer: event.organizer,
          engagementScore,
          recentActivity: {
            newMembers: recentParticipants,
            newPosts: recentPosts,
            likes: recentLikes,
            comments: recentComments
          },
          type: 'event'
        };
      });

      // Sort by engagement score and return top 10
      return eventsWithScore
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10);
    } catch (error) {
      console.error('DashboardService.getTrendingEvents error:', error);
      return [];
    }
  }

  // Get recent posts from all event channels
  async getRecentPosts() {
    try {
      const recentPosts = await prisma.channelPost.findMany({
        where: {
          channel: {
            event: {
              status: 'APPROVED'
            }
          }
        },
        select: {
          id: true,
          content: true,
          imageUrl: true,
          createdAt: true,
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
            select: {
              event: {
                select: {
                  id: true,
                  title: true,
                  category: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return recentPosts.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.author,
        event: post.channel.event,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        type: 'post'
      }));
    } catch (error) {
      console.error('DashboardService.getRecentPosts error:', error);
      return [];
    }
  }

  // Get trending posts (based on likes and comments)
  async getTrendingPosts() {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const posts = await prisma.channelPost.findMany({
        where: {
          createdAt: { gte: threeDaysAgo },
          channel: {
            event: {
              status: 'APPROVED'
            }
          }
        },
        select: {
          id: true,
          content: true,
          imageUrl: true,
          createdAt: true,
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
            select: {
              event: {
                select: {
                  id: true,
                  title: true,
                  category: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      });

      // Calculate engagement score for each post
      const postsWithScore = posts.map(post => {
        const engagementScore = 
          (post._count.likes * 1) +      // Likes weight: 1
          (post._count.comments * 3);    // Comments weight: 3 (more valuable)

        return {
          id: post.id,
          content: post.content,
          imageUrl: post.imageUrl,
          createdAt: post.createdAt,
          author: post.author,
          event: post.channel.event,
          likeCount: post._count.likes,
          commentCount: post._count.comments,
          engagementScore,
          type: 'post'
        };
      });

      // Sort by engagement score and return top 10
      return postsWithScore
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10);
    } catch (error) {
      console.error('DashboardService.getTrendingPosts error:', error);
      return [];
    }
  }
}

export default new DashboardService();