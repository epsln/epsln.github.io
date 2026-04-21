import LatticeCoords from "./lattice_coords.js"
import Face from "./face.js"
export default class RegularTesselation {
  constructor(writer, tess, tess_id) {
    this.writer = writer;
    this.tess = tess;
    this.tess_id = tess_id;

    this.seed = null;
    this.cell = null;

    this.wpow = [
      new LatticeCoords([1, 0, 0, 0]),
      new LatticeCoords([0, 1, 0, 0]),
      new LatticeCoords([0, 0, 1, 0]),
      new LatticeCoords([0, 0, 0, 1]),
      new LatticeCoords([-1, 0, 1, 0]),
      new LatticeCoords([0, -1, 0, 1]),
      new LatticeCoords([-1, 0, 0, 0]),
      new LatticeCoords([0, -1, 0, 0]),
      new LatticeCoords([0, 0, -1, 0]),
      new LatticeCoords([0, 0, 0, -1]),
      new LatticeCoords([1, 0, -1, 0]),
      new LatticeCoords([0, 1, 0, -1]),
    ];

    this.set_tesselation(tess, tess_id);

    this.show_dual = false;
    this.show_face = false;
    this.show_base = false;
    this.ray_tesselation = false;
    this.angle = false;
    this.assym_angle = false;
    this.param_mode = false;
    this.show_underlying = false;
    this.separated_site_mode = false;
    this.lacing_mode = false;

    this.faces = [];
  }

  draw_seed() {
    this.writer.face(this.cell, { dotted: true });

    for (let s of this.seed) {
      s = new LatticeCoords(s);
      this.writer.point(s);
    }

    this.writer.write();
  }

  draw_cell() {
    for (let x = -2; x < 2; x++) {
      let t = this.T1.translate(this.T1.scale(x)).translate(this.T2.scale(-1));
      let t1 = this.T1.translate(this.T1.scale(x)).translate(this.T2.scale(2));
      this.writer.line(t, t1, { dotted: true });
    }

    for (let x = -1; x < 3; x++) {
      let t = this.T1.translate(this.T1.scale(-2)).translate(this.T2.scale(x));
      let t1 = this.T1.translate(this.T1.scale(1)).translate(this.T2.scale(x));
      this.writer.line(t, t1, { dotted: true });
    }
  }

  tesselate_face() {
    //const [i_min, i_max, j_min, j_max] = this.find_corners();
    const [i_min, i_max, j_min, j_max] = [-4, 4, -4, 4]; 
    const neighbor_arr = new Set();

    for (const x of [-1, 0, 1]) {
      for (const y of [-1, 0, 1]) {
        for (let s of this.seed) {
          s = new LatticeCoords(s);
          const p = s.translate(this.T1.scale(x).translate(this.T2.scale(y)));
          neighbor_arr.add(p.toString());
        }
      }
    }

    const faces = [];

    for (let s of this.seed) {
      s = new LatticeCoords(s);
      const neighbors = [];

      for (let k = 0; k < 6; k++) {
        const sk = s.translate(this.wpow[k]);
        if (neighbor_arr.has(sk.toString())) {
          neighbors.push(k);
        }
      }

      for (let i = 0; i < neighbors.length - 1; i++) {
        const h = 6 - (neighbors[i + 1] - neighbors[i]);
        const m = 12 / h;

        faces.push(
          Face.generate(s, neighbors[i], m, {
            param_mode: this.param_mode,
            assym_mode: this.assym_angle,
            separated_site_mode: this.separated_site_mode,
          })
        );
      }
    }

    const i_vals = [];
    const j_vals = [];

    for (let i = i_min; i < i_max; i++) i_vals.push(i);
    for (let j = j_min; j < j_max; j++) j_vals.push(j);

    const translations = [];

    for (const i of i_vals) {
      for (const j of j_vals) {
        const t = this.T1.w.map((v, idx) => v * i + this.T2.w[idx] * j);
        translations.push(t);
      }
    }

    for (const face of faces) {
      const verts = face._vertices;

      for (const tr of translations) {
        const newVerts = verts.map(v =>
          new LatticeCoords(v.map((val, i) => (val + tr[i]) * this.writer.n_tiles))
        );

        const new_face = Object.assign(
          Object.create(Object.getPrototypeOf(face)),
          face
        );

        new_face.vertices = newVerts;
        this.faces.push(new_face);
      }
    }
  }
	/*
  find_corners() {
    const W = [
      1,
      0.8660254037844386 + 0.5j,
      0.5 + 0.8660254037844386j,
      1j,
    ];

    if (this.show_base) {
      return [-1, 2, -1, 2];
    }

    let i_min = 1000,
      i_max = -1000,
      j_min = 1000,
      j_max = -1000;

    const [,, width, height] = this.writer.size;

    const corners = [
      0,
      width,
      height * 1j,
      width + height * 1j,
    ];

    for (const z of corners) {
      const z_ = plane_to_tile_coords(
        this.tess,
        W,
        z.real / this.writer.n_tiles,
        z.imag / this.writer.n_tiles
      );

      i_min = Math.min(i_min, z_.real);
      j_min = Math.min(j_min, z_.imag);
      i_max = Math.max(i_max, z_.real);
      j_max = Math.max(j_max, z_.imag);
    }

    i_min = Math.floor(i_min - 1);
    i_max = Math.ceil(i_max + 2);
    j_min = Math.floor(j_min - 1);
    j_max = Math.ceil(j_max + 2);

    return [i_min, i_max, j_min, j_max];
  }
	*/

  set_param_mode(mode = false) {
    this.param_mode = mode;
  }

  set_show_underlying(show = false) {
    this.show_underlying = show;
  }

  set_tesselation(tess, tess_id) {
    this.tess = tess;
    this.tess_id = tess_id;

    this.T0 = new LatticeCoords([0, 0, 0, 0]);
    this.T1 = new LatticeCoords(tess["T1"]);
    this.T2 = new LatticeCoords(tess["T2"]);
    this.T3 = this.T1.translate(this.T2);

    this.seed = this.tess["Seed"];
    this.cell = new Face([this.T0, this.T1, this.T3, this.T2]);
  }
}
