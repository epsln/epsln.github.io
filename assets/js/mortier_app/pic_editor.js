/**
 * pic_editor.js
 * Self-contained PIC angle + site-separation interactive editor.
 *
 * Usage:
 *   import PicEditor from './pic_editor.js';
 *   const editor = new PicEditor(document.getElementById('pic-editor'));
 *   editor.onChange = ({ angle, assymAngle, separatedSite }) => {
 *     computeGeometry();
 *   };
 */

export default class PicEditor {
  constructor(container, opts = {}) {
    this._W = 480;
    this._H = 195;
    this._BLY = 158;    // baseline y
    this._VX = 240;     // vertex x (midpoint)
    this._LX = 24;      // left edge x
    this._RX = 456;     // right edge x
    this._RLEN = 152;    // ray render length
    this._AR = 80;      // arc radius for angle indicator
    this._HIT = 14;     // hit radius in SVG coords

    this.a0  = opts.angle        ?? 0.5;  // left ray angle  (radians from normal)
    this.a1  = opts.assymAngle   ?? 0.5;  // right ray angle
    this.sep = opts.separatedSite ?? 0.0; // site separation factor
    this.dist = opts.separatedSite ?? 0.0; // site separation factor
		this.symmetric = opts.symmetric     ?? true; // mirror angles when dragging

    this.onChange = null; // callback({ angle, assymAngle, separatedSite })

    this._drag = null;
    this._NS = 'http://www.w3.org/2000/svg';

    this._build(container);
    this._bindEvents();
    this._update();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  setValues({ angle, assymAngle, separatedSite }) {
    if (angle        !== undefined) this.a0  = angle;
    if (assymAngle   !== undefined) this.a1  = assymAngle;
    if (separatedSite !== undefined) this.dist = separatedSite;
    this._update();
  }

  // ─── Build DOM ──────────────────────────────────────────────────────────────

  _mk(tag, attrs) {
    const el = document.createElementNS(this._NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  _build(container) {
    container.style.cssText = 'user-select:none;font-family:monospace;';

    const CA = '#c8a96e', CB = '#5cb8a0';
    const CN = '#888';

    this._svg = this._mk('svg', {
      viewBox: `0 0 ${this._W} ${this._H}`,
			  style: `width:100%;aspect-ratio:${this._W}/${this._H};touch-action:none;display:block;`,
      xmlns: this._NS,
    });

    // Baseline
    this._bl  = this._mk('line',   { x1: this._LX, y1: this._BLY, x2: this._RX, y2: this._BLY, stroke: CN, 'stroke-width': '1.5', 'stroke-linecap': 'round' });
    // Midpoint tick
    this._lx  = this._mk('line',   { x1: this._VX, y1: this._BLY - 6, x2: this._VX, y2: this._BLY + 6, stroke: CN, 'stroke-width': '1', opacity: '0.35' });
    // Dashed verticals (site reference)
    this._vl0 = this._mk('line',   { stroke: CA, 'stroke-width': '0.8', opacity: '0.25', 'stroke-dasharray': '3 2' });
    this._vl1 = this._mk('line',   { stroke: CB, 'stroke-width': '0.8', opacity: '0.25', 'stroke-dasharray': '3 2' });
    // Angle arcs
    this._ac0 = this._mk('path',   { fill: 'none', stroke: CA, 'stroke-width': '1.2', opacity: '0.7' });
    this._ac1 = this._mk('path',   { fill: 'none', stroke: CB, 'stroke-width': '1.2', opacity: '0.7' });
    // Rays
    this._ry0 = this._mk('line',   { stroke: CA, 'stroke-width': '2', 'stroke-linecap': 'round' });
    this._ry1 = this._mk('line',   { stroke: CB, 'stroke-width': '2', 'stroke-linecap': 'round' });
    // Intersection preview (dashed circle)
    this._ipt = this._mk('circle', { r: '4', fill: 'none', stroke: CN, 'stroke-width': '1.2', 'stroke-dasharray': '2 2', opacity: '0' });
    // Site draggable dots
    this._dt0 = this._mk('circle', { r: '5.5', fill: CA, cursor: 'ew-resize' });
    this._dt1 = this._mk('circle', { r: '5.5', fill: CB, cursor: 'ew-resize' });
    // Tip draggable dots
    this._tp0 = this._mk('circle', { r: '6.5', fill: CA, cursor: 'crosshair', stroke: '#fff', 'stroke-width': '1.5' });
    this._tp1 = this._mk('circle', { r: '6.5', fill: CB, cursor: 'crosshair', stroke: '#fff', 'stroke-width': '1.5' });
    // Angle labels
    this._lb0 = this._mk('text',   { 'font-family': 'monospace', 'font-size': '21.5', fill: CA, 'text-anchor': 'middle' });
    this._lb1 = this._mk('text',   { 'font-family': 'monospace', 'font-size': '21.5', fill: CB, 'text-anchor': 'middle' });

    [this._bl, this._lx, this._vl0, this._vl1, this._ac0, this._ac1,
     this._ry0, this._ry1, this._ipt,
     this._dt0, this._dt1, this._tp0, this._tp1,
     this._lb0, this._lb1].forEach(el => this._svg.appendChild(el));

    // Readout bar
    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:20px;padding:6px 2px 0;font-size:12px;flex-wrap:wrap;';

    this._ov0 = document.createElement('span');
    this._ov1 = document.createElement('span');
    this._ovs = document.createElement('span');
    [this._ov0, this._ov1, this._ovs].forEach(s => { s.style.color = '#888'; bar.appendChild(s); });

    container.appendChild(this._svg);
    container.appendChild(bar);

    // Hit zones (transparent, larger than visible dots) for easier interaction
    ['site0','site1','tip0','tip1'].forEach(id => {
      const hz = this._mk('circle', { r: String(this._HIT), fill: 'transparent', cursor: id.startsWith('tip') ? 'crosshair' : 'ew-resize', 'data-zone': id });
      this._svg.appendChild(hz);
      this['_hz_' + id] = hz;
    });
  }

  // ─── Geometry helpers ────────────────────────────────────────────────────────

  _s0x() { return this._W/2 + Math.min(this.sep, this._W); }
  _s1x() { return this._W/2 - Math.min(this.sep, this._W)}

  _t0() {
    const s = this._s0x();
    return { x: s + this._RLEN * Math.sin(Math.PI/2 - this.a0), y: this._BLY - this._RLEN * Math.cos(Math.PI/ 2 - this.a0) };
  }
  _t1() {
    const s = this._s1x();
    return { x: s - this._RLEN * Math.sin(Math.PI/2 - this.a1), y: this._BLY - this._RLEN * Math.cos(Math.PI/2 - this.a1) };
  }

  // Arc for right-side site: baseline goes rightward (+x).
  // Sweeps CCW from +x up to ray at angle a above horizontal.
  _arcPath0(cx, cy, r, a) {
    if (Math.abs(a) < 0.01) return `M${cx + r},${cy}`;
    const x0 = cx + r,               y0 = cy;
    const x1 = cx + r * Math.cos(a), y1 = cy - r * Math.sin(a);
    return `M${x0},${y0} A${r},${r} 0 0 0 ${x1},${y1}`;
  }

  // Arc for left-side site: baseline goes leftward (-x).
  // Sweeps CW from -x up to ray at angle a above horizontal.
  _arcPath1(cx, cy, r, a) {
    if (Math.abs(a) < 0.01) return `M${cx - r},${cy}`;
    const x0 = cx - r,               y0 = cy;
    const x1 = cx - r * Math.cos(a), y1 = cy - r * Math.sin(a);
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`;
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  _update() {
    const sx0 = this._s0x(), sx1 = this._s1x();
    const p0  = this._t0(),   p1  = this._t1();
    const BLY = this._BLY,    AR  = this._AR,  RLEN = this._RLEN;

    this._ry0.setAttribute('x1', sx0); this._ry0.setAttribute('y1', BLY);
    this._ry0.setAttribute('x2', p0.x); this._ry0.setAttribute('y2', p0.y);
    this._ry1.setAttribute('x1', sx1); this._ry1.setAttribute('y1', BLY);
    this._ry1.setAttribute('x2', p1.x); this._ry1.setAttribute('y2', p1.y);

    this._vl0.setAttribute('x1', sx0); this._vl0.setAttribute('y1', BLY - 5);
    this._vl0.setAttribute('x2', sx0); this._vl0.setAttribute('y2', BLY - RLEN - 8);
    this._vl1.setAttribute('x1', sx1); this._vl1.setAttribute('y1', BLY - 5);
    this._vl1.setAttribute('x2', sx1); this._vl1.setAttribute('y2', BLY - RLEN - 8);

    this._dt0.setAttribute('cx', sx0); this._dt0.setAttribute('cy', BLY);
    this._dt1.setAttribute('cx', sx1); this._dt1.setAttribute('cy', BLY);
    this._tp0.setAttribute('cx', p0.x); this._tp0.setAttribute('cy', p0.y);
    this._tp1.setAttribute('cx', p1.x); this._tp1.setAttribute('cy', p1.y);

    this._hz_site0.setAttribute('cx', sx0); this._hz_site0.setAttribute('cy', BLY);
    this._hz_site1.setAttribute('cx', sx1); this._hz_site1.setAttribute('cy', BLY);
    this._hz_tip0.setAttribute('cx', p0.x);  this._hz_tip0.setAttribute('cy', p0.y);
    this._hz_tip1.setAttribute('cx', p1.x);  this._hz_tip1.setAttribute('cy', p1.y);

    this._ac0.setAttribute('d', this._arcPath0(sx0, BLY, AR, this.a0));
    this._ac1.setAttribute('d', this._arcPath1(sx1, BLY, AR, this.a1));

    // Label at the bisector of the arc, offset outward
    const loff = AR + 14;
    this._lb0.setAttribute('x', sx0 + loff * Math.cos(this.a0 / 2));
    this._lb0.setAttribute('y', BLY - loff * Math.sin(this.a0 / 2) + 4);
    this._lb0.textContent = this.a0.toFixed(3);
    this._lb1.setAttribute('x', sx1 - loff * Math.cos(this.a1 / 2));
    this._lb1.setAttribute('y', BLY - loff * Math.sin(this.a1 / 2) + 4);
    this._lb1.textContent = this.a1.toFixed(3);
    this._ov0.innerHTML = `angle₀&nbsp;<b>${this.a0.toFixed(2)}</b>`;
    this._ov1.innerHTML = `angle₁&nbsp;<b>${this.a1.toFixed(2)}</b>`;
    this._ovs.innerHTML = `separation&nbsp;<b>${(0.5 - this.dist).toFixed(2)}</b>`;

    if (this.onChange) {
      this.onChange({
        angle: this.a0,
        assymAngle: this.a1,
        separatedSite: this.dist,
      });
    }
  }

  // ─── Events ─────────────────────────────────────────────────────────────────

  _pt(e) {
    const r = this._svg.getBoundingClientRect();
    const c = e.touches ? e.touches[0] : e;
    return {
      x: (c.clientX - r.left) / r.width  * this._W,
      y: (c.clientY - r.top)  / r.height * this._H,
    };
  }

  _bindEvents() {
    const startDrag = (e) => {
      const p = this._pt(e);
      const sx0 = this._s0x(), sx1 = this._s1x();
      const p0  = this._t0(),   p1  = this._t1();
      const HIT = this._HIT;
      const d = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

      if      (d(p.x, p.y, p0.x, p0.y) < HIT)  this._drag = 'tip0';
      else if (d(p.x, p.y, p1.x, p1.y) < HIT)  this._drag = 'tip1';
      else if (d(p.x, p.y, sx0,  this._BLY) < HIT) this._drag = 'site0';
      else if (d(p.x, p.y, sx1,  this._BLY) < HIT) this._drag = 'site1';

      if (this._drag) e.preventDefault();
    };

    const moveDrag = (e) => {
      if (!this._drag) return;
      if (e.cancelable) e.preventDefault();
      const p = this._pt(e);
      const BLY = this._BLY;

      if (this._drag === 'tip0') {
        const dy =  BLY - p.y;
				if (dy > 4){
          this.a0 = Math.max(0.001, Math.min(Math.PI / 2 - 0.01,
            Math.PI/ 2 - Math.atan2(p.x - this._s0x(), dy)));
				  if (this.symmetric) this.a1 = this.a0;
				}
      } else if (this._drag === 'tip1') {
        const dy = BLY - p.y;
				console.log("moved tip1");
        if (dy > 4){
          this.a1 = Math.max(0.001, Math.min(Math.PI / 2 - 0.01,
            Math.PI/2 - Math.atan2(this._s1x() - p.x, dy)));
				  if (this.symmetric) this.a0 = this.a1;
				}
			} else if(this._drag==='site0'){
				this.sep=Math.min(Math.max(0, p.x - this._W/2), this._W/2 - this._LX);
				this.dist = 0.5 - this.sep/(this._W/2 - this._LX)/2;
			} else if(this._drag==='site1'){
				this.sep=Math.min(Math.max(0, this._W/2 - p.x), this._W/2 - this._LX);
				this.dist = 0.5 - this.sep/(this._W - this._LX)/2;
			}

      this._update();
    };

    const endDrag = () => { this._drag = null; };

    this._svg.addEventListener('mousedown',  startDrag);
    this._svg.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('mousemove',  moveDrag);
    window.addEventListener('touchmove',  moveDrag, { passive: false });
    window.addEventListener('mouseup',    endDrag);
    window.addEventListener('touchend',   endDrag);
  }
}
