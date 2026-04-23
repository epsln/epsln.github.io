import LatticeCoords from "./lattice_coords.js"
import Face from "./face.js"
import Complex from "./complex.js"
import { planeToTileCoords } from "./math_utils.js"

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
    this.assym_mode = false;
    this.assym_angle = false;
    this.sep_mode = false;
    this.sep_dist = false;
    this.param_mode = false;
    this.show_underlying = false;
    this.lacing_mode = false;
    this.param_scale = 1;

    this.faces = [];
  }

  generate_faces() {
    const [i_min, i_max, j_min, j_max] = this.find_corners();
    //const [i_min, i_max, j_min, j_max] = [-10, 10, -10, 10]; 
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
            param_scale: this.param_scale,
            assym_mode: this.assym_mode,
            assym_angle: this.assym_angle,
            separated_site_mode: this.sep_mode,
            separated_site_dist: this.sep_dist,
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
        new_face.param_scale = this.param_scale;
        new_face.assym_mode = this.assym_mode;
        new_face.assym_angle = this.assym_angle;
        new_face.separated_site_mode = this.sep_mode;
        new_face.separated_site_dist = this.sep_dist;
        this.faces.push(new_face);
      }
    }
  }
	tesselate_face(){
        this.generate_faces();

				var new_faces = []
				
        if (this.angle){
        	for (let i = 0; i < this.faces.length; i++){
						const f = this.faces[i];
          	if (this.angle){
							//f.param_scale = this.param_scale;
            	const fn = f.ray_transform(
                            this.angle,
                            [this.writer.width, this.writer.height],
                            0,
                        );
							new_faces.push(fn);
						}
					}
					this.faces = new_faces
				}
	}
	find_corners() {

  const w = [
    new LatticeCoords([1, 0, 0, 0]),
    new LatticeCoords([0, 1, 0, 0]),
    new LatticeCoords([0, 0, 1, 0]),
    new LatticeCoords([0, 0, 0, 1]),
  ];

  let iMin = Infinity;
  let iMax = -Infinity;
  let jMin = Infinity;
  let jMax = -Infinity;

  const corners = [
    { x: 0, y: 0 },
    { x: this.writer.width, y: 0 },
    { x: 0, y: this.writer.height },
    { x: this.writer.width, y: this.writer.height },
  ];

  const tiling = this.tess;
  const wvec = w;

  for (const c of corners) {
    // normalize to tile sampling space
    const x = c.x / this.writer.n_tiles;
    const y = c.y / this.writer.n_tiles;

    // convert to tile coords
    const p = planeToTileCoords(tiling, wvec, x, y);

    iMin = Math.min(iMin, p.x);
    iMax = Math.max(iMax, p.x);
    jMin = Math.min(jMin, p.y);
    jMax = Math.max(jMax, p.y);
  }

  return [
    Math.floor(iMin - 1),
    Math.ceil(iMax + 1),
    Math.floor(jMin - 1),
    Math.ceil(jMax + 1),
  ];
}
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
    this.T1 = new LatticeCoords(tess.tess_id["T1"]);
    this.T2 = new LatticeCoords(tess.tess_id["T2"]);
    this.T3 = this.T1.translate(this.T2);

    this.seed = this.tess.tess_id["Seed"];
    this.cell = new Face([this.T0, this.T1, this.T3, this.T2]);
  }
}
