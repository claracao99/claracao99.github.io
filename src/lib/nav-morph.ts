/**
 * The header's middle between the index and a case page, as one shape that
 * changes rather than two pictures crossfading (Nav.astro, PageTransition).
 *
 * Index: Work | Play. Case: Back | name. Two parts joined by a neck on
 * both, mapped part for part: Work's part becomes Back's (Work is where
 * Back goes) and Play's the name's, the neck sliding to its new place.
 * Each part's text ticks over inside it (up opening a case, down coming
 * back), clipped by the outline.
 *
 * The leaving page saves its pill (edges, necks, labels) as it goes
 * (`saveNav`, on pageswap); the arriving page hides its real pill, draws a
 * stand-in in the saved shape over it and animates it into its own
 * (`morphNav`, on pagereveal), then hands back to the real one. The old
 * header is hidden from the View Transition (PageTransition.astro), so only
 * the live stand-in shows. Outline drawn as Nav.astro draws it: rounded
 * rectangles, a neck dipping in from top and bottom at each seam.
 */
import { cssMs } from './css';

const KEY = 'nav-morph';

/** A label, centred in the parts it spans (dx: off that centre). */
type Item = { text: string; dot?: boolean; span: [number, number]; dx: number };

/** Edges and seams in px from the header's left: [left, seams…, right],
 * with each seam's neck depth in `dips`. */
type Shape = {
  kind: 'switch' | 'crumb';
  edges: number[];
  dips: number[];
  items: Item[];
  top: number;
  height: number;
  radius: number;
  seen: boolean;
};

const centre = (r: DOMRect) => r.left + r.width / 2;

function describe(nav: HTMLElement): Shape | null {
  const box = nav.getBoundingClientRect();
  const x = (v: number) => v - box.left;
  const neck = parseFloat(getComputedStyle(nav).getPropertyValue('--nav-neck')) || 0;

  const row = nav.querySelector<HTMLElement>('.nav__views .nav__row');
  if (row) {
    const views = [...row.querySelectorAll<HTMLElement>('.nav__view')];
    const r = row.getBoundingClientRect();
    const parts = views.map((v) => v.getBoundingClientRect());
    const edges = [x(r.left), ...parts.slice(1).map((p) => x(p.left)), x(r.right)];
    return {
      kind: 'switch',
      edges,
      dips: parts.slice(1).map(() => neck),
      items: views.map((v, i) => {
        const label = v.querySelector<HTMLElement>('.nav__label')!;
        return {
          text: label.textContent?.trim() ?? '',
          dot: v.getAttribute('aria-pressed') === 'true',
          span: [i, i + 1] as [number, number],
          dx: x(centre(label.getBoundingClientRect())) - (edges[i] + edges[i + 1]) / 2,
        };
      }),
      top: r.top - box.top,
      height: r.height,
      radius: parseFloat(getComputedStyle(row.parentElement!).borderTopLeftRadius) || 0,
      seen: r.bottom > 0,
    };
  }

  const crumb = nav.querySelector<HTMLElement>('.nav__crumb');
  const back = crumb?.querySelector<HTMLElement>('.nav__back-label');
  const title = crumb?.querySelector<HTMLElement>('.nav__title');
  const text = crumb?.querySelector<HTMLElement>('.nav__title-text');
  if (!crumb || !back || !title || !text) return null;
  const r = crumb.getBoundingClientRect();
  const t = title.getBoundingClientRect();
  const edges = [x(r.left), x(t.left), x(r.right)];
  // The name and its dot (title::after): from the text's left to the end
  // of the title's content.
  const named = (text.getBoundingClientRect().left + t.right - parseFloat(getComputedStyle(title).paddingRight)) / 2;
  return {
    kind: 'crumb',
    edges,
    dips: [neck],
    items: [
      {
        text: back.textContent?.trim() ?? '',
        span: [0, 1],
        dx: x(centre(back.getBoundingClientRect())) - (edges[0] + edges[1]) / 2,
      },
      {
        text: text.textContent?.trim() ?? '',
        dot: true,
        span: [1, 2],
        dx: x(named) - (edges[1] + edges[2]) / 2,
      },
    ],
    top: r.top - box.top,
    height: r.height,
    radius: parseFloat(getComputedStyle(crumb).borderTopLeftRadius) || 0,
    seen: r.bottom > 0,
  };
}

/** Whether the wordmark shows (it's rolled away on the index's landing). */
const nameShows = () => {
  const roll = document.querySelector<HTMLElement>('.nav__home .logotype__roll');
  return !roll || parseFloat(getComputedStyle(roll).opacity) > 0.5;
};

/** On the leaving page, just before its snapshot. */
export function saveNav(nav: HTMLElement) {
  const shape = describe(nav);
  try {
    if (shape) sessionStorage.setItem(KEY, JSON.stringify({ shape, name: nameShows(), at: Date.now() }));
  } catch {}
}

/** A CSS cubic-bezier() token as a function of progress. */
function bezier(token: string) {
  const m = token.match(/cubic-bezier\(([^)]+)\)/);
  const [x1, y1, x2, y2] = m ? m[1].split(',').map(Number) : [0.42, 0, 0.58, 1];
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < p) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

/** Nav.astro's outline, with each seam's dip its own. */
function outline(e: number[], dips: number[], h: number, r: number) {
  const L = e[0];
  const R = e[e.length - 1];
  const n = r * 1.2;
  const seams = e.slice(1, -1).map((s, i) => [s, dips[i]]);
  const top = seams
    .map(([s, d]) => `L ${s - n} 0 C ${s - n / 3} 0 ${s - n / 4} ${d} ${s} ${d} C ${s + n / 4} ${d} ${s + n / 3} 0 ${s + n} 0`)
    .join(' ');
  const bottom = [...seams]
    .reverse()
    .map(([s, d]) => `L ${s + n} ${h} C ${s + n / 3} ${h} ${s + n / 4} ${h - d} ${s} ${h - d} C ${s - n / 4} ${h - d} ${s - n / 3} ${h} ${s - n} ${h}`)
    .join(' ');
  return `path('M ${L + r} 0 ${top} L ${R - r} 0 A ${r} ${r} 0 0 1 ${R} ${r} L ${R} ${h - r} A ${r} ${r} 0 0 1 ${R - r} ${h} ${bottom} L ${L + r} ${h} A ${r} ${r} 0 0 1 ${L} ${h - r} L ${L} ${r} A ${r} ${r} 0 0 1 ${L + r} 0 Z')`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * On the arriving page, while html has data-nav-stand-in (its real pill
 * hidden; data-nav-morph keeps the header whole in the transition and stays
 * till it ends: renaming parts of it mid-way would drop them from view).
 * `up`: opening a case, the text ticks up; back to the index, down.
 * Resolves once the real pill is back.
 */
export function morphNav(nav: HTMLElement, up: boolean): Promise<void> {
  const root = document.documentElement;
  const stage = nav.querySelector<HTMLElement>('.nav__morph');
  const done = () => {
    if (stage) {
      stage.hidden = true;
      stage.replaceChildren();
    }
    delete root.dataset.nameHold;
    delete root.dataset.navStandIn;
    root.dataset.navReady = '';
  };

  let saved: { shape: Shape } | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    sessionStorage.removeItem(KEY);
    if (saved && Date.now() - (saved as { at: number } & typeof saved).at > 10000) saved = null;
  } catch {}
  const from = saved?.shape;
  const first = describe(nav);
  // Part for part: both need as many parts (else no morph, just the page).
  if (!stage || !from || !first || from.kind === first.kind || from.edges.length !== first.edges.length || !from.seen) {
    done();
    return Promise.resolve();
  }

  let to: Shape = first;

  const make = (item: Item) => {
    const el = document.createElement('span');
    el.className = 'nav__morph-item';
    el.textContent = item.text;
    // Every label gets a dot, shown only on the chosen one: a freshly loaded
    // index picks its view a moment after this starts.
    const dot = Object.assign(document.createElement('span'), { className: 'nav__morph-dot', hidden: !item.dot });
    el.append(dot);
    stage.append(el);
    return el;
  };
  const olds = from.items.map(make);
  const news = to.items.map(make);
  stage.style.top = `${to.top}px`;
  stage.style.height = `${to.height}px`;
  stage.hidden = false;

  const duration = cssMs(root, '--duration-nav-morph');
  const shape = bezier(getComputedStyle(root).getPropertyValue('--ease-travel'));
  const leave = bezier(getComputedStyle(root).getPropertyValue('--ease-in-out'));
  const arrive = bezier(getComputedStyle(root).getPropertyValue('--ease-out'));
  const h = to.height;
  const travel = h * 0.7; // the text's tick, the pill clipping it
  const sign = up ? 1 : -1;

  const draw = (t: number) => {
    // Where this page's pill is now: measured every frame, so a late web
    // font or a resize mid-way still ends exactly on it.
    const now = describe(nav);
    if (now && now.kind === to.kind && now.edges.length === to.edges.length) {
      to = { ...now, items: now.items.map((item, i) => ({ ...to.items[i], dx: item.dx, dot: item.dot })) };
      news.forEach((el, i) => {
        const dot = el.querySelector<HTMLElement>('.nav__morph-dot');
        if (dot) dot.hidden = !to.items[i].dot;
      });
    }
    const g = shape(t);
    const edges = from.edges.map((v, i) => lerp(v, to.edges[i], g));
    const dips = from.dips.map((v, i) => lerp(v, to.dips[i], g));
    stage.style.clipPath = outline(edges, dips, h, lerp(from.radius, to.radius, g));
    const place = (el: HTMLElement, item: Item, y: number, opacity: number) => {
      const cx = (edges[item.span[0]] + edges[item.span[1]]) / 2 + item.dx;
      el.style.transform = `translate(${cx.toFixed(2)}px, ${y.toFixed(2)}px) translateX(-50%)`;
      el.style.opacity = opacity.toFixed(3);
    };
    // The old text leaves over the first 60%; the new arrives from a fifth
    // in, so the two overlap and the pill is never empty.
    const out = leave(clamp(t / 0.6));
    const inn = arrive(clamp((t - 0.2) / 0.8));
    olds.forEach((el, i) => place(el, from.items[i], -sign * travel * out, 1 - out));
    news.forEach((el, i) => place(el, to.items[i], sign * travel * (1 - inn), inn));
  };

  draw(0);
  // Drawn: the transition can show this header now, not the old one.
  root.dataset.navReady = '';
  // The wordmark rolls with the text: let go of the state it was held in
  // and its own transition takes it to this page's.
  requestAnimationFrame(() => delete root.dataset.nameHold);

  // Timed by an animation on the stand-in rather than by the frame clock,
  // so it pauses and seeks with the page's own (and the transition's).
  const clock = stage.animate([{ opacity: 1 }, { opacity: 1 }], { duration });
  return new Promise((resolve) => {
    const frame = () => {
      const t = clamp(Number(clock.currentTime ?? duration) / duration);
      draw(t);
      if (clock.playState !== 'finished') requestAnimationFrame(frame);
      else {
        done();
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}
