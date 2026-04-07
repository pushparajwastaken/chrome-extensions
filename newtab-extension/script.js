/**
 * Lumina New Tab — script.js
 * Fixed + production-ready
 */
(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════
     1. WALLPAPERS
  ═══════════════════════════════════════════════════════ */
  const WALLPAPERS = Array.from(
    { length: 14 },
    (_, i) => `images/${i + 1}.webp`,
  );

  const SESSION_KEY = "lumina_wp_index";

  /* ═══════════════════════════════════════════════════════
     2. HELPERS
  ═══════════════════════════════════════════════════════ */

  const $ = (id) => document.getElementById(id);

  function resolveImagePath(path) {
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.getURL
    ) {
      return chrome.runtime.getURL(path);
    }
    return path;
  }

  function getWallpaperIndex() {
    return Math.floor(Math.random() * WALLPAPERS.length);
  }

  /* ═══════════════════════════════════════════════════════
     3. ELEMENTS
  ═══════════════════════════════════════════════════════ */

  const bgEl = $("bg");
  const overlayEl = $("overlay");
  const clockEl = $("clock");
  const dateEl = $("date");
  const searchInput = $("search-input");
  const overlayToggle = $("overlay-toggle");
  const creditEl = $("img-credit");
  const parallaxWrap = $("parallax-wrap");

  /* ═══════════════════════════════════════════════════════
     4. WALLPAPER LOADER
  ═══════════════════════════════════════════════════════ */

  function loadWallpaper(idx) {
    const wp = WALLPAPERS[idx];
    const src = resolveImagePath(wp);

    const img = new Image();
    img.decoding = "async";
    img.fetchpriority = "high";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    img.onload = function () {
      bgEl.appendChild(img);
      img.getBoundingClientRect();
      img.classList.add("loaded");

      requestAnimationFrame(() => detectContrast(img));

      const nextIdx = (idx + 1) % WALLPAPERS.length;
      preloadNextWallpaper(nextIdx);
    };

    img.onerror = function () {
      console.warn(`[Lumina] Could not load wallpaper: ${src}`);
    };

    img.src = src;
  }

  function preloadNextWallpaper(idx) {
    const nextSrc = resolveImagePath(WALLPAPERS[idx]);
    const pre = new Image();
    pre.fetchpriority = "low";
    pre.decoding = "async";
    pre.src = nextSrc;
  }

  /* ═══════════════════════════════════════════════════════
     5. CONTRAST DETECTION
  ═══════════════════════════════════════════════════════ */

  function detectContrast(imgEl) {
    const SIZE = 32;
    let ctx;

    try {
      if (typeof OffscreenCanvas !== "undefined") {
        const oc = new OffscreenCanvas(SIZE, SIZE);
        ctx = oc.getContext("2d");
      } else {
        const c = document.createElement("canvas");
        c.width = c.height = SIZE;
        ctx = c.getContext("2d");
      }

      ctx.drawImage(imgEl, 0, 0, SIZE, SIZE);
      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

      let total = 0;
      const pixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        const lum =
          0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);

        total += lum;
      }

      const avg = total / pixels;
      document.body.classList.toggle("dark-ui", avg > 0.45);
    } catch (e) {}
  }

  function linearize(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  /* ═══════════════════════════════════════════════════════
     6. CLOCK
  ═══════════════════════════════════════════════════════ */

  const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const pad = (n) => String(n).padStart(2, "0");

  function formatDate(d) {
    return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  let lastSecond = -1;
  let clockInterval = null;

  function tick() {
    const now = new Date();
    const s = now.getSeconds();
    if (s === lastSecond) return;

    lastSecond = s;

    clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(s)}`;

    if (s === 0 || dateEl.textContent === "") {
      dateEl.textContent = formatDate(now);
    }
  }

  function startClock() {
    tick();
    clockInterval = setInterval(tick, 500);
  }

  /* ═══════════════════════════════════════════════════════
     7. PARALLAX
  ═══════════════════════════════════════════════════════ */

  const PARALLAX_STRENGTH = 8;
  let rafId = null;
  let targetX = 0,
    targetY = 0;
  let currentX = 0,
    currentY = 0;

  function onMouseMove(e) {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;

    targetX = nx * PARALLAX_STRENGTH;
    targetY = ny * PARALLAX_STRENGTH;

    if (!rafId) rafId = requestAnimationFrame(smoothParallax);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothParallax() {
    currentX = lerp(currentX, targetX, 0.06);
    currentY = lerp(currentY, targetY, 0.06);

    parallaxWrap.style.setProperty("--px", `${currentX}px`);
    parallaxWrap.style.setProperty("--py", `${currentY}px`);

    const delta = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);

    if (delta > 0.05) {
      rafId = requestAnimationFrame(smoothParallax);
    } else {
      rafId = null;
    }
  }

  function initParallax() {
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
    }
  }

  /* ═══════════════════════════════════════════════════════
     8. OVERLAY
  ═══════════════════════════════════════════════════════ */

  const OVERLAY_STATES = ["", "strong", "minimal"];
  let overlayState = 0;

  function cycleOverlay() {
    overlayState = (overlayState + 1) % OVERLAY_STATES.length;
    overlayEl.className = OVERLAY_STATES[overlayState];
  }

  /* ═══════════════════════════════════════════════════════
     9. SEARCH
  ═══════════════════════════════════════════════════════ */

  function initSearch() {
    setTimeout(() => searchInput.focus(), 200);
  }

  /* ═══════════════════════════════════════════════════════
     10. CLEANUP
  ═══════════════════════════════════════════════════════ */

  function cleanup() {
    clearInterval(clockInterval);
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener("mousemove", onMouseMove);
  }

  /* ═══════════════════════════════════════════════════════
     11. INIT
  ═══════════════════════════════════════════════════════ */

  function init() {
    const idx = getWallpaperIndex();
    loadWallpaper(idx);

    startClock();
    initParallax();
    initSearch();

    overlayToggle.addEventListener("click", cycleOverlay);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cleanup();
      else if (!clockInterval) startClock();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
