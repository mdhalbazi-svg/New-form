# My Islamic Daily Diary

Android project based on the uploaded source. Package ID is retained: `com.islamic.daily.dairy`.

## Build
GitHub Actions builds debug/release APK and AAB artifacts. The workflow currently produces **unsigned** release artifacts. To publish on Google Play, sign the AAB with the same upload key used by the existing Play Console app. Do not change the package ID or signing key.

## Features in this package
Daily prayer completion log, manually entered prayer times, Quran page tracker, tasbih counter, fasting and good-deed checklist, notes, JSON backup/import, CSV export, dark mode, Umm al-Qura Hijri date display with manual ±2 day adjustment, and Android local notifications for remaining manually entered prayer times on the current day.

## Important limitations
Prayer times are not calculated automatically from GPS/location. Notifications are scheduled for the current day only when the user taps the schedule button. Notification text is `اللّٰهُ أَكْبَر`; this is **not a spoken audio recording** and uses Android notification sound. Automatic daily rescheduling, custom spoken audio, and verified AdMob production integration are not included. Confirm Hijri dates with local moon-sighting announcements.

PDF export is intentionally absent. Data is stored locally in the app's WebView storage; export a JSON backup before reinstalling.
