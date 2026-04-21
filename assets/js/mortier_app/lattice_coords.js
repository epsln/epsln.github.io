export default class LatticeCoords {
  constructor(w) {

    // Store as plain array (no complex numbers)
    this.w = [w[0], w[1], w[2], w[3]];

    // Precompute Euclidean projection
    const sqrt3 = Math.sqrt(3);

    this.x = w[0] + 0.5 * sqrt3 * w[1] + 0.5 * w[2];
    this.y = 0.5 * w[1] + 0.5 * sqrt3 * w[2] + w[3];
  }

  // -------------------------
  // Transformations
  // -------------------------
  translate(wc) {
    const c = this.w.map((val, i) => val + wc.w[i]);
    return new LatticeCoords(c);
  }

  scale(k) {
    const c = this.w.map(val => val * k);
    return new LatticeCoords(c);
  }

  sum() {
    return this.w.reduce((a, b) => a + b, 0);
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;

    return new EuclideanCoords([x, y]);
  }

  to_euclidean() {
    return new EuclideanCoords([this.x, this.y]);
  }

  // -------------------------
  // Helpers
  // -------------------------
  toString() {
    return `(${this.w.join(",")})`;
  }
}
