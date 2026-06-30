// Incrémenter BUILD_ID à chaque déploiement pour invalider les caches
const BUILD_ID = '2';
const SHELL_CACHE = `ami-secret-shell-v${BUILD_ID}`;
const ASSETS_CACHE = `ami-secret-assets-v${BUILD_ID}`;

// ── Install : mise en cache du shell ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.add('/').catch(() => {})
    )
  );
});

// ── Activate : purge des anciens caches ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== ASSETS_CACHE && k !== 'pending-share')
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Share target : intercepte le POST depuis la galerie photo
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  // Requêtes cross-origin (API, fonts…) : réseau direct, pas de cache
  if (url.origin !== self.location.origin) return;

  // Assets Vite hashés (/assets/…) : cache-first (immuables)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(ASSETS_CACHE).then((c) => c.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Navigation SPA : network-first, fallback sur le shell mis en cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put('/', clone));
          }
          return res;
        })
        .catch(() =>
          caches.match('/').then((r) => r ?? new Response('Hors ligne', { status: 503 }))
        )
    );
    return;
  }

  // Icônes et ressources statiques publiques : stale-while-revalidate
  if (url.pathname.match(/\.(png|svg|webmanifest|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((res) => {
          if (res.ok) {
            caches.open(SHELL_CACHE).then((c) => c.put(event.request, res.clone()));
          }
          return res;
        }).catch(() => cached);
        return cached ?? fetchPromise;
      })
    );
  }
});

// ── Share target handler ───────────────────────────────────────────────────────
async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo');
    if (photo && photo instanceof File) {
      const cache = await caches.open('pending-share');
      await cache.put(
        '/_pending-share-photo',
        new Response(photo, { headers: { 'Content-Type': photo.type || 'image/jpeg' } })
      );
    }
  } catch {
    // best-effort
  }
  return Response.redirect('/share-photo', 303);
}

// ── Push notifications ─────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Ami Secret';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { link: data.link || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data?.link || '/'));
});
