import { PrismaClient } from '@prisma/client';
import webPush from 'web-push';

const prisma = new PrismaClient();

// Configure Web Push
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@volunteerhub.com';

if (!vapidPublicKey || !vapidPrivateKey) {
  throw new Error('VAPID keys are required. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env file');
}

webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
console.log('✅ VAPID keys configured successfully');

class NotificationService {
  // Subscribe user to push notifications
  async subscribeToPush(userId, subscription) {
    try {
      const { endpoint, keys } = subscription;
      
      // Check if subscription already exists
      const existingSubscription = await prisma.pushSubscription.findUnique({
        where: {
          userId_endpoint: {
            userId,
            endpoint
          }
        }
      });

      if (existingSubscription) {
        // Update existing subscription
        return await prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            p256dhKey: keys.p256dh,
            authKey: keys.auth
          }
        });
      }

      // Create new subscription
      return await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint,
          p256dhKey: keys.p256dh,
          authKey: keys.auth
        }
      });
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw new Error('SUBSCRIPTION_FAILED');
    }
  }

  // Unsubscribe user from push notifications
  async unsubscribeFromPush(userId, endpoint) {
    try {
      const result = await prisma.pushSubscription.delete({
        where: {
          userId_endpoint: {
            userId,
            endpoint
          }
        }
      });
      return result;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw new Error('UNSUBSCRIPTION_FAILED');
    }
  }

  // Send push notification to specific user
  async sendPushNotification(userId, payload, options = {}) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      const pushOptions = {
        TTL: options.ttl || 86400, // 24 hours default
        urgency: options.urgency || 'normal' // low, normal, high
      };

      const promises = subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dhKey,
              auth: subscription.authKey
            }
          };

          return await webPush.sendNotification(
            pushSubscription,
            JSON.stringify(payload),
            pushOptions
          );
        } catch (error) {
          console.error(`Failed to send notification to subscription ${subscription.id}:`, error);
          
          // If subscription is invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: subscription.id }
            }).catch(deleteError => {
              console.error('Error deleting invalid subscription:', deleteError);
            });
          }
          return null;
        }
      });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      
      console.log(`Sent ${successful}/${subscriptions.length} push notifications to user ${userId}`);
      return { successful, total: subscriptions.length };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendBulkPushNotifications(userIds, payload, options = {}) {
    const promises = userIds.map(userId => 
      this.sendPushNotification(userId, payload, options)
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    
    console.log(`Bulk notification: ${successful}/${userIds.length} users notified`);
    return { successful, total: userIds.length };
  }

  // Story 4.2.2: Admin notification for new events requiring approval
  async notifyAdminNewEvent(eventId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      if (admins.length === 0) {
        console.log('No admin users found for event approval notification');
        return;
      }

      const payload = {
        title: 'Sự kiện mới cần phê duyệt',
        body: `${event.organizer.firstName} ${event.organizer.lastName} đã tạo sự kiện "${event.title}"`,
        icon: '/icons/event-notification.png',
        badge: '/icons/badge.png',
        data: {
          type: 'EVENT_APPROVAL_REQUIRED',
          eventId: event.id,
          url: `/admin/events/pending/${event.id}`
        },
        actions: [
          {
            action: 'approve',
            title: 'Phê duyệt'
          },
          {
            action: 'view',
            title: 'Xem chi tiết'
          }
        ]
      };

      const adminIds = admins.map(admin => admin.id);
      return await this.sendBulkPushNotifications(adminIds, payload, { urgency: 'high' });
    } catch (error) {
      console.error('Error notifying admin of new event:', error);
      throw error;
    }
  }

  // Story 4.2.3: Organizer notification for volunteer registration
  async notifyOrganizerNewRegistration(eventId, volunteerId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: {
            select: { id: true }
          }
        }
      });

      const volunteer = await prisma.user.findUnique({
        where: { id: volunteerId },
        select: {
          firstName: true,
          lastName: true
        }
      });

      if (!event || !volunteer) {
        throw new Error('EVENT_OR_VOLUNTEER_NOT_FOUND');
      }

      const payload = {
        title: 'Đăng ký tham gia mới',
        body: `${volunteer.firstName} ${volunteer.lastName} đã đăng ký tham gia sự kiện "${event.title}"`,
        icon: '/icons/registration-notification.png',
        badge: '/icons/badge.png',
        data: {
          type: 'NEW_REGISTRATION',
          eventId: event.id,
          volunteerId: volunteer.id,
          url: `/organizer/events/${event.id}/registrations`
        },
        actions: [
          {
            action: 'approve',
            title: 'Phê duyệt'
          },
          {
            action: 'view',
            title: 'Xem danh sách'
          }
        ]
      };

      return await this.sendPushNotification(event.organizerId, payload);
    } catch (error) {
      console.error('Error notifying organizer of new registration:', error);
      throw error;
    }
  }

  // Story 4.2.4: Registration status change notification
  async notifyVolunteerRegistrationStatus(participantId, status) {
    try {
      const participant = await prisma.eventParticipant.findUnique({
        where: { id: participantId },
        include: {
          event: {
            select: {
              id: true,
              title: true
            }
          },
          volunteer: {
            select: { id: true }
          }
        }
      });

      if (!participant) {
        throw new Error('PARTICIPANT_NOT_FOUND');
      }

      let title, body, actions;
      
      if (status === 'APPROVED') {
        title = 'Đăng ký được phê duyệt';
        body = `Bạn đã được phê duyệt tham gia sự kiện "${participant.event.title}"`;
        actions = [
          {
            action: 'view_event',
            title: 'Xem sự kiện'
          },
          {
            action: 'view_channel',
            title: 'Tham gia thảo luận'
          }
        ];
      } else if (status === 'REJECTED') {
        title = 'Đăng ký bị từ chối';
        body = `Đăng ký tham gia sự kiện "${participant.event.title}" của bạn bị từ chối`;
        actions = [
          {
            action: 'view_reason',
            title: 'Xem lý do'
          },
          {
            action: 'find_other',
            title: 'Tìm sự kiện khác'
          }
        ];
      }

      const payload = {
        title,
        body,
        icon: '/icons/status-notification.png',
        badge: '/icons/badge.png',
        data: {
          type: 'REGISTRATION_STATUS_CHANGE',
          eventId: participant.event.id,
          participantId: participant.id,
          status,
          url: `/volunteer/events/${participant.event.id}`
        },
        actions
      };

      return await this.sendPushNotification(participant.volunteer.id, payload);
    } catch (error) {
      console.error('Error notifying volunteer of registration status:', error);
      throw error;
    }
  }

  // Story 4.2.5: Event status change notification
  async notifyOrganizerEventStatus(eventId, status) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: {
            select: { id: true }
          }
        }
      });

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      let title, body, actions;
      
      if (status === 'APPROVED') {
        title = 'Sự kiện được phê duyệt';
        body = `Sự kiện "${event.title}" của bạn đã được phê duyệt và công bố`;
        actions = [
          {
            action: 'view_event',
            title: 'Xem sự kiện'
          },
          {
            action: 'manage',
            title: 'Quản lý'
          }
        ];
      } else if (status === 'REJECTED') {
        title = 'Sự kiện bị từ chối';
        body = `Sự kiện "${event.title}" của bạn bị từ chối phê duyệt`;
        actions = [
          {
            action: 'view_reason',
            title: 'Xem lý do'
          },
          {
            action: 'create_new',
            title: 'Tạo sự kiện mới'
          }
        ];
      }

      const payload = {
        title,
        body,
        icon: '/icons/event-status-notification.png',
        badge: '/icons/badge.png',
        data: {
          type: 'EVENT_STATUS_CHANGE',
          eventId: event.id,
          status,
          url: `/organizer/events/${event.id}`
        },
        actions
      };

      return await this.sendPushNotification(event.organizerId, payload, { urgency: 'high' });
    } catch (error) {
      console.error('Error notifying organizer of event status:', error);
      throw error;
    }
  }

  // Get user's notification history (for Story 4.2.6)
  async getNotificationHistory(userId, page = 1, limit = 20) {
    try {
      // Since we're using push notifications, we'll store a log in database
      // This would require a separate NotificationLog model, but for now we'll return empty
      // In a real implementation, you'd log all sent notifications
      
      return {
        notifications: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw error;
    }
  }

  // Check if user has valid push subscriptions
  async hasValidSubscriptions(userId) {
    try {
      const count = await prisma.pushSubscription.count({
        where: { userId }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking user subscriptions:', error);
      return false;
    }
  }
}

export default new NotificationService();