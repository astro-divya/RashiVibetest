# RashiVibe — GitHub Pages Build

Upload the **contents of this ZIP directly into the repository root** (no extra parent folder).

## GitHub Pages
- Source: Deploy from branch
- Branch: main / root
- Test path: `https://astro-divya.github.io/RashiVibetest/` (or your repository Pages URL)
- `.nojekyll` and `404.html` are included.

## Included in this build
- Premium responsive homepage tool-card grid (not a plain link list)
- Supplied RashiVibe PNG logo/icon and all 12 supplied Rashi PNG artworks
- Larger animated hero icon with reduced-motion support
- Kundli report with separate Birth Moon Rashi and Name Rashi
- Kundli Matching with two separate North-Indian-style birth charts
- Matching PDF download plus Print / Save as PDF fallback
- Saved birth profiles and one-click reuse across supported tools
- Mobile-number OTP login page wired for Firebase Phone Authentication
- Optional WhatsApp Daily Rashifal preference stored per profile

## OTP login setup (required for live OTP)
Edit `assets/firebase-config.js` with your Firebase web-app configuration, enable **Phone** sign-in in Firebase Authentication, and authorize your GitHub Pages/custom domains. No fake/demo OTP is included. Cloud profile sync uses Firestore when Firebase is configured.

## WhatsApp automation
The profile opt-in is included. Automatic daily WhatsApp delivery requires a WhatsApp Business / Cloud API backend or scheduled server function; static GitHub Pages cannot send scheduled WhatsApp messages by itself.

## PDF libraries
Kundli/Matching direct PDF uses browser-loaded html2canvas + jsPDF. Print / Save as PDF remains available as a fallback.

## Calculation note
The current site uses browser-side Vedic/sidereal calculation formulas. For production ephemeris-grade professional use, planetary and house calculations should be validated against a trusted ephemeris implementation (for example Swiss Ephemeris) before claiming high precision.
