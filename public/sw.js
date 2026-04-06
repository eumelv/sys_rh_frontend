self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title || 'Nova Notificação';
    const options = {
        body: data.body || 'Tens uma nova atualização no SYS RH.',
        icon: '/img/icons/icon-192x192.png',
        badge: '/img/icons/badge-72x72.png',
        data: {
            url: data.action_url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
