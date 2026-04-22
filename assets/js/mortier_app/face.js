import LatticeCoords from "./lattice_coords.js"
import EuclideanCoords from "./euclidean_coords.js"
import { SimplexNoise, PerlinNoise } from "./math_utils.js"
export default class Face {
  constructor(
    vertices,
    mid_points = [],
    param_mode = false,
    assym_mode = false,
    separated_site_mode = false
  ) {
    this.vertices = vertices;

    // If lattice coords → extract raw vectors
    if (vertices[0] instanceof LatticeCoords) {
      this._vertices = vertices.map(v => v.w);
    }

    const n = vertices.length;
    this.mid_points = [];

    for (let i = 0; i < n; i++) {
      const p0 = vertices[i];
      const p1 = vertices[(i + 1) % n];

      const mid = [
        (p0.x + p1.x) / 2,
        (p0.y + p1.y) / 2,
      ];

      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      this.mid_points.push([mid, angle]);
    }

    // Remove duplicate closing vertex
    if (this._samePoint(vertices[0], vertices[vertices.length - 1])) {
      this.vertices.pop();
    }

    this.param_mode = param_mode;
    this.assym_mode = assym_mode;
    this.separated_site_mode = separated_site_mode;

    if (this.separated_site_mode) {
      this.separated_site = this.separated_site_mode;
    }

    this.neighbors = [];

    // Orientation (shoelace variant)
    let area = 0;
    for (let i = 0; i < n; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % n];
      area += (p2.x - p1.x) * (p2.y + p1.y);
    }

    if (area > 0) {
      this.vertices.reverse();
    }

		if (this.param_mode.param_mode == "perlin"){
			this.angle_parametrisation = new PerlinNoise(Math.random() * 2**32);
		}
		else if (this.param_mode.param_mode == "simplex"){
			this.angle_parametrisation = new SimplexNoise(Math.random() * 2 ** 32);
		}
    this.convex = false;
  }

  // -------------------------
  // Static generator
  // -------------------------
  static generate(v, k, m, param_mode = false, assym_mode = false, separated_site_mode = false) {
    const wpow = [
      [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1],
      [-1, 0, 1, 0], [0, -1, 0, 1],
      [-1, 0, 0, 0], [0, -1, 0, 0], [0, 0, -1, 0], [0, 0, 0, -1],
      [1, 0, -1, 0], [0, 1, 0, -1],
    ].map(w => new LatticeCoords(w));

    const vertices = [v, v.translate(wpow[k])];

    for (let i = 2; i < m; i++) {
      k = (k + 12 / m) % 12;
      k = Math.floor(k);
      vertices.push(vertices[i - 1].translate(wpow[k]));
    }

    return new Face(vertices, [], param_mode, assym_mode, separated_site_mode);
  }

  // -------------------------
  // Transformations
  // -------------------------
  translate(dir1, dir2 = null, i = 0, j = 0) {
    const new_face = this.clone();

    if (this.vertices[0] instanceof LatticeCoords) {
      const translation = dir1.w.map((v, idx) => v * i + dir2.w[idx] * j);
      new_face._vertices = new_face._vertices.map(v =>
        v.map((x, k) => x + translation[k])
      );
    } else {
      new_face.vertices = this.vertices.map(v => v.translate(dir1));
    }

    return new_face;
  }

  scale(n) {
    const new_face = this.clone();
    new_face.vertices = this.vertices.map(v => v.scale(n));
    return new_face;
  }

  add_neighbors(faces) {
    this.neighbors = faces.filter(f => f.vertices !== this.vertices);
  }

  // -------------------------
  // Ray transform
  // -------------------------
  ray_transform(angle, bounds = [0, 0, 1, 1], frame_num = 0) {
    const new_face = this.clone();
    const vertices = [];
    const mid_points = [];
    const intersection_points = [];
    if (this.param_mode.param_mode) {
      angle = 1 +  this.angle_parametrisation.noise(
        this.vertices[0].x/bounds[0] * 2,
        this.vertices[0].y/bounds[1] * 2,
      );
    }
		//angle = this.vertices[0].x/10;
		//angle = 0;

    angle = Math.max(0, Math.min(angle, Math.PI / 2));

    for (let i = 0; i < this.vertices.length; i++) {
      const p0 = this.vertices[i];
      const p1 = this.vertices[(i + 1) % this.vertices.length];
      const p2 = this.vertices[(i + 2) % this.vertices.length];

      const mid0 = {
        x: (p0.x + p1.x) / 2,
        y: (p0.y + p1.y) / 2,
      };

      const mid1 = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      const heading0 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const heading1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      const angle0 = heading0 + angle;
      const angle1 = heading1 - angle;

      const end0 = {
        x: mid0.x + 100 * Math.cos(angle0),
        y: mid0.y + 100 * Math.sin(angle0),
      };

      const end1 = {
        x: mid1.x + 100 * Math.cos(angle1),
        y: mid1.y + 100 * Math.sin(angle1),
      };

      const s0 = { x: mid0.x - end0.x, y: mid0.y - end0.y };
      const s1 = { x: mid1.x - end1.x, y: mid1.y - end1.y };

      const denom = -s1.x * s0.y + s0.x * s1.y;

      let cx, cy;
      if (Math.abs(denom) < 1e-8) {
        cx = (mid0.x + mid1.x) / 2;
        cy = (mid0.y + mid1.y) / 2;
      } else {
        const t =
          (s1.x * (mid0.y - mid1.y) - s1.y * (mid0.x - mid1.x)) / denom;
        cx = mid0.x + t * s0.x;
        cy = mid0.y + t * s0.y;
      }

      const p = [cx, cy];

      intersection_points.push({
        point: p,
        launch_0: [mid0.x, mid0.y],
        launch_1: [mid1.x, mid1.y],
        original_vertex: p1,
      });

      vertices.push(new EuclideanCoords([mid0.x, mid0.y]));
      vertices.push(new EuclideanCoords([cx, cy]));
      mid_points.push([new EuclideanCoords([mid0.x, mid0.y]), angle]);
    }

    vertices.push(vertices[0]);

    new_face.vertices = vertices;
    new_face.midPoints = mid_points;
    new_face.intersection_points = intersection_points;

    return new_face;
  }

  // -------------------------
  // Utils
  // -------------------------
  critical_angle(p0, p1, p2) {
    const v1 = [p0.x - p1.x, p0.y - p1.y];
    const v2 = [p2.x - p1.x, p2.y - p1.y];

    const norm = v => Math.hypot(v[0], v[1]);

    const u1 = v1.map(x => x / norm(v1));
    const u2 = v2.map(x => x / norm(v2));

    const dot = Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1]));

    return (Math.PI - Math.acos(dot)) * 0.5 - 1e-4;
  }

  point_inside(p) {
    let inside = false;

    for (let i = 0; i < this.vertices.length; i++) {
      const v1 = this.vertices[i];
      const v2 = this.vertices[(i + 1) % this.vertices.length];

      const intersects =
        (v1.y > p.y) !== (v2.y > p.y) &&
        p.x <
          ((v2.x - v1.x) * (p.y - v1.y)) / (v2.y - v1.y) + v1.x;

      if (intersects) inside = !inside;
    }

    return inside;
  }

  clone() {
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
  }

  _samePoint(a, b) {
    return Math.abs(a.x - b.x) < 1e-8 &&
           Math.abs(a.y - b.y) < 1e-8;
  }

  toString() {
    return this.vertices
      .map(v => `(${v.x.toFixed(2)},${v.y.toFixed(2)})`)
      .join("->");
  }
}
