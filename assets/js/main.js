// assets/js/main.js
/**
 * =========================================================
 *  ANDREI AUTO TRANS – Main JS (Optimized & Fixed)
 *  Handles WhatsApp links, navigation, maps & UX
 * =========================================================
 */

/* -----------------------------
   WhatsApp Link Setup
----------------------------- */
const WHATSAPP_NUMBER = "+40757283580";
const DEFAULT_MESSAGE = "Salut, aș vrea o rezervare pentru transport România–UK. Mulțumesc!";

function buildWaLink(message = DEFAULT_MESSAGE) {
  const cleaned = WHATSAPP_NUMBER.replace(/[^+0-9]/g, "");
  const enc = encodeURIComponent(message);
  return `https://wa.me/${cleaned.replace(/^\+/, "")}?text=${enc}`;
}

function setAllWaLinks() {
  // Every CTA button that should auto-sync the WhatsApp number / message
  const waIds = ["hero-wa", "footer-wa", "floating-wa", "ruk-wa", "ukr-wa"];
  waIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("href", buildWaLink());
  });
}

/* -----------------------------
   Smooth Scroll for Anchor Links
----------------------------- */
function initSmoothScroll() {
  const header = document.querySelector(".site-header");
  const headerOffset = header ? header.offsetHeight : 0;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - (headerOffset + 10);
        window.scrollTo({ top, behavior: "smooth" });

        // close mobile nav after click
        const nav = document.querySelector(".nav");
        if (nav && nav.classList.contains("open")) {
          nav.classList.remove("open");
        }
      }
    });
  });
}

/* -----------------------------
   Mobile Navigation
----------------------------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }
}

/* -----------------------------
   Leaflet Map Helpers
----------------------------- */
function addTiles(map) {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

function createRoutedMap(elId, stops, bounds) {
  const el = document.getElementById(elId);
  if (!el) return null;

  const map = L.map(elId, { scrollWheelZoom: false });
  addTiles(map);
  if (bounds) map.fitBounds(bounds);

  // Add markers
  stops.forEach((s, i) => {
    L.circleMarker([s.lat, s.lng], {
      radius: i === 0 || i === stops.length - 1 ? 6 : 5,
      color: i === 0 || i === stops.length - 1 ? "#22c55e" : "#1e3a8a",
      weight: 2,
      fillOpacity: 1,
    })
      .addTo(map)
      .bindPopup(s.name);
  });

  const waypoints = stops.map((s) => L.latLng(s.lat, s.lng));

  const control = L.Routing.control({
    waypoints,
    router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
    lineOptions: { styles: [{ color: "#2370ff", weight: 5 }] },
    createMarker: () => null,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    show: false,
  }).addTo(map);

  // graceful fallback if routing fails
  control.on("routingerror", () => {
    L.polyline(waypoints, { color: "#2370ff", weight: 4, dashArray: "6,6" }).addTo(map);
  });

  return map;
}

/* -----------------------------
   Stop Coordinates
----------------------------- */
const roStops = [
  { name: "Târgu Neamț", lat: 47.205, lng: 26.369 },
  { name: "Poiana Teiului", lat: 47.101, lng: 25.973 },
  { name: "Borsec", lat: 46.998, lng: 25.568 },
  { name: "Toplița", lat: 46.936, lng: 25.359 },
  { name: "Reghin", lat: 46.775, lng: 24.706 },
  { name: "Târgu Mureș", lat: 46.542, lng: 24.559 },
  { name: "Cluj-Napoca", lat: 46.771, lng: 23.624 },
  { name: "Huedin", lat: 46.869, lng: 23.024 },
  { name: "Aleșd", lat: 47.05, lng: 22.414 },
  { name: "Oradea", lat: 47.047, lng: 21.918 }
];

const ukStops = [
  { name: "Folkestone", lat: 51.078, lng: 1.174 },
  { name: "Canterbury", lat: 51.28, lng: 1.08 },
  { name: "London", lat: 51.507, lng: -0.128 },
  { name: "Luton", lat: 51.878, lng: -0.42 },
  { name: "Northampton", lat: 52.241, lng: -0.895 },
  { name: "Birmingham", lat: 52.486, lng: -1.89 },
  { name: "Manchester", lat: 53.48, lng: -2.242 },
  { name: "Liverpool", lat: 53.408, lng: -2.991 }
];

const europeStops = [
  { name: "Târgu Neamț", lat: 47.205, lng: 26.369 },
  { name: "Oradea", lat: 47.047, lng: 21.918 },
  { name: "Budapesta", lat: 47.4979, lng: 19.0402 },
  { name: "Viena", lat: 48.2082, lng: 16.3738 },
  { name: "München", lat: 48.1351, lng: 11.582 },
  { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
  { name: "Lille", lat: 50.6292, lng: 3.0573 },
  { name: "Londra", lat: 51.5074, lng: -0.1278 }
];

/* -----------------------------
   Init Maps (guarded for pages without Leaflet)
----------------------------- */
function initMaps() {
  if (typeof L === "undefined") return;

  const roBounds = [[43.6, 20.2], [48.4, 29.9]];
  const ukBounds = [[49.8, -8.7], [60.9, 1.8]];
  const euBounds = [[44, -5], [53, 25]];

  window.mapRoReal = createRoutedMap("map-ro-real", roStops, roBounds);
  window.mapUkReal = createRoutedMap("map-uk-real", ukStops, ukBounds);
  window.mapEurope = createRoutedMap("map-europe", europeStops, euBounds);

  // Fix for blank maps (redraw after load)
  setTimeout(() => {
    [window.mapRoReal, window.mapUkReal, window.mapEurope].forEach((m) => {
      if (m && m.invalidateSize) m.invalidateSize();
    });
  }, 800);
}

/* -----------------------------
   City List Toggle
----------------------------- */
function initCityToggle(listId, buttonId) {
  const list = document.getElementById(listId);
  const btn = document.getElementById(buttonId);
  if (!list || !btn) return;

  let isCollapsed = list.getAttribute("data-collapsed") === "true";

  const updateState = () => {
    if (isCollapsed) {
      list.style.maxHeight = "320px";
      list.style.overflow = "hidden";
      btn.textContent = "Arată mai multe";
    } else {
      list.style.maxHeight = "2000px";
      list.style.overflow = "visible";
      btn.textContent = "Arată mai puține";
    }
  };

  btn.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    list.setAttribute("data-collapsed", isCollapsed ? "true" : "false");
    updateState();
  });

  updateState();
}

/* -----------------------------
   Init Everything
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setAllWaLinks();
  initMobileNav();
  initSmoothScroll();
  initMaps();

  // Toggle expandable city lists (present on both homepage and subpage)
  initCityToggle("cityList", "toggleCities");
  initCityToggle("roCityList", "toggleRoCities");
});
// --- Google Ads conversion tracking for site clicks (WhatsApp + Phone) ---
(function () {
  const ADS_ID = 'AW-633978086';
  // <- Replace these with the EXACT labels Google showed you when you created
  // the two Website conversions (the part after the slash in send_to).
  const LABEL_WHATSAPP = 'PASTE_WHATSAPP_LABEL_HERE';
  const LABEL_PHONE   = 'PASTE_PHONE_LABEL_HERE';

  function sendConversion(label, href, newTab, ev) {
    if (typeof gtag !== 'function') return;

    // New tab (WhatsApp usually): no delay needed.
    if (newTab) {
      gtag('event', 'conversion', { send_to: ADS_ID + '/' + label });
      return;
    }

    // Same tab (tel: links): delay briefly so the hit is sent.
    if (ev) ev.preventDefault();
    let done = false;

    gtag('event', 'conversion', {
      send_to: ADS_ID + '/' + label,
      event_callback: function () {
        done = true;
        window.location.href = href;
      }
    });

    setTimeout(function () {
      if (!done) window.location.href = href;
    }, 400);
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href]');
    if (!a) return;

    const href   = a.getAttribute('href') || '';
    const newTab = (a.getAttribute('target') === '_blank');

    // WhatsApp click
    if (href.includes('wa.me/40757283580')) {
      sendConversion(LABEL_WHATSAPP, href, newTab, e);
      return;
    }

    // Phone click
    if (href.startsWith('tel:+40757283580') || href.startsWith('tel:0757283580')) {
      sendConversion(LABEL_PHONE, href, false, e);
      return;
    }
  });
})();

