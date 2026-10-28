// The white photo studio and the soft floor shadow, shared by the scroll
// sequence (main.js) and the Close-up About laptop (laptop3d.js).

import * as THREE from 'three';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const mix = (a, b, t) => a + (b - a) * t;

// The shadow on the floor: barely there, just enough to set the laptop down.
// How dark, the blur passes (wide to
// fine) and how high above the floor anything still casts.
export const SHADOW = { opacity: 0.13, blur: [7, 3.5, 1.5], height: 0.32 };

// A white photo studio for the metal to reflect: a cyclorama that darkens
// toward the floor, and softboxes all round so every side of the laptop
// catches light.
export function studio() {
  const room = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 64, 32);
  const pos = geo.attributes.position;
  const shade = [];
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    const v = y > 0 ? mix(0.9, 1, y) : mix(0.9, 0.84, Math.min(1, -y * 2)); // a white desk below
    shade.push(v, v, v);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(shade, 3));
  room.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const box = (w, h, light, at) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(light, light, light), side: THREE.DoubleSide }));
    m.position.copy(at);
    m.lookAt(0, 0, 0);
    room.add(m);
  };
  box(7, 4, 3, V(0, 7, 0)); // overhead
  box(3, 4, 2.2, V(-6, 2.5, 2.5)); // key, front left
  box(3, 4, 1.6, V(6, 2.5, -2.5)); // fill, back right
  box(4, 2.5, 1.6, V(0, 2.2, 6.5)); // front
  box(4, 2.5, 1.8, V(0, 2.2, -6.5)); // behind, for the lid's back
  return room;
}

// ── Contact shadow ────────────────────────────────────────────────────────────
// After three.js's webgl_shadow_contact: depth seen from under the floor,
// blurred, laid on the ground. Call update() whenever the object moves.

export function contactShadow(renderer, scene, width, depth, { height = 0.32, opacity, blur: passes }) {
  const group = new THREE.Group();
  const rt = new THREE.WebGLRenderTarget(512, 512);
  const rtBlur = new THREE.WebGLRenderTarget(512, 512);
  rt.texture.generateMipmaps = rtBlur.texture.generateMipmaps = false;

  const planeGeo = new THREE.PlaneGeometry(width, depth).rotateX(Math.PI / 2);
  const plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ map: rt.texture, transparent: true, depthWrite: false, opacity }));
  plane.renderOrder = 1;
  plane.scale.y = -1;
  const blurPlane = new THREE.Mesh(planeGeo);
  blurPlane.visible = false;
  const cam = new THREE.OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0, height);
  cam.rotation.x = Math.PI / 2;
  group.add(plane, blurPlane, cam);

  const depthMat = new THREE.MeshDepthMaterial();
  depthMat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
      'gl_FragColor = vec4( vec3( 0.0 ), pow( 1.0 - fragCoordZ, 3.0 ) );',
    );
  };
  depthMat.depthTest = depthMat.depthWrite = false;
  const hBlur = new THREE.ShaderMaterial(HorizontalBlurShader);
  const vBlur = new THREE.ShaderMaterial(VerticalBlurShader);
  hBlur.depthTest = vBlur.depthTest = false;

  function blur(amount) {
    blurPlane.visible = true;
    blurPlane.material = hBlur;
    hBlur.uniforms.tDiffuse.value = rt.texture;
    hBlur.uniforms.h.value = amount / 256;
    renderer.setRenderTarget(rtBlur);
    renderer.render(blurPlane, cam);
    blurPlane.material = vBlur;
    vBlur.uniforms.tDiffuse.value = rtBlur.texture;
    vBlur.uniforms.v.value = amount / 256;
    renderer.setRenderTarget(rt);
    renderer.render(blurPlane, cam);
    blurPlane.visible = false;
  }

  function update() {
    plane.visible = false;
    scene.overrideMaterial = depthMat;
    renderer.setRenderTarget(rt);
    renderer.render(scene, cam);
    scene.overrideMaterial = null;
    for (const amount of passes) blur(amount);
    renderer.setRenderTarget(null);
    plane.visible = true;
  }

  return { group, update };
}
