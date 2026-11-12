// 離線快取：有網路時一律抓最新版並更新快取，沒網路時用快取。
const CACHE = 'tfp-v15';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/main.css',
  'js/main.js', 'js/config.js', 'js/core/store.js', 'js/core/clock.js',
  'js/core/audio.js', 'js/core/voice.js', 'js/core/weather.js', 'js/core/dom.js',
  'js/data/lines.js', 'js/art/characters.js', 'js/art/items.js',
  'js/art/bathroom.js', 'js/scenes/bathroom.js', 'js/scenes/door.js', 'js/art/door.js', 'js/ui/hub.js', 'js/scenes/kitchen.js', 'js/scenes/bedroom.js', 'js/scenes/car.js', 'js/art/car.js', 'js/art/bedroom.js', 'js/art/kitchen.js', 'js/ui/xmas.js', 'js/art/xmas.js', 'js/core/festival.js', 'js/ui/screens.js',
  'js/ui/parent.js', 'js/ui/stamps.js', 'js/art/stamps.js', 'assets/voice/manifest.json',
  'assets/icons/icon-180.png', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
