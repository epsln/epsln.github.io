/**
 * ornements_geometry.js
 * Geometry helpers for band and lace ornement rendering.
 * Port of mortier/utils/geometry.py (ornement-relevant subset).
 */

// ─── OrnementsType enum ──────────────────────────────────────────────────────

export const OrnementsType = Object.freeze({ BANDS: "bands", LACES: "laces" });

// ─── Low-level math ──────────────────────────────────────────────────────────

/** Normalize a [x, y] array in-place (returns new array). */
export function normalize(v) {
  const n = Math.hypot(v[0], v[1]);
  if (n < 1e-9) return [0, 0];
  return [v[0] / n, v[1] / n];
}

/** Perpendicular (CCW 90°) of a [x, y] direction vector. */
export function perp(v) {
  return [-v[1], v[0]];
}

/**
 * Find the intersection of lines (p1→p2) and (p3→p4).
 * Returns [x, y]. Falls back to midpoint if parallel.
 * All points are {x, y} objects.
 */
export function intersect(p1, p2, p3, p4) {
  const A1 = p2.y - p1.y;
  const B1 = p1.x - p2.x;
  const C1 = A1 * p1.x + B1 * p1.y;

  const A2 = p4.y - p3.y;
  const B2 = p3.x - p4.x;
  const C2 = A2 * p3.x + B2 * p3.y;

  const det = A1 * B2 - A2 * B1;
  if (Math.abs(det) < 1e-8) {
    return { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
  }
  return {
    x: (B2 * C1 - B1 * C2) / det,
    y: (A1 * C2 - A2 * C1) / det,
  };
}

// ─── Vertex key ──────────────────────────────────────────────────────────────

/**
 * Stable string key for a vertex, rounded to `precision` decimal places.
 * @param {{x: number, y: number}} v
 * @param {number} precision
 */
export function vertexKey(v, precision = 2) {
  const r = 10 ** precision;
  return `${Math.round(v.x * r) / r},${Math.round(v.y * r) / r}`;
}

// ─── Miter join ──────────────────────────────────────────────────────────────

/**
 * Compute the two offset points (pos / neg sides) at vertex p_curr.
 * All points are {x, y}.  ornements is { width, type, angle }.
 *
 * @returns {{ pos: {x,y}, neg: {x,y} }}
 */
export function vertexMiter(pPrev, pCurr, pNext, ornements, end = false) {
  const half_w = ornements.width / 2;
  const EPS = 1e-9;

  const pc = [pCurr.x, pCurr.y];
  const vPrev = [pCurr.x - pPrev.x, pCurr.y - pPrev.y];
  const vNext = [pNext.x - pCurr.x, pNext.y - pCurr.y];

  const nPrev = normalize(vPrev);
  const nNext = normalize(vNext);

  const lenPrev = Math.hypot(...vPrev);
  const lenNext = Math.hypot(...vNext);

  const mk = (arr) => ({ x: arr[0], y: arr[1] });

  // Both degenerate
  if (lenPrev < EPS && lenNext < EPS) {
    return {
      pos: mk([pc[0] + half_w, pc[1]]),
      neg: mk([pc[0] - half_w, pc[1]]),
    };
  }

  // Only incoming degenerate
  if (lenPrev < EPS) {
    const n = normalize(perp(nNext));
    const d = normalize(nNext);
    const cut = half_w / Math.tan((end || 0) + Math.PI / 2);
    return {
      pos: mk([pc[0] + n[0] * half_w - d[0] * cut, pc[1] + n[1] * half_w - d[1] * cut]),
      neg: mk([pc[0] - n[0] * half_w, pc[1] - n[1] * half_w]),
    };
  }

  // Only outgoing degenerate
  if (lenNext < EPS) {
    const n = normalize(perp(nPrev));
    const d = normalize(nPrev);
    const cut = -half_w / Math.tan((end || 0) + Math.PI / 2);
    return {
      pos: mk([pc[0] + n[0] * half_w - d[0] * cut, pc[1] + n[1] * half_w - d[1] * cut]),
      neg: mk([pc[0] - n[0] * half_w, pc[1] - n[1] * half_w]),
    };
  }

  const n1 = normalize(perp(nPrev));
  const n2 = normalize(perp(nNext));
  const bis = [n1[0] + n2[0], n1[1] + n2[1]];
  const bisLen = Math.hypot(...bis);

  if (bisLen < 1e-6) {
    return {
      pos: mk([pc[0] + n2[0] * half_w, pc[1] + n2[1] * half_w]),
      neg: mk([pc[0] - n2[0] * half_w, pc[1] - n2[1] * half_w]),
    };
  }

  const b = [bis[0] / bisLen, bis[1] / bisLen];
  const denom = b[0] * n2[0] + b[1] * n2[1];
  const miterLen = half_w / denom;

  return {
    pos: mk([pc[0] + b[0] * miterLen, pc[1] + b[1] * miterLen]),
    neg: mk([pc[0] - b[0] * miterLen, pc[1] - b[1] * miterLen]),
  };
}

// ─── Segment offset ──────────────────────────────────────────────────────────

/**
 * Return the offset inner endpoint for a single segment [p0→p1].
 * When endCut=false, offsets the start end; when true, offsets the finish end.
 * All points are {x, y}.
 *
 * @returns {{x: number, y: number}}
 */
export function offsetSegment(p0, p1, cutLength, ornements, endCut = false) {
  const dir = [p1.x - p0.x, p1.y - p0.y];
  const n = normalize(perp(dir));
  const d = normalize(dir);
  const off = [n[0] * (ornements.width / 2), n[1] * (ornements.width / 2)];

  if (!endCut) {
    const px = p0.x + d[0] * cutLength;
    const py = p0.y + d[1] * cutLength;
    return { x: px - off[0], y: py - off[1] };
  } else {
    const px = p1.x - d[0] * cutLength;
    const py = p1.y - d[1] * cutLength;
    return { x: px - off[0], y: py - off[1] };
  }
}

// ─── Cut length ──────────────────────────────────────────────────────────────

/**
 * Compute cut and add lengths from intersection angle theta.
 * Returns { cutLength, addLength }.
 */
export function computeCutLength(theta, ornements) {
  const half_w = ornements.width / 2;
  let cutLength, addLength;

  if (theta < Math.PI / 4) {
    const theta_ = Math.PI / 2 - theta * 2;
    addLength = -(half_w / Math.cos(theta_) - half_w * Math.tan(theta_));
    cutLength = half_w / Math.cos(theta_) + half_w * Math.tan(theta_);
  } else {
    const theta_ = theta * 2 - Math.PI / 2;
    addLength = -(half_w / Math.cos(theta_) + half_w * Math.tan(theta_));
    cutLength = half_w / Math.cos(theta_) - half_w * Math.tan(theta_);
  }

  if (ornements.type === OrnementsType.BANDS) {
    addLength = cutLength;
  }

  return { cutLength, addLength };
}

// ─── Main outline algorithm ───────────────────────────────────────────────────

/**
 * Build the positive (outer) and negative (inner crossing) rings for a face.
 *
 * @param {Array<{x,y}>}  points           - Face vertices
 * @param {Map<string,{state:number[],angle:number}>} intersectPoints - Shared crossing state map
 * @param {{ width: number, type: string, angle: number }} ornements
 * @returns {{ posRing: Array<{x,y}>, negRing: Array<{x,y}> }}
 */
export function outlineLines(points, intersectPoints, ornements) {
  const pts = points;
  const n = pts.length;
  if (n < 2) return { posRing: [], negRing: [] };

  const posRing = [];
  const negRing = [];
  let begPoint = null;

  for (let i = 0; i < n; i++) {
    const pPrev = pts[(i - 1 + n) % n];
    const pCurr = pts[i];
    const pNext = pts[(i + 1) % n];

    const end = i === 0 || i === n - 1 ? ornements.angle : false;
    const { pos: posMid, neg: negMid } = vertexMiter(pPrev, pCurr, pNext, ornements, end);

    const keyCurr = vertexKey(pCurr);
    const keyNext = vertexKey(pNext);
    if (intersectPoints.has(keyCurr)) {
      const ip = intersectPoints.get(keyCurr);
      const { cutLength, addLength } = computeCutLength(ip.angle, ornements);
      begPoint = ip.state[0] === 1
        ? offsetSegment(pCurr, pNext, cutLength, ornements)
        : offsetSegment(pCurr, pNext, addLength, ornements);
    } else if (intersectPoints.has(keyNext)) {
      const ip = intersectPoints.get(keyNext);
      const { cutLength, addLength } = computeCutLength(ip.angle, ornements);
      const endPoint = ip.state[1] === 1
        ? offsetSegment(pCurr, pNext, cutLength, ornements, true)
        : offsetSegment(pCurr, pNext, addLength, ornements, true);

      if (begPoint !== null) {
        negRing.push(begPoint, negMid, endPoint);
      }
      begPoint = null;
    }

    posRing.push(posMid);
  }

  // Close pos ring: snap first and last to their line intersection
  if (posRing.length >= 2) {
    const closing = intersect(
      posRing[posRing.length - 2],
      posRing[posRing.length - 1],
      posRing[0],
      posRing[1],
    );
    posRing[0] = closing;
    posRing[posRing.length - 1] = closing;
  }

  return { posRing, negRing };
}

// ─── Intersect points state ───────────────────────────────────────────────────

/**
 * Populate the shared intersectPoints map from a face's midPoints.
 * Mirrors fill_intersect_points from geometry.py.
 *
 * @param {{ midPoints: Array<[{x,y}, number]> }} face
 * @param {Map<string, {state: number[], angle: number}>} intersectPoints
 */
export function fillIntersectPoints(face, intersectPoints) {
  for (const [p, angle] of face.midPoints) {
    const key = vertexKey(p);
    if (!intersectPoints.has(key)) {
      intersectPoints.set(key, {
        state: [Math.round(Math.random()), Math.round(Math.random())],
        angle,
      });
    } else {
      const ip = intersectPoints.get(key);
      if ((ip.state[0] + ip.state[1]) % 2 === 0) {
        intersectPoints.set(key, {
          state: [1 - ip.state[0], 1 - ip.state[1]],
          angle,
        });
      }
    }
  }
}

// ─── Quadratic Bézier ─────────────────────────────────────────────────────────

/**
 * Sample a quadratic Bézier curve through p0→p1→p2.
 * Returns an array of {x, y} points.
 */
export function quadraticBezier(p0, p1, p2, steps = 10) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    });
  }
  return pts;
}
