// ponytail: self-destroying service worker — a stale SW from a previous app on
// localhost:3000 was intercepting fetches and breaking RSC navigation.
// This unregisters it and reloads open tabs. Delete this file once clients are clean.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", async () => {
  await self.registration.unregister();
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => client.navigate(client.url));
});
