self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "X247 Rewards", body: "You have a new notification" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "x247-notification",
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  let targetPath = "/";
  try {
    const rawUrl = event.notification.data?.url || "/";
    const parsed = new URL(rawUrl, self.location.origin);
    if (parsed.origin === self.location.origin) {
      targetPath = parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (e) {
    targetPath = "/";
  }

  const fullUrl = self.location.origin + targetPath;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(fullUrl);
    })
  );
});
