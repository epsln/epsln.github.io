
export default class SVGWriter {
  constructor(width = 800, height = 600, n_tiles = 1) {
    this.width = width;
    this.height = height;
    this.n_tiles = n_tiles;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);

    document.body.appendChild(this.svg);
  }

  // --- helpers ---
  _pt(p) {
    return `${p.x},${this.height - p.y}`; // flip Y for SVG
  }

  // --- draw primitives ---
  point(p, r = 2) {
    const c = document.createElementNS(this.svg.namespaceURI, "circle");
    c.setAttribute("cx", p.x);
    c.setAttribute("cy", this.height - p.y);
    c.setAttribute("r", r);
    c.setAttribute("fill", "black");
    this.svg.appendChild(c);
  }

  line(p1, p2, { dotted = false } = {}) {
    const l = document.createElementNS(this.svg.namespaceURI, "line");
    l.setAttribute("x1", p1.x);
    l.setAttribute("y1", this.height - p1.y);
    l.setAttribute("x2", p2.x);
    l.setAttribute("y2", this.height - p2.y);
    l.setAttribute("stroke", "black");
    if (dotted) l.setAttribute("stroke-dasharray", "4,4");
    this.svg.appendChild(l);
  }

  face(face, { dotted = false, fill = "none" } = {}) {
    const poly = document.createElementNS(this.svg.namespaceURI, "polygon");

    const pts = face.vertices.map(v => this._pt(v)).join(" ");
    poly.setAttribute("points", pts);
    poly.setAttribute("fill", fill);
    poly.setAttribute("stroke", "black");

    if (dotted) poly.setAttribute("stroke-dasharray", "4,4");

    this.svg.appendChild(poly);
  }

  write() {
    // no-op (kept for compatibility)
  }
}
