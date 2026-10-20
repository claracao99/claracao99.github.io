/**
 * The lamp's pull cord (Lamp.astro): five 灯 characters hanging from the
 * shade, simulated with XPBD (extended position-based dynamics). Ported from
 * the lamp-string experiment (Figma 570:1886).
 *
 * The cord exits a hole in the shade. Above the hole it runs on a
 * spring-loaded slider, like a real pull switch, so pulling draws spare
 * characters out of the lamp and letting go snaps them back. Pulling the
 * slider past TOGGLE_AT clicks the switch (onToggle); it re-arms once the
 * cord is back up. Below the hole the characters hang as a chain of slightly
 * elastic links. All units are pixels of the 1254² design frame; the lamp
 * shows the CROP square around it.
 */

export const STAGE = 1254;
export const CROP = { x: 250, y: 250, size: 760 };

const CHAR = '灯';
// The characters are drawn larger than the Figma's 40px so they still read
// with the lamp small on screen; the sizes below follow SEG.
export const SEG = 95; // one character per link (font-size and line-height)
const FREE = 3; // hanging characters
const SPARE = 3; // characters waiting inside the shade
const HOLE_X = 785.6;

// ── Tuning ───────────────────────────────────────────────────────────────────

const STEP = 1 / 120;
const SUBSTEPS = 12;
const GRAVITY = 2400;
const AIR_DRAG = 5; // 1/s
const RADIUS = SEG * 0.4; // collision radius of a character

const LINK_COMPLIANCE = 1e-5; // gaps open between characters on a hard pull
const LINK_MAX = SEG * 1.2; // past this the hand slips instead
const LINK_DAMPING = 0.04; // per substep, along each link
const BEND_COMPLIANCE = 5e-5; // characters straighten out rather than fold
const MIN_GAP = SEG * 0.9; // characters never overlap

const GRAB_COMPLIANCE = 1e-4; // softness of the hand
const HIT_RADIUS = SEG * 0.75;
const HIT_MIN_PX = 14; // the lamp is small on screen: never a smaller target than this
const PRESS_PULL = 85; // pressing pulls the cord down this far while held
const PRESS_RATE = 18; // 1/s, how quickly the press pull eases in and out
const DRAG_THRESHOLD = 8; // past this the pointer takes over from the press pull
const KEY_PULL_MS = 260; // Enter or Space: a press held this long

const BRUSH_RADIUS = 24; // hovering past the cord nudges it
const BRUSH_GAIN = 0.05;
const BRUSH_MAX = 600;

const REST_SPEED = 2; // px/s: below this for REST_MS the loop sleeps
const REST_MS = 600;

// ── Lamp silhouette, measured from the image ─────────────────────────────────

// [x, shade top, shade bottom]
const SHADE = [
  [340, 505, 512], [350, 461, 523], [380, 399, 531], [410, 363, 535], [440, 339, 537],
  [470, 322, 539], [500, 310, 540], [530, 302, 541], [560, 298, 542], [590, 296, 543],
  [620, 277, 543], [650, 279, 543], [680, 297, 542], [710, 300, 541], [740, 306, 541],
  [770, 316, 540], [800, 331, 538], [830, 352, 536], [860, 383, 533], [890, 430, 527],
  [915, 505, 515],
];
/** The lamp's visible right and bottom edges (frame px): shade rim, base. */
export const LAMP_EDGE = { right: 916, bottom: 975 };
const SHADE_X0 = SHADE[0][0];
const SHADE_X1 = SHADE[SHADE.length - 1][0];
const STEM = { x0: 608, x1: 645, y0: 540, y1: 900 };
const BASE = { cx: 626, cy: 921, rx: 184, ry: 51 };

function shadeAt(x: number, col: 0 | 1) {
  for (let i = 1; i < SHADE.length; i++) {
    if (x <= SHADE[i][0]) {
      const [x0, ...a] = SHADE[i - 1];
      const [x1, ...b] = SHADE[i];
      const t = (x - x0) / (x1 - x0);
      return a[col] + (b[col] - a[col]) * t;
    }
  }
  return SHADE[SHADE.length - 1][col + 1];
}
const shadeTop = (x: number) => shadeAt(x, 0);
const shadeBottom = (x: number) => shadeAt(x, 1);

// Lowest point of the rim across the cord's width; spares only show below it.
const RIM = Math.max(shadeBottom(HOLE_X - SEG / 2), shadeBottom(HOLE_X + SEG / 2));
const HOLE = { x: HOLE_X, y: RIM }; // at the rim, so the cord starts on a whole character

const SLIDER_MASS = 3;
const SLIDER_K = 900;
const SLIDER_DAMPING = 65;
const SLIDER_MIN = HOLE.y - 22; // recoil into the shade
const SLIDER_MAX = HOLE.y + 120; // pull out of the shade
const SLIDER_NATURAL = HOLE.y - (FREE * GRAVITY) / SLIDER_K; // preload so it rests at HOLE.y

const TOGGLE_AT = HOLE.y + 30; // the switch clicks once the slider is pulled this far
const REARM_AT = HOLE.y + 10; // and is ready again once it is back above this


/** Where the cord can be grabbed, for the touch-action strip (frame px). */
export const GRIP = { x: HOLE.x - 1.75 * SEG, y: RIM, w: 3.5 * SEG, h: SLIDER_MAX + FREE * SEG * 1.2 - RIM };

type Node = { x: number; y: number; px: number; py: number; vx: number; vy: number; w: number };

interface Options {
  /** Scales and receives the pointer: the CROP square, fitted to its parent. */
  stage: HTMLElement;
  cord: HTMLElement;
  spare: HTMLElement;
  onToggle: () => void;
}

export function mountLamp({ stage, cord, spare, onToggle }: Options) {
  const makeChars = (parent: HTMLElement, count: number) =>
    Array.from({ length: count }, () => {
      const el = document.createElement('span');
      el.className = 'lamp__char';
      el.textContent = CHAR;
      parent.appendChild(el);
      return el;
    });
  const freeEls = makeChars(cord, FREE);
  const spareEls = makeChars(spare, SPARE);

  // Hanging characters disappear into the shade; spares never show above the rim.
  const shadePath =
    'M' + SHADE.map(([x, t]) => `${x} ${t}`).join(' L') +
    ' L' + [...SHADE].reverse().map(([x, , b]) => `${x} ${b}`).join(' L') + ' Z';
  cord.style.clipPath = `path(evenodd, "M0 0 H${STAGE} V${STAGE} H0 Z ${shadePath}")`;
  spare.style.clipPath = `inset(${RIM}px 0 0 0)`;

  let scale = 1;
  new ResizeObserver(() => {
    scale = (stage.parentElement?.clientWidth ?? CROP.size) / CROP.size;
    stage.style.transform = `scale(${scale})`;
  }).observe(stage.parentElement ?? stage);

  // ── Simulation ─────────────────────────────────────────────────────────────

  // nodes[0] is the slider at the hole; nodes[i + 1] is the bottom of character i.
  const nodes: Node[] = Array.from({ length: FREE + 1 }, (_, i) => ({
    x: HOLE.x, y: HOLE.y + i * SEG, px: 0, py: 0, vx: 0, vy: 0,
    w: i === 0 ? 1 / SLIDER_MASS : 1, // inverse mass
  }));
  const slider = nodes[0];

  const grab = {
    node: null as Node | null,
    ox: 0, oy: 0, tx: 0, ty: 0, sx: 0, sy: 0, pull: 0, pullTarget: 0,
  };
  let armed = true;

  // Centre of spare character k, stacked up the rail above the slider.
  const spareY = (k: number) => slider.y - SEG / 2 - k * SEG;

  // Move a and b along their axis so their distance changes by `delta` (split by inverse mass).
  const separate = (a: Node, b: Node, dx: number, dy: number, len: number, delta: number, alpha = 0) => {
    const s = delta / (a.w + b.w + alpha) / len;
    a.x += a.w * s * dx; a.y += a.w * s * dy;
    b.x -= b.w * s * dx; b.y -= b.w * s * dy;
  };

  // Distance constraint: `rest` exactly when compliance is 0, springy otherwise.
  // `mode` limits it to one side: "max" only resists stretching, "min" only squashing.
  const distance = (a: Node, b: Node, rest: number, alpha = 0, mode?: 'max' | 'min') => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1e-6;
    const delta = len - rest;
    if ((mode === 'max' && delta <= 0) || (mode === 'min' && delta >= 0)) return;
    separate(a, b, dx, dy, len, delta, alpha);
  };

  const collide = (n: Node) => {
    // the lamp's edges
    n.x = Math.min(CROP.x + CROP.size - RADIUS, Math.max(CROP.x + RADIUS, n.x));
    n.y = Math.min(CROP.y + CROP.size - RADIUS, Math.max(CROP.y + RADIUS, n.y));

    // shade: out through the nearer of top or bottom, except at the hole where the cord retracts
    if (n.x > SHADE_X0 && n.x < SHADE_X1 && Math.abs(n.x - HOLE.x) > RADIUS) {
      const top = shadeTop(n.x) - RADIUS;
      const bottom = shadeBottom(n.x) + RADIUS;
      if (n.y > top && n.y < bottom) n.y = n.y - top < bottom - n.y ? top : bottom;
    }

    // stem: out sideways
    if (n.y > STEM.y0 && n.y < STEM.y1 && n.x > STEM.x0 - RADIUS && n.x < STEM.x1 + RADIUS) {
      n.x = n.x < (STEM.x0 + STEM.x1) / 2 ? STEM.x0 - RADIUS : STEM.x1 + RADIUS;
    }

    // base: out along the ellipse normal
    const ex = (n.x - BASE.cx) / (BASE.rx + RADIUS);
    const ey = (n.y - BASE.cy) / (BASE.ry + RADIUS);
    const d = Math.hypot(ex, ey);
    if (d > 0 && d < 1) {
      n.x = BASE.cx + (ex / d) * (BASE.rx + RADIUS);
      n.y = BASE.cy + (ey / d) * (BASE.ry + RADIUS);
    }
  };

  const substep = (h: number) => {
    const ih2 = 1 / (h * h);

    // integrate: spring on the slider, gravity and drag on the chain
    slider.vy += (-SLIDER_K * (slider.y - SLIDER_NATURAL) - SLIDER_DAMPING * slider.vy) * slider.w * h;
    for (let i = 1; i < nodes.length; i++) {
      const n = nodes[i];
      const drag = 1 - AIR_DRAG * h;
      n.vx *= drag;
      n.vy = (n.vy + GRAVITY * h) * drag;
    }
    for (const n of nodes) {
      n.px = n.x; n.py = n.y;
      n.x += n.vx * h;
      n.y += n.vy * h;
    }

    // hand
    if (grab.node) {
      const n = grab.node;
      const k = n.w / (n.w + GRAB_COMPLIANCE * ih2);
      n.x += (grab.tx + grab.ox - n.x) * k;
      n.y += (grab.ty + grab.oy + grab.pull - n.y) * k;
    }

    // links: slightly elastic, with a hard stretch limit
    for (let i = 0; i < FREE; i++) {
      distance(nodes[i], nodes[i + 1], SEG, LINK_COMPLIANCE * ih2);
      distance(nodes[i], nodes[i + 1], LINK_MAX, 0, 'max');
    }

    // bending: every second node is softly pulled toward a straight line
    for (let i = 0; i + 2 < nodes.length; i++) {
      distance(nodes[i], nodes[i + 2], 2 * SEG, BEND_COMPLIANCE * ih2);
    }

    // no overlapping characters
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 2; j < nodes.length; j++) distance(nodes[i], nodes[j], MIN_GAP, 0, 'min');
    }

    // the slider runs on a vertical rail with end stops
    slider.x = HOLE.x;
    slider.y = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, slider.y));

    for (let i = 1; i < nodes.length; i++) collide(nodes[i]);

    // velocities from positions, then damp motion along each link
    for (const n of nodes) {
      n.vx = (n.x - n.px) / h;
      n.vy = (n.y - n.py) / h;
    }
    for (let i = 0; i < FREE; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1e-6;
      const imp = (((b.vx - a.vx) * dx + (b.vy - a.vy) * dy) / len) * LINK_DAMPING / (a.w + b.w) / len;
      a.vx += a.w * imp * dx; a.vy += a.w * imp * dy;
      b.vx -= b.w * imp * dx; b.vy -= b.w * imp * dy;
    }
    slider.vx = 0;

    // the switch
    // only under a hand: settling on load must not click it
    if (armed && grab.node && slider.y > TOGGLE_AT) {
      armed = false;
      onToggle();
    } else if (!armed && slider.y < REARM_AT) {
      armed = true;
    }
  };

  // ── Rendering ──────────────────────────────────────────────────────────────

  const place = (el: HTMLElement, x: number, y: number, deg: number) => {
    el.style.transform = `translate(${x}px, ${y}px) rotate(${deg}deg)`;
  };

  const render = () => {
    for (let i = 0; i < FREE; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const deg = (-Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;
      place(freeEls[i], (a.x + b.x) / 2, (a.y + b.y) / 2, deg);
    }
    for (let k = 0; k < SPARE; k++) place(spareEls[k], HOLE.x, spareY(k), 0);
  };

  // ── Loop: runs while the cord moves, sleeps once it has settled ────────────

  let raf = 0, acc = 0, prev = 0, still = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.1, (now - prev) / 1000); // don't spiral after a background tab
    prev = now;
    if (grab.node) grab.pull += (grab.pullTarget - grab.pull) * (1 - Math.exp(-PRESS_RATE * dt));
    for (acc += dt; acc >= STEP; acc -= STEP) {
      for (let s = 0; s < SUBSTEPS; s++) substep(STEP / SUBSTEPS);
    }
    render();
    const speed = Math.max(...nodes.map((n) => Math.hypot(n.vx, n.vy)));
    still = grab.node || speed > REST_SPEED ? 0 : still + dt * 1000;
    raf = still > REST_MS ? 0 : requestAnimationFrame(frame);
  };
  const wake = () => {
    if (raf) return;
    still = 0;
    prev = performance.now();
    raf = requestAnimationFrame(frame);
  };

  // ── Input ──────────────────────────────────────────────────────────────────

  const toFrame = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    return { x: CROP.x + (e.clientX - r.left) / scale, y: CROP.y + (e.clientY - r.top) / scale };
  };

  // Hanging characters grab their lower node; spares out of the shade grab the slider.
  const hitTest = (p: { x: number; y: number }) => {
    let best: Node | null = null, bestD = Math.max(HIT_RADIUS, HIT_MIN_PX / scale);
    for (let i = 0; i < FREE; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const d = Math.hypot(p.x - (a.x + b.x) / 2, p.y - (a.y + b.y) / 2);
      if (d < bestD) { bestD = d; best = b; }
    }
    for (let k = 0; k < SPARE && spareY(k) + SEG / 2 > RIM; k++) {
      const d = Math.hypot(p.x - HOLE.x, p.y - spareY(k));
      if (d < bestD) { bestD = d; best = slider; }
    }
    return best;
  };

  // Pressing pulls the cord down for as long as you hold; letting go springs it back.
  stage.addEventListener('pointerdown', (e) => {
    const p = toFrame(e);
    const node = hitTest(p);
    if (!node) return;
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    Object.assign(grab, {
      node, ox: node.x - p.x, oy: node.y - p.y, tx: p.x, ty: p.y,
      sx: p.x, sy: p.y, pull: 0, pullTarget: PRESS_PULL,
    });
    stage.classList.add('is-grabbing');
    wake();
  });

  let last: { x: number; y: number; t: number } | null = null; // previous pointer sample, for brushing
  const clampBrush = (v: number) => Math.max(-BRUSH_MAX, Math.min(BRUSH_MAX, v * BRUSH_GAIN));

  stage.addEventListener('pointermove', (e) => {
    const p = toFrame(e);
    if (grab.node) {
      grab.tx = p.x; grab.ty = p.y;
      if (Math.hypot(p.x - grab.sx, p.y - grab.sy) > DRAG_THRESHOLD) grab.pullTarget = 0;
    } else {
      stage.classList.toggle('can-grab', !!hitTest(p));
      if (last && e.pointerType === 'mouse') {
        const dt = Math.max(1, e.timeStamp - last.t) / 1000;
        const vx = clampBrush((p.x - last.x) / dt), vy = clampBrush((p.y - last.y) / dt);
        for (let i = 1; i < nodes.length; i++) {
          const n = nodes[i];
          if (Math.hypot(n.x - p.x, n.y - p.y) < BRUSH_RADIUS) { n.vx += vx; n.vy += vy; wake(); }
        }
      }
    }
    last = { x: p.x, y: p.y, t: e.timeStamp };
  });

  const release = () => {
    grab.node = null;
    stage.classList.remove('is-grabbing');
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('pointerleave', () => { last = null; });

  render();
  wake();

  return {
    /** Sets the hanging cord swaying sideways, `vx` in frame px/s, strongest
     * at the bottom: the idle wiggle (Lamp.astro). Never moves the switch. */
    nudge(vx: number) {
      if (grab.node) return;
      for (let i = 1; i < nodes.length; i++) nodes[i].vx += (vx * i) / (nodes.length - 1);
      wake();
    },
    /** A press held briefly on the bottom character, for the keyboard. */
    pull() {
      if (grab.node) return;
      const node = nodes[FREE];
      Object.assign(grab, {
        node, ox: 0, oy: 0, tx: node.x, ty: node.y, sx: node.x, sy: node.y, pull: 0, pullTarget: PRESS_PULL,
      });
      wake();
      setTimeout(release, KEY_PULL_MS);
    },
  };
}
