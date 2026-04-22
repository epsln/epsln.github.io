import { rgbToCss, magma, viridis, plasma } from "./colors.js";
import {
  OrnementsType,
  normalize,
  outlineLines,
  fillIntersectPoints,
  quadraticBezier,
} from "./geometry.js";

export default class SVGWriter {
  constructor(width, height, n_tiles, stroke) {
    this.width = width;
    this.height = height;
    this.stroke = stroke;
    this.n_tiles = n_tiles;
    this.size = [0, 0, width, height];

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // Ornement state
    this.ornements = null;       // { width, type (OrnementsType), angle }
    this.intersectPoints = new Map();
    this.polygonFill = new Map(); // n_vertices → CSS fill string | null
    this.colorLine = "black";
    this.colorBg = "white";
    this.bezier = false;
    this.regular = false;        // set to true by RegularTessellation
    this.colormap = "none";
    this._colormapFn = null;
  }

  // ─── Configuration setters ────────────────────────────────────────────────

  setOrnements(ornements) {
    if (this.bezier) throw new Error("Cannot use ornements together with bezier mode.");
    this.ornements = ornements;
  }

  setBezier(bezier) {
    if (bezier && this.ornements) throw new Error("Cannot use bezier together with ornements.");
    this.bezier = bezier;
  }

  setColormap(name) {
    this.colormap = name;
    const maps = { magma , viridis, plasma };
    this._colormapFn = maps[name] ?? null;
  }

  setColorLine(color) { this.colorLine = color; }
  setColorBg(color)   { this.colorBg = color; 
    const el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    el.setAttribute("width", "100%");
    el.setAttribute("height", "100%");
    el.setAttribute("fill", this.colorBg);
    this.svg.appendChild(el);
	}

  // ─── Internal helpers ─────────────────────────────────────────────────────

  _xy(p) {
    if (!p) return { x: 0, y: 0 };
    return { x: p.x ?? 0, y: p.y ?? 0 };
  }

  /** Resolve fill color for a face with n vertices. */
  _fillForN(n) {
    if (!this.polygonFill.has(n)) {
      if (this._colormapFn) {
        // Map vertex count to a color via the colormap array (256 entries)

        const idx = (n / 12) % 256;
        const [r, g, b] = this._colormapFn(idx);
        this.polygonFill.set(n, `rgb(${r},${g},${b})`);
      } else {
        this.polygonFill.set(n, null);
      }
    }
    return this.polygonFill.get(n);
  }

  // ─── Primitives ───────────────────────────────────────────────────────────

  point(p, color = "black", r = 2) {
    const { x, y } = this._xy(p);
    const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    el.setAttribute("cx", x);
    el.setAttribute("cy", y);
    el.setAttribute("r", r);
    el.setAttribute("fill", color);
    this.svg.appendChild(el);
  }

  /** line(p1, p2, color?, dotted?)  — color is 3rd arg to match ornements calls */
  line(p1, p2, color = this.colorLine, dotted = false) {
    const a = this._xy(p1);
    const b = this._xy(p2);
    const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
    el.setAttribute("x1", a.x); el.setAttribute("y1", a.y);
    el.setAttribute("x2", b.x); el.setAttribute("y2", b.y);
    el.setAttribute("stroke", color);
    el.setAttribute("stroke-width", "1");
    if (dotted) el.setAttribute("stroke-dasharray", "4 2");
    this.svg.appendChild(el);
  }

  /**
   * polygon(pts, fill, outline)
   * pts — Array of [x, y] pairs  OR  Array of {x, y} objects
   */
  polygon(pts, fill = null, outline = this.colorLine) {
    if (!pts || pts.length < 2) return;

    const pointStr = pts
      .map(p => Array.isArray(p) ? `${p[0]},${p[1]}` : `${p.x},${p.y}`)
      .join(" ");

    const el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    el.setAttribute("points", pointStr);
    el.setAttribute("fill", fill ?? "none");
    el.setAttribute("stroke", outline ?? "none");
    el.setAttribute("stroke-width", "1");
    this.svg.appendChild(el);
  }

  // ─── Band face ────────────────────────────────────────────────────────────

  _drawBandFace(face) {
    const verts = face.vertices;
    const n = verts.length;

    let cx = 0, cy = 0;
    for (const v of verts) { cx += v.x; cy += v.y; }
    cx /= n; cy /= n;

    const insetWidth = this.ornements.width * 3 / n;
    const pts = verts.map((v) => {
      const dir = normalize([cx - v.x, cy - v.y]);
      return [v.x + dir[0] * insetWidth, v.y + dir[1] * insetWidth];
    });

    this.polygon(pts, this._fillForN(n), this.colorLine);
    const basePts = face.vertices.map(v => [v.x, v.y]);
    this.polygon(basePts, "none", [255, 255, 0]);
  }

  // ─── Outline lines (lace / band PIC) ─────────────────────────────────────

  _drawOutlineLines(points) {
    const { posRing, negRing } = outlineLines(
      points,
      this.intersectPoints,
      this.ornements,
    );

    // Positive rin3
    if (this.bezier) {
      for (let i = 0; i < posRing.length - 1; i += 2) {
        const p0 = posRing[i];
        const p1 = posRing[i + 1];
        const p2 = posRing[(i + 2) % posRing.length];
        const curve = quadraticBezier(p0, p1, p2);
        for (let j = 0; j < curve.length - 1; j++) {
          this.line(curve[j], curve[j + 1], this.colorLine);
        }
      }
    } else {
      const xy = [];
      for (let i = 0; i < posRing.length - 1; i += 2) {
        xy.push([posRing[i].x,                          posRing[i].y]);
        xy.push([posRing[i + 1].x,                      posRing[i + 1].y]);
        xy.push([posRing[(i + 2) % posRing.length].x,   posRing[(i + 2) % posRing.length].y]);
      }
      this.polygon(xy, this._fillForN(points.length), this.colorLine);
    }

    // Negative ring (crossing segments)
    for (let i = 0; i < negRing.length - 2; i += 3) {
      const p0 = negRing[i];
      const p1 = negRing[i + 1];
      const p2 = negRing[i + 2];
      if (this.bezier) {
        const curve = quadraticBezier(p0, p1, p2);
        for (let j = 0; j < curve.length - 1; j++) {
          this.line(curve[j], curve[j + 1], this.colorLine);
        }
      } else {
        this.line(p0, p1, this.colorLine);
        this.line(p1, p2, this.colorLine);
      }
    }

    return posRing;
  }

  // ─── Face (main entry point) ──────────────────────────────────────────────

  face(face, { dotted = false } = {}) {
    if (!face?.vertices) return;

    // Guard against faces with NaN/Inf vertices
    for (const v of face.vertices) {
      if (!isFinite(v.x) || !isFinite(v.y)) return;
    }

    const n = face.vertices.length;

    if (this.ornements) {
      if (this.regular) {
        // Regular tessellation path: bands only (laces need PIC)
        if (this.ornements.type === OrnementsType.BANDS) {
          this._drawBandFace(face);
        } else {
          throw new Error("Laces cannot be applied to a regular tessellation.");
        }
      } else {
        // PIC path: update crossing state then draw outline rings
				console.log("!");
        fillIntersectPoints(face, this.intersectPoints);
        this._drawOutlineLines(face.vertices);
      }
      return;
    }

    // Plain rendering
    if (this.bezier) {
      for (let i = 0; i < n - 2; i += 2) {
        const curve = quadraticBezier(
          face.vertices[i],
          face.vertices[i + 1],
          face.vertices[i + 2],
        );
        for (let j = 0; j < curve.length - 1; j++) {
          this.line(curve[j], curve[j + 1], this.colorLine);
        }
      }
    } else {
      const fill = this._fillForN(n);
      const pts = face.vertices.map(v => [v.x, v.y]);
      this.polygon(pts, fill, dotted ? null : this.colorLine);
      if (dotted) {
        // Draw edges individually so we can apply dash style
        for (let i = 0; i < n; i++) {
          this.line(
            face.vertices[i],
            face.vertices[(i + 1) % n],
            this.colorLine,
            true,
          );
        }
      }
    }
  }

  // ─── Output ───────────────────────────────────────────────────────────────

  /** Return the SVG DOM element. */
  element() {
    return this.svg;
  }

  /** Return the SVG as a serialized string. */
  toString() {
    return new XMLSerializer().serializeToString(this.svg);
  }

  /** Trigger a download of the current SVG. */
  download(filename = "tiling.svg") {
    const blob = new Blob([this.toString()], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
