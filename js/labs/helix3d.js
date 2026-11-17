/* Live 3D double helix (three.js). Drag to turn it; raise the temperature
   to watch A–T pairs open first, then the strands separate (denaturation).
   If WebGL or the library is unavailable the static figure stays in place
   and the temperature read-out still works. */
import * as THREE from 'three';

const stage = document.getElementById('helixStage');
const canvas = document.getElementById('helixCanvas');
const slider = document.getElementById('helixTemp');

const SEQUENCE = 'ATGCTAGCTACAGTGAAATCTCGATG';
const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
const COLOR = { A: 0x199e70, T: 0xd95926, C: 0x3987e5, G: 0xf5f5f7 };
const N = SEQUENCE.length;
const SUBDIV = 5;            // backbone beads per base pair
const RISE = 0.42;           // distance between base pairs
const RADIUS = 1.55;
const TWIST = (Math.PI * 2) / 10.4;
const GROOVE = 2.25;         // angular offset of the second strand: makes a major and a minor groove
const SPREAD = 2.3;          // how far each strand moves when fully melted
const FIELD_OF_VIEW = 36;    // degrees, vertical
const HELIX_SPAN = 11.6;     // world units of height the tilted model needs
const HELIX_WIDTH = 10.8;    // world units of width once the strands have separated
const CAPTION_INSET = 44;    // px kept clear under the caption
const PANEL_GAP = 28;        // px kept clear above the control panel
const MIN_CLEAR = 0.35;      // never let the clear band fall below this share of the stage

const smooth = (edge0, edge1, value) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

function startScene() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 200);
  const halfTan = Math.tan(THREE.MathUtils.degToRad(FIELD_OF_VIEW / 2));
  const panel = stage.querySelector('.helix-hud');

  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x10131b, 1.25));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
  keyLight.position.set(5, 7, 9);
  const rimLight = new THREE.DirectionalLight(0x6ea8ff, 1.5);
  rimLight.position.set(-7, -3, -6);
  scene.add(keyLight, rimLight);

  const helix = new THREE.Group();
  helix.rotation.z = 0.3;
  scene.add(helix);

  const beadCount = N * SUBDIV;
  const beadGeometry = new THREE.SphereGeometry(0.2, 18, 12);
  const rodGeometry = new THREE.CylinderGeometry(0.115, 0.115, 1, 12);
  const backbone = new THREE.InstancedMesh(beadGeometry, new THREE.MeshStandardMaterial({ color: 0xd3d9e6, roughness: 0.38, metalness: 0.08 }), beadCount * 2);
  const rodMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.05 });
  const rodsA = new THREE.InstancedMesh(rodGeometry, rodMaterial, N);
  const rodsB = new THREE.InstancedMesh(rodGeometry, rodMaterial, N);
  [backbone, rodsA, rodsB].forEach((mesh) => { mesh.frustumCulled = false; helix.add(mesh); });

  const tint = new THREE.Color();
  for (let i = 0; i < N; i++) {
    rodsA.setColorAt(i, tint.setHex(COLOR[SEQUENCE[i]]));
    rodsB.setColorAt(i, tint.setHex(COLOR[PAIR[SEQUENCE[i]]]));
  }
  rodsA.instanceColor.needsUpdate = true;
  rodsB.instanceColor.needsUpdate = true;

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const mid = new THREE.Vector3();
  const tip = new THREE.Vector3();
  const dir = new THREE.Vector3();

  function setBead(index, x, y, z) {
    dummy.position.set(x, y, z);
    dummy.quaternion.identity();
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    backbone.setMatrixAt(index, dummy.matrix);
  }
  function setRod(mesh, index, from, to) {
    dir.subVectors(to, from);
    const length = Math.max(0.001, dir.length());
    dummy.position.copy(from).addScaledVector(dir, 0.5);
    dummy.quaternion.setFromUnitVectors(up, dir.normalize());
    dummy.scale.set(1, length, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }

  /** Rebuilds every instance for a temperature in °C. */
  function build(temperature) {
    const melt = smooth(74, 93, temperature);
    const twist = TWIST * (1 - 0.5 * melt);
    const radius = RADIUS * (1 - 0.12 * melt);
    const shift = melt * SPREAD;
    const height = (t) => (t - (N - 1) / 2) * RISE;

    for (let i = 0; i < beadCount; i++) {
      const t = i / SUBDIV;
      const angle = t * twist;
      setBead(i, Math.cos(angle) * radius + shift, height(t), Math.sin(angle) * radius);
      setBead(beadCount + i, Math.cos(angle + GROOVE) * radius - shift, height(t), Math.sin(angle + GROOVE) * radius);
    }
    for (let i = 0; i < N; i++) {
      const angle = i * twist;
      const weak = SEQUENCE[i] === 'A' || SEQUENCE[i] === 'T';
      const open = weak ? smooth(58, 72, temperature) : smooth(70, 84, temperature);
      const reach = 1 - 0.3 * open; // an open pair pulls back from the midline
      a.set(Math.cos(angle) * radius, height(i), Math.sin(angle) * radius);
      b.set(Math.cos(angle + GROOVE) * radius, height(i), Math.sin(angle + GROOVE) * radius);
      mid.addVectors(a, b).multiplyScalar(0.5);
      tip.copy(a).lerp(mid, reach);
      a.x += shift; tip.x += shift;
      setRod(rodsA, i, a, tip);
      tip.copy(b).lerp(mid, reach);
      b.x -= shift; tip.x -= shift;
      setRod(rodsB, i, b, tip);
    }
    backbone.instanceMatrix.needsUpdate = true;
    rodsA.instanceMatrix.needsUpdate = true;
    rodsB.instanceMatrix.needsUpdate = true;
  }

  /* ---- interaction: drag to turn, with a little inertia ---- */
  let spinY = 0.6;
  let tiltX = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const release = () => { dragging = false; };
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return; // a right-click or ctrl-click opens a menu and may never send pointerup
    dragging = true; lastX = event.clientX; lastY = event.clientY; velocity = 0;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    if (event.pointerType === 'mouse' && event.buttons === 0) { release(); return; } // the button came up elsewhere
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX; lastY = event.clientY;
    spinY += dx * 0.011;
    velocity = dx * 0.011;
    tiltX = Math.min(0.55, Math.max(-0.55, tiltX + dy * 0.006));
  });
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  /* ---- sizing: frame the model in the clear band between caption and control panel ---- */
  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const bottomInset = panel ? panel.offsetHeight + PANEL_GAP : 0;
    const clear = Math.max(MIN_CLEAR, (height - CAPTION_INSET - bottomInset) / height);
    const visible = Math.max(HELIX_SPAN / clear, HELIX_WIDTH / camera.aspect);
    camera.position.set(0, 0, visible / (2 * halfTan));
    helix.position.y = ((bottomInset - CAPTION_INSET) / 2 / height) * visible;
    camera.updateProjectionMatrix();
  }
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    if (panel) observer.observe(panel);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---- loop: runs only while the stage is on screen ---- */
  const timer = new THREE.Timer();
  timer.connect(document);
  let target = slider ? Number(slider.value) : 37;
  let shown = target;
  let firstFrame = true;
  build(shown);

  function frame() {
    timer.update();
    const dt = Math.min(0.05, timer.getDelta());
    if (Math.abs(target - shown) > 0.05) {
      shown += (target - shown) * Math.min(1, dt * 6);
      build(shown);
    }
    if (!dragging) {
      spinY += velocity;
      velocity *= 0.94;
      if (!reduced) spinY += dt * 0.22;
    }
    helix.rotation.y = spinY;
    helix.rotation.x = tiltX;
    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; stage.classList.add('is-live'); }
  }
  frame(); // draw once straight away, so the model is there before the first animation frame
  let onScreen = true;
  let contextLost = false;
  const syncLoop = () => renderer.setAnimationLoop(onScreen && !contextLost ? frame : null);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      syncLoop();
    }, { threshold: 0.02 }).observe(stage);
  } else {
    syncLoop();
  }

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); // allows the browser to restore the context later
    contextLost = true;
    syncLoop();
    stage.classList.remove('is-live'); // fall back to the static figure
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    firstFrame = true; // the next drawn frame brings the live model back
    syncLoop();
  });

  return { setTemperature(value) { target = value; } };
}

// The temperature read-out is handled by app.js so it works even without WebGL.
if (stage && canvas) {
  try {
    const scene3d = startScene();
    if (slider) slider.addEventListener('input', () => scene3d.setTemperature(Number(slider.value)));
  } catch (err) {
    console.error('The 3D helix could not start; showing the static figure instead.', err);
  }
}
