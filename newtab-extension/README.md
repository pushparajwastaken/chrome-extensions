# Lumina New Tab — Chrome Extension

A production-ready Chrome New Tab extension with adaptive wallpapers, live clock, and a beautiful minimal UI.

---

## Installation

### 1. Add Your Wallpapers

Place **8 WebP images** (or adjust the manifest in `script.js`) into the `/images/` folder:

**Recommended image specs:**

- Format: **WebP** (best compression + quality)
- Resolution: **1920×1080** minimum, **2560×1440** ideal
- File size: **200–500 KB** per image (use Squoosh or cwebp to compress)
- Aspect: **16:9 landscape**

**Quick conversion using cwebp:**

```bash
for f in *.jpg; do cwebp -q 82 "$f" -o "${f%.jpg}.webp"; done
```

### 2. Add Icons

Create an `/icons/` folder with:

```
icons/
  icon16.png
  icon48.png
  icon128.png
```

(Any icon image works — you can use your logo or a simple geometric shape.)

### 3. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `newtab-extension/` folder
5. Open a new tab — enjoy! 🎉

---

## Customising Wallpapers

Edit the `WALLPAPERS` array at the top of `script.js`:

```js
const WALLPAPERS = [
  { file: "wp1.webp", credit: "Photo · Mountain Dawn" },
  { file: "wp2.webp", credit: "Photo · Coastal Mist" },
  // Add as many as you like…
];
```

- `file` — filename inside `/images/`
- `credit` — optional caption shown bottom-left

---

## Features

| Feature                      | Implementation                                     |
| ---------------------------- | -------------------------------------------------- |
| Random wallpaper per new tab | `sessionStorage` cache avoids reload on same tab   |
| Wallpaper fade-in            | CSS `transition: opacity` on `.loaded` class       |
| Live clock (HH:MM:SS)        | 500 ms `setInterval` (no drift, low CPU)           |
| Dynamic light/dark UI        | Canvas luminance sampling (ITU-R BT.709)           |
| Google search bar            | Native HTML `<form>` submit                        |
| Glassmorphism search         | `backdrop-filter: blur`                            |
| Subtle parallax              | `requestAnimationFrame` + CSS variables            |
| Overlay toggle               | Cycles 3 intensities (default → strong → minimal)  |
| Preload next image           | Low-priority `Image()` preload after current loads |
| Memory leak prevention       | `visibilitychange` cleans up intervals + RAF       |
| Reduced motion support       | `@media (prefers-reduced-motion)` CSS              |

---

## Performance Notes

- **No frameworks** — pure HTML/CSS/JS
- **No redundant redraws** — clock only writes to DOM when second changes
- **GPU-composited animations** — `opacity` and `transform` only (no layout triggers)
- **Single image in DOM** at a time — old images never accumulate
- **OffscreenCanvas** for contrast detection — off main thread where supported
- **Passive event listeners** for `mousemove`

---

## File Structure

```
newtab-extension/
├── manifest.json       ← Manifest V3
├── newtab.html         ← New tab page
├── styles.css          ← All styles + CSS variables for theming
├── script.js           ← All JS logic (IIFE, modular sections)
├── images/             ← Your WebP wallpapers (add manually)
│   ├── wp1.webp
│   └── ...
├── icons/              ← Extension icons (add manually)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```
