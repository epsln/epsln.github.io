import SVGWriter from "./svg_writer.js"
import RegularTesselation from "./tesselation.js"
import { computePerimeterRange } from "./math_utils.js"
import { rgbToCss, viridis, plasma, magma } from "./colors.js"

const container = document.getElementById("app");

// ─── Save-as SVG ─────────────────────────────────────────────────────────────

document.getElementById("save-as").addEventListener("click", function () {
	const svg = document.getElementById("app");
	const clone = svg.cloneNode(true);
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	const serializer = new XMLSerializer();
	let source = serializer.serializeToString(clone);
	if (!source.match(/^<\?xml/)) {
		source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
	}
	const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "drawing.svg";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function updateTilingName(name) {
  const el = document.getElementById("current-tiling");
  if (el) el.textContent = name;
}

function getRGB(hex) {
	var res = hex.match(/[a-f0-9]{2}/gi);
	return res && res.length === 3
		? res.map(function (v) { return parseInt(v, 16) })
		: null;
}

function debounce(fn, ms) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), ms);
	};
}

// ─── Tiling database & selection ─────────────────────────────────────────────

var db = require('./database.json');
const tess_type = "regular";
var tess_id;
var angle;

// Group a flat list of tiling keys into labelled optgroup buckets.
function groupTessKeys(keys) {
  const groups = [
    { label: "1-uniform",         re: /^t1\d{3}$/ },
    { label: "2-uniform",         re: /^t2\d{3}$/ },
    { label: "3-uniform",         re: /^t3\d{3}$/ },
    { label: "3-uniform (mixed)", re: /^t3u/       },
    { label: "4-uniform",         re: /^t4\d{3}$/ },
    { label: "4-uniform (mixed)", re: /^t4u/       },
    { label: "5-uniform",         re: /^t5\d{3}$/ },
    { label: "5-uniform (mixed)", re: /^t5u/       },
    { label: "6-uniform",         re: /^t6\d{3}$/ },
    { label: "6-uniform (mixed)", re: /^t6u/       },
    { label: "7-uniform (mixed)", re: /^t7u/       },
    { label: "Grünbaum–Shephard", re: null          },
  ];
  const buckets = groups.map(g => ({ ...g, vals: [] }));
  for (const k of keys) {
    let matched = false;
    for (const b of buckets) {
      if (b.re && b.re.test(k)) { b.vals.push(k); matched = true; break; }
    }
    if (!matched) buckets[buckets.length - 1].vals.push(k);
  }
  return buckets.filter(b => b.vals.length > 0);
}

function populateTessSelect() {
  const sel = document.getElementById("tess-id");
  if (!sel) return;
  // Remove any previously generated optgroups, keep the "random" option
  Array.from(sel.querySelectorAll("optgroup")).forEach(g => g.remove());
  for (const bucket of groupTessKeys(Object.keys(db))) {
    const grp = document.createElement("optgroup");
    grp.label = bucket.label;
    for (const key of bucket.vals) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = key;
      grp.appendChild(opt);
    }
    sel.appendChild(grp);
  }
}

export function getRandomTiling() {
	const keys = Object.keys(db);
	if (keys.length === 0) throw new Error("Empty tiling database");
	const randomKey = keys[Math.floor(Math.random() * keys.length)];
	updateTilingName(randomKey);

	tess_id = { id: randomKey, ...db[randomKey] };
}

function chose_tiling() {
	const tess_mode = document.getElementById("tess-id");
	if (tess_mode.value === "random") {
		getRandomTiling();
		if (tess_mode) tess_mode.value = tess_id.id;
	} else {
		tess_id = { id: tess_mode, ...db[tess_mode] };
	}
}

// ─── State ───────────────────────────────────────────────────────────────────

var t; // current tessellation object

// ─── Read all params from DOM ─────────────────────────────────────────────────

function readParams() {
	const isMobile = window.innerWidth <= 768;
	const rect = container.getBoundingClientRect();
	const widthPx  = Math.round(isMobile ? window.innerWidth        : rect.width);
	const heightPx = Math.round(isMobile ? window.innerHeight * 0.8 : rect.height);

	return {
		widthPx,
		heightPx,
		scale:        parseInt(document.getElementById("scale").value),
		angle:        parseFloat(document.getElementById("angle").value),
		param:        document.getElementById("parametrisation").value,
		param_scale:  parseFloat(document.getElementById("param-scale").value),
		ornement_type: document.getElementById("ornements").value,
		bands_width:  parseInt(document.getElementById("bands-width").value),
		color_line:   document.getElementById("line-color").value,
		color_bg:     document.getElementById("bg-color").value,
		color_map:    document.getElementById("color-map").value,
	};
}

// ─── Geometry computation (expensive: rebuilds tessellation + faces) ──────────

function computeGeometry() {
	const p = readParams();

	const ornements = p.ornement_type !== "none"
		? { type: p.ornement_type, width: p.bands_width }
		: null;

	const tess_parameters = { type: tess_type, tess_id };

	const writer = new SVGWriter(p.widthPx, p.heightPx, p.scale, p.color_line);
	writer.setColormap(p.color_map);
	writer.setOrnements(ornements);
	writer.setColorLine(p.color_line);
	writer.setColorBg(p.color_bg);

	if (tess_type === "regular") {
		t = new RegularTesselation(writer, tess_parameters, "demo");
	}

	if (p.param !== "none") {
		t.param_mode = p.param;
		t.param_scale = p.param_scale;
	}

	t.angle = p.angle;
	t.tesselate_face();

  const angle= document.getElementById("pic-angle");
  angle.textContent = p.angle 
  const param_scale = document.getElementById("p-scale");
  param_scale.textContent = p.param_scale 

	drawFaces();
}

// ─── Draw (cheap: reuses existing faces, only re-renders SVG) ─────────────────
//
// Call this when only visual properties changed (colors, colormap).
// The SVG is cleared and redrawn from the already-computed t.faces list.
// intersectPoints is also reset so lace crossing state regenerates cleanly.

function drawFaces() {
	if (!t) return;

	const p = readParams();


	// Reset SVG content
	while (t.writer.svg.firstChild) {
		t.writer.svg.removeChild(t.writer.svg.firstChild);
	}
	// Reset lace/band crossing state so it rebuilds from scratch
	t.writer.intersectPoints = new Map();
	// Reset fill cache so colormap changes are picked up
	t.writer.polygonFill = new Map();

	// Apply current visual params to the existing writer
	t.writer.setColorLine(p.color_line);
	t.writer.setColorBg(p.color_bg);
	t.writer.setColormap(p.color_map);

	// Update SVG dimensions in case they changed (resize path)
	t.writer.svg.setAttribute("width",   p.widthPx);
	t.writer.svg.setAttribute("height",  p.heightPx);
	t.writer.svg.setAttribute("viewBox", `0 0 ${p.widthPx} ${p.heightPx}`);

	t.faces.forEach(face => t.writer.face(face));

	container.innerHTML = "";
	container.appendChild(t.writer.svg);
}

// ─── Resize: recompute geometry (tile count depends on canvas size) ───────────

const onResize = debounce(() => {
	computeGeometry();
}, 150);

new ResizeObserver(onResize).observe(container);

// ─── Event wiring ─────────────────────────────────────────────────────────────

// Controls that affect face positions → full recompute
const GEOMETRY_IDS = ["scale", "angle", "parametrisation", "param-scale", "ornements", "bands-width"];
GEOMETRY_IDS.forEach(id => {
	document.getElementById(id)?.addEventListener("input", computeGeometry);
});

// Controls that only affect rendering → cheap redraw
const RENDER_IDS = ["color-map", "line-color", "bg-color"];
RENDER_IDS.forEach(id => {
	document.getElementById(id)?.addEventListener("input", drawFaces);
});

// Tiling selector: choosing a new tiling always needs a full recompute
document.getElementById("tess-id").addEventListener("input", () => {
	chose_tiling();
	computeGeometry();
});


document.getElementById("tess-id").addEventListener("change", () => {
  const value = select.value;
  updateTilingName(value);
});

// Generate button: pick a new random tiling, then recompute
document.getElementById("generate").addEventListener("click", () => {
	getRandomTiling();
	// Sync the dropdown to "random" so it stays consistent
	const sel = document.getElementById("tess-id");
	if (sel) sel.value = tess_id.id;
	computeGeometry();
});

// ─── Visibility toggling for conditional params ───────────────────────────────

const params = document.querySelectorAll(".param");

function updateVisibility() {
	params.forEach(el => {
		let visible = true;
		for (const attr of el.attributes) {
			if (!attr.name.startsWith("data-show-")) continue;
			const selectId = attr.name.replace("data-show-", "");
			const select = document.getElementById(selectId);
			if (!select) continue;
			const allowedValues = attr.value.split(",");
			if (!allowedValues.includes(select.value)) {
				visible = false;
				break;
			}
		}
		el.classList.toggle("hidden", !visible);
	});
}

document.querySelectorAll("select").forEach(select => {
	select.addEventListener("input", updateVisibility);
});
document.querySelectorAll("checkbox").forEach(select => {
	select.addEventListener("change", updateVisibility);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

populateTessSelect();
chose_tiling();
updateVisibility();
computeGeometry();

// ─── Animation ─────────────────────────────────────────────────────────────────────
let animating_angle = false;
let animating_param_scale = false;
let s = 0;

function animate_angle() {
  if (!animating_angle) return;

  s += 0.05; // speed

  // update params
  const angleInput = document.getElementById("angle");
  angleInput.value = 0.1 + (0.5 + 0.5 * Math.sin(s)) * 1.4;
  // trigger your render pipeline
  computeGeometry();
  requestAnimationFrame(animate_angle);
}

function animate_param_scale() {
  if (!animating_param_scale) return;

  s += 0.01; // speed

  // update params
  const param_scale = document.getElementById("param-scale");
  param_scale.value = (0.1 + (0.5 + 0.5 * Math.sin(s)) * 20).toFixed(2);

  // trigger your render pipeline
  computeGeometry();
  requestAnimationFrame(animate_param_scale);
}


const btn_anim_angle = document.getElementById("anim-angle-toggle");
btn_anim_angle.onclick = () => {
  animating_angle = !animating_angle;
  const btn_icon = document.getElementById("btn-icon-angle");
  if (animating_angle){ 
		btn_icon.textContent = "◼";
		animate_angle();
	}
	else{
		btn_icon.textContent = "▶︎";
	}
};

const btn_anim_param = document.getElementById("anim-param-scale-toggle");
btn_anim_param.onclick = () => {
  animating_param_scale = !animating_param_scale;
  const btn_icon = document.getElementById("btn-icon-param");
  if (animating_param_scale){
		btn_icon.textContent = "◼";
		animate_param_scale();
	}
	else{
		btn_icon.textContent = "▶︎";
	}
};

// ─── Print modal (unchanged below) ───────────────────────────────────────────

/*
const PRINT_API = "https://mortier-api.onrender.com";
//const PRINT_API = "http://127.0.0.1:8000";

function collectPrintParams() {
	const tessType = document.getElementById("tess-type").value;
	const scale    = parseFloat(document.getElementById("scale").value);
	const angle    = parseFloat(document.getElementById("angle").value);
	const colorRGB = getRGB(document.getElementById("line-color").value) ?? [0, 0, 0];
	const colormap = document.getElementById("color-map").value;
	const angleParam = document.getElementById("parametrisation").value;

	const ornementsType = document.getElementById("ornements").value;
	const ornements = ornementsType === "none"
		? { type: "none" }
		: { type: ornementsType, width: parseFloat(document.getElementById("bands-width").value) };

	const hatchType = document.getElementById("hatch-type").value;
	const hatching = hatchType === "none"
		? { type: "none" }
		: {
			type:       hatchType,
			spacing:    parseInt(document.getElementById("hatch-spacing").value),
			angle:      parseFloat(document.getElementById("hatch-angle").value),
			crosshatch: document.getElementById("crosshatch").checked,
		};

	let tess_parameters, tile = null;

	if (tessType === "regular") {
		let id = document.getElementById("tess-id").value;
		if (id === "random") id = choose_tess_id();
		tess_parameters = { type: "regular", id };
	} else if (tessType === "penrose") {
		tile = document.getElementById("tile-id").value;
		tess_parameters = { type: "penrose", depth: parseInt(document.getElementById("depth").value) };
	} else if (tessType === "hyperbolic") {
		tess_parameters = {
			type:        "hyperbolic",
			p:           parseInt(document.getElementById("p").value),
			q:           parseInt(document.getElementById("q").value),
			depth:       parseInt(document.getElementById("depth").value),
			refinements: parseInt(document.getElementById("refinements").value),
			half_plane:  document.getElementById("half-plane").checked,
		};
	}

	return {
		tess_parameters,
		scale,
		angle,
		angle_parametrisation: angleParam === "none" ? null : angleParam,
		ornements,
		hatching,
		colormap: colormap === "none" ? null : colormap,
		tile,
		color_line: colorRGB,
	};
}

function loadImage(src, cors = false) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		if (cors) img.crossOrigin = "anonymous";
		img.onload  = () => resolve(img);
		img.onerror = (e) => reject(new Error(`Failed to load image: ${src} — ${e.type}`));
		img.src = src;
	});
}

const PRINT_PRODUCTS = [
  {
    id:        "poster_a3",
    name:      "A3 poster",
    desc:      "297 × 420 mm · 170g/m · matte · shipping included",
    price:     "€25",
    popular:   true,
    mockupSrc: "/mortier/mockups/poster_a3.png",
    rect:      { x: 157, y: 64, w: 456, h: 612 },
  },
  {
    id:        "poster_a4",
    name:      "A4 poster",
    desc:      "210 × 297 mm · 170g/m · matte · shipping included",
    price:     "€20",
    popular:   false,
    mockupSrc: "/mortier/mockups/poster_a4.png",
    rect:      { x: 173, y: 93, w: 331, h: 451 },
  },
  {
    id:        "card_15x20",
    name:      "Card",
    desc:      "150 × 200 mm · 170g/m · matte · shipping included",
    price:     "€15",
    popular:   false,
    mockupSrc: "/mortier/mockups/card_15x20.jpg",
    rect:      { x: 79, y: 32, w: 856, h: 1217 },
  },
];

async function buildMockupCanvas(mockupSrc, rect) {
  const container = document.getElementById("app");
  const svgEl = container.tagName === "SVG"
    ? container
    : container.querySelector("svg");

  if (!svgEl) throw new Error("No SVG found in #app — generate a tiling first");

  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width",  rect.w);
  clone.setAttribute("height", rect.h);
  clone.setAttribute("preserveAspectRatio", "xMidYMid slice");
  clone.removeAttribute("style");

  clone.querySelectorAll("*").forEach(el => {
    if (!el.getAttribute("xmlns"))
      el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  });

  const svgUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)],
    { type: "image/svg+xml;charset=utf-8" })
  );

  try {
    const [mockupImg, tilingImg] = await Promise.all([
      loadImage(mockupSrc, true),
      loadImage(svgUrl,    false),
    ]);

    const canvas = document.createElement("canvas");
    canvas.width  = mockupImg.naturalWidth;
    canvas.height = mockupImg.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(mockupImg, 0, 0);
    ctx.drawImage(tilingImg, rect.x, rect.y, rect.w, rect.h);

    return canvas;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

async function openPrintModal() {
	if (document.getElementById("print-overlay")) return;
	injectPrintStyles();

	const overlay = document.createElement("div");
	overlay.id = "print-overlay";
	overlay.addEventListener("click", e => { if (e.target === overlay) closePrintModal(); });

	const panel = document.createElement("div");
	panel.id = "print-panel";
	panel.innerHTML = `
		<button class="pm-back">← back to editor</button>
		<h2>Print your tiling</h2>
		<p class="pm-sub">Various formats · shipped within 3–5 business days</p>
		${PRINT_PRODUCTS.map(p => `
			<div class="pm-card ${p.popular ? "pm-featured" : ""}">
				<div class="pm-preview" id="pm-preview-${p.id}">
					${p.decoration === "frame"  ? '<div class="pm-frame"></div><div class="pm-frame-inner"></div>' : ""}
					${p.decoration === "canvas" ? '<div class="pm-canvas-edge"></div>' : ""}
					${p.popular                 ? '<div class="pm-badge">popular</div>' : ""}
				</div>
				<div class="pm-body">
					<div class="pm-info">
						<p class="pm-name">${p.name}</p>
						<p class="pm-desc">${p.desc}</p>
					</div>
					<span class="pm-price">${p.price}</span>
					<button class="pm-btn" data-product="${p.id}">Order</button>
				</div>
			</div>
		`).join("")}
		<p class="pm-note">Fulfilled by Gelato · free returns</p>
	`;

	overlay.appendChild(panel);
	document.body.appendChild(overlay);

	for (const p of PRINT_PRODUCTS) {
    const preview = document.getElementById(`pm-preview-${p.id}`);
    if (!preview) continue;
    try {
      const canvas = await buildMockupCanvas(p.mockupSrc, p.rect);
      if (canvas) {
        canvas.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
        preview.insertBefore(canvas, preview.firstChild);
      }
    } catch (err) {
      console.error(`Mockup failed for ${p.id}:`, err.message);
      const svgEl = document.getElementById("app")?.querySelector("svg");
      if (svgEl) preview.insertBefore(svgEl.cloneNode(true), preview.firstChild);
    }
  }

  const svgEl = document.getElementById("app")?.querySelector("svg");
	panel.querySelector(".pm-back").addEventListener("click", closePrintModal);
	panel.querySelectorAll(".pm-btn").forEach(btn =>
		btn.addEventListener("click", () => handleOrder(btn.dataset.product, svgEl))
	);
}

function closePrintModal() {
	document.getElementById("print-overlay")?.remove();
}

async function handleOrder(productId, svgEl) {
	const allBtns = document.querySelectorAll(".pm-btn");
	const activeBtn = document.querySelector(`.pm-btn[data-product="${productId}"]`);

	allBtns.forEach(b => { b.disabled = true; });
	activeBtn.textContent = "Preparing…";

	var s = new XMLSerializer();
	var svgStr = s.serializeToString(svgEl);

	try {
		const res = await fetch(`${PRINT_API}/api/print`, {
			method:  "POST",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ product_id: productId, svg: svgStr }),
		});

		if (!res.ok) throw new Error(`Server error ${res.status}`);

		const { checkout_url } = await res.json();
		window.location.href = checkout_url;

	} catch (err) {
		console.error("Print order failed:", err);
		activeBtn.textContent = "Error — try again";
		allBtns.forEach(b => { b.disabled = false; });
	}
}

function injectPrintStyles() {
	if (document.getElementById("print-modal-css")) return;
	const s = document.createElement("style");
	s.id = "print-modal-css";
	s.textContent = `
		#print-overlay {
			position: fixed; inset: 0; z-index: 9999;
			background: rgba(0,0,0,0.7);
			display: flex; align-items: flex-start; justify-content: flex-end;
		}
		#print-panel {
			width: 360px; height: 100vh; overflow-y: auto;
			background: #111; color: #fff;
			padding: 2rem 1.5rem; box-sizing: border-box;
			border-left: 1px solid rgba(255,255,255,0.1);
			animation: pm-slide 0.2s ease;
		}
		@keyframes pm-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
		#print-panel .pm-back {
			background: none; border: none; color: rgba(255,255,255,0.45);
			font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 1.5rem;
		}
		#print-panel .pm-back:hover { color: #fff; }
		#print-panel h2 { font-size: 20px; font-weight: 500; margin: 0 0 4px; }
		#print-panel .pm-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 1.75rem; }
		.pm-card {
			border: 1px solid rgba(255,255,255,0.1);
			border-radius: 8px; overflow: hidden; margin-bottom: 12px;
		}
		.pm-card.pm-featured { border-color: rgba(255,255,255,0.35); }
		.pm-preview {
			width: 100%; aspect-ratio: 3/4;
			position: relative; overflow: hidden; background: #0d0d0d;
		}
		.pm-frame {
			position: absolute; inset: 0;
			border: 14px solid #2a2218; box-sizing: border-box; pointer-events: none; z-index: 1;
		}
		.pm-frame-inner {
			position: absolute; inset: 14px;
			border: 2px solid #3d3024; box-sizing: border-box; pointer-events: none; z-index: 1;
		}
		.pm-canvas-edge {
			position: absolute; inset: 0; pointer-events: none; z-index: 1;
			box-shadow: inset 4px 4px 0 rgba(255,255,255,0.06), inset -4px -4px 0 rgba(0,0,0,0.4);
		}
		.pm-badge {
			position: absolute; top: 8px; left: 8px; z-index: 2;
			background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
			font-size: 11px; padding: 3px 8px; border-radius: 4px; pointer-events: none;
		}
		.pm-body { padding: 12px 14px; display: flex; align-items: center; gap: 10px; }
		.pm-info { flex: 1; min-width: 0; }
		.pm-name { font-size: 14px; font-weight: 500; margin: 0 0 2px; }
		.pm-desc { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }
		.pm-price { font-size: 14px; font-weight: 500; white-space: nowrap; }
		.pm-btn {
			font-size: 12px; padding: 6px 14px; white-space: nowrap;
			border: 1px solid rgba(255,255,255,0.25); border-radius: 4px;
			background: none; color: #fff; cursor: pointer; transition: background 0.15s;
		}
		.pm-btn:hover    { background: rgba(255,255,255,0.08); }
		.pm-btn:disabled { opacity: 0.35; cursor: not-allowed; }
		.pm-note { font-size: 12px; color: rgba(255,255,255,0.25); text-align: center; margin-top: 1.5rem; }
		.pm-no-svg { font-size: 12px; color: rgba(255,255,255,0.2); padding: 1rem; text-align: center; }
	`;
	document.head.appendChild(s);
}

//document.getElementById("print").addEventListener("click", openPrintModal);
*/
