export default class EuclideanCoords {
  constructor(p) {
    this.x = p[0];
    this.y = p[1];
  }

  isclose(p) {
    return (
      Math.abs(this.x - p.x) < 1e-4 &&
      Math.abs(this.y - p.y) < 1e-4
    );
  }

  translate(wc) {
    return new EuclideanCoords([
      this.x + wc.x,
      this.y + wc.y
    ]);
  }

  scale(k) {
    return new EuclideanCoords([
      this.x * k,
      this.y * k
    ]);
  }

  sum() {
    return this.x + this.y;
  }

  heading() {
    return Math.atan2(this.y, this.x) % Math.PI;
  }

  len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalise() {
    const length = this.len();

    if (length < 1e-9) {
      return new EuclideanCoords([0.0, 0.0]);
    }

    return new EuclideanCoords([
      this.x / length,
      this.y / length
    ]);
  }

  rotate(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const x = this.x * c - this.y * s;
    const y = this.x * s + this.y * c;

    return new EuclideanCoords([x, y]);
  }

  rotate_around(dx, dy, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const x = ((this.x - dx) * c) - ((this.y - dy) * s) + dx;
    const y = ((this.x - dx) * s) + ((this.y - dy) * c) + dy;

    return new EuclideanCoords([x, y]);
  }

  to_euclidean() {
    return this;
  }
}
