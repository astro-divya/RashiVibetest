# RashiVibe FINAL GitHub Build

Upload the CONTENTS of this folder directly to the root of `RashiVibetest`.

Important architecture:
- No `site.js`
- No `vedic.js`
- No external JavaScript files at all
- All working logic is inline inside each HTML page
- One CSS file only: `assets/rashivibe.css`
- New logo and icon are included as optimized WebP assets

This architecture is intentionally chosen because GitHub web upload previously stalled on common JS files.

Current calculations use browser-side low-precision astronomical formulas. They are suitable for a functional traditional astrology site, but for professional ephemeris-grade precision you should later cross-check against Swiss Ephemeris.
