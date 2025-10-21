


self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
  });
});
