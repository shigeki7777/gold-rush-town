/* Gold Rush Town — Parts Catalog viewer (owner / Mission Control).
 * Renders one part at a time on a golden-hour turntable. Decoupled from the town. */
(function () {
  "use strict";
  var GRT = (window.GRT = window.GRT || {});
  var P = GRT.palette;
  var DBG = (window.GRTCAT = { ready: false, error: null, partId: null });

  var cv = document.getElementById("cv");
  var renderer, scene, camera, partGroup = null, ground, FUNC = null;
  var spin = true, az = Math.PI * 0.86, el = 0.34, dist = 40, target = new THREE.Vector3(0, 4, 0);

  function col(tok) { return GRT.PartKit.tok(tok); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(P.sky.haze, 60, 200);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);

    // golden-hour lighting (same recipe as the town)
    scene.add(new THREE.AmbientLight(0xffffff, 0.34));
    scene.add(new THREE.HemisphereLight(P.light.skyFill, P.light.groundFill, 0.5));
    var sun = new THREE.DirectionalLight(P.light.sun, 1.0);
    sun.position.set(22, 34, 16); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    var c = sun.shadow.camera; c.near = 1; c.far = 120; c.left = -40; c.right = 40; c.top = 40; c.bottom = -40;
    sun.shadow.bias = -0.0008;
    scene.add(sun); scene.add(sun.target);

    // turntable base
    var gMat = new THREE.MeshLambertMaterial({ color: col("ground.dirt") });
    ground = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 0.6, 48), gMat);
    ground.position.y = -0.3; ground.receiveShadow = true;
    scene.add(ground);
    var ring = new THREE.Mesh(
      new THREE.CylinderGeometry(20.4, 20.4, 0.3, 48),
      new THREE.MeshLambertMaterial({ color: col("ground.boardwalk") })
    );
    ring.position.y = -0.45; ring.receiveShadow = true; scene.add(ring);

    bindOrbit();
    addEventListener("resize", resize);
    resize();
    requestAnimationFrame(tick);
  }

  function resize() {
    var w = cv.clientWidth || cv.parentElement.clientWidth, h = cv.clientHeight || cv.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function placeCamera() {
    var ce = Math.cos(el), se = Math.sin(el);
    camera.position.set(
      target.x + dist * ce * Math.sin(az),
      target.y + dist * se,
      target.z + dist * ce * Math.cos(az)
    );
    camera.lookAt(target);
  }

  function tick() {
    if (spin && partGroup) partGroup.rotation.y += 0.0055;
    placeCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // minimal orbit (no external controls = stays vendored-only)
  function bindOrbit() {
    var down = false, lx = 0, ly = 0;
    cv.addEventListener("pointerdown", function (e) { down = true; lx = e.clientX; ly = e.clientY; spin = false; });
    addEventListener("pointerup", function () { down = false; });
    addEventListener("pointermove", function (e) {
      if (!down) return;
      az -= (e.clientX - lx) * 0.008; el = Math.max(-0.2, Math.min(1.3, el + (e.clientY - ly) * 0.006));
      lx = e.clientX; ly = e.clientY;
    });
    cv.addEventListener("wheel", function (e) { e.preventDefault(); dist = Math.max(12, Math.min(120, dist * (1 + Math.sign(e.deltaY) * 0.08))); }, { passive: false });
    document.getElementById("spinBtn").addEventListener("click", function (e) {
      spin = !spin; e.target.textContent = spin ? "pause spin" : "resume spin";
    });
  }

  function frameTo(res) {
    // re-center the part: bbox centre to x/z=0, base (minY) to y=0
    var s = res.size, ctr = res.center;
    res.group.position.x -= ctr.x;
    res.group.position.z -= ctr.z;
    res.group.position.y -= (ctr.y - s.y / 2); // lift so minY = 0
    var maxd = Math.max(s.x, s.y, s.z);
    dist = maxd * 1.75 + 6;
    target.set(0, s.y * 0.46, 0);
  }

  function loadPart(part) {
    document.getElementById("loadMsg").textContent = "loading " + part.name + "…";
    fetch(part.file, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (spec) {
      if (partGroup) { scene.remove(partGroup); }
      var res = GRT.PartKit.build(spec);
      partGroup = res.group; partGroup.rotation.y = 0;
      scene.add(partGroup);
      frameTo(res);
      renderInfo(spec, res);
      DBG.partId = spec.id; DBG.ready = true;
      document.getElementById("loadMsg").textContent = spec.name;
    }).catch(function (err) {
      DBG.error = String(err && err.message || err);
      document.getElementById("loadMsg").textContent = "error: " + DBG.error;
    });
  }

  function renderInfo(spec, res) {
    var dim = res.size, fn = FUNC && FUNC.parts && FUNC.parts[spec.id];
    var swatches = (spec.palette_tokens || []).map(function (t) {
      return '<span class="sw"><i style="background:' + GRT.PartKit.css(col(t)) + '"></i>' + esc(t) + "</span>";
    }).join("");
    document.getElementById("infoBody").innerHTML =
      '<div class="cat">' + esc(spec.category || "") + (spec.variant ? " · " + esc(spec.variant) : "") + "</div>" +
      "<h2>" + esc(spec.name || spec.id) + "</h2>" +
      '<div class="desc">' + esc(spec.description || "") + "</div>" +
      '<div class="kv"><span>footprint (tiles)</span><b>' + (spec.footprint || []).map(Number).join(" × ") + "</b></div>" +
      '<div class="kv"><span>voxel size</span><b>' + (spec.voxel) + " u</b></div>" +
      '<div class="kv"><span>render size (u)</span><b>' + dim.x.toFixed(1) + " × " + dim.y.toFixed(1) + " × " + dim.z.toFixed(1) + "</b></div>" +
      '<div class="kv"><span>voxel boxes</span><b>' + (spec.boxes || []).length + "</b></div>" +
      '<div class="kv"><span>signs (on-model)</span><b>' + (spec.signs || []).length + "</b></div>" +
      (fn ? '<div class="fnBox"><b>GOLD RUSH FUNCTION</b><i>' + esc(fn.axis) + '</i><span>' + esc(fn.interaction_level) + ' · ' + esc(fn.facility) + ' · ' + esc(fn.lifecycle) + '</span><p>' + esc(fn.honesty) + '</p></div>' : '') +
      '<div class="palTitle">PALETTE TOKENS</div><div class="swatches">' + swatches + "</div>";
  }

  var FILTER = "all";
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function renderMenu(manifest, onpick) {
    // category filter chips ("All" + each category present)
    var cats = ["all"];
    manifest.parts.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
    var fbox = document.getElementById("partFilters"); fbox.textContent = "";
    cats.forEach(function (c) {
      var chip = mk("button", "fchip" + (c === FILTER ? " on" : ""), c === "all" ? "All" : c);
      chip.addEventListener("click", function () { FILTER = c; renderMenu(manifest, onpick); });
      fbox.appendChild(chip);
    });

    // filtered part list
    var list = document.getElementById("partList"); list.textContent = "";
    manifest.parts.forEach(function (p) {
      if (FILTER !== "all" && p.category !== FILTER) return;
      var b = mk("button", "partBtn" + (p.id === DBG.partId ? " on" : ""));
      b.appendChild(mk("span", "swatchDot"));
      var wrap = mk("span");
      wrap.appendChild(mk("span", "cat", p.category));
      wrap.appendChild(document.createElement("br"));
      wrap.appendChild(document.createTextNode(p.name));
      b.appendChild(wrap);
      b.addEventListener("click", function () {
        list.querySelectorAll(".partBtn").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        onpick(p);
      });
      list.appendChild(b);
    });
    var badge = document.getElementById("mPartsCount");
    if (badge) badge.textContent = "(" + list.querySelectorAll(".partBtn").length + ")";
  }

  // ── mobile bottom-sheet chrome (parts / info drawers + scrim) ──
  var MQ = window.matchMedia ? matchMedia("(max-width:900px)") : { matches: false };
  function closeSheets() { document.body.classList.remove("sheet-parts", "sheet-info"); }
  function toggleSheet(name) {
    var on = document.body.classList.contains("sheet-" + name);
    closeSheets();
    if (!on) document.body.classList.add("sheet-" + name);
  }
  function setupMobile() {
    var bp = document.getElementById("btnParts"), bi = document.getElementById("btnInfo"), sc = document.getElementById("scrim");
    if (bp) bp.addEventListener("click", function () { toggleSheet("parts"); });
    if (bi) bi.addEventListener("click", function () { toggleSheet("info"); });
    if (sc) sc.addEventListener("click", closeSheets);
    Array.prototype.forEach.call(document.querySelectorAll(".sheetHandle"), function (h) { h.addEventListener("click", closeSheets); });
  }

  DBG.report = function () {
    return { ready: DBG.ready, partId: DBG.partId, error: DBG.error,
      objects: scene ? scene.children.length : 0 };
  };

  function boot() {
    if (!window.THREE || !GRT.palette || !GRT.PartKit) { DBG.error = "deps missing"; return; }
    init();
    setupMobile();
    Promise.all([fetch("manifest.json", { cache: "no-store" }).then(function (r) { return r.json(); }), fetch("../public/catalog-functions.json", { cache: "no-store" }).then(function(r){ return r.ok ? r.json() : null; }).catch(function(){ return null; })]).then(function (pair) { var m = pair[0]; FUNC = pair[1];
      DBG.partId = m.parts[0] && m.parts[0].id;   // initial highlight
      // on a phone, picking a part closes the drawer so the model is visible
      renderMenu(m, function (p) { loadPart(p); if (MQ.matches) closeSheets(); });
      loadPart(m.parts[0]);
    }).catch(function (err) { DBG.error = "manifest: " + err; });
  }

  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot); else boot();
})();
