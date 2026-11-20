# My Islamic Daily Diary

Offline-first Islamic daily diary built with HTML, CSS, JavaScript and Capacitor.

## Included
- Daily prayer tracking, editable prayer times, Quran page tracking, tasbih, fasting, notes, Hijri date display, backup and CSV export.
- Islamic services page with Quran surah retrieval (AlQuran Cloud), optional per-surah local text caching, Alafasy audio streaming, location-based prayer times and Qibla bearing (AlAdhan API), simple 2.5% zakat estimate, trusted learning links, and WhatsApp contact for Quran learning.
- WhatsApp contact configured as `+92 306 1856055`.

## Build
- Node.js 22 recommended.
- `npm install`
- `npm run check && npm test && npm run build`
- `npx cap add android` (first Android setup)
- `npx cap sync android`

GitHub Actions builds a debug APK and an unsigned release AAB. A signed Play Store release requires the owner's existing keystore and signing secrets; do not replace an existing Play Store signing key.

## Data and limitations
Online Quran, prayer-time and Qibla lookups require internet and location permission where applicable. A downloaded surah text is cached locally; the audio player streams and does not yet save MP3 files for offline playback. The language selector saves a preference, but full translation of every legacy screen is not yet complete. The zakat figure is only a basic 2.5% estimate and is not a fatwa or a complete nisab/debt calculation. Inheritance shares require a qualified scholar's review. External links open the respective providers; the app does not reproduce their full libraries.
