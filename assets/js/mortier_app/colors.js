function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t))
  ];
}

export function rgbToCss([r, g, b]) {
  return `rgb(${r},${g},${b})`;
};

function sampleColormap(stops, t) {
  t = Math.max(0, Math.min(1, t));

  const n = stops.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const localT = t * n - i;

  return lerpColor(stops[i], stops[i + 1], localT);
}

const MAGMA = [
  [0, 0, 4],
  [28, 16, 68],
  [79, 18, 123],
  [129, 37, 129],
  [181, 54, 122],
  [229, 80, 100],
  [251, 135, 97],
  [254, 194, 135],
  [252, 253, 191]
];

export function magma(t) {
  return sampleColormap(MAGMA, t);
};

const PLASMA = [
  [13, 8, 135],
  [75, 3, 161],
  [125, 3, 168],
  [168, 34, 150],
  [203, 70, 121],
  [229, 107, 93],
  [248, 148, 65],
  [253, 195, 40],
  [240, 249, 33]
];

export function plasma(t) {
  return sampleColormap(PLASMA, t);
};

const VIRIDIS = [
  [68, 1, 84],
  [71, 44, 122],
  [59, 81, 139],
  [44, 113, 142],
  [33, 144, 141],
  [39, 173, 129],
  [92, 200, 99],
  [170, 220, 50],
  [253, 231, 37]
];

export function viridis(t) {
  return sampleColormap(VIRIDIS, t);
};
