
/* My Islamic Daily Diary — Professional UI
   Single-file app.js
   Requires: <div id="app"></div> in index.html
*/
(() => {
  'use strict';

  const STORE = 'idd_professional_v1';

  const today = () => new Date().toISOString().slice(0, 10);

  const dateLabel = (value = today()) =>
    new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

  const defaults = () => ({
    version: 1,
    date: today(),
    dark: false,
    city: 'Set your city',
    prayerTimes: {
      Fajr: '--:--',
      Dhuhr: '--:--',
      Asr: '--:--',
      Maghrib: '--:--',
      Isha: '--:--'
    },
    days: {},
    adhkarCount: 0,
    adhkarTarget: 100,
    quranPages: 0,
    quranTarget: 2,
    notes: [],
    customActs: [],
    fasting: {},
    hijriAdjustment: 0
  });

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || 'null');

      if (!raw || typeof raw !== 'object') {
        return defaults();
      }

      const d = defaults();

      return {
        ...d,
        ...raw,
        prayerTimes: {
          ...d.prayerTimes,
          ...(raw.prayerTimes || {})
        },
        days: raw.days && typeof raw.days === 'object'
          ? raw.days : {},
        notes: Array.isArray(raw.notes)
          ? raw.notes : [],
        customActs: Array.isArray(raw.customActs)
          ? raw.customActs : []
      };
    } catch (_) {
      return defaults();
    }
  }

  let state = load();
  let page = 'home';
  let expandedPrayerTimes = false;

  const root = document.getElementById('app') || (() => {
    const el = document.createElement('div');
    el.id = 'app';
    document.body.appendChild(el);
    return el;
  })();

  const css = `
  :root {
    --bg: #f5f1e7;
    --card: #fffefa;
    --ink: #172033;
    --muted: #687080;
    --gold: #c5a33c;
    --gold2: #eadca9;
    --line: #e8e1d2;
    --soft: #f7f0d9;
    --shadow: 0 8px 28px rgba(54,43,15,.07);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: var(--bg);
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
    color: var(--ink);
  }

  body.idd-dark {
    --bg: #151a20;
    --card: #202832;
    --ink: #f4f1e8;
    --muted: #b2bac5;
    --gold: #d7b64e;
    --gold2: #594c2a;
    --line: #39424d;
    --soft: #302b20;
    --shadow: 0 8px 28px rgba(0,0,0,.18);
  }

  button, input, textarea, select {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  .idd-wrap {
    max-width: 760px;
    margin: auto;
    min-height: 100vh;
    padding: 14px 15px 104px;
  }

  .idd-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #e9e5dc;
    padding: 13px 15px;
    border-radius: 0 0 16px 16px;
    margin: -14px -15px 17px;
  }

  body.idd-dark .idd-head {
    background: #29313a;
  }

  .idd-brand {
    flex: 1;
    text-align: center;
  }

  .idd-brand strong {
    display: block;
    color: var(--gold);
    font-size: 23px;
    letter-spacing: .3px;
    text-shadow: 0 2px 2px #a58a3a55;
  }

  .idd-brand small {
    color: var(--muted);
    font-weight: 700;
    letter-spacing: 1.4px;
  }

  .idd-iconbtn {
    border: 0;
    background: var(--card);
    color: var(--gold);
    border-radius: 15px;
    width: 48px;
    height: 48px;
    font-size: 24px;
    box-shadow: var(--shadow);
  }

  .idd-card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 27px;
    padding: 20px;
    margin: 15px 0;
    box-shadow: var(--shadow);
  }

  .idd-prayer-top,
  .idd-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .idd-kicker {
    color: #947a28;
    font-weight: 800;
    letter-spacing: 1px;
    font-size: 14px;
  }

  .idd-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--gold2);
    background: var(--soft);
    color: #a4872c;
    border-radius: 99px;
    padding: 9px 13px;
    font-weight: 750;
  }

  .idd-date {
    margin: 15px 0;
    color: #947a28;
    font-weight: 700;
  }

  .idd-next {
    font-size: clamp(27px,7vw,40px);
    font-weight: 800;
    letter-spacing: -1px;
    margin: 13px 0;
  }

  .idd-time {
    font-size: clamp(25px,6vw,36px);
    font-weight: 850;
    white-space: nowrap;
  }

  .idd-rule {
    border: 0;
    border-top: 1px solid var(--line);
    margin: 20px 0;
  }

  .idd-linkbtn {
    border: 0;
    background: none;
    color: var(--gold);
    font-weight: 800;
    padding: 8px;
  }

  .idd-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 25px 0 12px;
  }

  .idd-section-head h2 {
    font-size: 21px;
    margin: 0;
  }

  .idd-feature-grid {
    display: grid;
    grid-template-columns: repeat(4,minmax(0,1fr));
    gap: 10px;
  }

  .idd-feature {
    min-width: 0;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 23px;
    padding: 15px 7px;
    text-align: center;
    box-shadow: var(--shadow);
    color: var(--ink);
    font-weight: 750;
  }

  .idd-feature span {
    display: block;
    font-size: 31px;
    margin-bottom: 8px;
  }

  .idd-feature small {
    font-size: 12px;
    white-space: nowrap;
  }

  .idd-xp {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .idd-xp-icon {
    background: linear-gradient(135deg,#f3d76b,#b58e16);
    color: #332600;
    border-radius: 13px;
    padding: 12px;
    font-size: 20px;
  }

  .idd-level {
    border: 1px solid var(--gold2);
    background: var(--soft);
    color: #9b7e24;
    padding: 8px 12px;
    border-radius: 12px;
    font-weight: 750;
  }

  .idd-progress {
    height: 10px;
    border-radius: 20px;
    background: var(--soft);
    overflow: hidden;
    margin: 12px 0;
  }

  .idd-progress i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg,#b99627,#ead37b);
    border-radius: 20px;
  }

  .idd-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 0;
    border-top: 1px solid var(--line);
  }

  .idd-stat-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    background: var(--soft);
    border-radius: 15px;
    font-size: 23px;
  }

  .idd-stat b {
    display: block;
  }

  .idd-stat small {
    color: var(--muted);
  }

  .idd-check {
    accent-color: #b6952c;
    width: 21px;
    height: 21px;
  }

  .idd-bottom {
    position: fixed;
    z-index: 5;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--card);
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: center;
    padding: 8px max(8px,env(safe-area-inset-right))
      calc(8px + env(safe-area-inset-bottom));
    box-shadow: 0 -5px 22px #0000000c;
  }

  .idd-nav {
    width: min(760px,100%);
    display: grid;
    grid-template-columns: repeat(5,1fr);
    gap: 3px;
  }

  .idd-nav button {
    border: 0;
    background: none;
    color: var(--muted);
    padding: 7px 2px;
    border-radius: 17px;
    font-size: 11px;
    font-weight: 750;
  }

  .idd-nav button.active {
    color: #927721;
    background: var(--soft);
  }

  .idd-nav span {
    display: block;
    font-size: 22px;
    margin-bottom: 3px;
  }

  .idd-title {
    font-size: 25px;
    margin: 10px 0 4px;
  }

  .idd-muted {
    color: var(--muted);
  }

  .idd-btn {
    border: 0;
    background: linear-gradient(135deg,#d8bb58,#b28e25);
    color: #fff;
    border-radius: 13px;
    padding: 12px 16px;
    font-weight: 800;
  }

  .idd-btn.secondary {
    background: var(--soft);
    color: #947a28;
    border: 1px solid var(--gold2);
  }

  .idd-input {
    width: 100%;
    border: 1px solid var(--line);
    background: var(--bg);
    color: var(--ink);
    padding: 12px;
    border-radius: 12px;
    margin: 6px 0 12px;
  }

  .idd-list {
    display: grid;
    gap: 9px;
  }

  .idd-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px;
    border: 1px solid var(--line);
    border-radius: 15px;
    background: var(--card);
  }

  .idd-bigcount {
    text-align: center;
    font-size: 54px;
    font-weight: 850;
    color: var(--gold);
    padding: 18px;
  }

  .idd-circle {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 8px solid var(--gold2);
    background: var(--soft);
    color: var(--gold);
    font-size: 25px;
    font-weight: 850;
    margin: 10px auto;
    display: grid;
    place-items: center;
  }

  .idd-empty {
    text-align: center;
    padding: 25px;
    color: var(--muted);
  }

  .idd-footer-note {
    text-align: center;
    color: var(--muted);
    font-size: 11px;
    margin-top: 20px;
  }

  @media(max-width:420px) {
    .idd-feature-grid {
      gap: 7px;
    }

    .idd-feature {
      padding: 13px 3px;
    }

    .idd-feature span {
      font-size: 27px;
    }

    .idd-feature small {
      font-size: 10px;
    }

    .idd-card {
      padding: 17px;
    }
  }
  `;

  if (!document.getElementById('idd-professional-style')) {
    const style = document.createElement('style');
    style.id = 'idd-professional-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  const day = (date = state.date) => {
    if (!state.days[date]) {
      state.days[date] = {
        prayers: {},
        quranPages: 0,
        fast: false,
        good: []
      };
    }

    const d = state.days[date];

    if (!d.prayers) d.prayers = {};
    if (!Array.isArray(d.good)) d.good = [];

    return d;
  };

  function save() {
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function setPage(p) {
    page = p;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function allDone() {
    return ['Fajr','Dhuhr','Asr','Maghrib','Isha']
      .filter(p => day().prayers[p]).length;
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
          ['diary','✎','Diary']
        ].map(([id,ic,label]) => `
          <button class="${page === id ? 'active' : ''}" data-page="${id}">
            <span>${ic}</span>${label}
          </button>
        `).join('')}
      </div>
    </nav>`;
  }

  function header() {
    return `<header class="idd-head">
      <button class="idd-iconbtn" data-action="reminders">♧</button>
      <div class="idd-brand">
        <strong>☪ My Islamic Daily Diary</strong>
        <small>YOUR DAILY SPIRITUAL COMPANION</small>
      </div>
      <button class="idd-iconbtn" data-action="menu">☰</button>
    </header>`;
  }

  function prayerCard() {
    return `<section class="idd-card">
      <div class="idd-prayer-top">
        <span class="idd-kicker">◉ &nbsp; DAILY PRAYER TRACKER</span>
        <button class="idd-pill" data-action="city">
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
        <button class="idd-linkbtn" data-action="times">
          Edit prayer times⌄
        </button>
      </div>

      ${expandedPrayerTimes ? `
        <div class="idd-list">
          ${Object.entries(state.prayerTimes).map(([p,t]) => `
            <div class="idd-item">
              <b>${p}</b>
              <input class="idd-input"
                style="width:125px;margin:0"
                type="time"
                data-time="${p}"
                value="${esc(t === '--:--' ? '' : t)}">
            </div>
          `).join('')}
        </div>
        <p class="idd-muted" style="font-size:12px">
          Enter prayer times from a trusted local timetable.
          Times are not auto-calculated by this app.
        </p>
      ` : ''}

      <button class="idd-linkbtn" data-page="prayer">
        Open prayer tracker →
      </button>
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
        <button class="idd-feature" data-page="${p}">
          <span>${ic}</span>
          <small>${l}</small>
        </button>
      `).join('')}
    </div>`;
  }

  function dashboard() {
    const xp =
      allDone() * 20 +
      Math.min(100, day().quranPages * 5) +
      day().good.length * 10;

    return `
      ${prayerCard()}
      ${featureCards()}

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
            ${Math.max(0,100-xp%100)} XP to next level
          </span>
        </div>

        <div class="idd-progress">
          <i style="width:${xp%100}%"></i>
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
    const prayers = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
    const icons = ['🌅','☀️','🌤️','🌇','🌙'];

    return `
      <h1 class="idd-title">Prayer Log</h1>
      <p class="idd-muted">Record your five daily obligatory prayers.</p>

      <section class="idd-card">
        <div class="idd-row">
          <b>${esc(dateLabel())}</b>
          <span class="idd-pill">${allDone()} / 5 complete</span>
        </div>

        ${prayers.map((p,i) => `
          <div class="idd-stat">
            <span class="idd-stat-icon">${icons[i]}</span>
            <div style="flex:1">
              <b>${p}</b>
              <small>${day().prayers[p] ? 'Completed' : 'Not marked yet'}</small>
            </div>
            <input class="idd-check"
              type="checkbox"
              data-prayer="${p}"
              ${day().prayers[p] ? 'checked' : ''}>
          </div>
        `).join('')}
      </section>`;
  }

  function quranPage() {
    return `
      <h1 class="idd-title">Quran Tracker</h1>
      <p class="idd-muted">Keep a record of your daily recitation.</p>

      <section class="idd-card">
        <div class="idd-bigcount">${day().quranPages}</div>
        <p style="text-align:center" class="idd-muted">
          Pages recited today
        </p>

        <div class="idd-row">
          <button class="idd-btn secondary" data-action="qminus">
            − One page
          </button>
          <button class="idd-btn" data-action="qplus">
            ＋ One page
          </button>
        </div>

        <hr class="idd-rule">

        <label>Daily target (pages)</label>
        <input class="idd-input"
          type="number"
          min="1"
          max="1000"
          data-setting="quranTarget"
          value="${state.quranTarget}">

        <div class="idd-progress">
          <i style="width:${Math.min(100,day().quranPages/Math.max(1,state.quranTarget)*100)}%"></i>
        </div>
      </section>`;
  }

  function azkarPage() {
    return `
      <h1 class="idd-title">Dua, Azkar & Tasbih</h1>
      <p class="idd-muted">
        Use the counter for your daily remembrance.
      </p>

      <section class="idd-card">
        <div class="idd-row">
          <b>Personal Tasbih Counter</b>
          <span class="idd-pill">Target ${state.adhkarTarget}</span>
        </div>

        <button class="idd-circle" data-action="count">
          ${state.adhkarCount}
          <small style="font-size:12px">TAP TO COUNT</small>
        </button>

        <div class="idd-row">
          <button class="idd-btn secondary" data-action="resetcount">
            Reset
          </button>
          <button class="idd-btn" data-action="target">
            Set target
          </button>
        </div>

        <div class="idd-progress">
          <i style="width:${Math.min(100,state.adhkarCount/Math.max(1,state.adhkarTarget)*100)}%"></i>
        </div>
      </section>

      <section class="idd-card">
        <h3>Daily remembrance</h3>
        <p class="idd-muted">
          You can use this counter with any dhikr or wird of your choice.
        </p>
        <button class="idd-btn secondary" data-action="count">
          سبحان الله • الحمد لله • الله أكبر
        </button>
      </section>`;
  }

  function diaryPage() {
    return `
      <h1 class="idd-title">Daily Diary</h1>
      <p class="idd-muted">
        Notes, fasting and personal good deeds.
      </p>

      <section class="idd-card">
        <h3>Today's reflection</h3>

        <textarea class="idd-input"
          rows="4"
          id="idd-note"
          placeholder="Write your reflection or note..."></textarea>

        <button class="idd-btn" data-action="addnote">
          Save note
        </button>

        <hr class="idd-rule">

        <div class="idd-row">
          <b>Fasting today</b>
          <input class="idd-check"
            type="checkbox"
            data-fast
            ${day().fast ? 'checked' : ''}>
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
              <input class="idd-check"
                type="checkbox"
                data-good="${i}"
                ${day().good.includes(i) ? 'checked' : ''}>
            </label>
          `).join('')}
        </div>
      </section>

      <section class="idd-card">
        <h3>Saved notes</h3>

        ${state.notes.length
          ? state.notes.slice().reverse().map(n => `
            <div class="idd-item">
              <div>
                <b>${esc(n.date)}</b>
                <div class="idd-muted">${esc(n.text)}</div>
              </div>
            </div>
          `).join('')
          : '<p class="idd-empty">No notes saved yet.</p>'
        }
      </section>

      <section class="idd-card">
        <h3>Backup & 
