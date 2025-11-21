// Service Worker for Push Notifications

const CACHE_NAME = 'volunteerhub-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'VolunteerHub',
    body: 'Bạn có thông báo mới',
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge.png',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const dataText = event.data.text();
      const data = JSON.parse(dataText);
      
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || notificationData.data,
        tag: data.tag || 'default',
        vibrate: [200, 100, 200]
      };
    } catch (e) {
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Detect browser for compatibility
  const isEdge = /Edg/i.test(self.navigator.userAgent);

  // Ultra-simple notification for maximum compatibility
  const notificationOptions = {
    body: notificationData.body,
    tag: 'volunteerhub-notification',
    renotify: true,
    silent: false
  };

  // Add data only for non-Edge browsers (Edge has issues with complex data)
  if (!isEdge && notificationData.data) {
    notificationOptions.data = notificationData.data;
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationOptions
  );

  event.waitUntil(promiseChain);
});

// Notification click event - Handle click on notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message event - Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
