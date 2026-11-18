# Audit & Phase 1 report (2026-11-18)

## Audit findings (from the uploaded ZIP)
1. **Quran Yes/No bug (fixed):** buttons wrote to `days[d].tl.x.done` but UI/reports read `tl.done` → buttons never highlighted, amount/unit never shown in stats.
2. **Date never changed after midnight (fixed):** `cur` was set once at start.
3. **Backup restore had no validation (fixed):** any JSON with a `days` key replaced all data.
4. No native Android code exists: no Adhan, alarms, notifications, DND, prayer times, Hadith, AdMob/UMP, signing (not started – see plan).
5. Workflow has no signing, no release-AAB signing secrets, no plugin verification.
6. README mentions files/artifacts (`src/theme.js`, `assets/`, `android-builds`) that do not match this ZIP's flat layout.
7. Package ID `com.islamic.daily.dairy` kept unchanged.

## Phase 1 changes (all in app.js)
- Schema v3 + safe migration (old `tl.x.*` moved; copy kept in localStorage `idd_v2_pre_v3`).
- Quran Yes/No + amount/unit saved per date; negative amounts clamped.
- Auto date: rolls at midnight / on resume / focus; manually selected past dates are not overwritten.
- Previous / Today / Next buttons + date picker; past/future banner; weekday in header.
- Hijri: Umm al-Qura calculated, manual ±2 day adjust, note that it is not an official sighting.
- Restore: validation + safety copy `idd_v2_before_restore`.

## Tested (Node, stubbed DOM): 13/13 logic checks passed
Migration, Yes/No/qty persistence, restart reload, midnight + year rollover, past-date protection, backup validation.
## NOT tested: real device, WebView UI taps, Android build (no network in this environment).

## Remaining phases (need verified data / device work)
2 Prayer times (offline calc library, no fake times) · 3 Native Adhan/alarms/boot receiver · 4 DND automation · 5 Hadith (needs licensed verified datasets) · 6 Notifications · 7 AdMob+UMP · 8 Icon/UI redesign · 9 Signing workflow · 10 Play checklist.
