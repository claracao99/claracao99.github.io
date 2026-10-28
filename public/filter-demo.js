// Activity's filter sheet, playable on its own in the case page: no phone, no
// list behind it. A plain-JS copy of the rider prototype's FilterSheet and
// FilterChip (clara-rider-playground, src/prototypes/activity), drawn without
// Bolt's design-system code so it can live on a public page.
//
// What works, as in the prototype: chips toggle (multi-select within a group),
// the date fields open the calendar, picking the start hands over to the end,
// a start after the end swaps the two, days after today are greyed out, and
// Clear all empties the sheet. Apply goes nowhere: there is no list to filter.

const SECTIONS = [
  ['services', 'Service', [['ride-hailing', 'Ride-hailing'], ['2-wheels', '2 wheels'], ['drive', 'Bolt Drive'], ['send', 'Bolt Send']]],
  ['profiles', 'Profile', [['personal', 'Personal'], ['work', 'Work']]],
  ['riders', 'Rider', [['me', 'Me'], ['clara', 'Clara'], ['andreas', 'Andreas'], ['max', 'Max']]],
];
const EMPTY = { services: [], profiles: [], riders: [], from: null, to: null };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const day0 = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
const same = (a, b) => a && b && day0(a).getTime() === day0(b).getTime();
const dayLabel = (x, year = false) => `${x.getDate()} ${MONTHS[x.getMonth()]}${year ? ` ${x.getFullYear()}` : ''}`;
const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

// ── Glyphs: Kalep's own (the icons the prototype imports from
// @bolteu/kalep-react-icons), filled paths on a 24px grid ───────────────────
const icon = (paths, s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${paths}</svg>`;
const P = (d, odd) => `<path${odd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ''} d="${d}"/>`;
const K = {
  user: P('M7.49994 6.5C7.49994 4.01472 9.51466 2 11.9999 2C14.4852 2 16.4999 4.01472 16.4999 6.5C16.4999 8.98528 14.4852 11 11.9999 11C9.51466 11 7.49994 8.98528 7.49994 6.5Z') + P('M4.98606 13.4613C7.39493 12.8241 9.734 12.4998 12.0009 12.5C14.2675 12.5002 16.6059 12.8247 19.0136 13.4616C19.8897 13.6933 20.4998 14.483 20.4999 15.3851L20.5001 19.9997C20.5001 21.1044 19.6086 21.9999 18.5039 21.9998C14.7123 21.9995 6.73535 21.999 5.50092 22C4.39696 21.9998 3.50045 21.1084 3.5002 20.0097L3.49976 15.3851C3.49969 14.4829 4.1099 13.693 4.98606 13.4613Z'),
  userOutlined: P('M11.9999 2C9.51466 2 7.49994 4.01472 7.49994 6.5C7.49994 8.98528 9.51466 11 11.9999 11C14.4852 11 16.4999 8.98528 16.4999 6.5C16.4999 4.01472 14.4852 2 11.9999 2ZM14.4999 6.5C14.4999 7.88071 13.3807 9 11.9999 9C10.6192 9 9.49994 7.88071 9.49994 6.5C9.49994 5.11929 10.6192 4 11.9999 4C13.3807 4 14.4999 5.11929 14.4999 6.5Z', 1) + P('M12.0009 12.5C9.734 12.4998 7.39493 12.8241 4.98606 13.4613C4.1099 13.693 3.49969 14.4829 3.49976 15.3851L3.5002 20.0097C3.50045 21.1084 4.39696 21.9998 5.50092 22C6.73535 21.999 14.7123 21.9995 18.5039 21.9998C19.6086 21.9999 20.5001 21.1044 20.5001 19.9997L20.4999 15.3851C20.4998 14.483 19.8897 13.6933 19.0136 13.4616C16.6059 12.8247 14.2675 12.5002 12.0009 12.5ZM18.5001 20.015L18.4999 15.3852C16.24 14.7874 14.0747 14.4907 12.0007 14.4904C9.92663 14.4903 7.76075 14.7869 5.49976 15.3849L5.50109 20.0203L18.5001 20.015Z', 1),
  business: P('M22 19C21.9999 20.1045 21.1045 21 20 21H4C2.89549 21 2.0001 20.1045 2 19V12.1602C5.14294 13.5291 8.56821 14.293 12 14.293C15.4314 14.293 18.8574 13.5291 22 12.1602V19Z') + P('M12 0C14.4853 0 16.5 2.01472 16.5 4.5V5H20C21.1046 5 22 5.89543 22 7V10.1348C18.8547 11.5679 15.4726 12.4434 12 12.4434C8.52663 12.4434 5.14622 11.5668 2 10.1348V7C2 5.89543 2.89543 5 4 5H7.5V4.5C7.5 2.01472 9.51472 0 12 0ZM12 2C10.6193 2 9.5 3.11929 9.5 4.5V5H14.5V4.5C14.5 3.11929 13.3807 2 12 2Z', 1),
  businessOutlined: P('M12 0.000732422C9.51472 0.000732422 7.5 2.01545 7.5 4.50073V5.00078H4C2.89543 5.00078 2 5.89621 2 7.00078V19.0008C2 20.1053 2.89543 21.0008 4 21.0008H20C21.1046 21.0008 22 20.1053 22 19.0008V7.00078C22 5.89621 21.1046 5.00078 20 5.00078H16.5V4.50073C16.5 2.01545 14.4853 0.000732422 12 0.000732422ZM14.5 5.00078V4.50073C14.5 3.12002 13.3807 2.00073 12 2.00073C10.6193 2.00073 9.5 3.12002 9.5 4.50073V5.00078H14.5ZM4 19.0008V13.0121C6.65649 13.9142 9.32432 14.369 12 14.369C14.6758 14.369 17.3436 13.9141 20 13.012V19.0008H4ZM4 7.00078V10.8905C6.67916 11.8794 9.34433 12.369 12 12.369C14.6558 12.369 17.3209 11.8793 20 10.8903V7.00078H4Z', 1),
  cross: P('M5.3 6.70002C4.90001 6.29999 4.89999 5.7 5.29997 5.29995C5.69999 4.89999 6.30001 4.90002 6.7 5.30003L11.9999 10.5858L17.3 5.3C17.7 4.9 18.3 4.9 18.7 5.3C19.1 5.7 19.1 6.3 18.7 6.7L13.4141 12L18.7 17.3C19.1 17.7 19.1 18.3 18.7 18.7C18.3 19.1 17.7 19.1 17.3 18.7L11.9999 13.4142L6.7 18.7C6.3 19.1 5.7 19.1 5.3 18.7C4.9 18.3 4.9 17.7 5.3 17.3L10.5857 12L5.3 6.70002Z'),
  clear: P('M12 23C18.0751 23 23 18.0751 23 12C23 5.92493 18.0751 1 12 1C5.92487 1 1 5.92493 1 12C1 18.0751 5.92487 23 12 23ZM8.41143 7.10327C8.05019 6.74207 7.46452 6.74207 7.10328 7.10327C6.74204 7.46448 6.74204 8.05017 7.10328 8.41138L10.6918 12L7.10328 15.5886C6.74204 15.9498 6.74204 16.5355 7.10328 16.8967C7.46452 17.2579 8.05019 17.2579 8.41143 16.8967L12 13.3081L15.5886 16.8967C15.9498 17.2579 16.5355 17.2579 16.8967 16.8967C17.2579 16.5355 17.2579 15.9498 16.8967 15.5886L13.3081 12L16.8967 8.41138C17.2579 8.05017 17.2579 7.46448 16.8967 7.10327C16.5355 6.74207 15.9498 6.74207 15.5886 7.10327L12 10.6919L8.41143 7.10327Z', 1),
  left: P('M14.2891 4.2968C14.6796 4.68749 14.6796 5.32092 14.2891 5.71161L8 12.0038L14.2891 18.296C14.6796 18.6867 14.6796 19.3201 14.2891 19.7108C13.8986 20.1015 13.2654 20.1015 12.8749 19.7108L6.58579 13.4186C5.80474 12.6372 5.80474 11.3704 6.58579 10.589L12.8749 4.2968C13.2654 3.90611 13.8986 3.90611 14.2891 4.2968Z', 1),
  right: P('M9.71294 4.2968C9.32241 4.68749 9.32241 5.32092 9.71294 5.71161L16.002 12.0038L9.71294 18.296C9.32241 18.6867 9.32241 19.3201 9.71294 19.7108C10.1035 20.1015 10.7366 20.1015 11.1272 19.7108L17.4163 13.4186C18.1973 12.6372 18.1973 11.3704 17.4163 10.589L11.1272 4.2968C10.7366 3.90611 10.1035 3.90611 9.71294 4.2968Z', 1),
};
const I = {
  cross: icon(K.cross, 24), // lg
  clear: icon(K.clear, 24), // lg
  left: icon(K.left, 24),
  right: icon(K.right, 24),
  chev: icon(K.right, 20), // sm
  // Outlined at rest, filled when on, the way the tab bar marks the current tab.
  work: (on) => icon(on ? K.business : K.businessOutlined, 20),
  personal: (on) => icon(on ? K.user : K.userOutlined, 20),
};

export function mountFilterDemo(root) {
  const TODAY = new Date();
  let draft = { ...EMPTY };
  let picking = null; // 'from' | 'to' | null
  let view = { y: TODAY.getFullYear(), m: TODAY.getMonth() };

  root.innerHTML = `
    <section class="fs" aria-label="Filters">
      <div class="fs__body"></div>
      <div class="fs__foot">
        <button type="button" class="fs-btn" data-act="clear">Clear all</button>
        <button type="button" class="fs-btn is-primary" data-act="apply">Apply</button>
      </div>
      <button type="button" class="fs-close" aria-label="Close" tabindex="-1">${I.cross}</button>
    </section>`;
  const body = root.querySelector('.fs__body');

  function calendar() {
    const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const today = day0(TODAY);
    const atLatest = view.y === today.getFullYear() && view.m === today.getMonth();
    let cells = '<span></span>'.repeat(lead);
    for (let d = 1; d <= days; d++) {
      const x = new Date(view.y, view.m, d);
      const picked = same(x, draft.from) || same(x, draft.to);
      const inRange = draft.from && draft.to && x > day0(draft.from) && x < day0(draft.to);
      cells += `<button type="button" class="fs-day${inRange ? ' is-range' : ''}" data-day="${d}" ${x > today ? 'disabled' : ''} aria-pressed="${!!picked}"><span${picked ? ' class="is-picked"' : ''}>${d}</span></button>`;
    }
    return `<div class="fs-cal" role="dialog" aria-label="Choose a date">
      <div class="fs-cal__head">
        <span>${MONTHS_LONG[view.m]} ${view.y} <i>${I.chev}</i></span>
        <button type="button" data-act="prev" aria-label="Previous month">${I.left}</button>
        <button type="button" data-act="next" aria-label="Next month" ${atLatest ? 'disabled' : ''}>${I.right}</button>
      </div>
      <div class="fs-cal__week">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="fs-cal__grid">${cells}</div>
    </div>`;
  }

  const field = (key, name) => {
    const v = draft[key];
    return `<div class="fs-field${picking === key ? ' is-active' : ''}">
      <button type="button" data-pick="${key}" aria-label="${v ? `${name}: ${dayLabel(v, true)}` : name}">
        ${v ? `<small>${name}</small><span>${dayLabel(v, v.getFullYear() !== TODAY.getFullYear())}</span>` : `<span class="fs-t2">${name}</span>`}
      </button>
      ${v ? `<button type="button" class="fs-field__clear" data-unpick="${key}" aria-label="Clear ${name.toLowerCase()}">${I.clear}</button>` : ''}
    </div>`;
  };

  function render() {
    body.innerHTML = `<h2 class="fs-h2">Filters</h2>
      ${SECTIONS.map(([key, title, options]) => `<h3 class="fs-h3">${title}</h3><div class="fs-chips">${options
        .map(([id, label]) => {
          const on = draft[key].includes(id);
          const icon = key === 'profiles' ? I[id](on) : '';
          return `<button type="button" class="fs-chip${on ? ' is-on' : ''}" aria-pressed="${on}" data-toggle="${key}:${id}">${icon}<span>${label}</span></button>`;
        })
        .join('')}</div>`).join('')}
      <h3 class="fs-h3">Custom dates</h3>
      <div class="fs-dates">${picking ? calendar() : ''}${field('from', 'Start date')}${field('to', 'End date')}</div>`;
  }

  function pick(d) {
    const x = new Date(view.y, view.m, d);
    if (picking === 'from') {
      // A start after the chosen end swaps the two rather than refusing.
      const swap = draft.to && x > day0(draft.to);
      draft = { ...draft, from: swap ? draft.to : x, to: swap ? x : draft.to };
      picking = 'to'; // picking the start hands over to the end: a range is two taps
    } else {
      const swap = draft.from && x < day0(draft.from);
      draft = { ...draft, from: swap ? x : draft.from, to: swap ? draft.from : x };
      picking = null;
    }
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t || !root.contains(t)) {
      // A tap anywhere outside the calendar and its fields closes it.
      if (picking && !e.target.closest('.fs-dates')) { picking = null; render(); }
      return;
    }
    const d = t.dataset;
    if (d.act === 'apply' || t.classList.contains('fs-close')) return; // nowhere to go
    if (d.act === 'clear') { draft = { ...EMPTY }; picking = null; }
    else if (d.toggle) { const [k, id] = d.toggle.split(':'); draft = { ...draft, [k]: toggle(draft[k], id) }; picking = null; }
    else if (d.pick) {
      picking = picking === d.pick ? null : d.pick;
      // Open on the month of the end being picked, else on today's.
      const anchor = draft[d.pick] ?? draft.from ?? TODAY;
      view = { y: anchor.getFullYear(), m: anchor.getMonth() };
    } else if (d.unpick) draft = { ...draft, [d.unpick]: null };
    else if (d.act === 'prev' || d.act === 'next') {
      const n = new Date(view.y, view.m + (d.act === 'next' ? 1 : -1), 1);
      view = { y: n.getFullYear(), m: n.getMonth() };
    } else if (d.day) pick(+d.day);
    render();
  });

  render();
}
