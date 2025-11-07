// Minimal no-op Service Worker to avoid errors and 404s
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  try {
    const url = new URL(event.request.url)
    // Ignore non-http(s) schemes like chrome-extension:// to prevent Cache API errors
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return
  } catch {
    // If URL parsing fails, just let the request pass through
    return
  }
  // Pass-through: do not intercept; let the network handle it
})
