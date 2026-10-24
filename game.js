import * as THREE from './three.module.min.js';
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
function rngf(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const IS_TOUCH = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

/* ---------------- data ---------------- */
const BIKES = [
  { id: 'viper', name: 'Viper', type: 'Sport', price: 0, spd: .78, acc: .74, hnd: .72, desc: 'Nimble starter sport bike' },
  { id: 'hopper', name: 'Hopper', type: 'Dirt', price: 1500, spd: .66, acc: .92, hnd: .9, desc: 'Grippy and great off the road' },
  { id: 'bison', name: 'Bison', type: 'Cruiser', price: 2500, spd: .86, acc: .66, hnd: .56, desc: 'Heavy, long kick reach' },
  { id: 'comet', name: 'Comet', type: 'Café racer', price: 4000, spd: .9, acc: .82, hnd: .76, desc: 'Classic style, all-rounder' },
  { id: 'bolt', name: 'Bolt', type: 'Superbike', price: 7000, spd: 1, acc: .92, hnd: .74, desc: 'The fastest thing on two wheels' },
];
const PAINTS = ['#e63946', '#ff8c1a', '#ffd60a', '#2ec4b6', '#3a86ff', '#8338ec', '#ff4fa3', '#1b1b1f', '#f1f1f1', '#3fbf3f'];
const DECALS = [{ id: 'none', name: 'Plain' }, { id: 'stripes', name: 'Racing stripes' }, { id: 'flames', name: 'Flames' }, { id: 'stars', name: 'Stars' }, { id: 'checker', name: 'Checkers' }, { id: 'bolt', name: 'Lightning' }, { id: 'num', name: 'Race number' }];
const GEAR = ['#ffffff', '#111111', '#e63946', '#ffd60a', '#3a86ff', '#2ec4b6', '#ff4fa3', '#8338ec', '#ff8c1a', '#3fbf3f'];
const UPG_COST = [400, 700, 1100, 1600, 2300];
const RIVALS = ['Dusty', 'Zippy', 'Turbo Tess', 'Max Revs', 'Lola Loop', 'Sprocket', 'Nitro Nik', 'Ace', 'Vroom Vic', 'Pip'];
const TRACKS = [
  { id: 'coast', name: 'Sunrise Coast', desc: 'Seaside highway, palm trees and a few beach cars.', theme: 'coast', rw: 10.6, R: 430, seed: 11, rad: [[2, .12, 0], [3, .08, 1], [5, .045, 2]], hills: [[2, 6, 0], [5, 2.5, 1]], laps: 2, traffic: 6, obst: 6, cross: 5, ramps: 3, bumps: 2, diff: 0,
    sky: [0x3d8fe0, 0xffd2a0, 0x9fc4e8], sun: [-0.6, 0.28, -0.5], sunCol: 0xffe2b8, sunInt: 2.8, hemi: [0xcfe4ff, 0x9a8a60, 1.25], fog: [0xf6d8b4, 140, 1200], grip: 1, art: 'linear-gradient(#4a9cf0,#ffd2a0 70%,#2a7fc0 71%)' },
  { id: 'canyon', name: 'Red Rock Canyon', desc: 'Hot desert canyon with big hills, cacti and rocks.', theme: 'canyon', rw: 9.8, R: 470, seed: 22, rad: [[2, .1, .5], [4, .1, 0], [7, .035, 1]], hills: [[3, 14, 0], [6, 5, 2]], laps: 2, traffic: 3, obst: 12, cross: 2, ramps: 4, bumps: 3, diff: 1,
    sky: [0x3f74c8, 0xffc488, 0xd89a66], sun: [0.5, 0.45, -0.4], sunCol: 0xfff0d0, sunInt: 3.0, hemi: [0xd8e6ff, 0xb0603a, 1.2], fog: [0xf0c294, 160, 1100], grip: .95, art: 'linear-gradient(#3f74c8,#ffc488 60%,#c8603a 61%)' },
  { id: 'city', name: 'Neon City Night', desc: 'Downtown at night with streetlights, skyscrapers and lots of traffic.', theme: 'city', R: 400, seed: 33, rad: [[2, .15, 1], [4, .07, 0], [6, .02, 1]], hills: [[2, 3, 0], [5, 1.5, 1]], laps: 2, traffic: 16, obst: 8, cross: 8, ramps: 2, bumps: 1, diff: 2,
    sky: [0x05061a, 0x2a1850, 0x120c2a], sun: [0.3, 0.6, 0.4], sunCol: 0x8fa0ff, sunInt: 0.9, hemi: [0x5060a0, 0x201830, 1.1], fog: [0x1a1238, 80, 800], grip: 1, night: true, art: 'linear-gradient(#05061a,#3a1a6a 70%,#111 71%)' },
  { id: 'forest', name: 'Pine Ridge', desc: 'Steep forest mountain roads at sunset. Tight bends!', theme: 'forest', rw: 9, R: 500, seed: 44, rad: [[3, .12, 2], [5, .07, 1], [8, .03, 0]], hills: [[2, 22, 0], [4, 8, 1]], laps: 2, traffic: 4, obst: 9, cross: 2, ramps: 4, bumps: 3, diff: 3,
    sky: [0x3b4fa0, 0xff9a5a, 0x6a4a6a], sun: [-0.7, 0.14, 0.3], sunCol: 0xffb070, sunInt: 2.4, hemi: [0xffd0b0, 0x3a5a2a, 1.1], fog: [0xe08a68, 110, 950], grip: 1, art: 'linear-gradient(#3b4fa0,#ff9a5a 65%,#2d5a2a 66%)' },
  { id: 'snow', name: 'Frosty Pass', desc: 'Snowy mountain pass with falling snow. Slippery!', theme: 'snow', R: 460, seed: 55, rad: [[2, .1, 2], [3, .1, 0], [6, .05, 1]], hills: [[3, 18, 1], [5, 6, 0]], laps: 2, traffic: 4, obst: 9, cross: 0, ramps: 3, bumps: 2, diff: 4,
    sky: [0x8aa4c4, 0xe6eef6, 0xc8d4e0], sun: [0.4, 0.5, -0.6], sunCol: 0xffffff, sunInt: 2.0, hemi: [0xeef4ff, 0xa0a8b8, 1.5], fog: [0xdfe7f0, 90, 850], grip: .78, art: 'linear-gradient(#8aa4c4,#e6eef6 65%,#fff 66%)' },
];

/* ---------------- save ---------------- */
const SKEY = 'tiltrider_save_v1';
const DEF = { cash: 600, owned: ['viper'], bike: 'viper', paint: '#e63946', decal: 'stripes', helmet: '#ffffff', jacket: '#111111', upg: {}, unlocked: ['coast'], best: {}, wins: 0,
  set: { steer: IS_TOUCH ? 'tilt' : 'touch', sens: 3, inv: false, auto: true, diff: 'easy', sv: 2, qual: 'auto', music: true, sound: true, cal: 0 } };
let S;
try { S = Object.assign(structuredClone(DEF), JSON.parse(localStorage.getItem(SKEY) || '{}')); S.set = Object.assign(structuredClone(DEF.set), S.set || {}); if (S.set.sv !== 2) { S.set.sv = 2; S.set.auto = true; S.set.sens = 3; S.set.diff = 'easy'; } } catch (e) { S = structuredClone(DEF); }
const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) { } };
const upgOf = id => (S.upg[id] = S.upg[id] || { spd: 0, acc: 0, hnd: 0 });
function bikeStats(id) { const b = BIKES.find(x => x.id === id), u = upgOf(id); return { spd: Math.min(1.15, b.spd + u.spd * .045), acc: Math.min(1.15, b.acc + u.acc * .05), hnd: Math.min(1.15, b.hnd + u.hnd * .05) }; }

/* ---------------- renderer ---------------- */
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const QUAL = { low: { pr: 1, sh: false, dens: .45, far: 700 }, med: { pr: 1.5, sh: false, dens: .75, far: 950 }, high: { pr: 2, sh: true, dens: 1, far: 1200 } };
let qName = 'med', Q = QUAL.med, dynPR = 1;
function pickQuality() {
  qName = S.set.qual === 'auto' ? (IS_TOUCH ? 'med' : 'high') : S.set.qual; Q = QUAL[qName];
  dynPR = Math.min(devicePixelRatio || 1, Q.pr); renderer.setPixelRatio(dynPR); renderer.shadowMap.enabled = Q.sh;
}
pickQuality();
const camera = new THREE.PerspectiveCamera(64, 1, 0.3, 4000);
const fxc = $('fx'), fx = fxc.getContext('2d');
let ROT = 0, softPaused = false, softT = 0; const VW = () => ROT ? innerHeight : innerWidth, VH = () => ROT ? innerWidth : innerHeight;
function setRot(a) { ROT = a; document.body.classList.toggle('rot90', a === 90); document.body.classList.toggle('rotm90', a === -90); resize(); }
function resize() {
  const pageP = IS_TOUCH && innerHeight > innerWidth; if (ROT && !pageP) { ROT = 0; document.body.classList.remove('rot90', 'rotm90'); }
  const w = VW(), h = VH(); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  fxc.width = w; fxc.height = h; gcam.aspect = w / h; gcam.updateProjectionMatrix(); placeGarageCam();
  const portrait = IS_TOUCH && h > w;
  if (state === 'race' && portrait) { if (!paused) { paused = true; softPaused = true; sfx.engine(0, false, false); } $('tiltHint').classList.add('on'); }
  else if (softPaused && !portrait) { softT = performance.now(); setTimeout(() => { if (softPaused && !(IS_TOUCH && VH() > VW())) { softPaused = false; paused = false; last = performance.now(); $('tiltHint').classList.remove('on'); } }, 250); }
  $('rotate').classList.toggle('need', portrait && !rotDismissed && state !== 'race');
}
let rotDismissed = false;
addEventListener('resize', () => { resize(); setTimeout(resize, 120); }); addEventListener('orientationchange', () => setTimeout(resize, 200));
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (!e.target.closest('.cards,#gTab,.set')) e.preventDefault(); }, { passive: false });

/* ---------------- textures ---------------- */
function ctex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return t; }
function roadTex(theme) {
  return ctex(256, 512, (g, w, h) => {
    const base = theme === 'snow' ? '#5a5f68' : theme === 'canyon' ? '#57504c' : theme === 'city' ? '#2c2c34' : '#44464c';
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = Math.random() * 40 - 20; const c = v > 0 ? 255 : 0; g.fillStyle = `rgba(${c},${c},${c},${Math.abs(v) / 200})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const cw = w * 0.06;
    for (let y = 0; y < h; y += 64) { g.fillStyle = (y / 64) % 2 ? '#f2f2f2' : '#d8282a'; g.fillRect(0, y, cw, 64); g.fillRect(w - cw, y, cw, 64); }
    g.fillStyle = '#f4f4f4'; g.fillStyle = '#ffffff'; g.fillRect(cw + 2, 0, 9, h); g.fillRect(w - cw - 11, 0, 9, h);
    g.fillStyle = theme === 'city' ? '#ffd23a' : '#f4f4f4'; g.fillRect(w / 2 - 6, 0, 12, h * .55);
    g.fillStyle = '#ffffff'; g.fillRect(w * .28 - 3, 0, 6, h * .4); g.fillRect(w * .72 - 3, h * .5, 6, h * .4);
    if (theme === 'snow') { for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }
  }, true);
}
function decalTex(paint, decal) {
  return ctex(256, 128, (g, w, h) => {
    g.fillStyle = paint; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.25)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const lt = paint === '#f1f1f1' || paint === '#ffd60a' ? '#1b1b1f' : '#ffffff';
    g.fillStyle = lt; g.strokeStyle = lt;
    if (decal === 'stripes') { g.fillRect(w * .38, 0, w * .08, h); g.fillRect(w * .54, 0, w * .08, h); }
    if (decal === 'flames') { const c = ['#ffd60a', '#ff8c1a', '#e63946']; for (let k = 0; k < 3; k++) { g.fillStyle = c[k]; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w * .85; x += 26) { g.lineTo(x + 13, h * (.15 + k * .17) + Math.sin(x) * 8); g.lineTo(x + 26, h * (.55 + k * .12)); } g.lineTo(w * .85, h); g.fill(); } }
    if (decal === 'stars') { for (let i = 0; i < 9; i++) { const x = (i * 53) % w + 14, y = (i * 37) % h + 12, r = 9 + (i % 3) * 4; g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); } }
    if (decal === 'checker') { for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 16) if (((x + y) / 16) % 2 === 0 && x > w * .55) g.fillRect(x, y, 16, 16); }
    if (decal === 'bolt') { g.fillStyle = '#ffd60a'; g.beginPath(); g.moveTo(w * .2, h * .1); g.lineTo(w * .55, h * .1); g.lineTo(w * .45, h * .42); g.lineTo(w * .8, h * .42); g.lineTo(w * .3, h * .95); g.lineTo(w * .42, h * .55); g.lineTo(w * .12, h * .55); g.fill(); }
    if (decal === 'num') { g.beginPath(); g.arc(w / 2, h / 2, h * .38, 0, 7); g.fillStyle = '#fff'; g.fill(); g.fillStyle = '#111'; g.font = 'bold 64px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('7', w / 2, h / 2 + 3); }
  });
}
const dotTex = ctex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.5, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
const windowTex = ctex(128, 256, (g, w, h) => { g.fillStyle = '#15151f'; g.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 16) for (let x = 6; x < w; x += 14) { const r = Math.random(); g.fillStyle = r < .45 ? '#ffd88a' : r < .55 ? '#8fd8ff' : r < .6 ? '#ff8ad8' : '#22222e'; g.fillRect(x, y, 8, 10); } });
windowTex.wrapS = windowTex.wrapT = THREE.RepeatWrapping;

/* ---------------- bike builder ---------------- */
const geo = { box: new THREE.BoxGeometry(1, 1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 14), sph: new THREE.SphereGeometry(1, 16, 12), tor: new THREE.TorusGeometry(1, .32, 10, 22) };
function M(color, shin = 30) { return new THREE.MeshPhongMaterial({ color, shininess: shin }); }
const mats = { tyre: M(0x1a1a1a, 5), chrome: M(0xd8dde4, 120), dark: M(0x2a2a30, 20), seat: M(0x151515, 10), visor: M(0x10141c, 150), glove: M(0x222222, 5), light: new THREE.MeshBasicMaterial({ color: 0xfff6cc }), tail: new THREE.MeshBasicMaterial({ color: 0xff2020 }) };
function part(g, mat, sx, sy, sz, x, y, z, parent, rx = 0) { const m = new THREE.Mesh(g, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = true; parent.add(m); return m; }
function makeBike(o) {
  const root = new THREE.Group(), lean = new THREE.Group(); root.add(lean);
  const body = new THREE.MeshPhongMaterial({ map: decalTex(o.paint, o.decal), shininess: 90, specular: 0x666666 });
  const paint = M(o.paint, 90);
  const md = o.model;
  const wr = md === 'hopper' ? .36 : md === 'bison' ? .34 : .32, wb = md === 'bison' ? 1.65 : md === 'hopper' ? 1.4 : 1.45;
  const wheel = (z) => { const w = new THREE.Group(); w.position.set(0, wr, z); const t = new THREE.Mesh(geo.tor, mats.tyre); t.scale.set(wr * .78, wr * .78, md === 'hopper' ? wr * 1.3 : wr); t.rotation.y = Math.PI / 2; w.add(t); const h = part(geo.cyl, mats.chrome, wr * .5, .12, wr * .5, 0, 0, 0, w); h.rotation.z = Math.PI / 2; const sp = part(geo.box, mats.dark, .04, wr * 1.4, .06, 0, 0, 0, w); const sp2 = sp.clone(); sp2.rotation.x = Math.PI / 2; w.add(sp2); lean.add(w); return w; };
  const wf = wheel(-wb / 2), wrr = wheel(wb / 2);
  part(geo.box, mats.dark, .3, .32, .55, 0, wr + .2, .05, lean);
  part(geo.cyl, mats.chrome, .06, .5, .06, .12, wr + .12, .45, lean, 1.3);
  part(geo.box, mats.chrome, .05, .05, wb * .55, 0, wr + .05, wb * .22, lean);
  const fk = part(geo.box, mats.chrome, .06, .75, .06, .12, wr + .35, -wb / 2 + .1, lean, -.35); const fk2 = fk.clone(); fk2.position.x = -.12; lean.add(fk2);
  if (md === 'bison') {
    part(geo.sph, body, .26, .2, .42, 0, wr + .58, -.2, lean); part(geo.box, mats.seat, .34, .1, .6, 0, wr + .46, .32, lean);
    part(geo.cyl, mats.chrome, .025, .6, .025, .22, wr + .95, -.48, lean, .4); part(geo.cyl, mats.chrome, .025, .6, .025, -.22, wr + .95, -.48, lean, .4);
    part(geo.box, mats.chrome, .6, .03, .03, 0, wr + 1.22, -.36, lean);
    part(geo.box, paint, .34, .08, .5, 0, wr + .62, .75, lean, .2);
    part(geo.sph, mats.light, .14, .14, .06, 0, wr + .7, -.78, lean);
  } else if (md === 'hopper') {
    part(geo.box, body, .3, .22, .5, 0, wr + .62, -.15, lean); part(geo.box, mats.seat, .24, .08, .75, 0, wr + .58, .35, lean, -.08);
    part(geo.box, paint, .3, .04, .5, 0, wr * 2 + .12, -wb / 2 + .05, lean, .15); part(geo.box, paint, .26, .04, .5, 0, wr * 2 + .15, wb / 2 - .1, lean, -.25);
    part(geo.box, mats.dark, .8, .035, .035, 0, wr + 1.0, -.5, lean);
    part(geo.box, paint, .28, .3, .06, 0, wr + .75, -.7, lean, -.3);
  } else if (md === 'comet') {
    part(geo.sph, body, .24, .17, .44, 0, wr + .62, -.22, lean); part(geo.box, mats.seat, .26, .1, .5, 0, wr + .55, .28, lean);
    part(geo.box, body, .28, .2, .2, 0, wr + .62, .58, lean);
    part(geo.cyl, mats.chrome, .15, .1, .15, 0, wr + .78, -.72, lean, Math.PI / 2); part(geo.sph, mats.light, .12, .12, .04, 0, wr + .78, -.78, lean);
    part(geo.box, mats.dark, .62, .035, .035, 0, wr + .72, -.55, lean);
  } else {
    const big = md === 'bolt' ? 1.12 : 1;
    part(geo.box, body, .36 * big, .28, .56, 0, wr + .6, -.15, lean, .12);
    part(geo.box, body, .44 * big, .46, .42, 0, wr + .52, -.6, lean, -.5);
    part(geo.box, new THREE.MeshPhongMaterial({ color: 0x9fd8ff, transparent: true, opacity: .55, shininess: 150 }), .34, .03, .3, 0, wr + .82, -.72, lean, -.95);
    part(geo.box, body, .3, .16, .55, 0, wr + .62, .5, lean, -.25); part(geo.box, mats.seat, .28, .07, .36, 0, wr + .66, .22, lean);
    part(geo.box, body, .4 * big, .3, .7, 0, wr + .22, -.1, lean);
    part(geo.box, mats.light, .2, .08, .04, 0, wr + .55, -.83, lean);
    part(geo.box, mats.dark, .56, .035, .035, 0, wr + .72, -.5, lean);
    if (md === 'bolt') { part(geo.box, paint, .5, .03, .14, 0, wr + .92, .72, lean); part(geo.box, mats.dark, .03, .2, .05, .2, wr + .82, .72, lean); part(geo.box, mats.dark, .03, .2, .05, -.2, wr + .82, .72, lean); }
  }
  part(geo.box, mats.tail, .14, .06, .03, 0, wr + .7, wb / 2 + .05, lean);
  const rider = new THREE.Group(); lean.add(rider);
  const jk = M(o.jacket, 25), hm = new THREE.MeshPhongMaterial({ color: o.helmet, shininess: 120 }), pants = M(0x2a3550, 10);
  const tuck = md === 'bison' ? 0 : md === 'hopper' ? .25 : .65; const seatY = wr + (md === 'bison' ? .5 : .66);
  const torso = new THREE.Group(); torso.position.set(0, seatY + .05, .2); torso.rotation.x = -tuck; rider.add(torso);
  part(geo.box, jk, .42, .62, .26, 0, .32, 0, torso);
  part(geo.box, M(0xffffff, 10), .43, .1, .27, 0, .45, 0, torso);
  part(geo.sph, hm, .2, .21, .22, 0, .78, -.02, torso);
  part(geo.box, mats.visor, .3, .1, .05, 0, .78, -.2, torso);
  part(geo.box, hm, .05, .06, .3, 0, .99, 0, torso);
  const barZ = md === 'bison' ? -.36 : -.5, barY = md === 'bison' ? wr + 1.22 : wr + .74;
  for (const sx of [-1, 1]) { const sh = new THREE.Vector3(sx * .24, seatY + .05 + .58 * Math.cos(tuck), .2 - .58 * Math.sin(tuck)); const hd = new THREE.Vector3(sx * .28, barY, barZ);
    const a = new THREE.Mesh(geo.box, jk); a.position.copy(sh).add(hd).multiplyScalar(.5); a.scale.set(.11, .11, sh.distanceTo(hd)); rider.add(a); a.lookAt(hd); part(geo.sph, mats.glove, .07, .07, .07, hd.x, hd.y, hd.z, rider); }
  const legs = [];
  for (const sx of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(sx * .17, seatY + .08, .22); rider.add(hip); part(geo.box, pants, .14, .14, .5, 0, 0, -.22, hip); const knee = new THREE.Group(); knee.position.set(0, 0, -.44); hip.add(knee); part(geo.box, pants, .13, .48, .13, 0, -.22, .05, knee, .3); part(geo.box, mats.dark, .14, .1, .24, 0, -.46, -.02, knee); hip.userData.knee = knee; legs.push(hip); }
  root.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return { root, lean, rider, wf, wr: wrr, legs, torso, wheelR: wr };
}

/* ---------------- track ---------------- */
let scene, track, sun, hemi, racers = [], traffic = [], obstacles = [], crossTraffic = [], ramps = [], bumps = [], dust, snow;
function genTrack(def) {
  const ctrl = [], NC = 400;
  for (let j = 0; j < NC; j++) {
    const th = j / NC * Math.PI * 2; let r = 1; for (const [k, a, p] of def.rad) r += a * Math.sin(k * th + p); r *= def.R;
    let y = 0; for (const [k, a, p] of def.hills) y += a * Math.sin(k * th + p);
    ctrl.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
  }
  const curve = new THREE.CatmullRomCurve3(ctrl, true, 'centripetal');
  const L0 = curve.getLength(), N = Math.round(L0 / 2), pts = curve.getSpacedPoints(N); pts.pop();
  const P = pts, T = [], Rv = [], K = new Float32Array(N), SL = new Float32Array(N);
  for (let i = 0; i < N; i++) { const a = P[(i - 1 + N) % N], b = P[(i + 1) % N]; const t = new THREE.Vector3(b.x - a.x, 0, b.z - a.z).normalize(); T.push(t); Rv.push(new THREE.Vector3(-t.z, 0, t.x)); SL[i] = (b.y - a.y) / a.distanceTo(b); }
  let L = 0; for (let i = 0; i < N; i++) L += P[i].distanceTo(P[(i + 1) % N]); const step = L / N;
  for (let i = 0; i < N; i++) { const a = T[i], b = T[(i + 3) % N]; K[i] = (a.x * b.z - a.z * b.x) / (3 * step); }
  const K2 = new Float32Array(N); for (let i = 0; i < N; i++) { let s = 0; for (let d = -4; d <= 4; d++) s += K[(i + d + N) % N]; K2[i] = s / 9; }
  let minY = 1e9, maxY = -1e9; for (const p of P) { minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  return { def, P, T, R: Rv, K: K2, SL, N, L, step, minY, maxY };
}
function frameAt(s, out) { const tr = track; let u = ((s % tr.L) + tr.L) % tr.L / tr.step; const i = Math.floor(u) % tr.N, j = (i + 1) % tr.N, f = u - Math.floor(u);
  out.p.lerpVectors(tr.P[i], tr.P[j], f); out.t.lerpVectors(tr.T[i], tr.T[j], f).normalize(); out.r.set(-out.t.z, 0, out.t.x); out.k = lerp(tr.K[i], tr.K[j], f); out.sl = lerp(tr.SL[i], tr.SL[j], f); out.i = i; return out; }
const mkF = () => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), r: new THREE.Vector3(), k: 0, sl: 0, i: 0 });
function wave(i, N, f, ph) { return Math.sin(i / N * Math.PI * 2 * f + ph); }
function profile(i, side) {
  const tr = track, th = tr.def.theme, N = tr.N, y0 = tr.P[i].y, base = tr.minY - 3;
  const n1 = wave(i, N, 7, side * 2), n2 = wave(i, N, 17, side), n3 = wave(i, N, 31, side * 3);
  let o, h;
  if (th === 'coast') { if (side < 0) { o = [8.4, 12, 24, 45, 110]; h = [0, -.3, -2.2, -8, base - 25 - y0]; } else { o = [8.4, 13, 28, 70, 260]; h = [0, .4, 3 + 3 * n1, 14 + 10 * n2, base + 30 + 25 * n3 - y0]; } }
  else if (th === 'canyon') { o = [8.4, 12, 22, 38, 70, 260]; h = [0, .3, 2 + n2, 22 + 10 * n1, 42 + 14 * n3, base + 10 - y0]; }
  else if (th === 'city') { o = [8.4, 8.6, 14, 16, 260]; h = [0, .22, .22, 0, base + 2.8 - y0]; }
  else if (th === 'forest') { if (side * (n1 > 0 ? 1 : -1) > 0) { o = [8.4, 12, 25, 60, 260]; h = [0, .4, 4 + 2 * n2, 18 + 10 * n3, base + 40 - y0]; } else { o = [8.4, 12, 25, 60, 260]; h = [0, -.4, -4 + n2, -14 + 6 * n3, base - y0]; } }
  else { o = [8.4, 12, 26, 60, 260]; h = [0, .8, 5 + 3 * n2, 22 + 14 * n1, base + 60 + 30 * n3 - y0]; }
  o = o.map((v, j) => j ? v + RW - 8.4 : RW);
  return { o, y: h.map(v => v + y0) };
}
function terrainY(i, side, off) { const pr = profile(i, side); for (let k = 0; k < pr.o.length - 1; k++) if (off <= pr.o[k + 1]) { const f = (off - pr.o[k]) / (pr.o[k + 1] - pr.o[k]); return lerp(pr.y[k], pr.y[k + 1], f); } return pr.y[pr.y.length - 1]; }
const THEMECOL = {
  coast: { L: ['#d9c690', '#e8d6a0', '#e0c890', '#c8b07a', '#c8b07a'], R: ['#c9b682', '#79a84c', '#5f9a3c', '#4d8432', '#6a8f4a'], base: 0x2a86c8 },
  canyon: { L: ['#c79a6a', '#d08a55', '#b8643a', '#9a4a2a', '#c07040', '#c88a58'], base: 0xc88a58 },
  city: { L: ['#777780', '#9a9aa4', '#8a8a94', '#303038', '#202028'], base: 0x202028 },
  forest: { L: ['#6a7a3a', '#4f7a30', '#3d6a28', '#2f5a22', '#3a5a2a'], base: 0x2f4f22 },
  snow: { L: ['#e8eef6', '#f4f8ff', '#e6eef8', '#d0dcea', '#f4f8ff'], base: 0xe6eef8 },
};
let RW = 8.4;
function buildWorld(def) { RW = def.rw || 8.4;
  scene = new THREE.Scene(); track = genTrack(def); const tr = track, N = tr.N, th = def.theme;
  scene.fog = new THREE.Fog(def.fog[0], def.fog[1] * 1.8, Math.min(def.fog[2] * 1.3, Q.far * 1.3)); camera.far = 3500; camera.updateProjectionMatrix();
  const skyM = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color(def.sky[0]) }, hor: { value: new THREE.Color(def.sky[1]) }, bot: { value: new THREE.Color(def.sky[2]) }, sdir: { value: new THREE.Vector3(...def.sun).normalize() }, scol: { value: new THREE.Color(def.sunCol) }, night: { value: def.night ? 1 : 0 } },
    vertexShader: 'varying vec3 vp;void main(){vp=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w;}',
    fragmentShader: 'uniform vec3 top,hor,bot,sdir,scol;uniform float night;varying vec3 vp;float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}void main(){float y=vp.y;vec3 c=y>0.?mix(hor,top,pow(clamp(y,0.,1.),.6)):mix(hor,bot,clamp(-y*4.,0.,1.));float s=max(dot(vp,sdir),0.);c+=scol*(pow(s,600.)*(night>.5?.8:3.)+pow(s,12.)*.25);if(night>.5&&y>.05){vec3 q=floor(vp*300.);float st=step(.997,h(q));c+=vec3(st)*smoothstep(.05,.3,y);}gl_FragColor=vec4(c,1.);}' });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), skyM); sky.renderOrder = -1; sky.frustumCulled = false; scene.add(sky); scene.userData.sky = sky;
  hemi = new THREE.HemisphereLight(def.hemi[0], def.hemi[1], def.hemi[2]); scene.add(hemi);
  sun = new THREE.DirectionalLight(def.sunCol, def.sunInt); sun.position.set(...def.sun).multiplyScalar(100); scene.add(sun); scene.add(sun.target);
  if (Q.sh) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); const c = sun.shadow.camera; c.left = c.bottom = -40; c.right = c.top = 40; c.near = 1; c.far = 300; sun.shadow.bias = -0.0005; sun.shadow.normalBias = .02; }
  if (def.night) { const hl = new THREE.SpotLight(0xfff2cc, 80, 90, .5, .5, 1.2); scene.add(hl); scene.add(hl.target); scene.userData.head = hl; }
  { const pos = [], uv = [], idx = []; for (let i = 0; i <= N; i++) { const k = i % N, p = tr.P[k], r = tr.R[k]; for (const sx of [-1, 1]) { pos.push(p.x + r.x * sx * RW, p.y + .02, p.z + r.z * sx * RW); uv.push(sx < 0 ? 0 : 1, i * tr.step / 16); } if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const rm = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: roadTex(th), side: THREE.DoubleSide })); rm.receiveShadow = true; scene.add(rm); }
  for (const side of [-1, 1]) {
    const pos = [], col = [], idx = []; let nv = 0; const tc = THEMECOL[th]; const cols = (side > 0 && tc.R ? tc.R : tc.L).map(c => new THREE.Color(c)); const cc = new THREE.Color();
    for (let i = 0; i <= N; i++) { const k = i % N, p = tr.P[k], r = tr.R[k], pr = profile(k, side); nv = pr.o.length;
      for (let j = 0; j < nv; j++) { const o = pr.o[j] * side; pos.push(p.x + r.x * o, pr.y[j], p.z + r.z * o); cc.copy(cols[Math.min(j, cols.length - 1)]); const n = .92 + .08 * Math.sin(k * .37 + j * 3.1) * Math.sin(k * .11 + j); cc.multiplyScalar(n); col.push(cc.r, cc.g, cc.b); }
      if (i < N) for (let j = 0; j < nv - 1; j++) { const a = i * nv + j, b = a + nv; idx.push(a, b, a + 1, a + 1, b, b + 1); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m);
  }
  const basePl = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), th === 'coast' ? new THREE.MeshPhongMaterial({ color: 0x1f7fc0, shininess: 90, specular: 0xffffff }) : new THREE.MeshLambertMaterial({ color: THEMECOL[th].base })); basePl.rotation.x = -Math.PI / 2; basePl.position.y = th === 'coast' ? tr.minY - 5 : tr.minY - 3.2; scene.add(basePl);
  buildScenery(def); buildBackdrop(def);
  dust = makeParticles(260, th === 'snow' ? 0xffffff : th === 'city' ? 0xb0b0c0 : th === 'coast' ? 0xe8d8b0 : th === 'forest' ? 0x9a8a6a : 0xd09060, 1.3);
  snow = th === 'snow' ? makeSnow() : null;
}
function makeParticles(n, color, size) {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3).fill(-9999); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: dotTex, transparent: true, opacity: .22, depthWrite: false })); pts.frustumCulled = false; scene.add(pts);
  return { pts, p, v: new Float32Array(n * 3), life: new Float32Array(n), n, next: 0 };
}
function emit(ps, x, y, z, vx, vy, vz) { const i = ps.next; ps.next = (i + 1) % ps.n; ps.p[i * 3] = x; ps.p[i * 3 + 1] = y; ps.p[i * 3 + 2] = z; ps.v[i * 3] = vx; ps.v[i * 3 + 1] = vy; ps.v[i * 3 + 2] = vz; ps.life[i] = .9; }
function stepParticles(ps, dt) { for (let i = 0; i < ps.n; i++) { if (ps.life[i] <= 0) continue; ps.life[i] -= dt; if (ps.life[i] <= 0) { ps.p[i * 3 + 1] = -9999; continue; } ps.p[i * 3] += ps.v[i * 3] * dt; ps.p[i * 3 + 1] += ps.v[i * 3 + 1] * dt; ps.p[i * 3 + 2] += ps.v[i * 3 + 2] * dt; ps.v[i * 3 + 1] += .6 * dt; } ps.pts.geometry.attributes.position.needsUpdate = true; }
function makeSnow() { const n = qName === 'low' ? 600 : 1400, g = new THREE.BufferGeometry(), p = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) p[i] = (Math.random() - .5) * 120; g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: .35, map: dotTex, transparent: true, depthWrite: false })); pts.frustumCulled = false; scene.add(pts); return { pts, p, n }; }

function inst(geom, mat, list, shadow = true) { if (!list.length) return null; const m = new THREE.InstancedMesh(geom, mat, list.length); const o = new THREE.Object3D(), c = new THREE.Color(); list.forEach((it, k) => { o.position.set(it.x, it.y, it.z); o.rotation.set(it.rx || 0, it.ry || 0, it.rz || 0); o.scale.set(it.sx, it.sy, it.sz); o.updateMatrix(); m.setMatrixAt(k, o.matrix); if (it.c !== undefined) m.setColorAt(k, c.set(it.c)); }); m.castShadow = shadow; m.receiveShadow = true; scene.add(m); return m; }
function buildScenery(def) {
  const tr = track, th = def.theme, rnd = rngf(def.seed * 7), N = tr.N, dens = Q.dens;
  const place = (count, minO, maxO, fn, sides = [-1, 1]) => { for (let n = 0; n < count * dens; n++) { const i = Math.floor(rnd() * N), side = sides[Math.floor(rnd() * sides.length)], off = (RW - 8.4) + minO + rnd() * (maxO - minO); const p = tr.P[i], r = tr.R[i]; fn({ x: p.x + r.x * off * side, y: terrainY(i, side, off), z: p.z + r.z * off * side, i, side, off }); } };
  const L = { trunk: [], crown: [], crown2: [], rock: [], bld: [], pole: [], lamp: [], cact: [], arm: [], house: [], roof: [], snowman: [], snowhead: [], umb: [] };
  const lam = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
  if (th === 'coast') {
    place(260, 11, 55, q => { const h = 6 + rnd() * 5; L.trunk.push({ x: q.x, y: q.y + h / 2, z: q.z, sx: .25, sy: h, sz: .25, rz: (rnd() - .5) * .3 }); L.crown.push({ x: q.x, y: q.y + h, z: q.z, sx: 2.6, sy: .7, sz: 2.6, ry: rnd() * 6, c: rnd() < .5 ? 0x3a9a3a : 0x4fb04a }); });
    place(60, 16, 80, q => { L.house.push({ x: q.x, y: q.y + 2, z: q.z, sx: 6 + rnd() * 4, sy: 4, sz: 6, ry: rnd() * 6, c: [0xfff4e0, 0xffd8c0, 0xd8f0ff, 0xfff0a0][Math.floor(rnd() * 4)] }); L.roof.push({ x: q.x, y: q.y + 4.8, z: q.z, sx: 5, sy: 1.6, sz: 5, ry: rnd() * 6, c: 0xc0503a }); }, [1]);
    place(40, 12, 22, q => { L.umb.push({ x: q.x, y: q.y + 2, z: q.z, sx: 1.6, sy: .5, sz: 1.6, c: [0xff4040, 0xffd040, 0x40a0ff, 0xffffff][Math.floor(rnd() * 4)] }); L.pole.push({ x: q.x, y: q.y + 1, z: q.z, sx: .06, sy: 2, sz: .06 }); }, [-1]);
    place(70, 10, 60, q => { const s = .6 + rnd() * 2; L.rock.push({ x: q.x, y: q.y + s * .3, z: q.z, sx: s, sy: s * .7, sz: s, ry: rnd() * 6, c: 0x8a8070 }); });
  } else if (th === 'canyon') {
    place(240, 10, 34, q => { const h = 2 + rnd() * 3; L.cact.push({ x: q.x, y: q.y + h / 2, z: q.z, sx: .32, sy: h, sz: .32 }); if (rnd() < .7) L.arm.push({ x: q.x + .45, y: q.y + h * .6, z: q.z, sx: .2, sy: h * .35, sz: .2 }); });
    place(160, 10, 60, q => { const s = 1 + rnd() * 4; L.rock.push({ x: q.x, y: q.y + s * .2, z: q.z, sx: s, sy: s * (.6 + rnd()), sz: s, ry: rnd() * 6, c: [0xa0482a, 0xc0603a, 0x8a3a22][Math.floor(rnd() * 3)] }); });
  } else if (th === 'city') {
    place(340, 19, 48, q => { const h = 15 + rnd() * rnd() * 90, w = 8 + rnd() * 10; L.bld.push({ x: q.x, y: q.y + h / 2, z: q.z, sx: w, sy: h, sz: w, ry: Math.atan2(tr.T[q.i].x, tr.T[q.i].z), c: [0x8890b0, 0xb0a0c0, 0x90a8c0, 0xc0b0a0, 0x7080a0][Math.floor(rnd() * 5)] }); });
    for (let i = 0; i < N; i += Math.round(28 / tr.step)) for (const side of [-1, 1]) { const p = tr.P[i], r = tr.R[i], o = (RW + 1.1) * side; const x = p.x + r.x * o, z = p.z + r.z * o, y = p.y + .2; L.pole.push({ x, y: y + 3.5, z, sx: .12, sy: 7, sz: .12 }); L.lamp.push({ x: x - r.x * side * 1.2, y: y + 7, z: z - r.z * side * 1.2, sx: 1.6, sy: .2, sz: .5, ry: Math.atan2(r.x, r.z) + Math.PI / 2 }); }
  } else {
    const snowy = th === 'snow';
    place(snowy ? 380 : 520, 10, 75, q => { const h = 6 + rnd() * 8; L.trunk.push({ x: q.x, y: q.y + 1.2, z: q.z, sx: .4, sy: 2.4, sz: .4 }); L.crown.push({ x: q.x, y: q.y + 2 + h * .35, z: q.z, sx: h * .32, sy: h * .6, sz: h * .32, ry: rnd() * 6, c: snowy ? 0x2f5a44 : [0x2f6a2a, 0x3a7a30, 0x24561f][Math.floor(rnd() * 3)] }); L.crown2.push({ x: q.x, y: q.y + 2 + h * .72, z: q.z, sx: h * .22, sy: h * .45, sz: h * .22, ry: rnd() * 6, c: snowy ? 0xf4f8ff : 0x3f8a36 }); });
    place(90, 10, 60, q => { const s = .8 + rnd() * 3; L.rock.push({ x: q.x, y: q.y + s * .2, z: q.z, sx: s, sy: s * .7, sz: s, ry: rnd() * 6, c: snowy ? 0x9aa4b0 : 0x7a7a72 }); });
    if (snowy) place(18, 10, 18, q => { L.snowman.push({ x: q.x, y: q.y + .7, z: q.z, sx: .8, sy: .8, sz: .8, c: 0xffffff }); L.snowhead.push({ x: q.x, y: q.y + 1.75, z: q.z, sx: .5, sy: .5, sz: .5, c: 0xffffff }); });
  }
  const cyl6 = new THREE.CylinderGeometry(1, 1, 1, 6), cone = new THREE.ConeGeometry(1, 1, 7), ico = new THREE.IcosahedronGeometry(1, 0), sph = new THREE.SphereGeometry(1, 8, 6);
  inst(cyl6, lam(th === 'coast' ? 0x9a7048 : 0x5a3a22), L.trunk);
  inst(th === 'coast' ? new THREE.SphereGeometry(1, 7, 4) : cone, lam(0xffffff), L.crown);
  inst(cone, lam(0xffffff), L.crown2);
  inst(ico, lam(0xffffff), L.rock);
  inst(cyl6, lam(0x3f9a4a), L.cact); inst(cyl6, lam(0x3f9a4a), L.arm);
  inst(geo.box, lam(0xffffff), L.house); inst(new THREE.ConeGeometry(1, 1, 4), lam(0xffffff), L.roof);
  inst(new THREE.ConeGeometry(1, 1, 8), lam(0xffffff), L.umb); inst(sph, lam(0xffffff), L.snowman); inst(sph, lam(0xffffff), L.snowhead);
  inst(cyl6, lam(0x40404a), L.pole);
  inst(geo.box, new THREE.MeshBasicMaterial({ color: 0xffe9a8 }), L.lamp, false);
  if (L.bld.length) { const bm = new THREE.MeshLambertMaterial({ map: windowTex, emissive: 0xffffff, emissiveMap: windowTex, emissiveIntensity: .9 }); inst(geo.box, bm, L.bld, false); }
}
function buildBackdrop(def) {
  const th = def.theme, rnd = rngf(def.seed * 3), list = [], col = { coast: 0x6f9a7a, canyon: 0xb0603a, city: 0x1a1a30, forest: 0x3a4a5a, snow: 0xc8d4e4 }[th];
  const cnt = th === 'coast' ? 22 : 40;
  for (let k = 0; k < cnt; k++) { const a = rnd() * Math.PI * 2; if (th === 'coast' && Math.cos(a - 1) > 0) continue; const d = 1500 + rnd() * 600, h = th === 'city' ? 60 + rnd() * 160 : 150 + rnd() * 300, w = th === 'city' ? 40 + rnd() * 60 : 250 + rnd() * 250;
    list.push({ x: Math.cos(a) * d, y: track.minY + h / 2 - 5, z: Math.sin(a) * d, sx: w, sy: h, sz: w, ry: rnd() * 6 }); }
  const c = new THREE.Color(col).lerp(new THREE.Color(def.fog[0]), .45);
  inst(th === 'city' ? geo.box : th === 'canyon' ? new THREE.CylinderGeometry(.8, 1, 1, 7) : new THREE.ConeGeometry(1, 1, 6), new THREE.MeshBasicMaterial({ color: c, fog: false }), list, false);
  if (th === 'snow') { const caps = list.map(it => ({ ...it, y: it.y + it.sy * .3, sx: it.sx * .42, sy: it.sy * .4, sz: it.sx * .42 })); inst(new THREE.ConeGeometry(1, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), caps, false); }
}
function makeCar(color) {
  const g = new THREE.Group(); const b = M(color, 80);
  part(geo.box, b, 2, .7, 4.4, 0, .65, 0, g); part(geo.box, M(0x223344, 120), 1.7, .6, 2.2, 0, 1.25, .2, g);
  for (const [x, z] of [[-.9, -1.4], [.9, -1.4], [-.9, 1.4], [.9, 1.4]]) { const w = part(geo.cyl, mats.tyre, .36, .3, .36, x, .36, z, g); w.rotation.z = Math.PI / 2; }
  part(geo.box, mats.tail, .4, .15, .05, -.7, .75, 2.21, g); part(geo.box, mats.tail, .4, .15, .05, .7, .75, 2.21, g);
  part(geo.box, mats.light, .4, .15, .05, -.7, .75, -2.21, g); part(geo.box, mats.light, .4, .15, .05, .7, .75, -2.21, g);
  return g;
}
function makeTruck(color) {
  const g = new THREE.Group(); const b = M(color, 90);
  // bright cab + box so cross traffic reads from far ahead
  part(geo.box, b, 2.4, 1.1, 3.2, 0, .95, .4, g);
  part(geo.box, M(0x1a2230, 140), 2.1, .7, 1.4, 0, 1.7, -.3, g);
  part(geo.box, M(color === 0xffd040 ? 0xe8a010 : 0xd8dce4, 40), 2.5, 1.6, 3.6, 0, 1.4, 3.6, g); // cargo box
  for (const [x, z] of [[-1.05, -1.1], [1.05, -1.1], [-1.05, 1.6], [1.05, 1.6], [-1.05, 4.4], [1.05, 4.4]]) { const w = part(geo.cyl, mats.tyre, .42, .36, .42, x, .42, z, g); w.rotation.z = Math.PI / 2; }
  part(geo.box, mats.light, .45, .22, .08, -.8, .9, -1.25, g); part(geo.box, mats.light, .45, .22, .08, .8, .9, -1.25, g);
  part(geo.box, mats.tail, .5, .2, .08, -.85, 1.1, 5.45, g); part(geo.box, mats.tail, .5, .2, .08, .85, 1.1, 5.45, g);
  // roof beacon so kids spot it early
  part(geo.sph, M(0xff3030, 80), .28, .28, .28, 0, 2.15, -.2, g);
  return g;
}
function makeRamp() {
  const g = new THREE.Group();
  // wedge of stacked planks; -z is forward (launch end)
  for (let i = 0; i < 7; i++) {
    const t = i / 6, h = .18 + t * 2.1, z = 3.2 - i * 1.05;
    part(geo.box, M(i % 2 ? 0xffd040 : 0x1b1b1f, 25), 5.4, h, 1.1, 0, h / 2, z, g);
  }
  // bright side rails so kids see it early
  for (const sx of [-2.85, 2.85]) part(geo.box, M(0xff3b30, 60), .22, 1.4, 7.2, sx, .9, 0, g);
  part(geo.box, M(0xffd040, 40), 5.6, .12, .4, 0, 2.35, -3.4, g); // lip
  return g;
}
function makeObstacle(th) {
  const g = new THREE.Group();
  if (th === 'city' || th === 'coast') { for (const dx of [-.6, .6]) { part(new THREE.ConeGeometry(.3, .8, 10), M(0xff6a00, 20), 1, 1, 1, dx, .4, 0, g); part(geo.box, M(0xffffff), .45, .08, .45, dx, .04, 0, g); } }
  else if (th === 'snow') { part(geo.sph, M(0xffffff, 5), 1.2, .6, .9, 0, .1, 0, g); }
  else { part(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: th === 'canyon' ? 0xa0482a : 0x6a6a62, flatShading: true }), .9, .7, .9, 0, .4, 0, g); }
  return g;
}

/* ---------------- racers ---------------- */
function makeRacer(o) { const b = makeBike(o); scene.add(b.root); return Object.assign({ s: 0, lap: -1, x: 0, xd: 0, v: 0, steer: 0, leanA: 0, crashT: 0, ghost: 0, kickT: 0, kickSide: 0, kickCd: 0, done: false, ft: 0, kos: 0, wspin: 0, cdir: 1, laneT: 0, aiCd: 0, aggr: 0, airY: 0, airVy: 0, airPitch: 0, groundY: 0, jumpCd: 0 }, o, { b }); }
function setupRace(ti) {
  const def = TRACKS[ti]; buildWorld(def); racers = []; traffic = []; obstacles = []; crossTraffic = []; ramps = []; bumps = [];
  const st = bikeStats(S.bike); const rnd = rngf(Date.now() & 0xffff);
  const names = RIVALS.slice().sort(() => rnd() - .5);
  for (let k = 0; k < 8; k++) {
    let o;
    if (k === 5) o = { name: 'You', isP: true, model: S.bike, paint: S.paint, decal: S.decal, helmet: S.helmet, jacket: S.jacket, st };
    else { const md = BIKES[Math.floor(rnd() * BIKES.length)].id; const DF = DIFFS[S.set.diff] || DIFFS.easy; const skill = DF.ai * (.9 + def.diff * .045 + ((7 - k) / 8) * .1 + rnd() * .05); o = { name: names[k], isP: false, model: md, paint: PAINTS[Math.floor(rnd() * PAINTS.length)], decal: DECALS[Math.floor(rnd() * DECALS.length)].id, helmet: GEAR[Math.floor(rnd() * GEAR.length)], jacket: GEAR[Math.floor(rnd() * GEAR.length)], st: { spd: .64 * skill, acc: .8 * skill, hnd: .8 }, aggr: (.25 + rnd() * .5 + def.diff * .05) * DF.aggr, lane: (rnd() - .5) * 9 }; }
    const r = makeRacer(o); r.s = track.L - 6 - Math.floor(k / 2) * 7; r.x = (k % 2 ? 2.8 : -2.8); r.laneT = r.isP ? 0 : o.lane; racers.push(r);
  }
  const trnd = rngf(def.seed * 13); const carCols = [0xe0e0e0, 0x2050c0, 0xc02030, 0x30a050, 0xf0c020, 0x404040, 0x7050c0];
  for (let k = 0; k < def.traffic; k++) { const m = makeCar(carCols[k % carCols.length]); scene.add(m); traffic.push({ m, s: 300 + (k + trnd() * .5) * (track.L - 400) / def.traffic, x: [-5, -1.8, 1.8, 5][Math.floor(trnd() * 4)], v: 14 + trnd() * 10 }); }
  for (let k = 0; k < def.obst; k++) { const m = makeObstacle(def.theme); scene.add(m); const ob = { cone: def.theme === 'city' || def.theme === 'coast', hitT: 0, fly: null, m, s: 250 + (k + trnd()) * (track.L - 300) / def.obst, x: (trnd() - .5) * 11 }; placeObj(m, ob.s, ob.x, 0); obstacles.push(ob); }
  const nCross = def.cross || 0; const xCols = [0xffd040, 0x2080e0, 0xe03040, 0x30b060, 0xf0f0f0, 0xff7a20];
  for (let k = 0; k < nCross; k++) {
    const m = makeTruck(xCols[k % xCols.length]); scene.add(m);
    const side = k % 2 ? 1 : -1;
    // Park far down a side approach so the player sees them coming long before the junction
    const c = { m, s: 320 + (k + .4) * (track.L - 420) / Math.max(1, nCross), x: side * (RW + 34), side, dir: -side, spd: 11 + trnd() * 5, approachSpd: 7 + trnd() * 3, phase: trnd() * 3, period: 4 + trnd() * 3, hitT: 0, mode: 'wait' };
    placeObj(m, c.s, c.x, Math.PI / 2); m.visible = false; crossTraffic.push(c);
  }
  const nRamp = def.ramps || 0;
  for (let k = 0; k < nRamp; k++) {
    const m = makeRamp(); scene.add(m);
    const s = 380 + (k + .5) * (track.L - 500) / Math.max(1, nRamp);
    const x = (k % 2 ? 1 : -1) * (1.2 + trnd() * 2.2);
    const rp = { m, s, x, len: 7.2, h: 2.2, w: 3.2 }; placeObj(m, s, x, 0); ramps.push(rp);
  }
  const nBump = def.bumps || 0;
  for (let k = 0; k < nBump; k++) {
    bumps.push({ s: 450 + (k + .3) * (track.L - 600) / Math.max(1, nBump), len: 18 + trnd() * 10, amp: 1.1 + trnd() * .7 });
  }
}
function groundLift(s) {
  let y = 0, slope = 0;
  for (const b of bumps) {
    let ds = wrapDS(s - b.s); if (ds < 0 || ds > b.len) continue;
    const u = ds / b.len, sn = Math.sin(u * Math.PI), cs = Math.cos(u * Math.PI);
    y += b.amp * sn; slope += b.amp * Math.PI / b.len * cs;
  }
  return { y, slope };
}
const F = mkF(), F2 = mkF();
function placeObj(obj, s, x, yawRel) { frameAt(s, F); obj.position.copy(F.p).addScaledVector(F.r, x); obj.rotation.order = 'YXZ'; obj.rotation.y = Math.atan2(-F.t.x, -F.t.z) - yawRel; obj.rotation.x = Math.atan(F.sl); return F; }
const player = () => racers.find(r => r.isP);
const maxV = r => 40 + 34 * r.st.spd;
const steerRate = r => (6 + 6 * r.st.hnd) * track.def.grip;
const DRIFT = .05;
const DIFFS = { easy: { ai: .93, aggr: .65, assist: 1, offF: .82, band: .78, catch: 1.36 }, normal: { ai: 1.0, aggr: .95, assist: .5, offF: .7, band: .86, catch: 1.42 }, pro: { ai: 1.06, aggr: 1.35, assist: 0, offF: .5, band: .94, catch: 1.48 } };
const DF_ = () => DIFFS[S.set.diff] || DIFFS.easy;
const progress = r => r.lap * track.L + r.s;
const wrapDS = ds => { const L = track.L; if (ds > L / 2) ds -= L; if (ds < -L / 2) ds += L; return ds; };
let shake = 0;
function crash(r, dir) {
  if (r.crashT > 0 || r.ghost > 0) return; r.crashT = 2.6; r.cdir = dir || (Math.random() < .5 ? -1 : 1); r.cv = r.v;
  if (r.isP) { sfx.crash(); banner('Whoops! Back on in a sec…', 1800); shake = .6; } else sfx.thud(Math.max(.2, 1 - Math.abs(progress(r) - progress(player())) / 60));
}
function doKick(r, side) { if (r.kickCd > 0 || r.crashT > 0) return; r.kickT = .55; r.kickSide = side; r.kickCd = .85; r.kickHit = false; if (r.isP) sfx.whoosh(); }
function resolveKick(r) {
  const reach = r.model === 'bison' ? 2.9 : 2.4;
  for (const o of racers) { if (o === r || o.crashT > 0 || o.ghost > 0) continue; const ds = wrapDS(o.s - r.s), dx = (o.x - r.x) * r.kickSide;
    if (Math.abs(ds) < 2.2 && dx > .4 && dx < reach) { crash(o, r.kickSide); r.kos++; if (r.isP) { sfx.kick(); popText(o, ['BONK!', 'POW!', 'BOOP!', 'WHAM!'][Math.floor(Math.random() * 4)]); } else if (o.isP) { sfx.kick(); popText(o, 'OOF!'); } return true; } }
  return false;
}
function updateRacer(r, dt, inp) {
  const tr = track; frameAt(r.s, F); const k = F.k, mv = maxV(r), sr = steerRate(r);
  r.kickCd -= dt; r.ghost -= dt; r._catchUp = 0;
  if (r.kickT > 0) { r.kickT -= dt; if (r.kickT < .38 && r.kickT > .08 && !r.kickHit) r.kickHit = resolveKick(r); }
  if (r.crashT > 0) {
    r.crashT -= dt; r.cv = Math.max(0, r.cv - 22 * dt); r.v = r.cv; r.s += r.cv * dt; r.x += r.cdir * Math.min(r.cv, 8) * .35 * dt; r.x = clamp(r.x, -18, 18); r.xd = 0; r.airY = 0; r.airVy = 0; r.airPitch = 0;
    if (r.crashT <= 0) { r.v = 0; r.x = clamp(r.x, -6, 6); r.ghost = 1.6; r.steer = 0; }
  } else {
    let steer, thr, brk;
    if (inp) { steer = inp.steer; thr = inp.thr; brk = inp.brk; if (inp.kick) doKick(r, inp.kick);
      const as = DF_().assist; if (as > 0 && r.isP) {
        const fac = sr * Math.min(1, .35 + r.v / 25);
        steer += as * .7 * (k * r.v * r.v * DRIFT) / fac; // cancel most curve drift
        const edge = RW * .6; if (Math.abs(r.x) > edge) steer -= as * Math.sign(r.x) * Math.min(.6, (Math.abs(r.x) - edge) / RW * 1.6); // soft pull back toward the road
        if (Math.abs(inp.steer) < .08) steer -= as * .04 * r.x / RW; // auto-center
        steer = clamp(steer, -1, 1); } }
    else {
      let tx = r.laneT; r.aiCd -= dt;
      const look = (s0, x0, near = 38) => { const ds = wrapDS(s0 - r.s); return ds > 0 && ds < near && Math.abs(x0 - r.x) < 2.6; };
      for (const c of traffic) if (look(c.s, c.x)) { tx = c.x > r.x ? c.x - 3.4 : c.x + 3.4; if (Math.abs(tx) > 7) tx = c.x + (c.x > 0 ? -3.4 : 3.4); }
      for (const o of obstacles) if (look(o.s, o.x)) { tx = o.x > r.x ? o.x - 3 : o.x + 3; if (Math.abs(tx) > 7) tx = o.x + (o.x > 0 ? -3 : 3); }
      for (const c of crossTraffic) if ((c.mode === 'cross' || c.mode === 'approach') && look(c.s, c.x, 55)) {
        const escape = Math.abs(c.x - r.x) < 2.8 ? (r.x >= 0 ? -1 : 1) : Math.sign(r.x - c.x) || 1;
        tx = clamp(c.x + escape * 4.2, -6.5, 6.5); }
      for (const rp of ramps) { // AI aims for ramps when lined up
        const ds = wrapDS(rp.s - r.s); if (ds > 5 && ds < 40 && Math.abs(rp.x - r.x) < 5) tx = rp.x; }
      if (r.aiCd < 0) { r.aiCd = 2 + Math.random() * 3; r.laneT = clamp(r.laneT + (Math.random() - .5) * 4, -5.5, 5.5); }
      const need = (tx - r.x) * 1.4 + k * r.v * r.v * DRIFT; steer = clamp(need / (sr * Math.min(1, .35 + r.v / 25)), -1, 1);
      // Rubber-band: catch up when behind the player, ease off when far ahead — keep races tight
      const pl = player();
      const gap = progress(r) - progress(pl); // + = AI ahead of player
      const DF = DF_(); let band = 1, catchUp = 0;
      if (gap < -6) { catchUp = Math.min(1, (-gap - 6) / 70); band = 1 + catchUp * (DF.catch - 1); }
      else if (gap > 28) band = Math.max(DF.band, 1 - Math.min(1 - DF.band, (gap - 28) / 130 * (1 - DF.band)));
      else if (gap > 8) band = 1 - (gap - 8) / 20 * (1 - (1 + DF.band) / 2);
      r._catchUp = catchUp;
      const vCurve = Math.sqrt(sr * .85 / (Math.abs(k) * DRIFT + 1e-4));
      // draft: sit on the player's bumper — a little faster while behind so 1st isn't a runaway
      let tv = Math.min(mv * band, vCurve * (1 + catchUp * .7));
      if (catchUp > 0) {
        const ceiling = Math.max(mv * DF.catch, pl.v + 8 + catchUp * 6);
        tv = Math.min(Math.max(tv, pl.v + 5 + catchUp * 10), ceiling, vCurve * (1 + catchUp) + 14);
      }
      thr = r.v < tv; brk = r.v > tv + (catchUp > .2 ? 12 : 4);
      // position rubber-band: gently reel the pack in so a clean lead can't become a runaway
      if (gap < -22 && r.crashT <= 0) r.s += Math.min(16, (-gap - 22) * .18) * dt;
      else if (gap > 55 && r.crashT <= 0) r.s -= Math.min(10, (gap - 55) * .1) * dt;
      for (const o of racers) { if (o === r || o.crashT > 0 || o.ghost > 0) continue; if (Math.abs(wrapDS(o.s - r.s)) > 2) continue; const dx = o.x - r.x; if (Math.abs(dx) > .6 && Math.abs(dx) < 2.2 && Math.random() < dt * r.aggr * (o.isP ? 1.2 : .35)) doKick(r, Math.sign(dx)); }
    }
    const off = Math.abs(r.x) > RW - .2, offF = off ? (r.model === 'hopper' ? Math.max(.78, DF_().offF) : (r.isP ? DF_().offF : .5)) : 1;
    const mvE = mv * offF;
    const accMul = (!r.isP && r._catchUp) ? (1 + r._catchUp * 1.1) : 1;
    if (thr) r.v += (8 + 9 * r.st.acc) * accMul * dt * Math.max(.05, 1 - (r.v / mvE) ** 2); else r.v -= (1.2 + r.v * .035) * dt; // gentle coast
    if (brk) r.v -= 28 * dt;
    if (r.v > mvE) r.v -= (r.v - mvE) * (r.isP ? .7 : (r._catchUp ? .2 : 1.6)) * dt; // let drafting AI briefly exceed bike max
    r.v = Math.max(0, r.v);
    r.steer = lerp(r.steer, steer, Math.min(1, dt * 10));
    r.xd = r.steer * sr * Math.min(1, .35 + r.v / 25) - k * r.v * r.v * DRIFT;
    r.x += r.xd * dt;
    const as = r.isP ? DF_().assist : 0, rail = RW + 1.2 + (1 - as) * 3;
    if (as > 0 && Math.abs(r.x) > RW + .3) r.x -= Math.sign(r.x) * (Math.abs(r.x) - RW - .3) * 2.5 * as * dt; // soft guardrail pull
    const wall = Math.min(rail, (tr.def.theme === 'city' ? 13 : 18) + RW - 8.4);
    if (Math.abs(r.x) > wall) { r.x = Math.sign(r.x) * wall; r.v *= Math.pow(.75, dt); }
    r.s += r.v * dt;
    r.jumpCd -= dt;
    // --- ramps / bumps / air ---
    const gl = groundLift(r.s);
    let onRamp = null, alongRamp = 0;
    for (const rp of ramps) {
      const along = wrapDS(r.s - (rp.s - rp.len * .5));
      if (along > 0 && along < rp.len && Math.abs(r.x - rp.x) < rp.w * .55) {
        onRamp = rp; alongRamp = along; r.groundY = (along / rp.len) * rp.h; break;
      }
    }
    if (!onRamp) r.groundY = gl.y;
    // freefall only after a real launch (airVy set); otherwise stick to ramp/bump/road
    const freefall = r.airVy !== 0 || r.airY > r.groundY + 0.25;
    if (freefall) {
      r.airVy -= 26 * dt; r.airY += r.airVy * dt;
      r.airPitch = lerp(r.airPitch, clamp(r.airVy * .045, -.5, .7), Math.min(1, dt * 6));
      if (r.isP) r.v = Math.min(r.v + 1.8 * dt, mv + 5);
      if (r.airY <= r.groundY) {
        const hard = r.airVy < -14;
        r.airY = r.groundY; r.airVy = 0; r.airPitch *= .35; r.jumpCd = Math.max(r.jumpCd, .3);
        if (hard) { r.wob = Math.max(r.wob || 0, .55); r.v *= .92; if (r.isP) { sfx.thud(.5); shake = Math.max(shake, .18); } }
        else if (r.isP) { popText(r, ['NICE!', 'AIR!', 'WHOA!', 'JUMP!'][Math.floor(Math.random() * 4)]); sfx.beep(990, .08); }
      }
    } else {
      r.airY = r.groundY; r.airVy = 0;
      r.airPitch = lerp(r.airPitch, onRamp ? .32 : clamp(gl.slope * .08, -.25, .35), Math.min(1, dt * 8));
      if (onRamp && r.jumpCd <= 0 && alongRamp > onRamp.len * .78 && r.v > 16) {
        r.airVy = 7.5 + r.v * .14; r.airY = onRamp.h + 0.1; r.v *= 1.06; r.jumpCd = .85; r.airPitch = .5;
        if (r.isP) { popText(r, 'BOOST!'); sfx.whoosh(); window.__jumps = (window.__jumps || 0) + 1; }
      } else if (!onRamp && r.jumpCd <= 0 && gl.slope < -1.5 && gl.y > .55 && r.v > 22) {
        r.airVy = 4.5 + r.v * .09; r.airY = gl.y + .08; r.jumpCd = .7; r.airPitch = .35;
        if (r.isP) { window.__jumps = (window.__jumps || 0) + 1; popText(r, 'BUMP!'); }
      }
    }
    const airborne = freefall && r.airY > r.groundY + 0.05;
    const p = F.p;
    if (!airborne && off && r.v > 6) { for (let n = 0; n < 2; n++) emit(dust, p.x + F.r.x * r.x - F.t.x, p.y + .3, p.z + F.r.z * r.x - F.t.z, (Math.random() - .5) * 3, 1 + Math.random() * 2, (Math.random() - .5) * 3); }
    else if (!airborne && r.v > 20 && Math.random() < (tr.def.theme === 'snow' || tr.def.theme === 'canyon' ? .7 : .25)) emit(dust, p.x + F.r.x * r.x - F.t.x * .9, p.y + .2, p.z + F.r.z * r.x - F.t.z * .9, (Math.random() - .5) * 1.5, .5 + Math.random(), (Math.random() - .5) * 1.5);
  }

  if (r.s >= tr.L) { r.s -= tr.L; r.lap++; if (r.lap >= tr.def.laps && !r.done) { r.done = true; r.ft = raceTime; if (r.isP) finishPlayer(); } else if (r.isP && r.lap > 0 && !r.done) { banner(r.lap === tr.def.laps - 1 ? 'FINAL LAP!' : 'Lap ' + (r.lap + 1), 1400); sfx.beep(880, .15); } }
  poseRacer(r, dt, k);
}
function poseRacer(r, dt, k) {
  const b = r.b; const yaw = r.crashT > 0 ? 0 : Math.atan2(r.xd, Math.max(r.v, 4));
  placeObj(b.root, r.s, r.x, yaw);
  b.root.position.y += (r.airY || 0);
  b.root.rotation.x += (r.airPitch || 0);
  const lt = r.crashT > 0 ? r.cdir * -1.45 : -r.steer * .55 * Math.min(1, r.v / 18);
  r.leanA = lerp(r.leanA, lt, Math.min(1, dt * (r.crashT > 0 ? 6 : 8))); b.lean.rotation.z = r.leanA;
  if (r.wob > 0) { r.wob = Math.max(0, r.wob - dt); const w = r.wob * r.wob, ph = (1 - r.wob) * 26; b.lean.rotation.z += Math.sin(ph) * .32 * w; b.root.rotation.y += Math.sin(ph * .8 + 1) * .14 * w; } // cone wobble
  r.wspin += r.v * dt / b.wheelR; b.wf.rotation.x = -r.wspin; b.wr.rotation.x = -r.wspin;
  if (r.crashT > 0) { const t = 2.6 - r.crashT; const air = Math.min(t, 1.2) / 1.2; const up = t < 1.2 ? Math.sin(air * Math.PI) * 1.6 : 0; const getUp = clamp((t - 1.8) / .6, 0, 1);
    b.rider.position.set(r.cdir * air * 1.4, up, air * 1.6); b.rider.rotation.set(t < 1.2 ? t * 6 : 0, 0, t < 1.2 ? t * 2.5 * r.cdir : (1 - getUp) * r.cdir * 1.3); }
  else { b.rider.position.set(0, 0, 0); b.rider.rotation.set(0, 0, 0); }
  b.legs.forEach((h, n) => {
    const side = n === 0 ? -1 : 1; let a = 0;
    if (r.kickT > 0 && r.kickSide === side) { const u = 1 - r.kickT / .55; a = Math.sin(Math.min(1, u * 1.35) * Math.PI); } // 0→1→0 swing
    // thigh swings out to the side + slightly forward; clear from chase cam
    h.rotation.y = side * a * 1.15; h.rotation.z = -side * a * .55; h.rotation.x = -a * .35;
    const kn = h.userData.knee; if (kn) { kn.rotation.z = -side * a * 1.05; kn.rotation.x = a * .85; kn.rotation.y = 0; }
  });
  b.root.visible = !(r.ghost > 0 && Math.floor(r.ghost * 10) % 2 === 0);
}
function updateTraffic(dt) {
  for (const c of traffic) { c.s = (c.s + c.v * dt) % track.L; placeObj(c.m, c.s, c.x, 0);
    for (const r of racers) { if (r.crashT > 0 || r.ghost > 0) continue; const ds = wrapDS(c.s - r.s); if (Math.abs(ds) < 3 && Math.abs(c.x - r.x) < 1.5) { if (r.v > c.v + 3) crash(r, r.x > c.x ? 1 : -1); else r.v = Math.min(r.v, c.v); } } }
  for (const o of obstacles) { if (o.hitT > 0) o.hitT -= dt; if (o.fly) { const f = o.fly; f.t += dt; o.x += f.vx * dt; o.s += f.vs * dt; placeObj(o.m, o.s, o.x, 0); o.m.position.y += Math.max(0, f.vy * f.t - 9 * f.t * f.t); o.m.rotation.z += f.spin * dt; o.m.rotation.x += f.spin * .7 * dt; if (f.t > 1.2) { o.fly = null; o.m.visible = false; } } }
  for (const o of obstacles) for (const r of racers) { if (r.crashT > 0 || r.ghost > 0 || !o.m.visible || (r.airY || 0) > 1.15) continue; // jump over
    if (o.cone) { if (o.hitT > 0) continue; const ds = wrapDS(o.s - r.s); if (Math.abs(ds) < 1.3 && Math.abs(o.x - r.x) < 1.2) { o.hitT = 2; r.v *= .65; r.wob = 1; const side = o.x >= r.x ? 1 : -1; o.fly = { t: 0, vx: side * (5 + Math.random() * 3), vs: Math.max(4, r.v * .6), vy: 5, spin: side * 9 }; if (r.isP) { shake = Math.max(shake, .25); sfx.thud(.7); popText(r, 'WOBBLE!'); try { navigator.vibrate && navigator.vibrate(40); } catch (e) { } window.__coneHits = (window.__coneHits || 0) + 1; } } continue; } const ds = wrapDS(o.s - r.s); if (Math.abs(ds) < 1.3 && Math.abs(o.x - r.x) < 1.2) { if (r.v > 12) crash(r, r.x > o.x ? 1 : -1); else r.v = 0; } }
  updateCrossTraffic(dt);
  for (let a = 0; a < racers.length; a++) for (let c = a + 1; c < racers.length; c++) { const A = racers[a], B = racers[c]; if (A.crashT > 0 || B.crashT > 0) continue; if (Math.abs(wrapDS(A.s - B.s)) < 1.9 && Math.abs(A.x - B.x) < .9) { const push = (.9 - Math.abs(A.x - B.x)) * .5 * (A.x >= B.x ? 1 : -1); A.x += push; B.x -= push; } }
}
function updateCrossTraffic(dt) {
  const p = player();
  for (const c of crossTraffic) {
    if (c.hitT > 0) c.hitT -= dt;
    c.phase += dt;
    const ds = wrapDS(c.s - p.s);
    // wait → approach (visible far ahead, driving in from the side road) → cross → reset
    if (c.mode === 'wait') {
      c.x = c.side * (RW + 34); c.m.visible = false;
      if (ds > 110 && ds < 220 && c.phase > c.period) { c.mode = 'approach'; c.phase = 0; c.m.visible = true; c.dir = -c.side; }
    } else if (c.mode === 'approach') {
      // crawl toward the shoulder while still well ahead of the player
      const edge = c.side * (RW + 9);
      c.x += (edge - c.x) * Math.min(1, dt * .55);
      if (Math.abs(c.x) > Math.abs(edge)) c.x += c.dir * c.approachSpd * dt * .25;
      c.m.visible = ds > -30 && ds < 240;
      placeObj(c.m, c.s, c.x, Math.PI / 2);
      // start crossing once near the road and player is in the approach window
      if (Math.abs(c.x) <= RW + 10.5 && ds > 35 && ds < 130) { c.mode = 'cross'; c.phase = 0; }
      if (ds < 20 && ds > -10) { c.mode = 'cross'; c.phase = 0; } // late scramble if player arrives early
      if (ds < -50 || ds > 250) { c.mode = 'wait'; c.phase = 0; c.period = 3 + Math.random() * 4; }
    } else { // cross
      c.x += c.dir * c.spd * dt;
      placeObj(c.m, c.s, c.x, Math.PI / 2);
      c.m.visible = true;
      for (const r of racers) {
        if (r.crashT > 0 || r.ghost > 0 || c.hitT > 0 || (r.airY || 0) > 1.2) continue;
        const d = wrapDS(c.s - r.s);
        if (Math.abs(d) < 2.4 && Math.abs(c.x - r.x) < 2.0) {
          c.hitT = 1.4; r.v *= .65; r.wob = 1;
          if (r.isP) { shake = Math.max(shake, .3); sfx.thud(.85); popText(r, 'WOBBLE!'); try { navigator.vibrate && navigator.vibrate(45); } catch (e) { } window.__crossHits = (window.__crossHits || 0) + 1; }
        }
      }
      if (Math.abs(c.x) > RW + 16) {
        c.mode = 'wait'; c.side = -c.side; c.x = c.side * (RW + 34); c.period = 4 + Math.random() * 4; c.phase = 0; c.m.visible = false;
      }
    }
    if (c.mode === 'wait') placeObj(c.m, c.s, c.x, Math.PI / 2);
  }
}

/* ---------------- input ---------------- */
const keys = {}; let kickQ = 0; const touch = { l: 0, r: 0, gas: 0, brk: 0 };
addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'KeyZ') kickQ = -1; if (e.code === 'KeyX') kickQ = 1; if ((e.code === 'KeyP' || e.code === 'Escape') && state === 'race') { paused ? resume() : pause(); } if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function bindHold(id, k) { const el = $(id); const on = e => { e.preventDefault(); touch[k] = 1; el.classList.add('down'); ensureAudio(); try { el.setPointerCapture(e.pointerId); } catch (x) { } }, off = () => { touch[k] = 0; el.classList.remove('down'); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off); el.addEventListener('contextmenu', e => e.preventDefault()); }
bindHold('cLeft', 'l'); bindHold('cRight', 'r'); bindHold('cGas', 'gas'); bindHold('cBrake', 'brk');
for (const [id, s] of [['cKickL', -1], ['cKickR', 1]]) { const el = $(id); el.addEventListener('pointerdown', e => { e.preventDefault(); kickQ = s; el.classList.add('down'); setTimeout(() => el.classList.remove('down'), 160); }); }
const tilt = { raw: null, val: 0, has: false, g: null, g0: null, src: '', lockA: null, deg: 0, landT: 0 };
function orientAngle() { if (screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle; return typeof window.orientation === 'number' ? window.orientation : 0; }
const wrap180 = d => { while (d > 180) d -= 360; while (d < -180) d += 360; return d; };
const gAng = g => Math.atan2(g.y, g.x) * 180 / Math.PI;
function onOrient(e) { if (e.beta == null && e.gamma == null) return; const a = tilt.lockA != null ? tilt.lockA : orientAngle(); let v; if (a === 90) v = e.beta; else if (a === -90 || a === 270) v = -e.beta; else if (a === 180) v = -e.gamma; else v = e.gamma; tilt.raw = v; if (!tilt.has) { tilt.has = true; updateCtlMode(); } if (tilt.src !== 'motion') $('tiltRead').textContent = 'tilt: ' + (v - S.set.cal).toFixed(0) + '°'; }
function onMotion(e) { const a = e.accelerationIncludingGravity; if (!a || a.x == null || a.y == null) return; if (Math.hypot(a.x, a.y) < 2.5) return; // too flat to read
  if (!tilt.g) tilt.g = { x: a.x, y: a.y }; else { tilt.g.x += (a.x - tilt.g.x) * .5; tilt.g.y += (a.y - tilt.g.y) * .5; }
  if (tilt.src !== 'motion') { tilt.src = 'motion'; } if (!tilt.has) { tilt.has = true; updateCtlMode(); }
  if (tilt.g0 == null) tilt.g0 = gAng(tilt.g);
  // Portrait Orientation Lock detection: page portrait but phone held sideways
  const pageP = IS_TOUCH && innerHeight > innerWidth, sideways = Math.abs(tilt.g.x) > Math.abs(tilt.g.y) * 1.4;
  if (pageP && sideways && !ROT && !softPaused) { if (!tilt.landT) tilt.landT = performance.now(); else if (performance.now() - tilt.landT > 700) { setRot(tilt.g.x < 0 ? 90 : -90); tilt.g0 = gAng(tilt.g); } } else tilt.landT = 0;
  $('tiltRead').textContent = 'tilt: ' + wrap180(gAng(tilt.g) - tilt.g0).toFixed(0) + '°'; }
addEventListener('deviceorientation', onOrient); addEventListener('devicemotion', onMotion);
async function requestTilt() { try { if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') { const r = await DeviceOrientationEvent.requestPermission(); if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) { try { await DeviceMotionEvent.requestPermission(); } catch (x) { } } return r === 'granted'; } } catch (e) { return false; } return true; }
function recenter() { if (tilt.g) { tilt.g0 = gAng(tilt.g); banner('Tilt centered ✓', 900); } else if (tilt.raw != null) { S.set.cal = tilt.raw; save(); banner('Tilt centered ✓', 900); } else banner('No tilt sensor found on this device', 1400); }
function tiltDeg() { let d = tilt.src === 'motion' && tilt.g ? wrap180(gAng(tilt.g) - tilt.g0) : wrap180(tilt.raw - S.set.cal); return S.set.inv ? -d : d; }
function readInput(dt) {
  let steer = 0; const useTilt = S.set.steer === 'tilt' && tilt.has;
  if (useTilt) { const full = clamp(30 - S.set.sens * 2, 10, 28), DZ = 3; let d = tiltDeg(); tilt.deg = d; d = Math.abs(d) < DZ ? 0 : d - Math.sign(d) * DZ;
    let n = clamp(d / (full - DZ), -1, 1); n = .45 * n + .55 * n * Math.abs(n); // gentle centre, full lock by ~full°
    tilt.val = lerp(tilt.val, n, Math.min(1, dt * 7)); steer = tilt.val; }
  const kb = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0) + touch.r - touch.l; if (kb) steer = clamp(kb, -1, 1);
  const brk = !!(keys.ArrowDown || keys.KeyS || keys.Space || touch.brk); const thr = !!(S.set.auto || keys.ArrowUp || keys.KeyW || touch.gas) && !brk;
  const kick = kickQ; kickQ = 0; return { steer, thr, brk, kick };
}

/* ---------------- audio ---------------- */
let AC = null; const sfx = { engine() { }, beep() { }, kick() { }, crash() { }, thud() { }, whoosh() { } };
function ensureAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const master = AC.createGain(); master.gain.value = S.set.sound ? .7 : 0; master.connect(AC.destination); sfx.master = master;
  const nb = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const eg = AC.createGain(); eg.gain.value = 0; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 3; eg.connect(master); lp.connect(eg);
  const o1 = AC.createOscillator(); o1.type = 'sawtooth'; const o2 = AC.createOscillator(); o2.type = 'square'; const g2 = AC.createGain(); g2.gain.value = .35; o1.connect(lp); o2.connect(g2); g2.connect(lp); o1.start(); o2.start();
  const lfo = AC.createOscillator(); lfo.frequency.value = 28; const lg = AC.createGain(); lg.gain.value = 6; lfo.connect(lg); lg.connect(o1.frequency); lfo.start();
  sfx.engine = (sp, thr, on) => { const t = AC.currentTime, gp = sp * 5.2, gear = Math.floor(gp), fr = gp - gear; const f = 48 + gear * 14 + fr * 95 + (thr ? 6 : 0); o1.frequency.setTargetAtTime(f, t, .05); o2.frequency.setTargetAtTime(f * .501, t, .05); lfo.frequency.setTargetAtTime(f * .5, t, .05); lp.frequency.setTargetAtTime(500 + sp * 1600 + (thr ? 400 : 0), t, .05); eg.gain.setTargetAtTime(on ? (thr ? .16 : .1) : 0, t, .08); };
  const noise = (dur, f, type, vol) => { const s = AC.createBufferSource(); s.buffer = nb; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = f; const g = AC.createGain(); const t = AC.currentTime; g.gain.setValueAtTime(Math.max(vol, .002), t); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur); };
  const tone = (f, dur, type = 'sine', vol = .3, f2) => { const o = AC.createOscillator(); o.type = type; const g = AC.createGain(); const t = AC.currentTime; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur); };
  sfx.beep = (f, du) => tone(f, du, 'square', .15);
  sfx.kick = () => { noise(.12, 2500, 'bandpass', .6); tone(160, .2, 'sine', .7, 50); tone(600, .15, 'triangle', .2, 1200); };
  sfx.whoosh = () => noise(.18, 1200, 'highpass', .15);
  sfx.crash = () => { noise(.7, 700, 'lowpass', .7); tone(120, .4, 'sine', .5, 40); setTimeout(() => tone(500, .25, 'triangle', .15, 900), 300); };
  sfx.thud = v => noise(.3, 600, 'lowpass', .35 * v);
  const mg = AC.createGain(); mg.gain.value = .12; mg.connect(master); let step = 0, next = AC.currentTime;
  const roots = [0, 0, -4, -2], scale = [0, 3, 5, 7, 10, 12];
  setInterval(() => { if (!S.set.music || state !== 'race' || paused || AC.state !== 'running') { next = AC.currentTime; return; } if (next < AC.currentTime) next = AC.currentTime; while (next < AC.currentTime + .25) { const bar = Math.floor(step / 16) % 4, rt = 45 + roots[bar], st = step % 16;
      const play = (midi, dur, type, v) => { const o = AC.createOscillator(); o.type = type; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12); const g = AC.createGain(); g.gain.setValueAtTime(v, next); g.gain.exponentialRampToValueAtTime(.001, next + dur); o.connect(g); g.connect(mg); o.start(next); o.stop(next + dur); };
      if (st % 2 === 0) play(rt - 12 + (st % 8 === 6 ? 12 : 0), .2, 'triangle', .9);
      if (st % 4 === 0) { const s = AC.createBufferSource(); s.buffer = nb; const g = AC.createGain(); g.gain.setValueAtTime(st % 8 === 4 ? .5 : .2, next); g.gain.exponentialRampToValueAtTime(.001, next + .08); s.connect(g); g.connect(mg); s.start(next); s.stop(next + .1); }
      play(rt + 12 + scale[(step * 5 + bar) % 6], .12, 'square', .25);
      next += .125; step++; } }, 80);
}
function applySound() { if (sfx.master) sfx.master.gain.value = S.set.sound ? .7 : 0; $('bMute').textContent = S.set.sound ? '🔊' : '🔇'; }

/* ---------------- HUD ---------------- */
let bannerT = 0; function banner(t, ms) { const b = $('banner'); b.textContent = t; b.classList.toggle('on', !!t); clearTimeout(bannerT); if (ms) bannerT = setTimeout(() => b.classList.remove('on'), ms); }
const _pv = new THREE.Vector3();
function popText(r, t) { _pv.copy(r.b.root.position); _pv.y += 2; _pv.project(camera); if (_pv.z > 1) return; const d = document.createElement('div'); d.className = 'pop'; d.textContent = t; d.style.left = ((_pv.x + 1) / 2 * VW()) + 'px'; d.style.top = ((1 - _pv.y) / 2 * VH()) + 'px'; $('pops').appendChild(d); setTimeout(() => d.remove(), 950); }
const sp = $('speedo').getContext('2d'), mini = $('mini').getContext('2d'); let miniPath = null;
function fmt(t) { const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
function standings() { return racers.slice().sort((a, b) => { if (a.done && b.done) return a.ft - b.ft; if (a.done) return -1; if (b.done) return 1; return progress(b) - progress(a); }); }
function drawHUD() {
  const p = player(), tr = track; const mph = p.v * 2.237, mx = maxV(p) * 2.237;
  sp.clearRect(0, 0, 220, 140); const cx = 110, cy = 118, R = 92, a0 = Math.PI * .9, a1 = Math.PI * 2.1;
  sp.lineWidth = 14; sp.lineCap = 'round'; sp.strokeStyle = 'rgba(0,0,0,.45)'; sp.beginPath(); sp.arc(cx, cy, R, a0, a1); sp.stroke();
  const f = clamp(mph / Math.max(mx, 1), 0, 1); const g = sp.createLinearGradient(20, 0, 200, 0); g.addColorStop(0, '#3fd0ff'); g.addColorStop(.6, '#ffd25e'); g.addColorStop(1, '#ff3b1f'); sp.strokeStyle = g; sp.beginPath(); sp.arc(cx, cy, R, a0, a0 + (a1 - a0) * Math.max(f, .001)); sp.stroke();
  sp.fillStyle = '#fff'; sp.textAlign = 'center'; sp.font = '900 46px system-ui,sans-serif'; sp.fillText(Math.round(mph), cx, cy - 18); sp.font = '700 13px system-ui,sans-serif'; sp.fillStyle = 'rgba(255,255,255,.7)'; sp.fillText('MPH', cx, cy);
  if (!miniPath) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const q of tr.P) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); } const sc = 140 / Math.max(x1 - x0, z1 - z0); miniPath = { sc, ox: 90 - (x0 + x1) / 2 * sc, oz: 90 - (z0 + z1) / 2 * sc }; }
  const mp = miniPath; mini.clearRect(0, 0, 180, 180); mini.fillStyle = 'rgba(0,0,0,.35)'; mini.beginPath(); mini.arc(90, 90, 88, 0, 7); mini.fill();
  mini.strokeStyle = 'rgba(255,255,255,.85)'; mini.lineWidth = 5; mini.lineJoin = 'round'; mini.beginPath(); for (let i = 0; i < tr.N; i += 4) { const q = tr.P[i]; const X = q.x * mp.sc + mp.ox, Y = q.z * mp.sc + mp.oz; i ? mini.lineTo(X, Y) : mini.moveTo(X, Y); } mini.closePath(); mini.stroke();
  for (const r of racers) { if (r.isP) continue; frameAt(r.s, F2); mini.fillStyle = r.paint; mini.beginPath(); mini.arc(F2.p.x * mp.sc + mp.ox, F2.p.z * mp.sc + mp.oz, 4.5, 0, 7); mini.fill(); }
  frameAt(p.s, F2); mini.fillStyle = '#ffd25e'; mini.strokeStyle = '#000'; mini.lineWidth = 2; mini.beginPath(); mini.arc(F2.p.x * mp.sc + mp.ox, F2.p.z * mp.sc + mp.oz, 7, 0, 7); mini.fill(); mini.stroke();
  const pos = standings().indexOf(p) + 1; $('hPos').lastChild.textContent = pos + '/' + racers.length; $('hLap').lastChild.textContent = clamp(p.lap + 1, 1, tr.def.laps) + '/' + tr.def.laps; $('hTime').lastChild.textContent = fmt(raceTime);
}
function drawFX() {
  const w = fxc.width, h = fxc.height; fx.clearRect(0, 0, w, h); if (state !== 'race') return; const p = player(); const f = clamp((p.v - 30) / 40, 0, 1);
  if (f > 0 && !paused) { fx.strokeStyle = `rgba(255,255,255,${.35 * f})`; fx.lineWidth = 2; fx.beginPath(); for (let n = 0; n < 26 * f + 4; n++) { const a = Math.random() * Math.PI * 2, r0 = (.35 + Math.random() * .3) * Math.max(w, h) * .5, r1 = r0 + 40 + Math.random() * 120 * f; fx.moveTo(w / 2 + Math.cos(a) * r0, h * .45 + Math.sin(a) * r0 * .7); fx.lineTo(w / 2 + Math.cos(a) * r1, h * .45 + Math.sin(a) * r1 * .7); } fx.stroke(); }
  const vg = fx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .45, w / 2, h / 2, Math.max(w, h) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${.25 + .2 * f})`); fx.fillStyle = vg; fx.fillRect(0, 0, w, h);
}

/* ---------------- game loop ---------------- */
let state = 'menu', paused = false, raceTime = 0, countT = 0, curTrack = 0, endT = 0;
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(); let camInit = false;
let fpsAcc = 0, fpsN = 0, fpsChecked = false;
function disposeScene(sc) { sc.traverse(o => { if (o.geometry && !Object.values(geo).includes(o.geometry)) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.map && m.map !== windowTex && m.map !== dotTex) m.map.dispose(); if (!Object.values(mats).includes(m)) m.dispose(); }); } }); }
function startRace(ti) {
  tilt.lockA = orientAngle(); softPaused = false; $('tiltHint').classList.remove('on');
  curTrack = ti; if (scene) disposeScene(scene); miniPath = null; setupRace(ti); state = 'race'; paused = false; raceTime = 0; countT = 3.99; camInit = false; endT = 0; fpsAcc = 0; fpsN = 0; fpsChecked = false;
  showScreen(null); $('hud').classList.remove('hidden'); updateCtlMode(); $('count').textContent = ''; banner('', 0);
  for (const r of racers) poseRacer(r, 1, 0);
  ensureAudio(); sfx.beep(440, .2);
}
function updateCtlMode() { const hud = $('hud'); hud.classList.toggle('tiltmode', S.set.steer === 'tilt' && tilt.has); hud.classList.toggle('autothr', !!S.set.auto); hud.classList.toggle('nopointer', !IS_TOUCH && !window.__forceTouch); }
function tickRace(dt) {
  if (countT > 0) { const prev = Math.ceil(countT); countT -= dt; const c = Math.ceil(countT); $('count').textContent = countT > 0 ? c : 'GO!'; if (c !== prev) sfx.beep(c > 0 ? 440 : 880, c > 0 ? .2 : .4); if (countT <= 0) setTimeout(() => { if (countT <= 0) $('count').textContent = ''; }, 700); }
  if (countT > .3 && tilt.g) tilt.g0 = gAng(tilt.g); // hold-angle at GO is centre
  const racing = countT <= 0; if (racing && !player().done) raceTime += dt;
  const inp = readInput(dt);
  for (const r of racers) { if (!racing) continue; if (r.isP) updateRacer(r, dt, r.done ? { steer: 0, thr: false, brk: true, kick: 0 } : inp); else updateRacer(r, dt, null); }
  if (racing) updateTraffic(dt); else { traffic.forEach(c => placeObj(c.m, c.s, c.x, 0)); crossTraffic.forEach(c => placeObj(c.m, c.s, c.x, Math.PI / 2)); ramps.forEach(rp => placeObj(rp.m, rp.s, rp.x, 0)); }
  stepParticles(dust, dt);
  const p = player(); frameAt(p.s, F);
  const v = p.v;
  // Phone = short side ≤500 (covers iPhone 17 Pro ~874×402). iPad landscape short side is ~744–820 → mid zoom.
  const shortSide = Math.min(VW(), VH());
  const phoneCam = shortSide <= 500;
  if (window.__trCamDbg !== shortSide + (phoneCam ? 'p' : 'm')) {
    window.__trCamDbg = shortSide + (phoneCam ? 'p' : 'm');
    console.log('[TiltRider cam]', VW() + 'x' + VH(), 'short=' + shortSide, phoneCam ? 'PHONE close' : 'mid');
  }
  const air = p.airY || 0;
  const back = phoneCam ? (3.45 + v * .014) : (6.4 + v * .03);
  const hgt = (phoneCam ? (1.85 + v * .0035) : (3.1 + v * .008)) + air * .85;
  const want = F.p.clone().addScaledVector(F.t, -back).addScaledVector(F.r, p.x * (phoneCam ? .65 : .85)); want.y = Math.max(want.y, F.p.y) + hgt;
  frameAt(p.s + (phoneCam ? 12 + v * .07 : 20 + v * .09), F2);
  const look = F2.p.clone().addScaledVector(F2.r, p.x * (phoneCam ? .5 : .7)); look.y += (phoneCam ? 1.3 : 1.1) + air * .9;
  if (!camInit) { camPos.copy(want); camLook.copy(look); camInit = true; }
  camPos.lerp(want, Math.min(1, dt * (phoneCam ? 9 : 6.5))); camLook.lerp(look, Math.min(1, dt * (phoneCam ? 8 : 6)));
  camera.position.copy(camPos); if (shake > 0) { shake -= dt; camera.position.x += (Math.random() - .5) * shake * .6; camera.position.y += (Math.random() - .5) * shake * .6; }
  camera.position.y += Math.sin(raceTime * 40) * .012 * clamp(v / 60, 0, 1);
  camera.lookAt(camLook); camera.rotateZ(p.leanA * .22);
  const fov = phoneCam ? (46 + clamp(v / 70, 0, 1) * 6) : ((camera.aspect > 1.3 ? 63 : 66) + clamp(v / 70, 0, 1) * 11);
  if (Math.abs(camera.fov - fov) > .1) { camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 3)); camera.updateProjectionMatrix(); }
  scene.userData.sky.position.copy(camera.position);
  sun.target.position.copy(p.b.root.position); sun.position.copy(p.b.root.position).addScaledVector(new THREE.Vector3(...track.def.sun).normalize(), 120);
  const hl = scene.userData.head; if (hl) { hl.position.copy(p.b.root.position).addScaledVector(F.t, -.5); hl.position.y += 1.3; hl.target.position.copy(p.b.root.position).addScaledVector(F.t, 30); }
  if (snow) { const a = snow.p, c = camera.position; for (let i = 0; i < snow.n; i++) { const j = i * 3; a[j + 1] -= dt * 6; a[j] -= F.t.x * v * dt * .5; a[j + 2] -= F.t.z * v * dt * .5; const dx = a[j] - c.x, dy = a[j + 1] - c.y, dz = a[j + 2] - c.z; if (dy < -20) a[j + 1] += 50; if (dy > 30) a[j + 1] -= 50; if (dx > 60) a[j] -= 120; if (dx < -60) a[j] += 120; if (dz > 60) a[j + 2] -= 120; if (dz < -60) a[j + 2] += 120; } snow.pts.geometry.attributes.position.needsUpdate = true; }
  sfx.engine(clamp(v / maxV(p), 0, 1.1), inp.thr, true);
  drawHUD();
  if (racing && !fpsChecked && S.set.qual === 'auto') { fpsAcc += dt; fpsN++; if (fpsAcc > 3) { const fps = fpsN / fpsAcc; fpsChecked = true; if (fps < 42 && dynPR > 1) { dynPR = Math.max(1, dynPR - .5); renderer.setPixelRatio(dynPR); resize(); } } }
  if (p.done) { endT += dt; if (endT > 2.2 && state === 'race') showResults(); }
}
const ordinal = n => n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th');
function finishPlayer() { const pos = standings().indexOf(player()) + 1; banner(pos === 1 ? '🏆 YOU WIN!' : 'Finished ' + ordinal(pos) + '!', 2200); sfx.beep(pos <= 3 ? 1320 : 660, .5); }
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (state === 'race' || state === 'race-end') { if (state === 'race' && !paused) tickRace(dt); renderer.render(scene, camera); drawFX(); }
  else { if (gBike) gBike.root.rotation.y += dt * (state === 'garage' ? .5 : .3); renderer.render(gscene, gcam); fx.clearRect(0, 0, fxc.width, fxc.height); if (AC) sfx.engine(0, false, false); }
}

/* ---------------- garage scene ---------------- */
const gscene = new THREE.Scene(); const gcam = new THREE.PerspectiveCamera(40, 1, .1, 100);
gscene.background = new THREE.Color(0x14183a); gscene.fog = new THREE.Fog(0x14183a, 8, 22);
gscene.add(new THREE.HemisphereLight(0xc8d8ff, 0x302040, 1.4)); const gl1 = new THREE.DirectionalLight(0xffe8d0, 3); gl1.position.set(3, 6, 4); gl1.castShadow = true; gl1.shadow.mapSize.set(1024, 1024); gscene.add(gl1);
const rim = new THREE.DirectionalLight(0x6aa0ff, 2); rim.position.set(-4, 3, -4); gscene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshPhongMaterial({ color: 0x2a2f5a, shininess: 60 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; gscene.add(floor);
const ring = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.35, 64), new THREE.MeshBasicMaterial({ color: 0xff8a3c })); ring.rotation.x = -Math.PI / 2; ring.position.y = .01; gscene.add(ring);
let gBike = null;
function refreshGarageBike() { const ry = gBike ? gBike.root.rotation.y : .8; if (gBike) { gscene.remove(gBike.root); disposeScene(gBike.root); } gBike = makeBike({ model: S.bike, paint: S.paint, decal: S.decal, helmet: S.helmet, jacket: S.jacket }); gBike.root.rotation.y = ry; gscene.add(gBike.root); }
function placeGarageCam() { const garage = state === 'garage'; const w = VW(), h = VH(); gcam.position.set(0, 2.1, garage ? 6.4 : 7.2); gcam.lookAt(0, garage ? .75 : 1.5, 0); if (garage && w > h) gcam.setViewOffset(w, h, w * .22, 0, w, h); else gcam.clearViewOffset(); gcam.updateProjectionMatrix(); }

/* ---------------- menus ---------------- */
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('show', s.id === id)); document.querySelectorAll('.cashv').forEach(e => e.textContent = S.cash.toLocaleString()); }
function goMenu(id) { state = id === 'sGarage' ? 'garage' : 'menu'; paused = false; $('hud').classList.add('hidden'); showScreen(id); placeGarageCam(); if (id === 'sGarage') renderGarage(); if (id === 'sTracks') renderTracks(); if (id === 'sSettings') renderSettings(); }
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => goMenu(b.dataset.go)));
$('bStart').addEventListener('click', async () => {
  ensureAudio(); const ok = await requestTilt(); if (!ok && S.set.steer === 'tilt') { S.set.steer = 'touch'; save(); }
  setTimeout(() => { if (tilt.raw != null && !S.set.calDone) { S.set.cal = tilt.raw; S.set.calDone = true; save(); } }, 700);
  goMenu('sTitle');
  try { if (IS_TOUCH && document.documentElement.requestFullscreen && screen.orientation && screen.orientation.lock) document.documentElement.requestFullscreen().then(() => screen.orientation.lock('landscape')).catch(() => { }); } catch (e) { }
});
$('bRace').onclick = () => goMenu('sTracks'); $('bGarage').onclick = () => goMenu('sGarage'); $('bSettings').onclick = () => goMenu('sSettings');
$('rotGo').onclick = () => { rotDismissed = true; resize(); };
function renderTracks() {
  const el = $('trackList'); el.innerHTML = '';
  TRACKS.forEach((t, i) => { const un = S.unlocked.includes(t.id); const cost = 1200 * i; const c = document.createElement('button'); c.className = 'card';
    c.innerHTML = `<div class="art" style="background:${t.art}"></div><div class="inf"><h3>${t.name}</h3><p>${t.desc}</p><div class="meta"><span>${'★'.repeat(t.diff + 1)}${'☆'.repeat(4 - t.diff)}</span><span>${S.best[t.id] ? '⏱ ' + fmt(S.best[t.id]) : t.laps + ' laps'}</span></div></div>` + (un ? '' : `<div class="lock"><b>🔒</b>Finish top 3 on ${TRACKS[i - 1].name}<br>or unlock for 💰${cost.toLocaleString()}</div>`);
    c.onclick = () => { if (un) startRace(i); else if (S.cash >= cost) { S.cash -= cost; S.unlocked.push(t.id); save(); renderTracks(); showScreen('sTracks'); } else banner('Need 💰' + cost.toLocaleString(), 1300); };
    el.appendChild(c); });
}
let gtab = 'bike';
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { gtab = b.dataset.tab; document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); renderGarage(); });
function renderGarage() {
  refreshGarageBike(); const el = $('gTab'); el.innerHTML = ''; const st = bikeStats(S.bike);
  $('gStats').innerHTML = `<b>${BIKES.find(b => b.id === S.bike).name}</b>` + [['Speed', st.spd], ['Accel', st.acc], ['Handling', st.hnd]].map(([n, v]) => `<div class="stat"><span>${n}</span><div class="bar"><i style="width:${Math.round(v / 1.15 * 100)}%"></i></div></div>`).join('');
  document.querySelectorAll('.cashv').forEach(e => e.textContent = S.cash.toLocaleString());
  const sw = (list, key, lbl) => { const d = document.createElement('div'); d.innerHTML = `<div class="lbl">${lbl}</div>`; const w = document.createElement('div'); w.className = 'sw'; list.forEach(c => { const b = document.createElement('button'); b.style.background = c; b.className = S[key] === c ? 'on' : ''; b.setAttribute('aria-label', c); b.onclick = () => { S[key] = c; save(); renderGarage(); }; w.appendChild(b); }); d.appendChild(w); el.appendChild(d); };
  if (gtab === 'bike') BIKES.forEach(b => { const own = S.owned.includes(b.id); const o = document.createElement('button'); o.className = 'opt' + (S.bike === b.id ? ' on' : ''); o.innerHTML = `<div><div class="nm">${b.name} <small>· ${b.type}</small></div><div class="sub">${b.desc}</div></div><div class="pr">${own ? (S.bike === b.id ? '✓ Riding' : 'Ride') : '💰' + b.price.toLocaleString()}</div>`;
    o.onclick = () => { if (own) S.bike = b.id; else if (S.cash >= b.price) { S.cash -= b.price; S.owned.push(b.id); S.bike = b.id; sfx.beep(990, .2); } else { banner('Need 💰' + b.price.toLocaleString() + '. Win races to earn more!', 1600); return; } save(); renderGarage(); }; el.appendChild(o); });
  if (gtab === 'paint') sw(PAINTS, 'paint', 'Bike paint');
  if (gtab === 'decal') DECALS.forEach(dc => { const o = document.createElement('button'); o.className = 'opt' + (S.decal === dc.id ? ' on' : ''); o.innerHTML = `<div class="nm">${dc.name}</div>`; o.onclick = () => { S.decal = dc.id; save(); renderGarage(); }; el.appendChild(o); });
  if (gtab === 'rider') { sw(GEAR, 'helmet', 'Helmet'); sw(GEAR, 'jacket', 'Jacket'); }
  if (gtab === 'up') { const u = upgOf(S.bike); [['spd', 'Top speed'], ['acc', 'Accel'], ['hnd', 'Handling']].forEach(([k, n]) => { const lv = u[k], cost = UPG_COST[lv]; const d = document.createElement('div'); d.className = 'upg'; d.innerHTML = `<span class="nm">${n}</span><div class="pips">${[0, 1, 2, 3, 4].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div>`; const b = document.createElement('button'); b.textContent = lv >= 5 ? 'MAX' : '💰' + cost.toLocaleString(); b.disabled = lv >= 5 || S.cash < cost; b.onclick = () => { S.cash -= cost; u[k]++; save(); sfx.beep(1100, .15); renderGarage(); }; d.appendChild(b); el.appendChild(d); }); const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'Upgrades are saved per bike. Win races to earn cash.'; el.appendChild(p); }
}
function renderSettings() { const s = S.set; $('oSteer').value = s.steer; $('oSens').value = s.sens; $('oSensV').textContent = s.sens; $('oInv').checked = s.inv; $('oAuto').checked = s.auto; $('oDiff').value = s.diff; $('oQual').value = s.qual; $('oMusic').checked = s.music; $('oSound').checked = s.sound; }
$('oSteer').onchange = e => { S.set.steer = e.target.value; save(); if (S.set.steer === 'tilt') requestTilt(); };
$('oSens').oninput = e => { S.set.sens = +e.target.value; $('oSensV').textContent = S.set.sens; save(); };
$('pSens').oninput = e => { S.set.sens = +e.target.value; save(); };
$('oInv').onchange = e => { S.set.inv = e.target.checked; save(); };
$('oAuto').onchange = e => { S.set.auto = e.target.checked; save(); };
$('oDiff').onchange = e => { S.set.diff = e.target.value; save(); };
$('rotLock').onclick = () => { rotDismissed = true; setRot(tilt.g && tilt.g.x > 0 ? -90 : 90); };
$('oQual').onchange = e => { S.set.qual = e.target.value; save(); pickQuality(); resize(); };
$('oMusic').onchange = e => { S.set.music = e.target.checked; save(); };
$('oSound').onchange = e => { S.set.sound = e.target.checked; save(); applySound(); };
$('oCal').onclick = recenter; $('pCal').onclick = recenter;
$('oReset').onclick = () => { if (confirm('Reset all cash, bikes and unlocked tracks?')) { const set = S.set; S = structuredClone(DEF); S.set = set; save(); goMenu('sTitle'); } };
$('bMute').onclick = () => { S.set.sound = !S.set.sound; save(); ensureAudio(); applySound(); };
$('bPause').onclick = () => pause();
function pause() { if (state !== 'race') return; paused = true; $('pSens').value = S.set.sens; showScreen('sPause'); sfx.engine(0, false, false); }
function resume() { paused = false; showScreen(null); last = performance.now(); }
$('pResume').onclick = resume;
$('pRestart').onclick = () => startRace(curTrack);
$('pQuit').onclick = () => goMenu('sTitle');
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'race' && !paused) pause(); });
function showResults() {
  const st = standings(); const p = player(); const pos = st.indexOf(p) + 1; const prize = [1500, 1000, 700, 400, 300, 200, 150, 100][pos - 1]; const mult = 1 + TRACKS[curTrack].diff * .25; const total = Math.round((prize + p.kos * 50) * mult);
  S.cash += total; const t = TRACKS[curTrack]; if (!S.best[t.id] || raceTime < S.best[t.id]) S.best[t.id] = raceTime; let unl = '';
  const nx = TRACKS[curTrack + 1]; if (pos <= 3 && nx && !S.unlocked.includes(nx.id)) { S.unlocked.push(nx.id); unl = `<br>🔓 Unlocked <b>${nx.name}</b>!`; }
  if (pos === 1) S.wins++; save();
  $('rTitle').textContent = pos === 1 ? '🏆 You won!' : `You finished ${ordinal(pos)}`;
  const pd = i => st[i] ? `<div class="pd p${i + 1} ${st[i].isP ? 'you' : ''}">${st[i].name}<div class="blk">${i + 1}</div></div>` : '';
  $('podium').innerHTML = pd(1) + pd(0) + pd(2);
  $('rTable').innerHTML = `Prize 💰${prize} + ${p.kos} kick${p.kos === 1 ? '' : 's'} × 50${mult > 1 ? ` × ${mult} track bonus` : ''} = <b>💰${total.toLocaleString()}</b> · Time ${fmt(raceTime)}${unl}<br><span style="opacity:.7">${st.map((r, i) => (i + 1) + '. ' + r.name).join(' · ')}</span>`;
  $('rNext').style.display = nx && S.unlocked.includes(nx.id) ? '' : 'none';
  $('hud').classList.add('hidden'); showScreen('sResults'); state = 'race-end';
}
$('rAgain').onclick = () => startRace(curTrack); $('rMenu').onclick = () => goMenu('sTitle'); $('rNext').onclick = () => startRace(curTrack + 1);

resize(); refreshGarageBike(); applySound(); requestAnimationFrame(loop);
window.TR = { camInfo: () => ({ w: VW(), h: VH(), short: Math.min(VW(), VH()), phone: Math.min(VW(), VH()) <= 500, fov: camera.fov }), obstacles: () => obstacles, crossTraffic: () => crossTraffic, ramps: () => ramps, bumps: () => bumps, snapCam: () => { camInit = false; }, get S() { return S; }, get rot() { return ROT; }, get paused() { return paused; }, get softPaused() { return softPaused; }, get RW() { return RW; }, setRot, get state() { return state; }, startRace, tilt, racers: () => racers, player, track: () => track, finish: () => { const p = player(); p.lap = track.def.laps - 1; p.s = track.L - 2; p.v = 40; }, crash: r => crash(r || player()), q: () => qName, goMenu, steer: () => readInput(0.016).steer, fastStart: () => { countT = 0.01; }, riderRect: () => { const bx = new THREE.Box3().setFromObject(player().b.root); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < 8; i++) { const v = new THREE.Vector3(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z).project(camera); const X = (v.x + 1) / 2 * VW(), Y = (1 - v.y) / 2 * VH(); x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); } return { x0, y0, x1, y1 }; }, forceCross: i => { const c = crossTraffic[i|0]; if (!c) return null; c.mode = 'approach'; c.phase = 0; c.x = c.side * (RW + 22); c.dir = -c.side; c.hitT = 0; c.m.visible = true; placeObj(c.m, c.s, c.x, Math.PI / 2); return { s: c.s, x: c.x, side: c.side, mode: c.mode }; },
  forceJump: () => { const p = player(); const rp = ramps[0]; if (!rp) { p.airY = 2; p.airVy = 10; return null; } p.s = rp.s; p.x = rp.x; p.v = 42; p.airY = rp.h; p.airVy = 9; p.jumpCd = 0; return { s: rp.s, h: rp.h }; } };
