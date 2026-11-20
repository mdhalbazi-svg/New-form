/* My Islamic Daily Diary — complete single-file app.js
 * Offline-first personal diary. No prayer times are calculated or invented.
 * Requires index.html with <div id="app"></div>.
 */
(() => {
  'use strict';

  const STORE = 'idd_professional_v1';
  const HIJRI_KEY = 'idd_hijri_alarm_v1';
  const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const DEFAULT_TIMES = {
    Fajr: '--:--', Dhuhr: '--:--', Asr: '--:--',
    Maghrib: '--:--', Isha: '--:--'
  };

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const dateLabel = (value = today()) => {
    const d = new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime()) ? value :
      d.toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric',
        month: 'short', year: 'numeric'
      });
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
  }[c]));

  const clampInt = (v, min = 0, max = 100000) =>
    Math.min(max, Math.max(min, Math.floor(Number(v) || 0)));

  function defaults() {
    return {
      version: 2,
      date: today(),
      dark: false,
      city: 'Set your city',
      prayerTimes: { ...DEFAULT_TIMES },
      days: {},
      adhkarCount: 0,
      adhkarTarget: 100,
      quranTarget: 2,
      notes: [],
      customActs: []
    };
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!raw || typeof raw !== 'object') return defaults();

      const d = defaults();
      return {
        ...d,
        ...raw,
        prayerTimes: { ...d.prayerTimes, ...(raw.prayerTimes || {}) },
        days: raw.days && typeof raw.days === 'object' ? raw.days : {},
        notes: Array.isArray(raw.notes) ? raw.notes : [],
        customActs: Array.isArray(raw.customActs) ? raw.customActs : []
      };
    } catch (_) {
      return defaults();
    }
  }

  let state = load();
  let page = 'home';
  let expandedPrayerTimes = false;
  let hijriSettings = { adjustment: 0, enabled: false };

  try {
    hijriSettings = {
      ...hijriSettings,
      ...JSON.parse(localStorage.getItem(HIJRI_KEY) || '{}')
    };
  } catch (_) {}

  const root = document.getElementById('app') || (() => {
    const el = document.createElement('div');
    el.id = 'app';
    document.body.appendChild(el);
    return el;
  })();

  const css = `
  :root {
    --bg:#f5f1e7;
    --card:#fffefa;
    --ink:#172033;
    --muted:#687080;
    --gold:#c5a33c;
    --gold2:#eadca9;
    --line:#e8e1d2;
    --soft:#f7f0d9;
    --shadow:0 8px 28px rgba(54,43,15,.07);
  }

  * { box-sizing:border-box; }

  body {
    margin:0;
    background:var(--bg);
    font-family:Inter,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;
    color:var(--ink);
  }

  body.idd-dark {
    --bg:#151a20;
    --card:#202832;
    --ink:#f4f1e8;
    --muted:#b2bac5;
    --gold:#d7b64e;
    --gold2:#594c2a;
    --line:#39424d;
    --soft:#302b20;
    --shadow:0 8px 28px rgba(0,0,0,.18);
  }

  button,input,textarea,select { font:inherit; }
  button { cursor:pointer; }

  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline:3px solid #c5a33c88;
    outline-offset:2px;
  }

  .idd-wrap {
    max-width:760px;
    margin:auto;
    min-height:100vh;
    padding:14px 15px 104px;
  }

  .idd-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    background:#e9e5dc;
    padding:13px 15px;
    border-radius:0 0 16px 16px;
    margin:-14px -15px 17px;
  }

  body.idd-dark .idd-head { background:#29313a; }

  .idd-brand {
    flex:1;
    text-align:center;
    min-width:0;
  }

  .idd-brand strong {
    display:block;
    color:var(--gold);
    font-size:clamp(17px,4vw,23px);
    letter-spacing:.3px;
  }

  .idd-brand small {
    color:var(--muted);
    font-weight:700;
    letter-spacing:1px;
    font-size:10px;
  }

  .idd-iconbtn {
    flex:0 0 44px;
    border:0;
    background:var(--card);
    color:var(--gold);
    border-radius:14px;
    width:44px;
    height:44px;
    font-size:22px;
    box-shadow:var(--shadow);
  }

  .idd-card {
    background:var(--card);
    border:1px solid var(--line);
    border-radius:24px;
    padding:19px;
    margin:15px 0;
    box-shadow:var(--shadow);
  }

  .idd-prayer-top,.idd-row {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
  }

  .idd-row>* { min-width:0; }

  .idd-kicker {
    color:#947a28;
    font-weight:800;
    letter-spacing:1px;
    font-size:12px;
  }

  .idd-pill {
    display:inline-flex;
    align-items:center;
    gap:7px;
    border:1px solid var(--gold2);
    background:var(--soft);
    color:#a4872c;
    border-radius:99px;
    padding:8px 12px;
    font-weight:750;
    font-size:13px;
  }

  .idd-date {
    margin:15px 0;
    color:#947a28;
    font-weight:700;
  }

  .idd-next {
    font-size:clamp(25px,7vw,36px);
    font-weight:800;
    letter-spacing:-1px;
    margin:13px 0;
  }

  .idd-time {
    font-size:clamp(24px,6vw,34px);
    font-weight:850;
    white-space:nowrap;
  }

  .idd-rule {
    border:0;
    border-top:1px solid var(--line);
    margin:18px 0;
  }

  .idd-linkbtn {
    border:0;
    background:none;
    color:var(--gold);
    font-weight:800;
    padding:8px;
  }

  .idd-section-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:8px;
    margin:25px 0 12px;
  }

  .idd-section-head h2 { font-size:20px; margin:0; }

  .idd-feature-grid {
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:10px;
  }

  .idd-feature {
    min-width:0;
    background:var(--card);
    border:1px solid var(--line);
    border-radius:20px;
    padding:14px 5px;
    text-align:center;
    box-shadow:var(--shadow);
    color:var(--ink);
    font-weight:750;
  }

  .idd-feature span {
    display:block;
    font-size:29px;
    margin-bottom:7px;
  }

  .idd-feature small {
    font-size:11px;
    white-space:normal;
  }

  .idd-xp {
    display:flex;
    align-items:center;
    gap:10px;
  }

  .idd-xp-icon {
    background:linear-gradient(135deg,#f3d76b,#b58e16);
    color:#332600;
    border-radius:13px;
    padding:11px;
    font-size:20px;
  }

  .idd-level {
    border:1px solid var(--gold2);
    background:var(--soft);
    color:#9b7e24;
    padding:8px 11px;
    border-radius:12px;
    font-weight:750;
    font-size:12px;
  }

  .idd-progress {
    height:10px;
    border-radius:20px;
    background:var(--soft);
    overflow:hidden;
    margin:12px 0;
  }

  .idd-progress i {
    display:block;
    height:100%;
    background:linear-gradient(90deg,#b99627,#ead37b);
    border-radius:20px;
  }

  .idd-stat {
    display:flex;
    align-items:center;
    gap:12px;
    padding:12px 0;
    border-top:1px solid var(--line);
  }

  .idd-stat-icon {
    width:45px;
    height:45px;
    flex:0 0 45px;
    display:grid;
    place-items:center;
    background:var(--soft);
    border-radius:14px;
    font-size:22px;
  }

  .idd-stat b { display:block; }
  .idd-stat small { color:var(--muted); }
  .idd-check { accent-color:#b6952c; width:21px; height:21px; }

  .idd-bottom {
    position:fixed;
    z-index:5;
    bottom:0;
    left:0;
    right:0;
    background:var(--card);
    border-top:1px solid var(--line);
    display:flex;
    justify-content:center;
    padding:8px max(8px,env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom));
    box-shadow:0 -5px 22px #0000000c;
  }

  .idd-nav {
    width:min(760px,100%);
    display:grid;
    grid-template-columns:repeat(5,1fr);
    gap:3px;
  }

  .idd-nav button {
    border:0;
    background:none;
    color:var(--muted);
    padding:7px 2px;
    border-radius:15px;
    font-size:11px;
    font-weight:750;
  }

  .idd-nav button.active {
    color:#927721;
    background:var(--soft);
  }

  .idd-nav span {
    display:block;
    font-size:21px;
    margin-bottom:3px;
  }

  .idd-title { font-size:25px; margin:10px 0 4px; }
  .idd-muted { color:var(--muted); }

  .idd-btn {
    border:0;
    background:linear-gradient(135deg,#d8bb58,#b28e25);
    color:#fff;
    border-radius:13px;
    padding:11px 14px;
    font-weight:800;
    min-height:42px;
  }

  .idd-btn.secondary {
    background:var(--soft);
    color:#947a28;
    border:1px solid var(--gold2);
  }

  .idd-input {
    width:100%;
    border:1px solid var(--line);
    background:var(--bg);
    color:var(--ink);
    padding:11px;
    border-radius:12px;
    margin:6px 0 12px;
  }

  .idd-list { display:grid; gap:9px; }

  .idd-item {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:12px;
    border:1px solid var(--line);
    border-radius:14px;
    background:var(--card);
  }

  .idd-bigcount {
    text-align:center;
    font-size:52px;
    font-weight:850;
    color:var(--gold);
    padding:15px;
  }

  .idd-circle {
    width:158px;
    height:158px;
    border-radius:50%;
    border:8px solid var(--gold2);
    background:var(--soft);
    color:var(--gold);
    font-size:25px;
    font-weight:850;
    margin:10px auto;
    display:grid;
    place-items:center;
  }

  .idd-empty {
    text-align:center;
    padding:22px;
    color:var(--muted);
  }

  .idd-footer-note {
    text-align:center;
    color:var(--muted);
    font-size:11px;
    margin-top:20px;
  }

  .idd-actions { display:flex; flex-wrap:wrap; gap:9px; }
  .idd-actions>* { flex:1 1 130px; }
  .idd-note { white-space:pre-wrap; overflow-wrap:anywhere; }
  .idd-danger { color:#b23b35; }
  .idd-small { font-size:12px; }
  .idd-field-label { display:block; font-weight:700; margin:8px 0 3px; }

  @media(max-width:420px) {
    .idd-feature-grid { gap:7px; }
    .idd-feature { padding:12px 3px; }
    .idd-feature span { font-size:26px; }
    .idd-feature small { font-size:10px; }
    .idd-card { padding:16px; }
    .idd-pill { font-size:11px; padding:7px 9px; }
  }
  `;

  if (!document.getElementById('idd-professional-style')) {
    const style = document.createElement('style');
    style.id = 'idd-professional-style';
    style.textContent = css;
    document.head.appendChild(style);
  }  function day(date = state.date || today()) {
    if (!state.days[date]) {
      state.days[date] = {
        prayers: {},
        quranPages: 0,
        fast: false,
        good: []
      };
    }

    const d = state.days[date];
    if (!d.prayers || typeof d.prayers !== 'object') d.prayers = {};
    if (!Array.isArray(d.good)) d.good = [];
    d.quranPages = clampInt(d.quranPages);
    return d;
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      return true;
    } catch (err) {
      alert('ڈیٹا محفوظ نہیں ہوسکا۔ ممکن ہے فون کی اسٹوریج بھر گئی ہو۔');
      return false;
    }
  }

  function saveHijri() {
    try {
      localStorage.setItem(HIJRI_KEY, JSON.stringify(hijriSettings));
    } catch (_) {
      alert('ترتیبات محفوظ نہیں ہوسکیں۔');
    }
  }

  function setPage(p) {
    page = p;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function allDone() {
    return PRAYERS.filter(p => !!day().prayers[p]).length;
  }

  function progress() {
    return Math.round(allDone() / 5 * 100);
  }

  function nav() {
    return `<nav class="idd-bottom">
      <div class="idd-nav">
        ${[
          ['home','⌂','Home'],
          ['prayer','🕌','Prayer'],
          ['quran','📖','Quran'],
          ['azkar','📿','Azkar'],
          ['diary','✎','Diary'],
          ['more','☪','More']
        ].map(([id,ic,label]) =>
          `<button type="button"
            class="${page === id ? 'active' : ''}"
            data-page="${id}">
            <span>${ic}</span>${label}
          </button>`
        ).join('')}
      </div>
    </nav>`;
  }

  function header() {
    return `<header class="idd-head">
      <button type="button" class="idd-iconbtn"
        data-action="reminders" aria-label="Reminders">♧</button>
      <div class="idd-brand">
        <strong>☪ My Islamic Daily Diary</strong>
        <small>YOUR DAILY SPIRITUAL COMPANION</small>
      </div>
      <button type="button" class="idd-iconbtn"
        data-action="menu" aria-label="Menu">☰</button>
    </header>`;
  }

  function prayerCard() {
    return `<section class="idd-card">
      <div class="idd-prayer-top">
        <span class="idd-kicker">◉ &nbsp; DAILY PRAYER TRACKER</span>
        <button type="button" class="idd-pill" data-action="city">
          ⌖ ${esc(state.city)}
        </button>
      </div>

      <div class="idd-date">▢ &nbsp; ${esc(dateLabel())}</div>

      <div class="idd-row">
        <div class="idd-next">Today's Prayers</div>
        <div class="idd-time">${allDone()}/5</div>
      </div>

      <div class="idd-pill">
        ✓ &nbsp; ${allDone()} of 5 prayers completed
      </div>

      <hr class="idd-rule">

      <div class="idd-row">
        <span class="idd-muted">Prayer times</span>
        <button type="button" class="idd-linkbtn" data-action="times">
          ${expandedPrayerTimes ? 'Hide prayer times⌃' : 'Edit prayer times⌄'}
        </button>
      </div>

      ${expandedPrayerTimes ? `
        <div class="idd-list">
          ${PRAYERS.map(p => `
            <div class="idd-item">
              <b>${p}</b>
              <input class="idd-input"
                aria-label="${p} time"
                style="width:125px;margin:0"
                type="time"
                data-time="${p}"
                value="${esc(state.prayerTimes[p] === '--:--' ? '' : state.prayerTimes[p])}">
            </div>
          `).join('')}
        </div>
        <p class="idd-muted idd-small">
          Enter prayer times from a trusted local timetable.
          This app does not calculate prayer times.
        </p>
      ` : ''}

      <button type="button" class="idd-linkbtn"
        data-page="prayer">Open prayer tracker →</button>
    </section>`;
  }

  function featureCards() {
    return `<div class="idd-section-head">
      <h2>Features</h2>
      <span class="idd-muted">Your daily tools</span>
    </div>

    <div class="idd-feature-grid">
      ${[
        ['prayer','🕌','Prayer Log'],
        ['azkar','🤲','Dua & Azkar'],
        ['azkar','📿','Tasbih'],
        ['diary','📅','Daily Diary']
      ].map(([p,ic,l]) => `
        <button type="button" class="idd-feature" data-page="${p}">
          <span>${ic}</span>
          <small>${l}</small>
        </button>
      `).join('')}
    </div>`;
  }

  function dashboard() {
    const xp = allDone() * 20 +
      Math.min(100, day().quranPages * 5) +
      day().good.length * 10;

    return `${prayerCard()}${featureCards()}

      <section class="idd-card">
        <div class="idd-row">
          <div class="idd-xp">
            <span class="idd-xp-icon">✦</span>
            <b>Today's Deen Progress</b>
          </div>
          <span class="idd-level">
            ${xp >= 100 ? 'Achiever' : xp >= 50 ? 'Growing' : 'Beginner'}
          </span>
        </div>

        <div class="idd-row" style="margin-top:18px">
          <b style="color:var(--gold)">${xp} XP</b>
          <span class="idd-muted">
            ${Math.max(0,100 - xp % 100)} XP to next level
          </span>
        </div>

        <div class="idd-progress">
          <i style="width:${xp % 100}%"></i>
        </div>

        <div class="idd-stat">
          <span class="idd-stat-icon">☑</span>
          <div style="flex:1">
            <b>5 Obligatory Prayers</b>
            <small>${allDone()} / 5 prayed</small>
          </div>
          <b>${progress()}%</b>
        </div>

        <div class="idd-stat">
          <span class="idd-stat-icon">📖</span>
          <div style="flex:1">
            <b>Quran Recitation</b>
            <small>${day().quranPages} pages today</small>
          </div>
          <b>${state.quranTarget} target</b>
        </div>

        <div class="idd-stat">
          <span class="idd-stat-icon">🤲</span>
          <div style="flex:1">
            <b>Good Deeds</b>
            <small>${day().good.length} completed</small>
          </div>
        </div>
      </section>`;
  }

  function prayerPage() {
    return `<h1 class="idd-title">Prayer Log</h1>
      <p class="idd-muted">
        Record your five daily obligatory prayers.
      </p>

      <section class="idd-card">
        <div class="idd-row">
          <b>${esc(dateLabel())}</b>
          <span class="idd-pill">${allDone()} / 5 complete</span>
        </div>

        ${PRAYERS.map((p,i) => `
          <div class="idd-stat">
            <span class="idd-stat-icon">
              ${['🌅','☀️','🌤️','🌇','🌙'][i]}
            </span>
            <div style="flex:1">
              <b>${p}</b>
              <small>${day().prayers[p] ? 'Completed' : 'Not marked yet'}</small>
            </div>
            <input class="idd-check"
              type="checkbox"
              aria-label="Mark ${p} completed"
              data-prayer="${p}"
              ${day().prayers[p] ? 'checked' : ''}>
          </div>
        `).join('')}
      </section>`;
  }

  function quranPage() {
    return `<h1 class="idd-title">Quran Tracker</h1>
      <p class="idd-muted">
        Keep a record of your daily recitation.
      </p>

      <section class="idd-card">
        <div class="idd-bigcount">${day().quranPages}</div>

        <p style="text-align:center" class="idd-muted">
          Pages recited today
        </p>

        <div class="idd-row">
          <button type="button" class="idd-btn secondary"
            data-action="qminus">− One page</button>

          <button type="button" class="idd-btn"
            data-action="qplus">＋ One page</button>
        </div>

        <hr class="idd-rule">

        <label class="idd-field-label" for="idd-quran-target">
          Daily target (pages)
        </label>

        <input id="idd-quran-target"
          class="idd-input"
          type="number"
          min="1"
          max="1000"
          data-setting="quranTarget"
          value="${state.quranTarget}">

        <div class="idd-progress">
          <i style="width:${Math.min(100, day().quranPages / Math.max(1,state.quranTarget) * 100)}%"></i>
        </div>
      </section>`;
  }

  function azkarPage() {
    return `<h1 class="idd-title">Dua, Azkar & Tasbih</h1>
      <p class="idd-muted">
        Use the counter for your daily remembrance.
      </p>

      <section class="idd-card">
        <div class="idd-row">
          <b>Personal Tasbih Counter</b>
          <span class="idd-pill">Target ${state.adhkarTarget}</span>
        </div>

        <button type="button" class="idd-circle" data-action="count">
          ${state.adhkarCount}
          <small style="font-size:12px">TAP TO COUNT</small>
        </button>

        <div class="idd-row">
          <button type="button" class="idd-btn secondary"
            data-action="resetcount">Reset</button>
          <button type="button" class="idd-btn"
            data-action="target">Set target</button>
        </div>

        <div class="idd-progress">
          <i style="width:${Math.min(100,state.adhkarCount / Math.max(1,state.adhkarTarget) * 100)}%"></i>
        </div>
      </section>

      <section class="idd-card">
        <h3>Daily remembrance</h3>
        <p class="idd-muted">
          You can use this counter with any dhikr or wird of your choice.
        </p>
        <button type="button" class="idd-btn secondary"
          data-action="count">
          سبحان الله • الحمد لله • الله أكبر
        </button>
      </section>`;
           }  function diaryPage() {
    return `<h1 class="idd-title">Daily Diary</h1>
      <p class="idd-muted">Notes, fasting and personal good deeds.</p>

      <section class="idd-card">
        <h3>Today's reflection</h3>
        <textarea class="idd-input" rows="4" id="idd-note"
          placeholder="Write your reflection or note..."></textarea>
        <button type="button" class="idd-btn" data-action="addnote">Save note</button>

        <hr class="idd-rule">

        <div class="idd-row">
          <b>Fasting today</b>
          <input class="idd-check" type="checkbox" data-fast ${day().fast ? 'checked' : ''}>
        </div>

        <hr class="idd-rule">
        <h3>Good deeds checklist</h3>
        <div class="idd-list">
          ${[
            'Helped someone',
            'Gave charity',
            'Maintained family ties',
            'Read beneficial knowledge',
            'Avoided harmful speech'
          ].map((x,i) => `
            <label class="idd-item">
              <span>${x}</span>
              <input class="idd-check" type="checkbox"
                data-good="${i}" ${day().good.includes(i) ? 'checked' : ''}>
            </label>
          `).join('')}
        </div>
      </section>

      <section class="idd-card">
        <h3>Saved notes</h3>
        ${state.notes.length
          ? state.notes.slice().reverse().map((n,i) => `
            <div class="idd-item">
              <div style="min-width:0;flex:1">
                <b>${esc(dateLabel(n.date))}</b>
                <div class="idd-muted idd-note">${esc(n.text)}</div>
              </div>
              <button type="button" class="idd-linkbtn idd-danger"
                data-delete-note="${state.notes.length - 1 - i}">Delete</button>
            </div>
          `).join('')
          : '<p class="idd-empty">No notes saved yet.</p>'
        }
      </section>

      <section class="idd-card">
        <h3>Prayer reminders</h3>
        <p class="idd-muted idd-small">
          Prayer times must be entered manually from a reliable local timetable.
          Notifications are local reminders, not an Adhan recording.
        </p>
        <label>
          <input type="checkbox" id="idd-alarm-enabled"
            ${hijriSettings.enabled ? 'checked' : ''}>
          Enable prayer notifications
        </label>
        <button type="button" class="idd-btn"
          data-action="schedule-alarms" style="margin-top:12px">
          Schedule today's remaining times
        </button>
      </section>

      <section class="idd-card">
        <h3>Backup & reports</h3>
        <div class="idd-actions">
          <button type="button" class="idd-btn secondary" data-action="export">
            Export backup
          </button>
          <button type="button" class="idd-btn secondary" data-action="csv">
            Export CSV
          </button>
        </div>
        <p class="idd-muted idd-small">
          Keep a backup before clearing browser data or changing phones.
        </p>
        <label class="idd-btn secondary" style="display:inline-block">
          Import backup
          <input type="file" accept="application/json,.json" id="idd-import" hidden>
        </label>
        <button type="button" class="idd-btn secondary"
          data-action="theme" style="margin:8px 0">
          Toggle dark mode
        </button>
      </section>`;
  }

  function hijriText() {
    const d = new Date();
    d.setDate(d.getDate() + Number(hijriSettings.adjustment || 0));

    try {
      return new Intl.DateTimeFormat(
        'ur-PK-u-ca-islamic-umalqura',
        { day:'numeric', month:'long', year:'numeric' }
      ).format(d);
    } catch (_) {
      return 'ہجری تاریخ دستیاب نہیں';
    }
  }

  function hijriCard() {
    return `<section class="idd-card">
      <div class="idd-row">
        <div>
          <div class="idd-kicker">اسلامی تاریخ</div>
          <h2 style="color:var(--gold)">${esc(hijriText())}</h2>
          <small class="idd-muted">مقامی رؤیتِ ہلال سے تصدیق کریں</small>
        </div>
        <span class="idd-stat-icon">🌙</span>
      </div>

      <label class="idd-field-label" for="idd-hijri-adjust">
        ہجری تاریخ کی درستگی
      </label>
      <select id="idd-hijri-adjust" class="idd-input">
        ${[-2,-1,0,1,2].map(n => `
          <option value="${n}"
            ${Number(hijriSettings.adjustment) === n ? 'selected' : ''}>
            ${n === 0 ? 'کوئی تبدیلی' : n > 0 ? '+' + n + ' دن' : n + ' دن'}
          </option>
        `).join('')}
      </select>
    </section>`;
  }


  const EXTRA_STORE='idd_extra_v1';
  let extra={lang:'ur',surah:1,reader:null,prayer:null,qibla:null};
  try{extra={...extra,...JSON.parse(localStorage.getItem(EXTRA_STORE)||'{}')}}catch(_){}
  const saveExtra=()=>localStorage.setItem(EXTRA_STORE,JSON.stringify(extra));
  const surahNames=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
  function extraPage(){
    const cached=Object.keys(localStorage).filter(k=>k.startsWith('idd_surah_')).length;
    return `<section class="idd-card"><div class="idd-kicker">ISLAMIC LIFE CENTER</div><h2>اسلامی سہولیات / Islamic Services / الخدمات الإسلامية</h2>
      <label class="idd-field-label">زبان / Language / اللغة</label><select id="extra-lang" class="idd-input"><option value="ur" ${extra.lang==='ur'?'selected':''}>اردو</option><option value="en" ${extra.lang==='en'?'selected':''}>English</option><option value="ar" ${extra.lang==='ar'?'selected':''}>العربية</option></select>
      <h3>قرآنِ کریم · Quran · القرآن الكريم</h3><p class="idd-muted">114 سورتیں۔ منتخب سورت انٹرنیٹ سے حاصل کرکے فون میں محفوظ کی جاسکتی ہے۔</p>
      <select id="extra-surah" class="idd-input">${surahNames.map((n,i)=>`<option value="${i+1}" ${extra.surah===i+1?'selected':''}>${i+1}. ${n}</option>`).join('')}</select>
      <div class="idd-row" style="margin-top:10px;flex-wrap:wrap"><button class="idd-btn" data-action="load-surah">سورت پڑھیں / Read</button><button class="idd-btn secondary" data-action="save-surah">آف لائن محفوظ کریں / Download</button></div>
      <p class="idd-muted">محفوظ سورتیں: ${cached} · Audio recitation streams from Alafasy; audio requires internet.</p><div id="extra-reader">${extra.reader||'سورت منتخب کرکے پڑھیں۔'}</div>
      <h3>نماز کے اوقات / Prayer Times</h3><p>اپنی اجازت سے مقام حاصل کرکے آج کے اوقات دیکھیں۔</p><button class="idd-btn" data-action="get-prayers">مقام سے اوقات معلوم کریں</button><div id="extra-prayer">${extra.prayer||''}</div>
      <h3>قبلہ رخ / Qibla</h3><button class="idd-btn secondary" data-action="get-qibla">قبلہ کی سمت معلوم کریں</button><div id="extra-qibla">${extra.qibla||''}</div>
      <h3>زکوٰۃ کیلکولیٹر / Zakat Calculator</h3><label class="idd-field-label">قابلِ زکوٰۃ مال (روپے)</label><input class="idd-input" id="zakat-amount" type="number" min="0" placeholder="مثلاً 500000"><button class="idd-btn" data-action="zakat">حساب کریں</button><div id="zakat-result"></div><small class="idd-muted">یہ سادہ 2.5% تخمینہ ہے؛ نصاب، قرض اور قمری سال کی شرائط الگ سے جانچیں۔</small>
      <h3>قرآن سیکھنے کے لیے قاری صاحب</h3><p>ناظرہ، تجوید اور حفظ کی رہنمائی کے لیے WhatsApp پر رابطہ کریں۔</p><a class="idd-btn" style="display:inline-block;text-decoration:none" href="https://wa.me/923061856055?text=Assalamu%20Alaikum%2C%20I%20want%20to%20learn%20Quran." target="_blank" rel="noopener">WhatsApp پر رابطہ کریں</a>
      <h3>دینی رہنمائی / Islamic learning</h3><div class="idd-row" style="flex-wrap:wrap"><a class="idd-pill" href="https://www.banuri.edu.pk/" target="_blank" rel="noopener">دارالافتاء بنوری ٹاؤن</a><a class="idd-pill" href="https://sunnah.com/" target="_blank" rel="noopener">حدیث کی کتب</a><a class="idd-pill" href="https://www.islamhouse.com/" target="_blank" rel="noopener">اسلامی کتب</a><a class="idd-pill" href="https://haj.gov.sa/" target="_blank" rel="noopener">حج و عمرہ</a></div>
      <h3>وراثت / Inheritance</h3><p class="idd-muted">شرعی وراثت میں حصے وارثوں، موانع، قرض اور وصیت کے مطابق بدلتے ہیں۔ اس ایپ میں غیر مصدقہ خودکار فتویٰ یا تقسیم نہیں دی جائے گی۔ مستند مفتی/دارالافتاء سے حساب کی تصدیق ضروری ہے۔</p>
    </section>`;
  }
  async function loadExtraSurah(saveOffline){
    const n=Number(root.querySelector('#extra-surah')?.value||extra.surah);extra.surah=n;
    const key='idd_surah_'+n;let data;
    try{const old=localStorage.getItem(key);if(saveOffline&&old){data=JSON.parse(old)}else{const r=await fetch(`https://api.alquran.cloud/v1/surah/${n}/ur.jalandhry`);if(!r.ok)throw Error('Quran service response '+r.status);const j=await r.json();if(j.code!==200)throw Error('Quran data unavailable');data=j.data;if(saveOffline){try{localStorage.setItem(key,JSON.stringify(data))}catch(_){throw Error('فون کی اسٹوریج کم ہے؛ کچھ جگہ خالی کریں')}}}
      const verses=data.ayahs||[];extra.reader=`<h4>${esc(data.name||surahNames[n-1])}</h4>${verses.map(a=>`<article style="padding:10px 0;border-bottom:1px solid var(--line)"><div dir="rtl" style="font-size:24px;line-height:1.9">${esc(a.text)}</div><small>${a.numberInSurah||''}</small></article>`).join('')}<audio controls preload="none" style="width:100%" src="https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3"></audio>`;
      saveExtra();const el=root.querySelector('#extra-reader');if(el)el.innerHTML=extra.reader;alert(saveOffline?'سورت فون میں محفوظ ہوگئی۔':'سورت لوڈ ہوگئی۔');
    }catch(e){alert('قرآن لوڈ نہیں ہوسکا: '+e.message)}
  }
  function getGeo(){return new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(Error('اس ڈیوائس میں مقام کی سہولت دستیاب نہیں'));navigator.geolocation.getCurrentPosition(p=>resolve(p.coords),e=>reject(Error(e.message)),{enableHighAccuracy:true,timeout:15000})})}
  async function getPrayerTimes(){try{const c=await getGeo();const r=await fetch(`https://api.aladhan.com/v1/timings?latitude=${c.latitude}&longitude=${c.longitude}&method=1`);const j=await r.json();if(j.code!==200)throw Error('Prayer time service unavailable');const t=j.data.timings;extra.prayer=['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(k=>`${k}: ${t[k]}`).join(' · ');saveExtra();const el=root.querySelector('#extra-prayer');if(el)el.textContent=extra.prayer}catch(e){alert('نماز کے اوقات حاصل نہیں ہوئے: '+e.message)}}
  async function getQibla(){try{const c=await getGeo();const r=await fetch(`https://api.aladhan.com/v1/qibla/${c.latitude}/${c.longitude}`);const j=await r.json();if(j.code!==200)throw Error('Qibla service unavailable');extra.qibla=`قبلہ کا زاویہ: ${Number(j.data.direction).toFixed(1)}° شمال سے گھڑی کی سمت`;saveExtra();const el=root.querySelector('#extra-qibla');if(el)el.textContent=extra.qibla}catch(e){alert('قبلہ کی سمت حاصل نہیں ہوئی: '+e.message)}}

  function render() {
    document.body.classList.toggle('idd-dark', !!state.dark);

    const content =
      page === 'home'
        ? hijriCard() + dashboard()
        : page === 'prayer'
          ? prayerPage()
          : page === 'quran'
            ? quranPage()
            : page === 'azkar'
              ? azkarPage()
              : page === 'more' ? extraPage() : diaryPage() + hijriCard();

    root.innerHTML = `
      <div class="idd-wrap">
        ${header()}
        ${content}
        <div class="idd-footer-note">
          My Islamic Daily Diary · Your personal offline diary
        </div>
      </div>
      ${nav()}
    `;
  }

  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJSON() {
    const payload = {
      app: 'My Islamic Daily Diary',
      exportedAt: new Date().toISOString(),
      state,
      hijriSettings
    };

    download(
      `islamic-diary-backup-${today()}.json`,
      JSON.stringify(payload, null, 2),
      'application/json'
    );
  }

  function csvCell(v) {
    return '"' + String(v ?? '').replace(/"/g, '""') + '"';
  }

  function exportCSV() {
    const rows = [[
      'Date','Fajr','Dhuhr','Asr','Maghrib',
      'Isha','Quran pages','Fasting','Good deeds'
    ]];

    Object.keys(state.days).sort().forEach(date => {
      const d = day(date);
      rows.push([
        date,
        ...PRAYERS.map(p => d.prayers[p] ? 'Yes' : 'No'),
        d.quranPages,
        d.fast ? 'Yes' : 'No',
        d.good.join('; ')
      ]);
    });

    const csv = '\uFEFF' +
      rows.map(r => r.map(csvCell).join(',')).join('\r\n');

    download(
      `islamic-diary-report-${today()}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  }

  async function importJSON(file) {
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const incoming =
        parsed.state && typeof parsed.state === 'object'
          ? parsed.state
          : parsed;

      if (
        !incoming ||
        typeof incoming !== 'object' ||
        !incoming.days ||
        typeof incoming.days !== 'object'
      ) {
        throw new Error('یہ درست ڈائری بیک اَپ فائل نہیں ہے۔');
      }

      if (!confirm(
        'Import کرنے سے موجودہ ڈائری کا ڈیٹا تبدیل ہوجائے گا۔ کیا جاری رکھیں؟'
      )) return;

      const d = defaults();

      state = {
        ...d,
        ...incoming,
        prayerTimes: {
          ...d.prayerTimes,
          ...(incoming.prayerTimes || {})
        },
        days: incoming.days,
        notes: Array.isArray(incoming.notes) ? incoming.notes : [],
        customActs: Array.isArray(incoming.customActs)
          ? incoming.customActs : []
      };

      if (parsed.hijriSettings) {
        hijriSettings = {
          ...hijriSettings,
          ...parsed.hijriSettings
        };
      }

      save();
      saveHijri();
      render();
      alert('بیک اَپ کامیابی سے بحال ہوگیا۔');

    } catch (err) {
      alert('بیک اَپ درآمد نہیں ہوسکا: ' + err.message);
    }
  }

  async function scheduleAlarms() {
    const cap = window.Capacitor;
    const plugin = cap?.Plugins?.LocalNotifications;

    if (!cap?.isNativePlatform?.() || !plugin) {
      alert(
        'Android ایپ میں Capacitor Local Notifications plugin شامل اور sync ہونا ضروری ہے۔'
      );
      return;
    }

    const perm = await plugin.requestPermissions();

    if (perm.display !== 'granted') {
      alert('نوٹیفکیشن کی اجازت نہیں ملی۔');
      return;
    }

    const now = new Date();
    const notifications = [];

    PRAYERS.forEach((name,i) => {
      const t = state.prayerTimes[name];

      if (!t || t === '--:--' ||
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return;

      const [h,m] = t.split(':').map(Number);
      const at = new Date();
      at.setHours(h,m,0,0);

      if (at > now) {
        notifications.push({
          id: 7100 + i,
          title: 'نماز کا وقت',
          body: `${name} prayer time`,
          schedule: { at }
        });
      }
    });

    if (!notifications.length) {
      alert('آج کے لیے کوئی آئندہ نماز کا درست وقت درج نہیں۔');
      return;
    }

    await plugin.schedule({ notifications });

    alert(
      `${notifications.length} نوٹیفکیشن آج کے لیے شیڈول ہوگئے۔ یہ بولی ہوئی اذان نہیں ہے۔`
    );
  }

  root.addEventListener('click', e => {
    const pageBtn = e.target.closest('[data-page]');

    if (pageBtn) {
      setPage(pageBtn.dataset.page);
      return;
    }

    const deleteNote = e.target.closest('[data-delete-note]');

    if (deleteNote) {
      const i = Number(deleteNote.dataset.deleteNote);

      if (
        Number.isInteger(i) &&
        i >= 0 &&
        i < state.notes.length &&
        confirm('یہ نوٹ حذف کردیں؟')
      ) {
        state.notes.splice(i,1);
        save();
        render();
      }
      return;
    }

    const b = e.target.closest('[data-action]');
    if (!b) return;

    const a = b.dataset.action;

    if(a==='load-surah'){loadExtraSurah(false);return;}
    if(a==='save-surah'){loadExtraSurah(true);return;}
    if(a==='get-prayers'){getPrayerTimes();return;}
    if(a==='get-qibla'){getQibla();return;}
    if(a==='zakat'){const n=Number(root.querySelector('#zakat-amount')?.value||0);const el=root.querySelector('#zakat-result');if(el)el.textContent=n>0?`تخمینی زکوٰۃ: Rs. ${(n*0.025).toLocaleString('en-PK',{maximumFractionDigits:2})}`:'درست رقم درج کریں۔';return;}

    if (a === 'times') {
      expandedPrayerTimes = !expandedPrayerTimes;
      render();
    }

    else if (a === 'schedule-alarms') {
      scheduleAlarms().catch(err =>
        alert('نوٹیفکیشن شیڈول نہیں ہوسکے: ' + err.message)
      );
    }

    else if (a === 'city') {
      const v = prompt('Enter your city or area:', state.city);
      if (v && v.trim()) {
        state.city = v.trim();
        save();
        render();
      }
    }

    else if (a === 'menu') {
      const choice = prompt(
        'Type: settings, backup, or home',
        'settings'
      );

      if (choice === 'settings') setPage('diary');
      else if (choice === 'backup') exportJSON();
      else if (choice === 'home') setPage('home');
    }

    else if (a === 'reminders') {
      alert(
        'Prayer reminders can be scheduled from the Daily Diary page after entering prayer times.'
      );
    }

    else if (a === 'qplus') {
      day().quranPages++;
      save();
      render();
    }

    else if (a === 'qminus') {
      day().quranPages = Math.max(0,day().quranPages - 1);
      save();
      render();
    }

    else if (a === 'count') {
      state.adhkarCount = clampInt(state.adhkarCount + 1);
      save();
      render();
    }

    else if (a === 'resetcount') {
      if (confirm('Reset the tasbih counter to zero?')) {
        state.adhkarCount = 0;
        save();
        render();
      }
    }

    else if (a === 'target') {
      const v = prompt(
        'Set your tasbih target:',
        String(state.adhkarTarget)
      );

      if (v !== null) {
        const n = Number(v);

        if (Number.isInteger(n) && n > 0 && n <= 100000) {
          state.adhkarTarget = n;
          save();
          render();
        } else {
          alert('Please enter a whole number from 1 to 100000.');
        }
      }
    }

    else if (a === 'addnote') {
      const field = root.querySelector('#idd-note');
      const noteText = field?.value.trim();

      if (!noteText) {
        alert('Please write a note first.');
        return;
      }

      state.notes.push({
        date: today(),
        text: noteText
      });

      save();
      render();
    }

    else if (a === 'export') {
      exportJSON();
    }

    else if (a === 'csv') {
      exportCSV();
    }

    else if (a === 'theme') {
      state.dark = !state.dark;
      save();
      render();
    }
  });

  root.addEventListener('change', e => {
    const t = e.target;

    if(t.id==='extra-lang'){extra.lang=t.value;saveExtra();alert('زبان کی ترجیح محفوظ ہوگئی۔ مکمل ترجمہ شدہ انٹرفیس اگلے مرحلے میں درکار ہے۔');}
    else if(t.id==='extra-surah'){extra.surah=Number(t.value);saveExtra();}

    if (t.matches('[data-prayer]')) {
      day().prayers[t.dataset.prayer] = t.checked;
      save();
      render();
    }

    else if (t.matches('[data-time]')) {
      state.prayerTimes[t.dataset.time] = t.value || '--:--';
      save();
    }

    else if (t.matches('[data-fast]')) {
      day().fast = t.checked;
      save();
    }

    else if (t.matches('[data-good]')) {
      const id = Number(t.dataset.good);
      const list = day().good;

      day().good = t.checked
        ? [...new Set([...list,id])]
        : list.filter(x => x !== id);

      save();
    }

    else if (t.matches('[data-setting="quranTarget"]')) {
      const n = Number(t.value);

      if (Number.isInteger(n) && n >= 1 && n <= 1000) {
        state.quranTarget = n;
        save();
        render();
      } else {
        alert('Daily target must be between 1 and 1000 pages.');
        t.value = state.quranTarget;
      }
    }

    else if (t.id === 'idd-hijri-adjust') {
      hijriSettings.adjustment = Number(t.value) || 0;
      saveHijri();
      render();
    }

    else if (t.id === 'idd-alarm-enabled') {
      hijriSettings.enabled = t.checked;
      saveHijri();
    }

    else if (t.id === 'idd-import') {
      importJSON(t.files?.[0]);
      t.value = '';
    }
  });

  if (state.date !== today()) state.date = today();

  day();
  render();

})();
