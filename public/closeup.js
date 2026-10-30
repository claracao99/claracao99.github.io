// Clara's site, direction B "Close-up".
//
// Work: one project at a time. The objects sit in one column that scroll
// slides, so the current phone leaves through the cut under the header as the
// next rises from below, and every line of words rolls through its own mask.
// Snap points stop it on a project. Play (lamp, flower, chair) ends the row.
// A project opens as a write-up over the work, starting on the same screen.
// About: the stickered laptop; drag it round, it turns back by itself.
//
//   #work, #work/activity, #about   the views
//   ?p=1.5                           holds that point of the work (screenshots)

import { PROJECTS, PLAY } from './closeup-content.js';
import { mountFilterDemo } from './filter-demo.js';
import { mount as mountLamp, FLOOR_LAMP } from './play-lamp.js';

const EMAIL = 'claracao99@gmail.com';
// Work shows only the year, the end year of a range: "Dec 2025 – Aug 2026" → "2026".
const years = (when) => (when.match(/\d{4}/g) ?? [when]).pop();
// A project has a page when it has sections: the content decides, no flag to
// forget. The link on Work, #work/<slug> and Next all ask this.
const hasPage = (p) => (p.sections?.length ?? 0) > 0;
const STOPS = [
  // Work's meta line is the project page's facts, in the same order (Role,
  // Company, When), so the two never disagree; When shortens to its year(s).
  ...PROJECTS.map((p) => ({ ...p, soon: !hasPage(p), role: p.facts.map(([k, v]) => (k === 'When' ? years(v) : v)).join(', '), kind: p.kind ?? 'phone', link: hasPage(p) ? (p.kind === 'display' ? 'Watch video' : 'View project') : null })),
  ...PLAY.map((p) => ({ ...p, kind: 'play', link: p.url && !p.soon ? 'Open project' : null })),
];
const WORK = PROJECTS.length;
const ALL = STOPS.length; // Play counts too: 01–06
const GAP = 1; // the column's spacing, × viewport height: it moves with the scroll, one stop per screen
const pad = (n) => String(n).padStart(2, '0');
// Every mention of Bolt links to Bolt.
const bolt = (t) => t.replace(/\bBolt\b/g, '<a class="bolt" href="https://bolt.eu" target="_blank" rel="noopener">Bolt</a>');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;
const root = document.documentElement;

// Silver on the light page, black on the dark one (same render, same screen).
// The screen: the clip, or (still) just its poster frame.
const screenHTML = (clip, { autoplay, still }) => (still
  ? `<img src="${clip}.jpg" alt="">`
  : `<video src="${clip}.mp4" poster="${clip}.jpg" muted loop playsinline preload="${autoplay ? 'auto' : 'metadata'}" ${autoplay ? 'autoplay' : ''}></video>`);
const phoneHTML = (clip, { autoplay = false, still = false } = {}) => `<img class="device" src="assets/closeup/device.webp" alt="">
  <img class="device device--dark" src="assets/closeup/device-dark.webp" alt="">
  <div class="screen">${screenHTML(clip, { autoplay, still })}</div>
  <span class="island"></span>`;

// The video: just its frame, 16:9, and under it a quiet timeline, the
// preview's place in the whole video (a hairline and the running time). The
// timeline hangs below the frame, so the object's box is the frame alone and
// shrinks cleanly into the miniature, which has no timeline.
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const displayHTML = (clip, { autoplay = false, still = false, from = 0, total = 0 } = {}) => `<div class="screen">${screenHTML(clip, { autoplay, still })}</div>`
  + (still || !total ? '' : `<span class="vtime" aria-hidden="true" data-from="${from}" data-total="${total}" style="--p:${from / total}"><span class="vtrack"><span class="vdone"></span></span><span class="vnow">${mmss(from)}</span><span class="vdur">${mmss(total)}</span></span>`);
const objectHTML = (s, opts) => (s.kind === 'display' ? displayHTML(s.clip, { ...s.preview, ...opts }) : phoneHTML(s.clip, opts));

// ── Work ──────────────────────────────────────────────────────────────────────

const strip = $('.strip');
const runway = $('.runway');
const objects = STOPS.map((s, i) => {
  // Projects open their page; a side project with a site opens that, in a new tab.
  const el = document.createElement((s.kind !== 'play' && !s.soon) || (s.kind === 'play' && s.url && !s.soon) ? 'a' : 'div');
  el.className = `object ${s.kind}${s.soon ? ' is-soon' : ''}`;
  if (s.soon && s.kind !== 'play') {
    // No page yet: nothing to open, only the cursor's "Coming soon".
    el.innerHTML = `<span class="lean">${objectHTML(s, { still: s.still })}</span>`;
  } else if (s.kind !== 'play') {
    el.href = `#work/${s.slug}`;
    el.tabIndex = -1;
    el.setAttribute('aria-label', `Open ${s.title}`);
    el.innerHTML = `<span class="lean">${objectHTML(s, { still: s.still })}</span>`;
  } else {
    el.style.setProperty('--r', s.ratio);
    el.style.setProperty('--s', s.scale);
    if (s.url && !s.soon) {
      el.href = s.url;
      el.target = '_blank';
      el.rel = 'noopener';
      el.tabIndex = -1; // the link under the words is the one in the tab order
      el.setAttribute('aria-label', `Open ${s.title}`);
    }
    el.innerHTML = `<span class="lean">${s.live === 'lamp' ? '<span class="live-lamp"></span>' : `<img src="${s.img}" alt="">`}</span>`;
  }
  strip.append(el);
  runway.append(document.createElement('section'));
  return el;
});
const videos = objects.map((el) => $('video', el));

// Character House's lamp is the real one: its 灯 cord swings under the pointer like the one on
// characterhouse.claracao.work. It doesn't pull here: a click anywhere on the lamp, the cord
// included, opens the site (Clara, 2026-10-30).
function liveLamp(tile) {
  const host = $('.live-lamp', tile);
  const stage = document.createElement('div');
  stage.className = 'lamp-stage';
  host.append(stage);
  const piece = mountLamp(stage, FLOOR_LAMP);
  // the floor lamp's 2048² frame, scaled and shifted so its art (BOUNDS) fills the tile
  const B = FLOOR_LAMP.BOUNDS;
  const fit = () => {
    const scale = host.offsetWidth / (B.x1 - B.x0);
    stage.style.transform = `translate(${-B.x0 * scale}px, ${-B.y0 * scale}px) scale(${scale})`;
  };
  new ResizeObserver(fit).observe(host);
  fit();
  stage.addEventListener('pointermove', (e) => piece.move(piece.toStage(e), e));
  stage.addEventListener('pointerleave', () => piece.leave());
  // the cord only moves while the tile is on screen
  let on = false, prev = 0;
  const frame = (now) => {
    if (!on) return;
    piece.step(Math.min(0.1, (now - (prev || now)) / 1000));
    prev = now;
    requestAnimationFrame(frame);
  };
  new IntersectionObserver(([entry]) => {
    const was = on;
    on = entry.isIntersecting;
    if (on && !was) { prev = 0; requestAnimationFrame(frame); }
  }).observe(tile);
}
STOPS.forEach((s, i) => { if (s.live === 'lamp') liveLamp(objects[i]); });
// One stop is one runway section (100svh). Scroll positions and snap points
// both count in it: on a phone innerHeight grows when the address bar hides,
// and measuring stops in it then left the last project peeking in.
const stopH = () => runway.firstElementChild?.offsetHeight || innerHeight;
// The video's timeline follows its preview: where in the whole video it is.
for (const v of videos) {
  const tl = v && $('.vtime', v.closest('.object'));
  if (!tl) continue;
  const from = Number(tl.dataset.from), total = Number(tl.dataset.total);
  v.addEventListener('timeupdate', () => {
    const at = from + v.currentTime;
    tl.style.setProperty('--p', at / total);
    $('.vnow', tl).textContent = mmss(at);
  });
}

// Each mask row gets one line per stop.
// Count, title, summary, role and link roll as one block per stop, so the
// spacing inside it is always the same.
const linkHTML = (s) => (!s.link ? '' : s.kind !== 'play'
  ? `<a href="#work/${s.slug}">${s.link}</a>`
  : `<a class="out" href="${s.url}" target="_blank" rel="noopener">${s.link}</a>`);
const fields = {
  block: (s, i) => `<span class="b-count">${pad(i + 1)} / ${pad(ALL)}</span><span class="b-title">${s.title}</span><span class="b-summary">${bolt(s.summary)}</span>`
    + `<span class="b-role">${bolt(s.role)}</span>${s.link ? `<span class="b-link">${linkHTML(s)}</span>` : ''}`,
};
const rows = Object.entries(fields).map(([key, make]) => {
  const el = $(`.work [data-field="${key}"]`);
  const lines = STOPS.map((s, i) => {
    const line = document.createElement('span');
    line.innerHTML = make(s, i);
    el.append(line);
    return line;
  });
  return { key, el, lines };
});
const row = (key) => rows.find((r) => r.key === key);

// The index on the right: every stop, the current one in ink; a name scrolls
// to its stop. Play starts a small group of its own.
const index = $('.work .index');
const marks = STOPS.map((s, i) => {
  const li = document.createElement('li');
  if (i === WORK) li.className = 'is-play';
  li.style.setProperty('--n', i);
  li.innerHTML = `<button type="button"><span>${s.title}</span></button>`;
  li.firstChild.addEventListener('click', () => go(i));
  $('ol', index).append(li);
  return li.firstChild;
});

// Rows are as tall as their tallest line, so a long summary never jumps.
function size() {
  // Every project's words are centred on their own, on one line: the row is
  // as tall as the tallest, and each shorter block sits down by half the
  // difference. The line is the phone's centre (the middle of the space under
  // the header) lifted to the optical centre, a little above the true one,
  // since a large title makes a block read low. The index centres on it too.
  // On a phone the words stack above the object, top-aligned.
  const block = row('block');
  for (const line of block.lines) line.style.top = '';
  const hs = block.lines.map((l) => l.offsetHeight);
  const H = Math.max(...hs);
  block.el.style.height = `${H}px`;
  const wide = innerWidth > 960;
  block.lines.forEach((line, i) => { line.style.top = wide ? `${Math.round((H - hs[i]) / 2)}px` : ''; });
  const cut = $('.bar').offsetHeight;
  const mid = cut + (innerHeight - cut) / 2 - Math.round((innerHeight - cut) * 0.04);
  root.style.setProperty('--info-top', `${Math.round(mid - H / 2)}px`);
  root.style.setProperty('--index-top', `${Math.round(mid - index.offsetHeight / 2)}px`);
  // On a phone the words and the objects keep to two bands: the words roll
  // inside their row, as tall as the wordiest project, and the objects stay
  // under it (the strip cuts there), so a moving one never crosses the words.
  root.style.setProperty('--words-bottom', `${Math.round($('.info').getBoundingClientRect().top + H)}px`);
  at = -1;
}

let at = -1;
function render() {
  const h = stopH();
  const p = scrollY / h;
  objects.forEach((el, i) => { el.style.transform = `translateY(${(i - p) * GAP * h}px)`; });
  // Each line rolls a beat after the one above it, top to bottom.
  rows.forEach(({ key, el, lines }) => {
    const rh = el.offsetHeight + 8;
    const roll = (node, k, i) => {
      const d = Math.max(-1, Math.min(1, (i - p) * (REDUCE ? 1 : 1 + k * 0.12)));
      node.style.transform = `translateY(${d * rh}px)`;
      return d;
    };
    lines.forEach((line, i) => {
      const parts = key === 'block' ? [...line.children] : [line];
      const ds = parts.map((part, k) => roll(part, key === 'block' ? k + 1 : 0, i));
      const d = Math.min(...ds.map(Math.abs));
      line.style.visibility = d >= 1 ? 'hidden' : '';
      line.inert = Math.abs(i - p) > 0.5;
    });
  });
  const now = Math.max(0, Math.min(STOPS.length - 1, Math.round(p)));
  if (now !== at) {
    at = now;
    marks.forEach((m, i) => {
      m.classList.toggle('is-on', i === at);
      if (i === at) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current');
    });
    body.toggleAttribute('data-play', STOPS[at].kind === 'play');
    markTabs();
    body.dataset.kind = STOPS[at].kind;
    objects.forEach((el, i) => { el.tabIndex = i === at ? 0 : -1; });
  }
  playStrip();
}

// Only the project in view plays, and only while the work is showing.
function playStrip() {
  const p = scrollY / stopH();
  videos.forEach((v, i) => {
    if (!v) return;
    const on = body.dataset.view === 'work' && Math.abs(i - p) < 0.5;
    if (on && v.paused) v.play().catch(() => {});
    if (!on && !v.paused) v.pause();
  });
}

let queued = false;
addEventListener('scroll', () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; render(); });
}, { passive: true });
addEventListener('resize', () => { size(); render(); });

function go(i, smooth = true) {
  const top = Math.max(0, Math.min(STOPS.length - 1, i)) * stopH();
  scrollTo({ top, behavior: smooth && !REDUCE ? 'smooth' : 'instant' });
}
const here = () => Math.round(scrollY / stopH());

// ── Case ──────────────────────────────────────────────────────────────────────

const casePane = $('.case');
let caseObserver, revealObserver;
// The open case: which project, its miniature, and a token so a stale timer
// from an earlier opening can't act on this one.
let current = null;
let openToken = 0;
// How many case pages sit on top of the work in the history, so leaving can
// step back through them (the browser's Back then never reopens a case).
let caseDepth = 0;
let booted = false;
let markIndex = () => {};
casePane.addEventListener('scroll', () => markIndex(), { passive: true });

function media(m) {
  const inner = m.video
    ? `<video src="${m.video}" poster="${m.poster}" muted loop playsinline preload="none" aria-label="${m.alt}"></video>`
    : `<img src="${m.src}" alt="${m.alt}" loading="lazy">`;
  return `<div class="frame${m.contain ? ' is-contain' : ''}" style="aspect-ratio:${m.ratio}">${inner}</div>`;
}

// A project's page, on a 12-column grid: the side column stays put on the
// left (a miniature of the object, still, that takes you back to Work; then
// number, name, overview, facts and the index of sections); the write-up
// fills the rest. Large: the name and Next.
const chapters = (list) => list.map(([t, name]) => `<li><button type="button" data-t="${t}"><span>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</span>${name}</button></li>`).join('');

function caseHTML(p, i) {
  // Next: the following project with a page, in PROJECTS order, wrapping
  // round to the first; none when this is the only page.
  const pages = PROJECTS.filter(hasPage);
  const after = pages[(pages.indexOf(p) + 1) % pages.length];
  const next = after && after !== p
    ? `<nav class="cp__next" aria-label="Next project"><span class="g">Next</span><a href="#work/${after.slug}">${after.title}</a></nav>` : '';
  const kind = p.kind ?? 'phone';
  const blocks = p.sections.map((s) => {
    if (s.media) return `<figure class="cp__media${s.media.bleed ? ' is-bleed' : ' is-single'}">${media(s.media)}<figcaption>${s.media.alt}</figcaption></figure>`;
    if (s.compare) return `<figure class="cp__media cp__compare is-single">
      <div class="frame">${[['Before', s.compare.before], ['After', s.compare.after]].map(([k, src]) =>
        `<div class="cmp"><span class="g">${k}</span><img src="${src}" alt="${k}: ${s.compare.caption}" loading="lazy"><img class="cmp--dark" src="${src.replace(/\.webp$/, '-dark.webp')}" alt="${k}: ${s.compare.caption}" loading="lazy"></div>`).join('')}</div>
      <figcaption>${s.compare.caption}</figcaption>
    </figure>`;
    // A row of screenshots at one height, as wide as the other media: each
    // takes width in proportion to its shape.
    if (s.row) return `<figure class="cp__media cp__row-media">${s.row.map((m) =>
      `<div style="flex:${(m.w / m.h).toFixed(3)} 1 0"><div class="frame"><img src="${m.src}" alt="${m.alt}" loading="lazy" style="aspect-ratio:${m.w} / ${m.h}"></div><figcaption>${m.alt}</figcaption></div>`).join('')}</figure>`;
    if (s.pair) return `<figure class="cp__media is-pair">${s.pair.map((m) => `<div>${media(m)}<figcaption>${m.alt}</figcaption></div>`).join('')}</figure>`;
    // Two phones side by side on the plain ground, each playing its clip
    // (the same flow in light and dark mode).
    if (s.duo) return `<figure class="cp__media cp__duo">
      <div class="frame">${s.duo.clips.map(([clip, label]) => `<div class="duo__item"><span class="g">${label}</span><span class="phone duo__phone">${phoneHTML(clip, { autoplay: true })}</span></div>`).join('')}</div>
      <figcaption>${s.duo.caption}</figcaption>
    </figure>`;
    // Product UI, piece by piece: the featured card with pressable buttons and
    // the live filter sheet side by side, then annotated list rows.
    if (s.ui) {
      const { card, filter, list } = s.ui;
      // Notes are numbered too: on a phone there's no room for the lines, so
      // the dots become numbers and the words a legend under the list.
      let n = 0;
      const rowsHTML = list.rows.map((r) => `<div class="ui__row" style="aspect-ratio:373 / ${r.h}"><img src="${r.src}" alt="" loading="lazy">${r.notes.map(([x, y, t]) =>
        `<span class="ui__note" data-n="${++n}" style="--x:${x / 373};--y:${y / r.h}"><span>${t}</span></span>`).join('')}</div>`).join('');
      const legend = `<ol class="ui__legend">${list.rows.flatMap((r) => r.notes.map(([, , t]) => `<li>${t}</li>`)).join('')}</ol>`;
      return `<figure class="cp__media cp__ui">
        <div class="ui__pair">
          <div><div class="frame ui__box"><div class="ui__card"><img src="${card.src}" alt="">${card.buttons.map(([label, x, y, w]) =>
            `<button type="button" class="ui__btn" style="left:${x}px;top:${y}px;width:${w}px">${label}</button>`).join('')}</div></div><figcaption>${card.caption}</figcaption></div>
          <div><div class="frame ui__box"><div class="fd" data-demo="${filter.id}"></div></div><figcaption>${filter.caption}</figcaption></div>
        </div>
        <div class="ui__listwrap"><div class="frame ui__box ui__listbox"><div class="ui__list">${rowsHTML}</div>${legend}</div><figcaption>${list.caption}</figcaption></div>
      </figure>`;
    }
    // A playable piece of the product, on its own ground.
    if (s.demo) return `<figure class="cp__media cp__demo is-single">
      <div class="frame">${s.demo.ui ? `<div class="demo__ui">${s.demo.ui.map((src, n) => `<img class="${n ? 'demo__row' : 'demo__card'}" src="${src}" alt="" loading="lazy">`).join('')}</div>` : ''}<div class="fd" data-demo="${s.demo.id}"></div></div>
      <figcaption>${s.demo.caption}</figcaption>
    </figure>`;
    if (s.player) return `<figure class="cp__media cp__video">
      <div class="frame" style="aspect-ratio:16 / 9"><video src="${s.player.video}" poster="${s.player.poster}" playsinline preload="none"></video>
        <button class="video__play" type="button"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>Play video</button></div>
      <ol class="video__chapters">${chapters(s.player.chapters)}</ol>
    </figure>`;
    // A section can carry paragraphs, a numbered list, or a lead line and a list.
    const text = (s.text ?? []).map((t) => `<p>${bolt(t)}</p>`).join('')
      + (s.list ? `<ol${s.text ? ' class="after-lead"' : ''}>${s.list.map((li) => `<li>${bolt(li)}</li>`).join('')}</ol>` : '');
    // No label: more of the section above (after a media block), not a new one.
    if (!s.label) return `<section class="cp__row is-cont"><div class="cp__text">${text}</div></section>`;
    return `<section class="cp__row" id="s-${s.label.toLowerCase()}"><h2 class="cp__label">${s.label}</h2><div class="cp__text">${text}</div></section>`;
  }).join('');
  // The index only earns its place with two sections or more.
  const labelled = p.sections.filter((s) => s.label);
  const index = labelled.length < 2 ? '' : labelled.map((s, n) =>
    `<li class="roll" style="--i:${6 + n}"><span><button type="button" data-to="s-${s.label.toLowerCase()}">${s.label}</button></span></li>`).join('');
  return `
    <div class="cp"${p.color ? ` style="--project:${p.color}"` : ''}>
      <aside class="cp__side">
        <a class="cp__mini is-${kind}" href="#work" aria-label="Back to Work"><span class="mini ${kind}">${objectHTML({ ...p, kind }, { still: true })}</span><span class="cp__back roll" style="--i:0" aria-hidden="true"><span>Back</span></span></a>
        <span class="cp__count g roll" style="--i:0"><span>${pad(i + 1)} / ${pad(ALL)}</span></span>
        <h1 class="cp__name roll" style="--i:1"><span>${p.title}</span></h1>
        <p class="cp__overview roll" style="--i:2"><span>${bolt(p.summary)}</span></p>
        <dl class="cp__facts">${p.facts.map(([k, v], n) => `<div class="roll" style="--i:${3 + n}"><span><dt>${k}</dt><dd>${bolt(v)}</dd></span></div>`).join('')}</dl>
      </aside>
      <nav class="cp__index" aria-label="On this page"><ol>${index}</ol></nav>
      <div class="cp__main">
        ${blocks}
        ${next}
      </div>
    </div>`;
}

// Leaning toward the pointer: as it comes near, the object drifts a few
// pixels and tilts in 3D to face it, easing back when the pointer leaves.
// lean(get, opts) follows whatever get() returns (the home row's current
// phone changes as you scroll); it returns a stop function.
function lean(get, { reach = 1.2, px = 14, deg = 12 } = {}) {
  if (REDUCE || !matchMedia('(hover: hover)').matches) return () => {};
  const state = new Map(); // element -> { x, y, tx, ty }
  let raf = 0;
  const step = () => {
    raf = 0;
    for (const [el, s] of state) {
      s.x += (s.tx - s.x) * 0.12;
      s.y += (s.ty - s.y) * 0.12;
      el.style.transform = `translate3d(${s.x * px}px, ${s.y * px}px, 0) rotateX(${-s.y * deg}deg) rotateY(${s.x * deg}deg)`;
      if (Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.001) raf ||= requestAnimationFrame(step);
      else if (!s.tx && !s.ty) { el.style.transform = ''; state.delete(el); }
    }
  };
  const move = (e) => {
    const cur = get();
    for (const [el, s] of state) if (el !== cur) { s.tx = 0; s.ty = 0; }
    if (cur) {
      const r = cur.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const R = Math.max(r.width, r.height) / 2 * reach + 120; // how near counts
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / R);
      const s = state.get(cur) ?? { x: 0, y: 0, tx: 0, ty: 0 };
      s.tx = Math.max(-1, Math.min(1, dx / (r.width / 2 + 60))) * near;
      s.ty = Math.max(-1, Math.min(1, dy / (r.height / 2 + 60))) * near;
      state.set(cur, s);
    }
    raf ||= requestAnimationFrame(step);
  };
  addEventListener('pointermove', move, { passive: true });
  return () => { removeEventListener('pointermove', move); for (const s of state.values()) { s.tx = 0; s.ty = 0; } raf ||= requestAnimationFrame(step); };
}

let parallaxStop = () => {};
function miniParallax(el) {
  parallaxStop();
  if (el) parallaxStop = lean(() => el, { reach: 1.6, px: 14, deg: 12 });
}

// Over a phone on the work (or a side project with a site), the cursor says what a click does.
const cursorLabel = $('.cursor-label');
if (matchMedia('(hover: hover)').matches) {
  let cx = 0, cy = 0, lx = 0, ly = 0, raf = 0;
  const follow = () => {
    lx += (cx - lx) * 0.3;
    ly += (cy - ly) * 0.3;
    cursorLabel.style.transform = `translate(${lx}px, ${ly}px)`;
    raf = Math.abs(cx - lx) + Math.abs(cy - ly) > 0.2 ? requestAnimationFrame(follow) : 0;
  };
  addEventListener('pointermove', (e) => {
    const obj = body.dataset.view === 'work' && e.pointerType === 'mouse' ? e.target.closest?.('.strip .object:not(.play), .strip a.play, .strip .play.is-soon') : null;
    // Over the About laptop it says how to turn it; not while it's held.
    const lap = body.dataset.view === 'about' && e.pointerType === 'mouse' && e.target === canvas && !canvas.dataset.drag;
    if (obj || lap) {
      cursorLabel.textContent = lap ? 'Drag to turn around' : obj.classList.contains('is-soon') ? 'Coming soon' : obj.classList.contains('play') ? 'Open project' : obj.classList.contains('display') ? 'Watch video' : 'View project';
      if (!cursorLabel.hasAttribute('data-on')) { lx = e.clientX + 16; ly = e.clientY + 16; }
      cursorLabel.setAttribute('data-on', '');
    } else cursorLabel.removeAttribute('data-on');
    cx = e.clientX + 16;
    cy = e.clientY + 16;
    raf ||= requestAnimationFrame(follow);
  }, { passive: true });
  addEventListener('scroll', () => cursorLabel.removeAttribute('data-on'), { passive: true });
}

// The home row's phone leans too, gently, while the work is showing.
lean(() => (body.dataset.view === 'work' ? $('.lean', objects[Math.round(scrollY / stopH())] ?? document.body) : null), { reach: 1.1, px: 10, deg: 6 });

// "Watch video" (the cursor over the video, or the link) means play it.
let watchNext = false, autoStart = null;
addEventListener('click', (e) => {
  const a = e.target.closest?.('.strip .object.display, .work .b-link a');
  watchNext = !!a && (a.classList.contains('display') || /Watch video/.test(a.textContent));
}, true);

function openCase(slug) {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  if (i < 0 || !hasPage(PROJECTS[i])) return show('work');
  const p = PROJECTS[i];
  // Coming from the work, the object is shared: note where it stands.
  const from = body.dataset.view === 'work' && here() === i ? objects[i].getBoundingClientRect() : null;
  const flip = from && !REDUCE && innerWidth > 960;
  // Hidden before the page goes in, so nothing flashes and fades out.
  casePane.classList.remove('is-entering', 'is-leaving');
  casePane.classList.toggle('is-arriving', !!flip);
  casePane.innerHTML = caseHTML(p, i);
  casePane.scrollTop = 0;
  document.title = `${p.title} – Clara Cao`;
  // The work underneath moves to this project, so leaving lands on it.
  go(i, false);
  // Media play only while on screen (the video waits for Play).
  caseObserver?.disconnect();
  caseObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    }
  }, { root: casePane, threshold: 0.25 });
  $$('video', casePane).filter((v) => !v.closest('.cp__video')).forEach((v) => caseObserver.observe(v));
  revealObserver?.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); revealObserver.unobserve(e.target); }
  }, { root: casePane, rootMargin: '0px 0px -10% 0px' });
  $$('.cp__media, .cp__row', casePane).forEach((el) => revealObserver.observe(el));
  // Demos: playable pieces of the product.
  for (const el of $$('[data-demo]', casePane)) if (el.dataset.demo === 'activity-filter') mountFilterDemo(el);
  const player = $('.cp__video', casePane);
  if (player) {
    const v = $('video', player);
    const start = (t) => {
      player.classList.add('is-playing');
      v.controls = true;
      if (t != null) v.currentTime = t;
      v.play().catch(() => {});
    };
    $('.video__play', player).addEventListener('click', () => start());
    $$('[data-t]', player).forEach((b) => b.addEventListener('click', () => start(Number(b.dataset.t))));
    // Opened by "Watch video": it starts by itself once the page is in.
    // The click still counts as the gesture that allows sound; a browser that
    // won't allow it plays muted, with the controls there to unmute.
    if (watchNext) {
      autoStart = () => {
        start();
        v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
      };
    }
  }
  watchNext = false;
  // The index: the last section whose top has passed 40% of the window is
  // the one you're reading; a click scrolls to a section.
  const indexButtons = $$('.cp__index button', casePane);
  const rows = $$('.cp__row[id]', casePane);
  markIndex = () => {
    let on = null;
    for (const el of rows) if (el.getBoundingClientRect().top <= innerHeight * 0.4) on = el.id;
    indexButtons.forEach((b) => b.classList.toggle('is-on', b.dataset.to === on));
  };
  markIndex();
  indexButtons.forEach((b) => b.addEventListener('click', () => {
    const el = $(`#${b.dataset.to}`, casePane);
    casePane.scrollTo({ top: casePane.scrollTop + el.getBoundingClientRect().top - (innerHeight * 0.4 - 40), behavior: REDUCE ? 'instant' : 'smooth' });
  }));
  void casePane.offsetWidth;
  show('case');
  // The object shrinks from where it stood on the work into the miniature.
  const obj = $('.cp__mini', casePane);
  // The miniature stays still: no lean toward the pointer on a project page.
  // The words and the write-up wait, hidden, until it has landed, then roll
  // in: nothing passes under the moving phone.
  const token = ++openToken;
  current = { i, obj, leaving: false, landing: !!flip };
  const enter = () => {
    if (token !== openToken) return;
    current.landing = false;
    casePane.classList.remove('is-arriving');
    casePane.classList.add('is-entering');
    autoStart?.();
    autoStart = null;
  };
  if (flip) {
    const to = obj.getBoundingClientRect();
    const k = from.height / to.height;
    obj.style.transformOrigin = '0 0';
    obj.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${k})`;
    void obj.offsetWidth;
    obj.style.transition = 'transform 900ms cubic-bezier(0.65, 0, 0.35, 1)';
    obj.style.transform = 'none';
    setTimeout(enter, 820);
  } else enter();
  obj.addEventListener('click', (e) => { e.preventDefault(); leaveCase(); });
}

// Back to the work, from the miniature, the Work tab or Esc: the opening in
// reverse. The words and the write-up go first, then the miniature grows back
// into the phone on the work, then the work takes over (its lines roll back
// in). It steps back through the history rather than adding to it.
function exitToWork() {
  if (caseDepth > 0) history.go(-caseDepth);
  else location.hash = 'work';
}

function leaveCase() {
  if (!current || current.leaving) return;
  const { i, obj } = current;
  const animate = !REDUCE && innerWidth > 960 && !current.landing;
  current.leaving = true;
  if (!animate) { exitToWork(); return; }
  const token = openToken;
  parallaxStop();
  $('.mini', obj).style.transform = '';
  casePane.classList.remove('is-entering');
  casePane.classList.add('is-leaving');
  setTimeout(() => {
    if (token !== openToken) return;
    const a = obj.getBoundingClientRect();
    const b = objects[i].getBoundingClientRect();
    obj.style.transition = 'none';
    obj.style.transformOrigin = '0 0';
    obj.style.transform = 'none';
    void obj.offsetWidth;
    obj.style.transition = 'transform 900ms cubic-bezier(0.65, 0, 0.35, 1)';
    obj.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.height / a.height})`;
    setTimeout(() => {
      if (token !== openToken) return;
      // The home phone picks up from the miniature's frame: the clip's start.
      if (videos[i]) videos[i].currentTime = 0;
      exitToWork();
    }, 880);
  }, 320);
}

// ── About ─────────────────────────────────────────────────────────────────────

const canvas = $('.about__laptop');
const hint = $('.about__hint');
let laptop;
async function wakeLaptop() {
  if (!laptop) {
    const { mountLaptop } = await import('./laptop3d.js');
    laptop = mountLaptop(canvas, { onReady: () => canvas.setAttribute('data-ready', '') });
    canvas.addEventListener('pointerdown', () => hint.setAttribute('data-gone', ''), { once: true });
  }
  laptop.setActive(body.dataset.view === 'about');
}

// ── Views and the switch ──────────────────────────────────────────────────────

// The tab in ink: About, or on the work Play at its stops and Work elsewhere
// (a case counts as Work).
function markTabs() {
  const view = body.dataset.view;
  const tab = view === 'about' ? 'about' : view === 'work' && STOPS[at]?.kind === 'play' ? 'play' : 'work';
  $$('.switch__tabs .tab').forEach((t) => {
    const on = t.dataset.tab === tab;
    t.classList.toggle('is-on', on);
    if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
  });
}

// The work's words roll in (first load, and back from a case or About).
function rollIn() {
  for (const el of [$('.work .info'), index]) {
    el.classList.remove('is-returning');
    void el.offsetWidth;
    el.classList.add('is-returning');
  }
}

function show(view) {
  const was = body.dataset.view;
  // Arriving on About: its words roll in.
  if (view === 'about' && was !== 'about') {
    const about = $('.about');
    about.classList.remove('is-entering');
    void about.offsetWidth;
    about.classList.add('is-entering');
  }
  cursorLabel.removeAttribute('data-on');
  // Going anywhere else cancels a pending landing or return.
  if (view !== 'case') { caseDepth = 0; current = null; openToken++; }
  body.removeAttribute('data-nav-hidden');
  lastY = 0;
  body.dataset.view = view;
  markTabs();
  if (view === 'work') document.title = 'Clara Cao';
  if (view === 'about') document.title = 'About – Clara Cao';
  if (view !== 'case') { caseObserver?.disconnect(); parallaxStop(); }
  if (view !== 'case' && was === 'case') $$('video', casePane).forEach((v) => v.pause());
  if (view === 'about' || laptop) wakeLaptop();
  if (view !== 'work' && was !== view) (view === 'case' ? casePane : $('.about')).focus({ preventScroll: true });
  // Back to the work: its lines roll back in.
  if (view === 'work' && was && was !== 'work') {
    rollIn();
  }
  playStrip();
}

function route() {
  const h = location.hash.slice(1) || 'work';
  if (h.startsWith('work/')) {
    // Kept on the history entry, so Back and Forward restore it.
    const saved = history.state?.caseDepth;
    caseDepth = saved ?? (!booted ? 0 : body.dataset.view === 'case' ? caseDepth + 1 : 1);
    history.replaceState({ ...history.state, caseDepth }, '');
    openCase(h.slice(5));
  }
  else show(h === 'about' ? 'about' : 'work');
}
addEventListener('hashchange', route);

// On a case, the Work tab leaves like the miniature does. On the work at
// Play, it goes back up to the first project.
$('[data-tab="work"]').addEventListener('click', (e) => {
  if (body.dataset.view === 'case') { e.preventDefault(); leaveCase(); }
  else if (body.dataset.view === 'work' && STOPS[here()]?.kind === 'play') { e.preventDefault(); go(0); }
});

// Play scrolls straight to the first Play piece, from wherever you are.
$('[data-tab="play"]').addEventListener('click', (e) => {
  e.preventDefault();
  if (body.dataset.view === 'work') { go(WORK); return; }
  addEventListener('hashchange', () => go(WORK, false), { once: true });
  if (body.dataset.view === 'case') exitToWork(); else location.hash = 'work';
});

// The name goes home, to the first project; Work keeps your place.
$('[data-top]').addEventListener('click', () => {
  if (body.dataset.view === 'work') go(0);
  else addEventListener('hashchange', () => go(0, false), { once: true });
});

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const view = body.dataset.view;
  if (e.key === 'Escape' && view === 'case') { leaveCase(); return; }
  if (e.key === 'Escape' && view !== 'work') { location.hash = 'work'; return; }
  if (view !== 'work') return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(here() + 1); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(here() - 1); }
});

// ── The nav while reading: it slides away scrolling down a case or the
// About, and comes back the moment you scroll up. ──
let lastY = 0;
for (const pane of [casePane, $('.about')]) {
  pane.addEventListener('scroll', () => {
    const y = pane.scrollTop;
    if (y > 80 && y > lastY + 4) body.setAttribute('data-nav-hidden', '');
    else if (y < lastY - 4 || y <= 80) body.removeAttribute('data-nav-hidden');
    lastY = y;
  }, { passive: true });
}

// Reaching for the top edge brings the nav back too.
addEventListener('pointermove', (e) => {
  if (e.pointerType === 'mouse' && e.clientY < 72) body.removeAttribute('data-nav-hidden');
}, { passive: true });

// ── Theme, email ────────────────────────────────────────────────────────

const toggle = $('[data-theme-toggle]');
const label = () => toggle.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} mode`);
label();
// The whole page changes theme at once: colours, phone frames and images in
// one step, cross-faded as one picture. Each element fading on its own clock
// (400ms here, 300ms there, the frames instant) read as delayed and glitchy.
toggle.addEventListener('click', () => {
  const flip = () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
    label();
  };
  root.classList.add('theme-switching');
  const done = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
  if (!document.startViewTransition || REDUCE) { flip(); done(); return; }
  document.startViewTransition(flip).finished.finally(done);
});

// Her rule: an email address copies, it never opens a mail app.
const toast = $('.toast');
let toastTimer;
$$('[data-email]').forEach((b) => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(EMAIL); toast.textContent = `Copied ${EMAIL}`; } catch { toast.textContent = EMAIL; }
  toast.setAttribute('data-on', '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.removeAttribute('data-on'), 2200);
}));


// ── Start ─────────────────────────────────────────────────────────────────────

// The page keeps its own place on the work; the browser restoring an old
// scroll position on Back would jump to another project.
history.scrollRestoration = 'manual';

const hold = new URLSearchParams(location.search).get('p');
document.fonts.ready.then(() => {
  size();
  if (hold !== null) {
    root.classList.add('hold');
    scrollTo(0, Number(hold) * stopH());
  }
  route();
  render();
  root.classList.add('is-ready');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('booting')));
  if (body.dataset.view === 'work' && hold === null) rollIn();
  booted = true;
});
