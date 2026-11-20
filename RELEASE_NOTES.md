# My Islamic Daily Diary - Current ZIP Notes

This ZIP preserves the existing app and its current local diary features. It also adds:

- Quran download library: download an individual Surah's Uthmani Arabic text and Urdu Jalandhry translation from AlQuran Cloud API.
- IndexedDB storage for downloaded Surahs, so saved text can be opened offline on the same device.
- Offline Surah reader and delete-download action.
- Direct WhatsApp contact button for the configured Quran teacher: +92 306 1856055.
- Language preference setting for Urdu, English, and Arabic.
- Corrected project checks/build workflow to match the files actually present.

## Important limitations

- The language selector currently saves the user's preference; complete translation of every screen into all three languages is not yet implemented.
- Quran audio reciter downloads, prayer-time calculation, Qibla compass, complete Hadith library, Fiqh search integration, Zakat and inheritance calculators, Hajj/Umrah guides, and other planned modules are not yet complete.
- Quran downloads require internet for the initial download. The offline copy contains Arabic text and Urdu translation only, not audio.
- The Quran API and edition availability depend on the third-party service. Verify the text/translation against an approved Mushaf and trusted printed source before formal religious use.
- Android APK/AAB has not been built in this local environment. GitHub Actions is configured to attempt the Android build; Play Store release signing requires the user's existing upload-key secrets.
