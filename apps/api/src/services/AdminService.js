import { PrismaClient } from '@prisma/client';
import NotificationService from './NotificationService.js';

const prisma = new PrismaClient();

class AdminService {
  async getPendingEvents() {
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

    return pendingEvents.map(event => ({
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
    }));
  }

  async approveOrRejectEvent(eventId, action, reason, adminUserId) {
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
      throw new Error('EVENT_NOT_FOUND');
    }

    if (event.status !== 'PENDING') {
      throw new Error('EVENT_ALREADY_PROCESSED');
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
          approvedBy: adminUserId
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

    // Story 4.2.5: Notify organizer about event status change
    try {
      await NotificationService.notifyOrganizerEventStatus(eventId, newStatus);
    } catch (notificationError) {
      console.error('Failed to notify organizer of event status change:', notificationError);
      // Don't fail the approval/rejection if notification fails
    }

    return {
      id: updatedEvent.id,
      title: updatedEvent.title,
      status: updatedEvent.status,
      approvedAt: updatedEvent.approvedAt,
      rejectionReason: updatedEvent.rejectionReason,
      organizer: updatedEvent.organizer
    };
  }

  async bulkApproveOrRejectEvents(eventIds, action, reason, adminUserId) {
    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      throw new Error('INVALID_EVENT_IDS');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new Error('INVALID_ACTION');
    }

    if (action === 'reject' && (!reason || reason.trim().length < 10)) {
      throw new Error('REJECTION_REASON_REQUIRED');
    }

    // Get pending events
    const pendingEvents = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        status: 'PENDING'
      }
    });

    if (pendingEvents.length === 0) {
      throw new Error('NO_PENDING_EVENTS');
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
          approvedBy: adminUserId
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

    return results;
  }

  async getApprovalHistory(page = 1, limit = 20, status = null) {
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

    return {
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
    };
  }

  // Story 5.2: Export events list
  async exportEvents() {
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        participants: {
          where: {
            status: 'APPROVED'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return events.map(event => ({
      id: event.id,
      title: event.title,
      organizer: `${event.organizer.firstName} ${event.organizer.lastName}`,
      organizerEmail: event.organizer.email,
      startDate: event.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      endDate: event.endDate.toISOString().split('T')[0],
      location: event.location,
      category: event.category,
      status: event.status,
      capacity: event.capacity || 'Không giới hạn',
      participantCount: event.participants.length,
      createdAt: event.createdAt.toISOString().split('T')[0],
      description: event.description.substring(0, 100) + (event.description.length > 100 ? '...' : '')
    }));
  }

  // Story 5.2: Export volunteers list
  async exportVolunteers() {
    const volunteers = await prisma.user.findMany({
      where: {
        role: 'VOLUNTEER'
      },
      include: {
        participations: {
          where: {
            status: 'APPROVED'
          },
          include: {
            event: {
              select: {
                title: true,
                startDate: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return volunteers.map(volunteer => ({
      id: volunteer.id,
      name: `${volunteer.firstName} ${volunteer.lastName}`,
      email: volunteer.email,
      phone: volunteer.phone || 'Chưa cập nhật',
      location: volunteer.location || 'Chưa cập nhật',
      registrationDate: volunteer.createdAt.toISOString().split('T')[0],
      eventsParticipated: volunteer.participations.length,
      recentEvents: volunteer.participations
        .slice(0, 3)
        .map(p => p.event.title)
        .join('; ') || 'Chưa tham gia sự kiện nào',
      lastActivity: volunteer.participations.length > 0 
        ? volunteer.participations[0].event.startDate.toISOString().split('T')[0]
        : 'Chưa có hoạt động'
    }));
  }

  // Story 5.2: Convert data to CSV format with Vietnamese encoding support
  convertToCSV(data, type) {
    if (!data || data.length === 0) {
      return type === 'events' 
        ? 'ID,Tên sự kiện,Người tổ chức,Email người tổ chức,Ngày bắt đầu,Ngày kết thúc,Địa điểm,Danh mục,Trạng thái,Sức chứa,Số người tham gia,Ngày tạo,Mô tả\n'
        : 'ID,Họ tên,Email,Số điện thoại,Địa chỉ,Ngày đăng ký,Số sự kiện tham gia,Sự kiện gần đây,Hoạt động cuối\n';
    }

    const headers = type === 'events' 
      ? ['ID', 'Tên sự kiện', 'Người tổ chức', 'Email người tổ chức', 'Ngày bắt đầu', 'Ngày kết thúc', 'Địa điểm', 'Danh mục', 'Trạng thái', 'Sức chứa', 'Số người tham gia', 'Ngày tạo', 'Mô tả']
      : ['ID', 'Họ tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Ngày đăng ký', 'Số sự kiện tham gia', 'Sự kiện gần đây', 'Hoạt động cuối'];

    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = type === 'events' 
        ? [
            row.id,
            `"${row.title.replace(/"/g, '""')}"`,
            `"${row.organizer.replace(/"/g, '""')}"`,
            row.organizerEmail,
            row.startDate,
            row.endDate,
            `"${row.location.replace(/"/g, '""')}"`,
            `"${row.category.replace(/"/g, '""')}"`,
            row.status,
            row.capacity,
            row.participantCount,
            row.createdAt,
            `"${row.description.replace(/"/g, '""')}"`
          ]
        : [
            row.id,
            `"${row.name.replace(/"/g, '""')}"`,
            row.email,
            `"${row.phone.replace(/"/g, '""')}"`,
            `"${row.location.replace(/"/g, '""')}"`,
            row.registrationDate,
            row.eventsParticipated,
            `"${row.recentEvents.replace(/"/g, '""')}"`,
            row.lastActivity
          ];

      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}

export default new AdminService();