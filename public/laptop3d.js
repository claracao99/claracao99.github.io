// The About page's laptop: seen from behind, lid up, her stickers square on.
// Drag turns it round, like a laptop on a turntable, to the screen: Cursor with
// Claude Code editing the iOS app, and the Simulator. It settles on whichever
// face is nearer, stickers or screen, and stays.
// The loading, stickers and materials follow main.js (the scroll sequence),
// trimmed to what a still, turnable laptop needs.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { studio, contactShadow, SHADOW } from './studio.js';

const LID = THREE.MathUtils.degToRad(100); // open a little past upright
const UPRIGHT = Math.PI / 2;
const FOV = 22;
const FILL_DEFAULT = 0.7; // the lid's share of the frame: room round it, not edge to edge (CSS --fill can set it)
const SILVER = '#d4d6d9';
const PAPER = new Set(['bolt', 'cheesecake', 'tweak']);
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const mix = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const PART = {
  base: 'BoBvWqDHZjAeVrp_44', lid: 'VCQqxpxkUlzqcJI_62', shell: 'Object_103', hingeCover: 'Object_99',
  screen: 'Object_123', glass: 'Object_129', logo: 'Object_125', keys: 'Object_84',
};

export function mountLaptop(canvas, { onReady } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(studio(), 0.02).texture;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 20);
  let dirty = true;

  const aluminium = () => new THREE.MeshPhysicalMaterial({ color: SILVER, metalness: 1, roughness: 0.42 });
  const blackGlass = () => new THREE.MeshPhysicalMaterial({ color: 0x020203, roughness: 0.08, clearcoat: 0.6, clearcoatRoughness: 0.05, envMapIntensity: 0.3 });

  function screenMaterial() {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0, emissive: 0, roughness: 0.12, specularIntensity: 0.5, envMapIntensity: 0.06, toneMapped: false });
    new THREE.TextureLoader().loadAsync('assets/closeup/desk.jpg').then((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      mat.emissiveMap = tex;
      mat.emissive.set(0xffffff);
      mat.needsUpdate = true;
      dirty = true;
    }, () => {});
    return mat;
  }

  // jackbaeten's MacBook Pro 16" (Sketchfab, CC BY 4.0), as main.js adapts it.
  function adapt(root) {
    const get = (n) => { const o = root.getObjectByName(n); if (!o) throw new Error(`no ${n}`); return o; };
    const alu = aluminium();
    root.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      if (m.transparent && m.opacity === 0) o.visible = false;
      else if (!m.map && m.metalness >= 0.5 && m.color.r > 0.5 && Math.abs(m.color.r - m.color.b) < 0.05) o.material = alu;
    });
    get(PART.logo).visible = false;
    get(PART.glass).material = blackGlass();
    get(PART.screen).material = screenMaterial();
    root.updateMatrixWorld(true);
    const screen = get(PART.screen);
    const normal = new THREE.Vector3();
    const n = screen.geometry.attributes.normal;
    for (let i = 0; i < n.count; i++) normal.add(new THREE.Vector3().fromBufferAttribute(n, i));
    normal.transformDirection(screen.matrixWorld);
    const measure = (name) => new THREE.Box3().setFromObject(get(name), true);
    const axis = measure(PART.hingeCover).getCenter(new THREE.Vector3());
    const lid = get(PART.lid);
    const parent = lid.parent;
    const turn = new THREE.Group();
    turn.position.set(0, axis.y, axis.z);
    root.add(turn);
    turn.updateMatrixWorld(true);
    turn.attach(lid);
    turn.rotation.x = Math.atan2(normal.y, normal.z);
    turn.updateMatrixWorld(true);
    parent.attach(lid);
    root.remove(turn);
    const base = measure(PART.base);
    const shell = measure(PART.shell);
    const cover = measure(PART.hingeCover);
    const keys = measure(PART.keys);
    const bottom = Math.max(shell.min.y, cover.max.y);
    const face = { w: shell.max.x - shell.min.x, h: shell.max.y - bottom };
    const CM = 0.01;
    const m = (v) => v.clone().multiplyScalar(CM).setY((v.y - base.min.y) * CM);
    const scaled = new THREE.Group();
    scaled.add(root);
    scaled.scale.setScalar(CM);
    scaled.position.y = -base.min.y * CM;
    const laptop = new THREE.Group();
    const hinge = new THREE.Group();
    hinge.position.copy(m(axis));
    laptop.add(scaled, hinge);
    laptop.updateMatrixWorld(true);
    hinge.attach(lid);
    const size = { w: (base.max.x - base.min.x) * CM, d: (base.max.z - base.min.z) * CM };
    return {
      laptop, hinge,
      back: m(V((shell.min.x + shell.max.x) / 2, (bottom + shell.max.y) / 2, shell.min.z)),
      frontY: (keys.max.y - base.min.y) * CM + face.h * CM * 0.4,
      mid: base.min.z * CM + size.d * 0.45,
      lid: { w: face.w * CM, h: face.h * CM },
      size,
    };
  }

  const loadImage = (src) => new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => fail(new Error(`${src} didn't load`));
    img.src = src;
  });
  function silhouette(img, fill) {
    const c = document.createElement('canvas');
    [c.width, c.height] = [img.naturalWidth, img.naturalHeight];
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = fill;
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }
  async function stickerSheet({ lid: face, back, hinge }) {
    const lid = { w: face.w, d: face.h };
    const [meta, layout] = await Promise.all(['assets/stickers/meta.json', 'assets/layout.json'].map((u) => fetch(u).then((r) => r.json())));
    const imgs = await Promise.all(layout.items.map(([slug]) => loadImage(`assets/stickers/${slug}.png`)));
    const W = 4096;
    const H = Math.round((W * lid.d) / lid.w);
    const px = W / (lid.w * 1000);
    const sx = (lid.w * 1000) / layout.lid_mm[0];
    const sy = (lid.d * 1000) / layout.lid_mm[1];
    const k = (sx + sy) / 2;
    const color = document.createElement('canvas');
    const rough = document.createElement('canvas');
    [color.width, color.height, rough.width, rough.height] = [W, H, W, H];
    const c = color.getContext('2d');
    const g = rough.getContext('2d');
    g.fillStyle = '#808080';
    g.fillRect(0, 0, W, H);
    layout.items.forEach(([slug, x, y, r, scale = 1], i) => {
      const mt = meta[slug];
      const w = mt.w * layout.mm_per_px * layout.s * scale * k * px;
      const h = mt.h * layout.mm_per_px * layout.s * scale * k * px;
      const place = (ctx) => { ctx.translate(x * sx * px, y * sy * px); ctx.rotate((r * Math.PI) / 180); };
      c.save(); place(c);
      c.shadowColor = 'rgb(0 0 0 / 0.3)'; c.shadowBlur = 0.45 * px; c.shadowOffsetY = 0.2 * px;
      c.drawImage(imgs[i], -w / 2, -h / 2, w, h);
      c.restore();
      g.save(); place(g);
      g.drawImage(silhouette(imgs[i], PAPER.has(slug) ? '#bdbdbd' : '#5c5c5c'), -w / 2, -h / 2, w, h);
      g.restore();
    });
    const map = new THREE.CanvasTexture(color);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const mat = new THREE.MeshPhysicalMaterial({
      map, roughnessMap: new THREE.CanvasTexture(rough), roughness: 1, metalness: 0, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    });
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(lid.w, lid.d).rotateY(Math.PI), mat);
    sheet.position.copy(back).sub(hinge.position).z -= 0.0002;
    sheet.renderOrder = 2;
    return sheet;
  }

  // The camera distance at which a w × h face fills `fill` of the frame.
  // With CSS --lid (px), the face is that wide whatever the canvas: a fixed
  // size on a full-window canvas, so its soft shadow never meets an edge.
  function fit(w, h, fill) {
    const v = THREE.MathUtils.degToRad(camera.fov) / 2;
    const hz = Math.atan(Math.tan(v) * camera.aspect);
    const px = parseFloat(getComputedStyle(canvas).getPropertyValue('--lid'));
    if (px) return w / (px / canvas.clientWidth) / 2 / Math.tan(hz);
    return Math.max(w / fill / 2 / Math.tan(hz), h / fill / 2 / Math.tan(v));
  }

  // t: 0 behind (stickers), ±1 in front (screen), either way round.
  let rig, shadow;
  function pose(t) {
    const { back, frontY, mid, lid, size } = rig;
    const f = ((t % 2) + 2) % 2;
    const c = f <= 1 ? f : 2 - f; // how far round to the screen, whichever way, however many turns
    const target = V(0, mix(back.y, frontY, c), mid);
    const yaw = Math.PI * t;
    const el = mix(0.05, 0.22, c);
    const FILL = Number(getComputedStyle(canvas).getPropertyValue('--fill')) || FILL_DEFAULT;
    const dist = mix(fit(lid.w, lid.h, FILL) + (mid - back.z), fit(size.w, lid.h * 1.2, FILL), c) * (1 + 0.18 * Math.sin(Math.PI * c));
    camera.position.copy(target).addScaledVector(V(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), dist);
    camera.lookAt(target);
  }

  // Drag: a turntable with two detents. The side under the pointer goes with
  // it, one to one, and there are no walls: turn it as far as you like. Let
  // go and its momentum carries it on, then a soft spring settles it on the
  // nearer face, the stickers or the screen, and there it stays until it's
  // turned again. (Chosen over a spring-back, a free spin that could stop
  // side-on, and a rubber-banded peek; explorations 2026-10-29.)
  let t = 0, vel = 0, goal = 0, dragging = false, grabX = 0, grabT = 0, lastT = 0, lastMs = 0, active = false, raf = 0;
  const perPx = () => 1.6 / canvas.clientWidth; // a drag across the canvas ≈ 1.6 faces
  const W = 6, ZETA = 0.8; // the settle: about a third of a second, the faintest overshoot
  canvas.addEventListener('pointerdown', (e) => {
    if (!rig) return;
    dragging = true; grabX = e.clientX; grabT = t; lastT = t; lastMs = e.timeStamp; vel = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.dataset.drag = '1';
    kick();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    t = grabT - (e.clientX - grabX) * perPx();
    // velocity in faces per second, smoothed so the flick counts, not one noisy frame
    const dt = Math.max(1, e.timeStamp - lastMs) / 1000;
    vel = vel * 0.5 + ((t - lastT) / dt) * 0.5;
    lastT = t; lastMs = e.timeStamp;
    dirty = true;
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    delete canvas.dataset.drag;
    if (e && e.timeStamp - lastMs > 80) vel = 0; // held still before letting go: no momentum
    // the face momentum carries it to, never more than one face on
    const near = Math.round(t);
    goal = clamp(Math.round(t + vel * 0.22), near - 1, near + 1);
    kick();
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  // Keyboard: Enter or Space turns it to the other face.
  canvas.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    goal = Math.round(goal) + 1;
    kick();
  });

  let last = performance.now();
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!dragging && (t !== goal || vel !== 0)) {
      if (REDUCE) { t = goal; vel = 0; } else {
        vel += (-W * W * (t - goal) - 2 * ZETA * W * vel) * dt;
        t += vel * dt;
        if (Math.abs(t - goal) < 1e-4 && Math.abs(vel) < 1e-3) { t = goal; vel = 0; }
      }
      dirty = true;
    }
    if (dirty && rig) {
      pose(t);
      renderer.render(scene, camera);
      dirty = false;
    }
    if (active && (dragging || t !== goal || vel !== 0 || dirty)) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (active && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
    kick();
  }
  new ResizeObserver(resize).observe(canvas);

  (async () => {
    const gltf = await new GLTFLoader().loadAsync('assets/model/macbook.glb');
    rig = adapt(gltf.scene);
    rig.hinge.rotation.x = -(LID - UPRIGHT);
    scene.add(rig.laptop);
    try { rig.hinge.add(await stickerSheet(rig)); } catch (e) { console.warn('no stickers:', e.message); }
    shadow = contactShadow(renderer, scene, rig.size.w * 1.5, rig.size.d * 1.7, SHADOW);
    shadow.group.position.set(0, 0.0004, -0.01);
    scene.add(shadow.group);
    shadow.update();
    resize();
    dirty = true;
    kick();
    onReady?.();
  })().catch((e) => console.warn('laptop:', e.message));

  return {
    setActive(on) { active = on; if (on) { dirty = true; resize(); } },
  };
}
