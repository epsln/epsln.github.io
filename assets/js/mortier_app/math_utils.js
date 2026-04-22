import LatticeCoords from "./lattice_coords.js"

export function planeCoords(p, w) {
  let re = 0;
  let im = 0;
  for (let i = 0; i < 4; i++) {
    re += p.w[i] * w[i].x;
    im += p.w[i] * w[i].y;
  }

  return { re, im };
}

export function planeToTileCoords(tiling, w, x, y) {
  const t1 = new LatticeCoords(tiling.tess_id.T1);
  const t2 = new LatticeCoords(tiling.tess_id.T2);

  const z1 = planeCoords(t1, w);
  const z2 = planeCoords(t2, w);

  const a = z1.re, b = z1.im;
  const c = z2.re, d = z2.im;

  const det = a * d - b * c;

  const a_ = d / det;
  const b_ = -c / det;
  const c_ = -b / det;
  const d_ = a / det;

  return {
    x: a_ * x + b_ * y,
    y: c_ * x + d_ * y,
  };
}

function facePerimeter(face) {
  const v = face.vertices;
  let total = 0;

  for (let i = 0; i < v.length; i++) {
    const a = v[i];
    const b = v[(i + 1) % v.length];

    const dx = a.x - b.x;
    const dy = a.y - b.y;

    total += Math.sqrt(dx * dx + dy * dy);
  }

  return total;
}

export function computePerimeterRange(faces) {
  let min = Infinity;
  let max = -Infinity;

  const values = faces.map(f => {
    const p = facePerimeter(f);
    if (p < min) min = p;
    if (p > max) max = p;
    return p;
  });

  return { values, min, max };
};

export class PerlinNoise {
  constructor(seed = 1337) {
    this.permutation = new Array(512);
    this.p = new Array(256);

    // simple seeded RNG
    let random = this._seededRandom(seed);

    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    // shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }

    // duplicate
    for (let i = 0; i < 512; i++) {
      this.permutation[i] = this.p[i & 255];
    }
  }

  _seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.permutation[X] + Y;
    const B = this.permutation[X + 1] + Y;

    return this.lerp(
      this.lerp(
        this.grad(this.permutation[A], x, y),
        this.grad(this.permutation[B], x - 1, y),
        u
      ),
      this.lerp(
        this.grad(this.permutation[A + 1], x, y - 1),
        this.grad(this.permutation[B + 1], x - 1, y - 1),
        u
      ),
      v
    );
  }
}

export class SimplexNoise {
  constructor(seed = 1337) {
    this.grad3 = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [1, 0], [-1, 0],
      [0, 1], [0, -1], [0, 1], [0, -1]
    ];

    this.p = new Array(256);
    this.perm = new Array(512);
    this.permMod12 = new Array(512);

    let random = this._seededRandom(seed);

    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }

    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
    }

    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  _seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  noise(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    let n0 = 0, n1 = 0, n2 = 0;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);

    const t = (i + j) * G2;

    const X0 = i - t;
    const Y0 = j - t;

    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;

    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    const t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      n0 = (t0 * t0) * (t0 * t0) *
        (this.grad3[gi0][0] * x0 + this.grad3[gi0][1] * y0);
    }

    const t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      n1 = (t1 * t1) * (t1 * t1) *
        (this.grad3[gi1][0] * x1 + this.grad3[gi1][1] * y1);
    }

    const t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      n2 = (t2 * t2) * (t2 * t2) *
        (this.grad3[gi2][0] * x2 + this.grad3[gi2][1] * y2);
    }

    return 70 * (n0 + n1 + n2);
  }
}
