import { PrismaClient } from '@prisma/client';
import NotificationService from './NotificationService.js';

const prisma = new PrismaClient();

class EventService {
  // Get all approved events with filtering and enhanced search
  async getApprovedEvents(filters = {}) {
    const { 
      category, 
      location, 
      search, 
      startDate, 
      endDate, 
      sortBy = 'date',
      sortOrder = 'asc',
      page = 1, 
      limit = 20,
      availability = 'all' // all, available, full
    } = filters;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where conditions
    const where = {
      status: 'APPROVED',
      startDate: {
        gte: new Date() // Only future events
      }
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (location && location.trim()) {
      where.location = {
        contains: location.trim(),
        mode: 'insensitive'
      };
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { location: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    if (startDate) {
      where.startDate.gte = new Date(startDate);
    }

    if (endDate) {
      where.startDate.lte = new Date(endDate);
    }

    // Build sorting options
    let orderBy = [];
    switch (sortBy) {
      case 'date':
        orderBy.push({ startDate: sortOrder });
        break;
      case 'title':
        orderBy.push({ title: sortOrder });
        break;
      case 'popularity':
        orderBy.push({ 
          participants: { 
            _count: sortOrder 
          } 
        });
        break;
      case 'created':
        orderBy.push({ createdAt: sortOrder });
        break;
      default:
        orderBy.push({ startDate: 'asc' }, { createdAt: 'desc' });
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        participants: {
          where: { status: 'APPROVED' },
          select: { id: true }
        },
        _count: {
          select: {
            participants: {
              where: { status: 'APPROVED' }
            }
          }
        }
      },
      orderBy,
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalCount = await prisma.event.count({ where });

    // Filter by availability if specified
    let filteredEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      capacity: event.capacity,
      category: event.category,
      organizer: {
        id: event.organizer.id,
        name: `${event.organizer.firstName} ${event.organizer.lastName}`,
        firstName: event.organizer.firstName,
        lastName: event.organizer.lastName,
        email: event.organizer.email
      },
      participantCount: event._count.participants,
      availableSpots: event.capacity ? event.capacity - event._count.participants : null,
      isFull: event.capacity ? event._count.participants >= event.capacity : false,
      isAvailable: event.capacity ? event._count.participants < event.capacity : true,
      createdAt: event.createdAt,
      status: event.status
    }));

    // Apply availability filter
    if (availability === 'available') {
      filteredEvents = filteredEvents.filter(event => event.isAvailable);
    } else if (availability === 'full') {
      filteredEvents = filteredEvents.filter(event => event.isFull);
    }

    return {
      success: true,
      events: filteredEvents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit)
      },
      filters: {
        category,
        location,
        search,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        availability
      }
    };
  }

  // Get event by ID with full details
  async getEventById(eventId, userId = null) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        participants: {
          include: {
            volunteer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { registeredAt: 'desc' }
        },
        communicationChannel: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            participants: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    // Check if user is registered
    let userRegistration = null;
    if (userId) {
      userRegistration = event.participants.find(p => p.volunteer.id === userId);
    }

    return {
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
      participants: event.participants.map(p => ({
        id: p.id,
        volunteer: p.volunteer,
        status: p.status,
        registeredAt: p.registeredAt,
        completedAt: p.completedAt
      })),
      participantCount: event._count.participants,
      availableSpots: event.capacity ? event.capacity - event._count.participants : null,
      isFull: event.capacity ? event._count.participants >= event.capacity : false,
      communicationChannelId: event.communicationChannel?.id,
      userRegistration,
      isUserRegistered: !!userRegistration,
      canUserRegister: userId && !userRegistration && event.status === 'APPROVED' && 
                      (!event.capacity || event._count.participants < event.capacity),
      createdAt: event.createdAt
    };
  }

  // Create new event (organizer only)
  async createEvent(eventData, organizerId) {
    const { title, description, location, startDate, endDate, capacity, category } = eventData;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start <= now) {
      throw new Error('START_DATE_MUST_BE_FUTURE');
    }

    if (end <= start) {
      throw new Error('END_DATE_MUST_BE_AFTER_START');
    }

    // Create event with pending status
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: start,
        endDate: end,
        capacity: capacity || null,
        category,
        organizerId,
        status: 'PENDING'
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

    // Story 4.2.2: Notify admins about new event requiring approval
    try {
      await NotificationService.notifyAdminNewEvent(event.id);
    } catch (notificationError) {
      console.error('Failed to notify admins of new event:', notificationError);
      // Don't fail the event creation if notification fails
    }

    return {
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
    };
  }

  // Register volunteer for event
  async registerForEvent(eventId, volunteerId) {
    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            participants: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    if (event.status !== 'APPROVED') {
      throw new Error('EVENT_NOT_APPROVED');
    }

    // Check if event is full
    if (event.capacity && event._count.participants >= event.capacity) {
      throw new Error('EVENT_FULL');
    }

    // Check if already registered
    const existingRegistration = await prisma.eventParticipant.findUnique({
      where: {
        eventId_volunteerId: {
          eventId,
          volunteerId
        }
      }
    });

    if (existingRegistration) {
      throw new Error('ALREADY_REGISTERED');
    }

    // Create registration
    const registration = await prisma.eventParticipant.create({
      data: {
        eventId,
        volunteerId,
        status: 'PENDING' // Organizer needs to approve
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
            organizer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        volunteer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Story 4.2.3: Notify organizer about new registration
    try {
      await NotificationService.notifyOrganizerNewRegistration(eventId, volunteerId);
    } catch (notificationError) {
      console.error('Failed to notify organizer of new registration:', notificationError);
      // Don't fail the registration if notification fails
    }

    return {
      id: registration.id,
      status: registration.status,
      registeredAt: registration.registeredAt,
      event: registration.event,
      volunteer: registration.volunteer
    };
  }

  // Get user's event registrations for their dashboard
  async getUserRegistrations(userId, status = null) {
    const where = { volunteerId: userId };
    
    if (status) {
      where.status = status;
    }

    const registrations = await prisma.eventParticipant.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            category: true,
            status: true,
            organizer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    return registrations.map(reg => ({
      id: reg.id,
      status: reg.status,
      registeredAt: reg.registeredAt,
      completedAt: reg.completedAt,
      event: reg.event
    }));
  }

  // Cancel registration (volunteer only, before event starts)
  async cancelRegistration(registrationId, userId) {
    const registration = await prisma.eventParticipant.findUnique({
      where: { id: registrationId },
      include: {
        event: {
          select: {
            title: true,
            startDate: true
          }
        }
      }
    });

    if (!registration) {
      throw new Error('REGISTRATION_NOT_FOUND');
    }

    if (registration.volunteerId !== userId) {
      throw new Error('NOT_YOUR_REGISTRATION');
    }

    // Check if event hasn't started yet
    const now = new Date();
    if (registration.event.startDate <= now) {
      throw new Error('EVENT_ALREADY_STARTED');
    }

    // Delete the registration
    await prisma.eventParticipant.delete({
      where: { id: registrationId }
    });

    return {
      success: true,
      message: 'Đã hủy đăng ký thành công',
      event: registration.event
    };
  }

  // Get organizer's events
  async getOrganizerEvents(organizerId, status = null) {
    const where = { organizerId };
    
    if (status) {
      where.status = status;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      capacity: event.capacity,
      category: event.category,
      status: event.status,
      participantCount: event._count.participants,
      createdAt: event.createdAt
    }));
  }

  // Get event participants for organizer management
  async getEventParticipants(eventId, organizerId) {
    // Verify organizer owns this event
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        organizerId 
      },
      select: {
        id: true,
        title: true,
        capacity: true,
        startDate: true,
        endDate: true,
        _count: {
          select: {
            participants: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND_OR_NOT_OWNER');
    }

    const participants = await prisma.eventParticipant.findMany({
      where: { eventId },
      include: {
        volunteer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            bio: true
          }
        }
      },
      orderBy: { registeredAt: 'asc' }
    });

    return {
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity,
        startDate: event.startDate,
        endDate: event.endDate,
        approvedCount: event._count.participants,
        availableSpots: event.capacity ? event.capacity - event._count.participants : null
      },
      participants: participants.map(p => ({
        id: p.id,
        volunteer: p.volunteer,
        status: p.status,
        registeredAt: p.registeredAt,
        completedAt: p.completedAt
      })),
      summary: {
        total: participants.length,
        pending: participants.filter(p => p.status === 'PENDING').length,
        approved: participants.filter(p => p.status === 'APPROVED').length,
        rejected: participants.filter(p => p.status === 'REJECTED').length
      }
    };
  }

  // Approve/reject participant with reason
  async updateParticipantStatus(participantId, status, organizerId, reason = null) {
    const participant = await prisma.eventParticipant.findUnique({
      where: { id: participantId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            organizerId: true,
            capacity: true,
            _count: {
              select: {
                participants: {
                  where: { status: 'APPROVED' }
                }
              }
            }
          }
        },
        volunteer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!participant) {
      throw new Error('PARTICIPANT_NOT_FOUND');
    }

    if (participant.event.organizerId !== organizerId) {
      throw new Error('NOT_EVENT_ORGANIZER');
    }

    // Check capacity if approving
    if (status === 'APPROVED' && participant.event.capacity) {
      if (participant.event._count.participants >= participant.event.capacity) {
        throw new Error('EVENT_FULL');
      }
    }

    // Validate rejection reason
    if (status === 'REJECTED' && !reason?.trim()) {
      throw new Error('REJECTION_REASON_REQUIRED');
    }

    const updatedParticipant = await prisma.eventParticipant.update({
      where: { id: participantId },
      data: { 
        status,
        rejectionReason: status === 'REJECTED' ? reason?.trim() : null
      },
      include: {
        volunteer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            communicationChannel: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    // Story 4.2.4: Notify volunteer about registration status change
    try {
      await NotificationService.notifyVolunteerRegistrationStatus(participantId, status);
    } catch (notificationError) {
      console.error('Failed to notify volunteer of status change:', notificationError);
      // Don't fail the status update if notification fails
    }

    return {
      id: updatedParticipant.id,
      status: updatedParticipant.status,
      rejectionReason: updatedParticipant.rejectionReason,
      volunteer: updatedParticipant.volunteer,
      event: updatedParticipant.event
    };
  }

  // Bulk approve/reject participants
  async bulkUpdateParticipantStatus(participantIds, status, organizerId, reason = null) {
    // Get all participants to verify ownership and capacity
    const participants = await prisma.eventParticipant.findMany({
      where: { 
        id: { in: participantIds },
        event: { organizerId }
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            capacity: true,
            _count: {
              select: {
                participants: {
                  where: { status: 'APPROVED' }
                }
              }
            }
          }
        }
      }
    });

    if (participants.length !== participantIds.length) {
      throw new Error('SOME_PARTICIPANTS_NOT_FOUND_OR_NOT_AUTHORIZED');
    }

    // Validate rejection reason for bulk rejection
    if (status === 'REJECTED' && !reason?.trim()) {
      throw new Error('REJECTION_REASON_REQUIRED');
    }

    // Group by event to check capacity for each event
    const eventGroups = participants.reduce((groups, p) => {
      if (!groups[p.event.id]) {
        groups[p.event.id] = { event: p.event, participants: [] };
      }
      groups[p.event.id].participants.push(p);
      return groups;
    }, {});

    // Check capacity for approvals
    if (status === 'APPROVED') {
      for (const group of Object.values(eventGroups)) {
        if (group.event.capacity) {
          const newApprovals = group.participants.filter(p => p.status !== 'APPROVED').length;
          if (group.event._count.participants + newApprovals > group.event.capacity) {
            throw new Error(`EVENT_CAPACITY_EXCEEDED_FOR_${group.event.title}`);
          }
        }
      }
    }

    // Update all participants
    const updatedParticipants = await prisma.eventParticipant.updateMany({
      where: { id: { in: participantIds } },
      data: { 
        status,
        rejectionReason: status === 'REJECTED' ? reason?.trim() : null
      }
    });

    // TODO: Send bulk notifications to volunteers
    // TODO: Grant communication channel access for approved participants

    return {
      updatedCount: updatedParticipants.count,
      status,
      reason: status === 'REJECTED' ? reason : null,
      affectedEvents: Object.keys(eventGroups)
    };
  }

  // Get organizer's all events with participant summaries
  async getOrganizerEventsWithParticipants(organizerId, status = null) {
    const where = { organizerId };
    
    if (status) {
      where.status = status;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            participants: true
          }
        },
        participants: {
          select: {
            id: true,
            status: true,
            registeredAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return events.map(event => {
      const participantSummary = event.participants.reduce((summary, p) => {
        summary[p.status.toLowerCase()] = (summary[p.status.toLowerCase()] || 0) + 1;
        return summary;
      }, { pending: 0, approved: 0, rejected: 0 });

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        capacity: event.capacity,
        category: event.category,
        status: event.status,
        participantCount: event._count.participants,
        participantSummary,
        availableSpots: event.capacity ? event.capacity - participantSummary.approved : null,
        hasNewRegistrations: participantSummary.pending > 0,
        createdAt: event.createdAt
      };
    });
  }

  // Export participant list for event day management
  async exportEventParticipants(eventId, organizerId, format = 'json') {
    const eventData = await this.getEventParticipants(eventId, organizerId);
    
    const exportData = {
      event: eventData.event,
      exportedAt: new Date(),
      participants: eventData.participants
        .filter(p => p.status === 'APPROVED')
        .map(p => ({
          name: `${p.volunteer.firstName} ${p.volunteer.lastName}`,
          email: p.volunteer.email,
          phone: p.volunteer.phone || 'Không có',
          location: p.volunteer.location || 'Không có',
          registeredAt: p.registeredAt
        }))
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['Tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Ngày đăng ký'];
      const csvRows = exportData.participants.map(p => [
        p.name,
        p.email,
        p.phone,
        p.location,
        new Date(p.registeredAt).toLocaleDateString('vi-VN')
      ]);
      
      return {
        format: 'csv',
        headers: csvHeaders,
        data: csvRows,
        filename: `participants_${eventData.event.title}_${new Date().toISOString().split('T')[0]}.csv`
      };
    }

    return {
      format: 'json',
      data: exportData,
      filename: `participants_${eventData.event.title}_${new Date().toISOString().split('T')[0]}.json`
    };
  }

  // Get volunteer's participation history with statistics (Story 3.4)
  async getVolunteerParticipationHistory(volunteerId) {
    const now = new Date();
    
    // Get all participations
    const participations = await prisma.eventParticipant.findMany({
      where: { volunteerId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            category: true,
            status: true,
            organizer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    // Categorize events
    const upcoming = participations.filter(p => 
      p.status === 'APPROVED' && 
      p.event.startDate > now && 
      p.event.status === 'APPROVED'
    );

    const completed = participations.filter(p => 
      p.status === 'APPROVED' && 
      p.event.endDate < now
    );

    const pending = participations.filter(p => p.status === 'PENDING');
    const rejected = participations.filter(p => p.status === 'REJECTED');

    // Calculate statistics
    const totalHoursVolunteered = completed.reduce((total, p) => {
      const hours = Math.ceil((new Date(p.event.endDate) - new Date(p.event.startDate)) / (1000 * 60 * 60));
      return total + hours;
    }, 0);

    const statistics = {
      totalRegistrations: participations.length,
      completedEvents: completed.length,
      upcomingEvents: upcoming.length,
      pendingApprovals: pending.length,
      rejectedApplications: rejected.length,
      totalHoursVolunteered,
      favoriteCategory: this.getFavoriteCategory(completed),
      currentStreak: this.calculateParticipationStreak(completed),
      achievements: this.calculateAchievements(completed, totalHoursVolunteered)
    };

    return {
      statistics,
      participations: {
        upcoming: upcoming.map(p => this.formatParticipation(p)),
        completed: completed.map(p => this.formatParticipation(p)),
        pending: pending.map(p => this.formatParticipation(p)),
        rejected: rejected.map(p => this.formatParticipation(p))
      }
    };
  }

  // Helper method to format participation data
  formatParticipation(participation) {
    return {
      id: participation.id,
      status: participation.status,
      registeredAt: participation.registeredAt,
      completedAt: participation.completedAt,
      rejectionReason: participation.rejectionReason,
      rating: participation.rating,
      feedback: participation.feedback,
      ratedAt: participation.ratedAt,
      canRate: participation.status === 'APPROVED' && 
               new Date(participation.event.endDate) < new Date() && 
               participation.rating === null,
      event: {
        ...participation.event,
        duration: Math.ceil((new Date(participation.event.endDate) - new Date(participation.event.startDate)) / (1000 * 60 * 60)),
        organizer: `${participation.event.organizer.firstName} ${participation.event.organizer.lastName}`
      }
    };
  }

  // Helper method to find favorite category
  getFavoriteCategory(completedEvents) {
    if (completedEvents.length === 0) return null;
    
    const categoryCount = completedEvents.reduce((count, p) => {
      count[p.event.category] = (count[p.event.category] || 0) + 1;
      return count;
    }, {});

    return Object.entries(categoryCount).reduce((max, [category, count]) => 
      count > max.count ? { category, count } : max, 
      { category: null, count: 0 }
    ).category;
  }

  // Helper method to calculate participation streak
  calculateParticipationStreak(completedEvents) {
    if (completedEvents.length === 0) return 0;

    // Sort by end date descending
    const sortedEvents = completedEvents
      .sort((a, b) => new Date(b.event.endDate) - new Date(a.event.endDate));

    let streak = 0;
    let lastEventDate = null;

    for (const event of sortedEvents) {
      const eventDate = new Date(event.event.endDate);
      
      if (lastEventDate === null) {
        streak = 1;
        lastEventDate = eventDate;
      } else {
        // Check if events are within reasonable timeframe (30 days)
        const daysDiff = (lastEventDate - eventDate) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 30) {
          streak++;
          lastEventDate = eventDate;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  // Helper method to calculate achievements
  calculateAchievements(completedEvents, totalHours) {
    const achievements = [];
    const eventCount = completedEvents.length;

    // Event-based achievements
    if (eventCount >= 1) achievements.push({ 
      id: 'first_volunteer', 
      title: 'Tình nguyện viên mới', 
      description: 'Hoàn thành sự kiện tình nguyện đầu tiên',
      earnedAt: completedEvents[completedEvents.length - 1]?.completedAt || completedEvents[0]?.event.endDate
    });

    if (eventCount >= 5) achievements.push({ 
      id: 'committed_volunteer', 
      title: 'Tình nguyện viên tận tâm', 
      description: 'Hoàn thành 5 sự kiện tình nguyện',
      earnedAt: completedEvents[eventCount - 5]?.event.endDate
    });

    if (eventCount >= 10) achievements.push({ 
      id: 'dedicated_volunteer', 
      title: 'Tình nguyện viên chuyên nghiệp', 
      description: 'Hoàn thành 10 sự kiện tình nguyện',
      earnedAt: completedEvents[eventCount - 10]?.event.endDate
    });

    if (eventCount >= 25) achievements.push({ 
      id: 'veteran_volunteer', 
      title: 'Tình nguyện viên kỳ cựu', 
      description: 'Hoàn thành 25 sự kiện tình nguyện',
      earnedAt: completedEvents[eventCount - 25]?.event.endDate
    });

    // Hours-based achievements
    if (totalHours >= 10) achievements.push({ 
      id: 'ten_hours', 
      title: '10 giờ cống hiến', 
      description: 'Dành 10 giờ cho hoạt động tình nguyện'
    });

    if (totalHours >= 50) achievements.push({ 
      id: 'fifty_hours', 
      title: '50 giờ cống hiến', 
      description: 'Dành 50 giờ cho hoạt động tình nguyện'
    });

    if (totalHours >= 100) achievements.push({ 
      id: 'hundred_hours', 
      title: '100 giờ cống hiến', 
      description: 'Dành 100 giờ cho hoạt động tình nguyện'
    });

    // Category-based achievements
    const categories = [...new Set(completedEvents.map(e => e.event.category))];
    if (categories.length >= 3) achievements.push({ 
      id: 'diverse_volunteer', 
      title: 'Tình nguyện viên đa dạng', 
      description: 'Tham gia ít nhất 3 danh mục khác nhau'
    });

    return achievements.sort((a, b) => new Date(b.earnedAt || 0) - new Date(a.earnedAt || 0));
  }

  // Export volunteer's participation data (Story 3.4)
  async exportVolunteerParticipationData(volunteerId, format = 'json') {
    const participationData = await this.getVolunteerParticipationHistory(volunteerId);
    
    // Get volunteer info
    const volunteer = await prisma.user.findUnique({
      where: { id: volunteerId },
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    });

    const exportData = {
      volunteer: volunteer,
      exportedAt: new Date(),
      statistics: participationData.statistics,
      participations: [
        ...participationData.participations.completed,
        ...participationData.participations.upcoming,
        ...participationData.participations.pending,
        ...participationData.participations.rejected
      ]
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Tên sự kiện', 'Danh mục', 'Địa điểm', 'Ngày bắt đầu', 
        'Ngày kết thúc', 'Trạng thái', 'Ngày đăng ký', 'Người tổ chức'
      ];
      
      const csvRows = exportData.participations.map(p => [
        p.event.title,
        p.event.category,
        p.event.location,
        new Date(p.event.startDate).toLocaleDateString('vi-VN'),
        new Date(p.event.endDate).toLocaleDateString('vi-VN'),
        p.status === 'APPROVED' ? 'Đã duyệt' : 
        p.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối',
        new Date(p.registeredAt).toLocaleDateString('vi-VN'),
        p.event.organizer
      ]);
      
      return {
        format: 'csv',
        headers: csvHeaders,
        data: csvRows,
        filename: `volunteer_history_${volunteer.firstName}_${volunteer.lastName}_${new Date().toISOString().split('T')[0]}.csv`
      };
    }

    return {
      format: 'json',
      data: exportData,
      filename: `volunteer_history_${volunteer.firstName}_${volunteer.lastName}_${new Date().toISOString().split('T')[0]}.json`
    };
  }

  // Rate and provide feedback for completed event (Story 3.4)
  async rateEvent(eventId, volunteerId, rating, feedback = null) {
    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('INVALID_RATING');
    }

    // Check if volunteer participated and event is completed
    const participation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_volunteerId: {
          eventId,
          volunteerId
        }
      },
      include: {
        event: {
          select: {
            title: true,
            endDate: true
          }
        }
      }
    });

    if (!participation) {
      throw new Error('PARTICIPATION_NOT_FOUND');
    }

    if (participation.status !== 'APPROVED') {
      throw new Error('PARTICIPATION_NOT_APPROVED');
    }

    // Check if event is completed
    const now = new Date();
    if (participation.event.endDate > now) {
      throw new Error('EVENT_NOT_COMPLETED');
    }

    // Check if already rated
    if (participation.rating !== null) {
      throw new Error('ALREADY_RATED');
    }

    // Update with rating and feedback
    const updatedParticipation = await prisma.eventParticipant.update({
      where: {
        eventId_volunteerId: {
          eventId,
          volunteerId
        }
      },
      data: {
        rating,
        feedback: feedback?.trim() || null,
        ratedAt: new Date()
      },
      include: {
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return {
      id: updatedParticipation.id,
      rating: updatedParticipation.rating,
      feedback: updatedParticipation.feedback,
      ratedAt: updatedParticipation.ratedAt,
      event: updatedParticipation.event
    };
  }

  // Get event ratings and feedback for organizers
  async getEventFeedback(eventId, organizerId) {
    // Verify organizer owns this event
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        organizerId 
      },
      select: {
        id: true,
        title: true,
        endDate: true
      }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND_OR_NOT_OWNER');
    }

    // Get all ratings and feedback
    const feedback = await prisma.eventParticipant.findMany({
      where: {
        eventId,
        status: 'APPROVED',
        rating: { not: null }
      },
      select: {
        rating: true,
        feedback: true,
        ratedAt: true,
        volunteer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { ratedAt: 'desc' }
    });

    // Calculate statistics
    const ratings = feedback.map(f => f.rating);
    const averageRating = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      stars: star,
      count: ratings.filter(r => r === star).length
    }));

    return {
      event,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      ratingDistribution,
      feedback: feedback.map(f => ({
        rating: f.rating,
        feedback: f.feedback,
        ratedAt: f.ratedAt,
        volunteer: `${f.volunteer.firstName} ${f.volunteer.lastName}`
      }))
    };
  }
}

export default new EventService();