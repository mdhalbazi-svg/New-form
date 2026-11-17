# میرا دینی روزنامچہ · My Islamic Daily Diary — v2
Package `com.islamic.daily.dairy` · Capacitor · offline · no registration.

## نیا کیا ہے / What changed
Professional icon & splash, themed UI with SVG icons, prayers = Yes/No (performed, congregation), nafl = Ishraq/Awwabin/Tahajjud/Chasht,
Quran tilawat Yes/No + amount, editable adhkar counters, Qibla (city list, optional GPS, compass), masnoon duas library, 5 themes.

## ڈیزائن بدلنا / Changing the design (app creator)
Edit **`src/theme.js`**: app names, colours (`themes`), default theme, font, corner radius, header pattern, visible bottom tabs.
For a custom Urdu font, put the font file in `src/` and add an @font-face in `src/style.css`, then name it in `fontFamily`.
Icons/splash: replace PNGs in `assets/`.

## GitHub
1. In your repo, **delete the old project files first** (old `src/`, `index.html`), then upload everything here including hidden `.github`.
2. Actions → "Android Build" → Run workflow. Download artifact `android-builds`.
- `app-debug-UNSIGNED-FOR-TESTING.apk` testing only. `app-release-unsigned.*` cannot be published.
- Signed files need secrets: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.

## Notes
Location permission is only for the optional Qibla GPS button; city selection works without it. Ads (AdMob) are not included.
Dua/adhkar texts and references are a starter set: have a scholar verify them. Not tested on a real device.
