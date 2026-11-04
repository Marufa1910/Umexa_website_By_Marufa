/**
 * Dev-only tool: renders UMEXA's SAMPLE artwork procedurally, so the site has
 * real image and video files to lay out and test before actual work is supplied.
 * Nothing here depicts a real client. Replace the output via the media library.
 *
 *   node scripts/generate-sample-media.mjs stills [name,name]
 *   node scripts/generate-sample-media.mjs crops
 *   FFMPEG=/path/to/ffmpeg node scripts/generate-sample-media.mjs clips
 *   FFMPEG=/path/to/ffmpeg node scripts/generate-sample-media.mjs reel
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker, isMainThread, parentPort } from "node:worker_threads";
import sharp from "sharp";

const OUT = fileURLToPath(new URL("../public/media/samples/", import.meta.url));

/* ---------- math ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const hex = (h) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255) ** 2.2);

const P = new Uint8Array(512);
{
  let s = 1337;
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i++) P[i] = base[i & 255];
}
function noise3(x, y, z) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
  const u = x - xi,
    v = y - yi,
    w = z - zi;
  const a = u * u * (3 - 2 * u),
    b = v * v * (3 - 2 * v),
    c = w * w * (3 - 2 * w);
  const X = xi & 255,
    Y = yi & 255,
    Z = zi & 255;
  const h = (i, j, k) => P[P[P[(X + i) & 255] + ((Y + j) & 255)] + ((Z + k) & 255)] / 255;
  return mix(
    mix(mix(h(0, 0, 0), h(1, 0, 0), a), mix(h(0, 1, 0), h(1, 1, 0), a), b),
    mix(mix(h(0, 0, 1), h(1, 0, 1), a), mix(h(0, 1, 1), h(1, 1, 1), a), b),
    c,
  );
}
function fbm(x, y, z, oct = 4) {
  let s = 0,
    a = 0.5;
  for (let i = 0; i < oct; i++) {
    s += a * noise3(x, y, z);
    x = x * 2.03 + 11.7;
    y = y * 2.03 + 3.1;
    z = z * 2.03 + 7.3;
    a *= 0.5;
  }
  return s;
}
const aces = (x) => clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14));

/* ---------- raymarch scaffold ---------- */
function march(map, ox, oy, oz, dx, dy, dz, maxT = 22, steps = 90) {
  let t = 0;
  for (let i = 0; i < steps; i++) {
    const d = map(ox + dx * t, oy + dy * t, oz + dz * t);
    if (d < 0.0012) return t;
    t += d * 0.85;
    if (t > maxT) break;
  }
  return -1;
}
function normal(map, x, y, z) {
  const e = 0.0016;
  const a = map(x + e, y - e, z - e),
    b = map(x - e, y - e, z + e);
  const c = map(x - e, y + e, z - e),
    d = map(x + e, y + e, z + e);
  const nx = a - b - c + d,
    ny = -a - b + c + d,
    nz = -a + b - c + d;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}
function softShadow(map, x, y, z, lx, ly, lz) {
  let res = 1,
    t = 0.03;
  for (let i = 0; i < 28 && t < 7; i++) {
    const d = map(x + lx * t, y + ly * t, z + lz * t);
    if (d < 0.001) return 0.04;
    res = Math.min(res, (9 * d) / t);
    t += clamp(d, 0.02, 0.5);
  }
  return clamp(res);
}
/** Liquid-metal environment: soft dome, a bright horizon band and gradated side lights. */
function studio(dx, dy, dz, key, rim) {
  const dome = clamp(dy * 0.5 + 0.5) ** 3.2 * 1.5;
  const band = Math.exp(-(((dy + 0.08) / 0.07) ** 2)) * 2.6 * smooth(-0.9, 0.5, dx + dz * 0.3);
  const band2 = Math.exp(-(((dy - 0.42) / 0.035) ** 2)) * 1.1 * smooth(0.6, -0.5, dx);
  const side = smooth(0.45, 1, -dx * 0.9 - dz * 0.25) * (0.5 + 0.5 * dy) * 3;
  const floor = smooth(-0.1, -0.9, dy) * 0.05;
  const wave = 0.75 + 0.25 * Math.sin(dx * 7 + dz * 5);
  const k = (dome + band2) * wave + band;
  return [0, 1, 2].map((i) => 0.006 + floor + key[i] * k + rim[i] * side);
}

/* ---------- looks: (u, v, aspect, t) => [r,g,b] in linear light; u,v in -1..1 ---------- */
const WHITE = [1, 1, 1];
const RED = hex("#dd110a");
const BLUE = hex("#84b4e6");
const CREAM = hex("#fbf4db");
const NAVY = hex("#12233d");

function makeChrome({ key = WHITE, rim = RED, zoom = 1.75, ox = 0, oy = 0 } = {}) {
  return (t) => {
    const ca = Math.cos(t * 0.55),
      sa = Math.sin(t * 0.55);
    const map = (x, y, z) => {
      const rx = x * ca - z * sa,
        rz = x * sa + z * ca;
      const q = Math.sin(2.6 * rx + t) * Math.sin(2.9 * y + t * 0.7) * Math.sin(2.3 * rz - t * 0.4);
      return Math.hypot(rx, y, rz) - 1.08 - 0.26 * q;
    };
    return (u, v, asp) => {
      const px = ((u - ox) * asp) / zoom,
        py = (v - oy) / zoom;
      const l = Math.hypot(px, py, 1),
        dx = px / l,
        dy = py / l,
        dz = 1 / l;
      const hit = march(map, 0, 0, -3.1, dx, dy, dz, 8, 70);
      if (hit < 0) {
        const glow = 0.022 * Math.exp(-2.1 * (px * px + py * py));
        return [glow * rim[0] + 0.004, glow * rim[1] + 0.004, glow * rim[2] + 0.005];
      }
      const x = dx * hit,
        y = dy * hit,
        z = -3.1 + dz * hit;
      const [nx, ny, nz] = normal(map, x, y, z);
      const dn = dx * nx + dy * ny + dz * nz;
      const [r, g, b] = studio(dx - 2 * dn * nx, dy - 2 * dn * ny, dz - 2 * dn * nz, key, rim);
      const f = 0.55 + 0.45 * (1 + dn) ** 4;
      return [r * f, g * f, b * f];
    };
  };
}

function makeTorus() {
  return (t) => {
    const c = Math.cos(0.9 + t * 0.4),
      s = Math.sin(0.9 + t * 0.4),
      c2 = Math.cos(0.55),
      s2 = Math.sin(0.55);
    const map = (x, y, z) => {
      const y1 = y * c2 - z * s2,
        z1 = y * s2 + z * c2;
      const x2 = x * c - z1 * s,
        z2 = x * s + z1 * c;
      const q = Math.hypot(x2, z2) - 1.3;
      const wob = 0.012 * Math.sin(3 * Math.atan2(z2, x2) + 2 * t);
      return Math.hypot(q, y1) - 0.3 - wob;
    };
    return (u, v, asp) => {
      const px = (u * asp) / 1.8,
        py = v / 1.8;
      const l = Math.hypot(px, py, 1),
        dx = px / l,
        dy = py / l,
        dz = 1 / l;
      const hit = march(map, 0, 0, -5.4, dx, dy, dz, 10, 80);
      if (hit < 0) {
        return null;
      }
      const x = dx * hit,
        y = dy * hit,
        z = -5.4 + dz * hit;
      const [nx, ny, nz] = normal(map, x, y, z);
      const dn = dx * nx + dy * ny + dz * nz;
      const [r, g, b] = studio(dx - 2 * dn * nx, dy - 2 * dn * ny, dz - 2 * dn * nz, CREAM, CREAM);
      const f = 0.08 + 0.3 * (1 + dn) ** 3;
      const lit = 0.4 + 0.75 * clamp(ny * 0.6 - nz * 0.65 - nx * 0.3);
      return [RED[0] * lit + r * f, RED[1] * lit + g * f, RED[2] * lit + b * f];
    };
  };
}

function makeSilk({ deep, mid, light, scale = 1.05, speed = 0.35 }) {
  return (t) => {
    const T = t * speed;
    const h = (x, y) => {
      const wx = x + 0.62 * Math.sin(1.25 * y + T) + 0.24 * Math.sin(2.7 * y - 1.1 * x + 1.7 * T);
      const wy = y + 0.5 * Math.sin(1.1 * x - T * 0.8) + 0.2 * Math.sin(2.4 * x + 0.9 * y + T);
      return (
        0.62 * Math.sin(3.1 * wx + 1.7 * Math.sin(1.3 * wy + 0.6)) +
        0.26 * Math.sin(6.1 * wx + 1.1 * wy + 1.9 * Math.sin(1.7 * wy))
      );
    };
    return (u, v, asp) => {
      const x = u * asp * scale,
        y = v * scale,
        e = 0.004;
      const h0 = h(x, y),
        nx = (h(x + e, y) - h0) / e,
        ny = (h(x, y + e) - h0) / e;
      const n = 0.4,
        l = Math.hypot(nx * n, ny * n, 1),
        Nx = (-nx * n) / l,
        Ny = (-ny * n) / l,
        Nz = 1 / l;
      const diff = clamp(Nx * -0.55 + Ny * 0.5 + Nz * 0.67);
      const hl = clamp(Nx * -0.3 + Ny * 0.28 + Nz * 0.91);
      const spec = hl ** 60,
        sheen = hl ** 10;
      const k = smooth(0.1, 1, diff);
      return [0, 1, 2].map((i) => {
        const base = k < 0.5 ? mix(deep[i], mid[i], k * 2) : mix(mid[i], light[i], (k - 0.5) * 2);
        return base * (0.35 + 0.75 * diff) + light[i] * (sheen * 0.12 + spec * 0.55);
      });
    };
  };
}

function makeTrails({ core, edge, count = 72 }) {
  return (t) => {
    const lines = Array.from({ length: count }, (_, i) => {
      const n = i / count;
      return {
        n,
        a: 0.2 + 0.72 * n,
        f: 1.1 + 0.9 * Math.sin(n * 9.2),
        ph: n * 6.8 + t * (0.5 + n * 0.5),
        w: 0.0011 + (0.0028 * ((i * 37) % 7)) / 7,
      };
    });
    return (u, v, asp) => {
      const x = u * asp;
      let r = NAVY[0],
        g = NAVY[1],
        b = NAVY[2];
      for (const L of lines) {
        const env = smooth(-1.9, -0.2, x + L.n * 0.5) * smooth(2.2, 0.5, x - L.n * 0.3);
        const y =
          (L.a * Math.sin(x * L.f + L.ph) + 0.14 * Math.sin(x * 3.1 - L.ph)) *
          (0.28 + 0.72 * (0.5 + 0.5 * Math.sin(x * 0.7 + 1)));
        const d = v - y;
        const I = (env * L.w) / (d * d * 7 + L.w * 0.5);
        const c = mix(0, 1, L.n);
        r += I * mix(core[0], edge[0], c);
        g += I * mix(core[1], edge[1], c);
        b += I * mix(core[2], edge[2], c);
      }
      return [r * 0.32, g * 0.32, b * 0.32];
    };
  };
}

function makeHalftone({ ink = CREAM, accent = RED, cells = 58 }) {
  return (t) => (u, v, asp) => {
    const x = u * asp,
      y = v,
      cell = 2 / cells;
    const cx = (Math.floor(x / cell) + 0.5) * cell,
      cy = (Math.floor(y / cell) + 0.5) * cell;
    const sx = cx - 0.42,
      sy = cy + 0.06,
      R = 0.82;
    const d2 = (sx * sx + sy * sy) / (R * R);
    let lum = 0.015 + 0.08 * fbm(cx * 1.4 + 5, cy * 1.4, t * 0.2, 2);
    let isAccent = false;
    if (d2 < 1) {
      const nz = Math.sqrt(1 - d2),
        nx = sx / R,
        ny = sy / R;
      const lx = Math.cos(t * 0.8 + 2.3) * 0.72,
        ly = 0.48;
      lum = clamp(nx * lx + ny * ly + nz * 0.5) ** 1.35;
    } else {
      const lane = Math.abs(cy + 0.78 - 0.1 * Math.sin(cx * 2 + t));
      if (lane < 0.05) {
        lum = 0.8;
        isAccent = true;
      }
    }
    const rad = Math.sqrt(lum) * cell * 0.62;
    const a = smooth(rad + 0.0016, rad - 0.0016, Math.hypot(x - cx, y - cy));
    const col = isAccent ? accent : ink;
    return [0, 1, 2].map((k) => mix(BLUE[k], col[k], a));
  };
}

function makeBottle() {
  const bg = BLUE,
    matte = NAVY,
    label = RED,
    cap = NAVY;
  return (t) => {
    const scene = (x, y, z) => {
      const r = Math.hypot(x, z);
      const box = (cy, h, rad, rnd) => {
        const a = r - rad + rnd,
          b = Math.abs(y - cy) - h + rnd;
        return Math.min(Math.max(a, b), 0) + Math.hypot(Math.max(a, 0), Math.max(b, 0)) - rnd;
      };
      const body = box(-0.15, 1.05, 0.62, 0.16);
      const neck = box(1.08, 0.3, 0.25, 0.04);
      const k = 0.2,
        h = clamp(0.5 + (0.5 * (neck - body)) / k);
      const bottle = mix(neck, body, h) - k * h * (1 - h);
      return { bottle, capD: box(1.46, 0.2, 0.285, 0.035) };
    };
    const map = (x, y, z) => {
      const s = scene(x, y, z);
      return Math.min(s.bottle, s.capD, y + 1.2);
    };
    const lx = -0.55,
      ly = 0.72,
      lz = -0.42;
    return (u, v, asp) => {
      const cA = Math.cos(t * 0.3 - 0.35),
        sA = Math.sin(t * 0.3 - 0.35);
      const px = (u * asp) / 1.75,
        py = v / 1.75 - 0.03;
      const l = Math.hypot(px, py, 1);
      const dx0 = px / l,
        dy = py / l,
        dz0 = 1 / l;
      const dx = dx0,
        dz = dz0;
      const ox = 0,
        oy = 0.12,
        oz = -4.8;
      const hit = march(map, ox, oy, oz, dx, dy, dz, 18, 90);
      const fall = 0.82 + 0.25 * smooth(-1, 1, v) - 0.14 * (u * u);
      if (hit < 0) return bg.map((c) => c * fall);
      const x = ox + dx * hit,
        y = oy + dy * hit,
        z = oz + dz * hit;
      const [nx, ny, nz] = normal(map, x, y, z);
      const s = scene(x, y, z);
      const sh = softShadow(map, x + nx * 0.01, y + ny * 0.01, z + nz * 0.01, lx, ly, lz);
      const diff = clamp(nx * lx + ny * ly + nz * lz) * sh;
      if (y < -1.19) {
        const ao = 0.55 + 0.45 * smooth(0, 1.2, Math.hypot(x, z) - 0.45);
        const k = (0.42 + 0.72 * diff) * ao;
        return bg.map((c) => c * k * fall * 1.05);
      }
      const dn = dx * nx + dy * ny + dz * nz;
      const rx = dx - 2 * dn * nx,
        ry = dy - 2 * dn * ny,
        rz = dz - 2 * dn * nz;
      const [er, eg, eb] = studio(rx, ry, rz, WHITE, WHITE);
      const fres = 0.05 + 0.5 * (1 + dn) ** 4;
      const ang = Math.atan2(x * cA + z * sA, -z * cA + x * sA);
      const onLabel = s.capD > s.bottle && y > -0.72 && y < 0.34;
      const stripe = onLabel && Math.abs(y + 0.48) < 0.1 && Math.sin(ang * 26) > -0.2;
      let base = s.capD < s.bottle ? cap : onLabel ? label : matte;
      if (stripe) base = matte;
      const kd = 0.09 + 0.95 * diff;
      return [base[0] * kd + er * fres, base[1] * kd + eg * fres, base[2] * kd + eb * fres];
    };
  };
}

function makeBlocks() {
  const deep = BLUE,
    acc = RED;
  return (t) => {
    const hash = (a, b) => {
      const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const size = 1;
    const height = (i, j) =>
      0.12 + 2.2 * hash(i, j) ** 3 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 0.8 + j * 1.3));
    const map = (x, y, z) => {
      const i = Math.floor(x / size),
        j = Math.floor(z / size);
      const qx = x - (i + 0.5) * size,
        qz = z - (j + 0.5) * size;
      const hgt = height(i, j);
      const dx = Math.abs(qx) - 0.46,
        dz = Math.abs(qz) - 0.46,
        dy = Math.abs(y - hgt / 2) - hgt / 2;
      const box =
        Math.min(Math.max(dx, dy, dz), 0) +
        Math.hypot(Math.max(dx, 0), Math.max(dy, 0), Math.max(dz, 0)) -
        0.02;
      const wall = Math.min(0.5 - Math.abs(qx), 0.5 - Math.abs(qz)) + 0.02;
      return Math.min(box, y, wall);
    };
    const yaw = 0.72 + t * 0.03,
      cy = Math.cos(yaw),
      sy = Math.sin(yaw),
      pit = 0.78,
      cp = Math.cos(pit),
      sp = Math.sin(pit);
    const lx = -0.62,
      ly = 0.55,
      lz = 0.56;
    return (u, v, asp) => {
      const px = (u * asp) / 1.9,
        py = v / 1.9;
      const l = Math.hypot(px, py, 1);
      let dx = px / l,
        dy = py / l,
        dz = 1 / l;
      const dy1 = dy * cp - dz * sp,
        dz1 = dy * sp + dz * cp;
      dy = dy1;
      dz = dz1;
      const dx2 = dx * cy + dz * sy,
        dz2 = -dx * sy + dz * cy;
      dx = dx2;
      dz = dz2;
      const ox = -sy * -7.6 + 2.2,
        oz = -cy * 7.6 + 2.2,
        oy = 7.2;
      const hit = march(map, ox, oy, oz, dx, dy, dz, 26, 170);
      if (hit < 0) return NAVY;
      const x = ox + dx * hit,
        y = oy + dy * hit,
        z = oz + dz * hit;
      const [nx, ny, nz] = normal(map, x, y, z);
      const sh = softShadow(map, x + nx * 0.01, y + ny * 0.01, z + nz * 0.01, lx, ly, lz);
      const diff = clamp(nx * lx + ny * ly + nz * lz) * sh;
      const i = Math.floor(x / size),
        j = Math.floor(z / size);
      const isAcc = hash(i + 4, j - 2) > 0.93 && y > 0.05;
      const base = isAcc ? acc : y < 0.01 ? NAVY : deep;
      const k = 0.06 + 1.7 * diff + 0.1 * clamp(ny);
      const rim = isAcc ? 0.06 : 0;
      return [base[0] * k + rim, base[1] * k + rim, base[2] * k + rim];
    };
  };
}

const EMBER = { deep: hex("#1a0502"), mid: hex("#c33a10"), light: hex("#ffc08a") };
const BONE = { deep: hex("#14130f"), mid: hex("#6f6a5c"), light: hex("#efeadb") };
const LOOKS = {
  chrome: makeChrome(),
  chromeWarm: makeChrome({ key: hex("#ffe8d0"), rim: hex("#ff6a2b") }),
  torus: makeTorus(),
  silk: makeSilk(EMBER),
  silkBone: makeSilk(BONE),
  trails: makeTrails({ core: RED, edge: CREAM }),
  halftone: makeHalftone({}),
  bottle: makeBottle(),
  blocks: makeBlocks(),
};

function render(look, t, W, H, SS, grain, seed, alpha = false) {
  const prepared = LOOKS[look](t);
  const w = W * SS,
    h = H * SS,
    asp = W / H;
  const channels = alpha ? 4 : 3;
  const buf = Buffer.alloc(w * h * channels);
  let s = seed >>> 0;
  for (let j = 0; j < h; j++) {
    const v = 1 - (2 * (j + 0.5)) / h;
    for (let i = 0; i < w; i++) {
      const u = (2 * (i + 0.5)) / w - 1;
      const c = prepared(u, v, asp);
      const o = (j * w + i) * channels;
      // A look can leave background pixels empty: see-through, or powder blue in video frames
      if (c === null) {
        if (!alpha) {
          buf[o] = 0x84;
          buf[o + 1] = 0xb4;
          buf[o + 2] = 0xe6;
        }
        continue;
      }
      const vig = 1 - 0.28 * smooth(0.5, 1.55, Math.hypot(u, v));
      s = (s * 1664525 + 1013904223) >>> 0;
      const n = grain * ((s >>> 16) / 65535 - 0.5);
      for (let k = 0; k < 3; k++) {
        buf[o + k] = clamp(aces(c[k] * vig) ** (1 / 2.2) + n) * 255;
      }
      if (alpha) buf[o + 3] = 255;
    }
  }
  return { buf, w, h };
}

/* ---------- jobs ---------- */
const STILLS = [
  { name: "afterglow", look: "trails", W: 1600, H: 1200, t: 0.8 },
  { name: "liquid-season", look: "silk", W: 1600, H: 1200, t: 1.4 },
  { name: "form-study", look: "chrome", W: 1600, H: 1200, t: 0.9 },
  { name: "halftone-press", look: "halftone", W: 1600, H: 2000, t: 0.3 },
  { name: "field-bottle", look: "bottle", W: 1600, H: 2000, t: 0.2 },
  { name: "monolith", look: "blocks", W: 1600, H: 1200, t: 0.4 },
  { name: "bone-study", look: "silkBone", W: 1600, H: 1200, t: 3.1 },
  { name: "hero", look: "torus", W: 1200, H: 1500, t: 0.2, grain: 0, alpha: true },
  // Case-study galleries
  { name: "afterglow-2", look: "trails", W: 1600, H: 1000, t: 2.6 },
  { name: "afterglow-3", look: "trails", W: 1600, H: 2000, t: 4.4 },
  { name: "liquid-season-2", look: "silk", W: 1600, H: 2000, t: 3.5 },
  { name: "liquid-season-3", look: "silk", W: 1600, H: 1000, t: 6 },
  { name: "form-study-2", look: "chromeWarm", W: 1600, H: 2000, t: 2.2 },
  { name: "form-study-3", look: "chrome", W: 1600, H: 1000, t: 3.6 },
  { name: "halftone-press-2", look: "halftone", W: 1600, H: 1000, t: 1.4 },
  { name: "halftone-press-3", look: "halftone", W: 1600, H: 2000, t: 2.6 },
  { name: "monolith-2", look: "blocks", W: 1600, H: 2000, t: 2 },
  { name: "monolith-3", look: "blocks", W: 1600, H: 1000, t: 3.5 },
  { name: "bone-study-2", look: "silkBone", W: 1600, H: 2000, t: 5 },
  { name: "bone-study-3", look: "silkBone", W: 1600, H: 1000, t: 7 },
];
const CLIPS = [
  { name: "afterglow", look: "trails" },
  { name: "form-study", look: "chrome" },
  { name: "liquid-season", look: "silk" },
  { name: "halftone-press", look: "halftone" },
  { name: "monolith", look: "blocks" },
  { name: "bone-study", look: "silkBone" },
];
/** Close-ups cut from an existing render, for subjects that barely change over time. */
const CROPS = [
  { name: "field-bottle-2", from: "field-bottle", left: 380, top: 900, width: 840, height: 525 },
  { name: "field-bottle-3", from: "field-bottle", left: 500, top: 170, width: 600, height: 750 },
];
const REEL_SHOTS = [
  { look: "trails", secs: 2.4 },
  { look: "chrome", secs: 2.4 },
  { look: "silk", secs: 2.0 },
  { look: "halftone", secs: 1.6 },
  { look: "blocks", secs: 2.0 },
  { look: "torus", secs: 2.6 },
];

if (!isMainThread) {
  parentPort.on("message", async (job) => {
    const { buf, w, h } = render(
      job.look,
      job.t,
      job.W,
      job.H,
      job.SS,
      job.grain,
      job.seed,
      job.alpha,
    );
    const img = sharp(buf, { raw: { width: w, height: h, channels: job.alpha ? 4 : 3 } }).resize(
      job.W,
      job.H,
      {
        kernel: "lanczos3",
      },
    );
    if (job.format === "webp") await img.webp({ quality: 82, effort: 5 }).toFile(job.out);
    else await img.jpeg({ quality: 94 }).toFile(job.out);
    parentPort.postMessage({ done: job.out });
  });
} else {
  const mode = process.argv[2] ?? "stills";
  mkdirSync(OUT, { recursive: true });
  const pool = (jobs) =>
    new Promise((resolve, reject) => {
      let next = 0,
        finished = 0;
      if (!jobs.length) return resolve();
      for (let i = 0; i < 8; i++) {
        const worker = new Worker(fileURLToPath(import.meta.url));
        const feed = () => {
          if (next < jobs.length) worker.postMessage(jobs[next++]);
          else worker.terminate();
        };
        worker.on("message", (m) => {
          finished++;
          if (mode === "stills" || finished % 24 === 0)
            console.log(`${finished}/${jobs.length}`, m.done);
          if (finished === jobs.length) resolve();
          feed();
        });
        worker.on("error", reject);
        feed();
      }
    });

  if (mode === "stills") {
    const only = process.argv[3]?.split(",");
    await pool(
      STILLS.filter((s) => !only || only.includes(s.name)).map((s, i) => ({
        SS: 2,
        grain: 0.05,
        ...s,
        seed: i * 7919 + 1,
        format: "webp",
        out: join(OUT, `${s.name}.webp`),
      })),
    );
  } else if (mode === "crops") {
    for (const c of CROPS) {
      await sharp(join(OUT, `${c.from}.webp`))
        .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
        .webp({ quality: 84 })
        .toFile(join(OUT, `${c.name}.webp`));
    }
  } else if (mode === "clips") {
    const FPS = 24;
    const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
    const clipDir = join(OUT, "clips");
    mkdirSync(clipDir, { recursive: true });
    for (const clip of CLIPS) {
      const dir = mkdtempSync(join(tmpdir(), "movexa-clip-"));
      const jobs = Array.from({ length: 60 }, (_, f) => ({
        look: clip.look,
        t: 0.4 + (f / FPS) * 0.9,
        W: 960,
        H: 540,
        SS: 1,
        grain: 0.01,
        seed: f * 31 + 5,
        format: "jpeg",
        out: join(dir, `f${String(f).padStart(5, "0")}.jpg`),
      }));
      await pool(jobs);
      spawnSync(
        ffmpeg,
        [
          "-y",
          "-framerate",
          String(FPS),
          "-i",
          join(dir, "f%05d.jpg"),
          "-c:v",
          "libx264",
          "-crf",
          "28",
          "-preset",
          "slow",
          "-pix_fmt",
          "yuv420p",
          "-an",
          "-movflags",
          "+faststart",
          join(clipDir, `${clip.name}.mp4`),
        ],
        { stdio: "ignore" },
      );
      rmSync(dir, { recursive: true, force: true });
      console.log("clip", clip.name);
    }
  } else {
    const FPS = 24,
      W = 1280,
      H = 720;
    const dir = mkdtempSync(join(tmpdir(), "movexa-reel-"));
    const jobs = [];
    for (const shot of REEL_SHOTS) {
      const n = Math.round(shot.secs * FPS);
      for (let f = 0; f < n; f++) {
        jobs.push({
          look: shot.look,
          t: 0.2 + (f / FPS) * 0.9,
          W,
          H,
          SS: 1,
          grain: 0.012,
          seed: jobs.length * 31 + 5,
          format: "jpeg",
          out: join(dir, `f${String(jobs.length).padStart(5, "0")}.jpg`),
        });
      }
    }
    await pool(jobs);
    const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
    const res = spawnSync(
      ffmpeg,
      [
        "-y",
        "-framerate",
        String(FPS),
        "-i",
        join(dir, "f%05d.jpg"),
        "-c:v",
        "libx264",
        "-crf",
        "27",
        "-preset",
        "slow",
        "-pix_fmt",
        "yuv420p",
        "-an",
        "-movflags",
        "+faststart",
        join(OUT, "reel.mp4"),
      ],
      { stdio: "inherit" },
    );
    if (res.status === 0) {
      spawnSync(
        ffmpeg,
        ["-y", "-i", join(dir, "f00012.jpg"), "-q:v", "70", join(OUT, "reel-poster.webp")],
        { stdio: "inherit" },
      );
    }
    rmSync(dir, { recursive: true, force: true });
    process.exit(res.status ?? 1);
  }
  process.exit(0);
}
