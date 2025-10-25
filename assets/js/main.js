/**
 * =========================================================
 *  ANDREI AUTO TRANS – Main JS (Optimized)
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
  if (!header) return;
  const headerOffset = header.offsetHeight;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - (headerOffset + 10);
        window.scrollTo({ top, behavior: "smooth" });
        document.querySelector(".nav")?.classList.remove("open");
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
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
}

function createRoutedMap(elId, stops, bounds) {
  const el = document.getElementById(elId);
  if (!el) return null;

  const map = L.map(elId, { scrollWheelZoom: false });
  addTiles(map);
  if (bounds) map.fitBounds(bounds);

  // Add Markers
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
  { name: "Oradea", lat: 47.047, lng: 21.918 },
];

const ukStops = [
  { name: "Folkestone", lat: 51.078, lng: 1.174 },
  { name: "Canterbury", lat: 51.28, lng: 1.08 },
  { name: "London", lat: 51.507, lng: -0.128 },
  { name: "Luton", lat: 51.878, lng: -0.42 },
  { name: "Northampton", lat: 52.241, lng: -0.895 },
  { name: "Birmingham", lat: 52.486, lng: -1.89 },
  { name: "Manchester", lat: 53.48, lng: -2.242 },
  { name: "Liverpool", lat: 53.408, lng: -2.991 },
];

const europeStops = [
  { name: "Târgu Neamț", lat: 47.205, lng: 26.369 },
  { name: "Oradea", lat: 47.047, lng: 21.918 },
  { name: "Budapesta", lat: 47.4979, lng: 19.0402 },
  { name: "Viena", lat: 48.2082, lng: 16.3738 },
  { name: "München", lat: 48.1351, lng: 11.582 },
  { name: "Strasbourg", lat: 48.5734, lng: 7.7521 },
  { name: "Lille", lat: 50.6292, lng: 3.0573 },
  { name: "Londra", lat: 51.5074, lng: -0.1278 },
];

/* -----------------------------
   Init Maps
----------------------------- */
function initMaps() {
  if (typeof L === "undefined") return;

  const roBounds = [[43.6, 20.2], [48.4, 29.9]];
  const ukBounds = [[49.8, -8.7], [60.9, 1.8]];
  const euBounds = [[44, -5], [53, 25]];

  window.mapRo = createRoutedMap("map-ro-real", roStops, roBounds);
  window.mapUk = createRoutedMap("map-uk-real", ukStops, ukBounds);
  window.mapEu = createRoutedMap("map-europe", europeStops, euBounds);
}

/* -----------------------------
   City List Toggle + Filter
----------------------------- */
function initCityToggle(listId, buttonId) {
  const list = document.getElementById(listId);
  const btn = document.getElementById(buttonId);
  if (!list || !btn) return;

  // initial collapsed state
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

  // initialize
  updateState();
}

function initCityFilter(listId, inputId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;

  const items = Array.from(list.querySelectorAll("li"));
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    list.setAttribute("data-collapsed", "false");
    list.style.maxHeight = "1000px";
    list.style.overflow = "visible";
    items.forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}

/* === INIT on DOM Ready === */
document.addEventListener("DOMContentLoaded", () => {
  initCityToggle("roCityList", "toggleRoCities");
  initCityToggle("cityList", "toggleCities");
  // optional: if you have search inputs
  // initCityFilter("roCityList", "roCitySearch");
  // initCityFilter("cityList", "ukCitySearch");
});

/* -----------------------------
   📱 Map Scroll Lock (Touch Protection)
----------------------------- */
function addMapLock(map) {
  if (!map) return;
  const mapContainer = map.getContainer();
  const overlay = document.createElement("div");
  overlay.className = "map-overlay";
  overlay.textContent = "🔍 Atinge pentru a activa harta";
  mapContainer.appendChild(overlay);

  const disableInteractions = () => {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
  };

  disableInteractions();

  overlay.addEventListener("click", () => {
    overlay.classList.add("hidden");
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();

    // Disable again after 4 seconds
    setTimeout(() => {
      overlay.classList.remove("hidden");
      disableInteractions();
    }, 4000);
  });
}

/* -----------------------------
   Init Everything
----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  setAllWaLinks();
  initMobileNav();
  initSmoothScroll();
  initMaps();

  // City lists
  initCityToggle("cityList", "toggleCities");
  initCityToggle("roCityList", "toggleRoCities");
  initCityFilter("cityList", "cityFilter");
  initCityFilter("roCityList", "roCityFilter");

  // Map lock
  setTimeout(() => {
    if (window.L) {
      [window.mapRo, window.mapUk, window.mapEu].forEach(addMapLock);
    }
  }, 1500);
});
