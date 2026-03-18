// YT Focus — Content Script
// Runs on every YouTube page and removes Shorts + recommended videos

const SELECTORS = {
  // Shorts in sidebar/feed
  shorts: [
    'ytd-rich-section-renderer',             // Shorts shelf in home feed
    'ytd-reel-shelf-renderer',               // Shorts shelf (older layout)
    'ytd-guide-entry-renderer a[title="Shorts"]', // Shorts in sidebar nav
    'ytd-mini-guide-entry-renderer a[title="Shorts"]',
    '#endpoint[title="Shorts"]',
    'a[href="/shorts"]',
    'ytd-browse[page-subtype="shorts"]',
    'ytd-reel-video-renderer',               // Individual short in feed
    'ytd-shorts',
  ],

  // Recommended / Up Next panel while watching
  recommendations: [
    '#secondary #related',                   // "Up Next" sidebar
    'ytd-watch-next-secondary-results-renderer', // Watch page sidebar results
    '#related',
  ],

  // Shorts chips / filter pills
  shortChips: [
    'yt-chip-cloud-chip-renderer',
  ],
};

// Detect if on a watch page
function isWatchPage() {
  return window.location.pathname === '/watch';
}

// Check if an element contains a Shorts link/label
function isShortElement(el) {
  if (!el) return false;
  const text = el.innerText || '';
  const href = el.querySelector('a')?.href || '';
  return (
    href.includes('/shorts') ||
    text.trim() === 'Shorts' ||
    el.matches('ytd-reel-shelf-renderer') ||
    el.matches('ytd-reel-video-renderer') ||
    el.querySelector('a[href*="/shorts"]') !== null ||
    el.querySelector('[title="Shorts"]') !== null
  );
}

// Check if a rich section is the Shorts shelf
function isShortShelf(el) {
  return (
    el.matches('ytd-rich-section-renderer') && isShortElement(el)
  );
}

let settings = { hideShorts: true, hideRecommended: true };

// Load settings from storage
function loadSettings(cb) {
  if (chrome?.storage?.sync) {
    chrome.storage.sync.get(['hideShorts', 'hideRecommended'], (data) => {
      settings.hideShorts = data.hideShorts !== false;
      settings.hideRecommended = data.hideRecommended !== false;
      if (cb) cb();
    });
  } else {
    if (cb) cb();
  }
}

function applyCleanup() {
  // --- Hide Shorts shelves in home/subscription feed ---
  if (settings.hideShorts) {
    // Rich sections (home feed shelves)
    document.querySelectorAll('ytd-rich-section-renderer').forEach(el => {
      if (isShortShelf(el)) hide(el);
    });

    // Reel shelves
    document.querySelectorAll('ytd-reel-shelf-renderer, ytd-reel-video-renderer').forEach(hide);

    // Sidebar nav Shorts link
    document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer').forEach(el => {
      if (el.querySelector('a[href="/shorts"], a[title="Shorts"], yt-formatted-string[title="Shorts"]')) {
        hide(el);
      }
    });

    // Shorts chips in search/filter bar
    document.querySelectorAll('yt-chip-cloud-chip-renderer').forEach(el => {
      if ((el.innerText || '').trim().toLowerCase() === 'shorts') hide(el);
    });

    // Individual short videos in grid/list
    document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer').forEach(el => {
      if (el.querySelector('a[href*="/shorts/"]')) hide(el);
    });
  }

  // --- Hide recommended while watching ---
  if (settings.hideRecommended && isWatchPage()) {
    document.querySelectorAll(
      'ytd-watch-next-secondary-results-renderer, #related, #secondary #related'
    ).forEach(hide);
  }
}

function hide(el) {
  if (el && el.style.display !== 'none') {
    el.style.setProperty('display', 'none', 'important');
  }
}

// Use MutationObserver to catch dynamically loaded content
const observer = new MutationObserver(() => {
  applyCleanup();
});

function startObserver() {
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

// Listen for settings changes from popup
chrome.storage.onChanged?.addListener((changes) => {
  if (changes.hideShorts !== undefined) settings.hideShorts = changes.hideShorts.newValue;
  if (changes.hideRecommended !== undefined) settings.hideRecommended = changes.hideRecommended.newValue;
  applyCleanup();
});

// YouTube is a SPA — re-run on navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(applyCleanup, 500);
    setTimeout(applyCleanup, 1500);
  }
}).observe(document, { subtree: true, childList: true });

// Boot
loadSettings(() => {
  applyCleanup();
  startObserver();
  // Run a few times after load to catch lazy-rendered elements
  setTimeout(applyCleanup, 800);
  setTimeout(applyCleanup, 2000);
  setTimeout(applyCleanup, 4000);
});
