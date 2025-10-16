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
          trendingEvents: await this.getTrendingEvents()
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
}

export default new DashboardService();