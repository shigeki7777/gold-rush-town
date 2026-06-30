/* Gold Rush Town — Part Renderer (shared, single source of truth for a part).
 *
 * Reads a declarative part spec (parts/<cat>/<id>.json) + GRT.palette and builds a
 * THREE.Group. The SAME renderer is reused by: (1) the MC catalog viewer, (2) the
 * town field assembly, (3) LP/website embeds, (4) thumbnail/GLB export.
 *
 * Conventions:
 *   - All part coords are in VOXEL UNITS; spec.voxel is voxel size in world units.
 *   - boxes: {x,y,z} = MIN corner, {w,h,d} = size, mat = palette token ("wood.base").
 *   - signs: {x,y,z} = CENTER, {w,h} = size; authored ON the building so they never
 *     drift from the world tile grid (the whole point).
 *
 * Browser global: GRT.PartKit.build(spec) -> { group, size, center }.
 */
(function () {
  var GRT = (window.GRT = window.GRT || {});

  // Resolve a palette token like "wood.base" -> 0xRRGGBB. Magenta if missing (loud failure).
  function tok(path) {
    var p = (GRT.palette || {}), parts = String(path).split(".");
    for (var i = 0; i < parts.length; i++) { p = p && p[parts[i]]; }
    return (typeof p === "number") ? p : 0xff00ff;
  }
  function css(hex) { return "#" + ("000000" + (hex >>> 0).toString(16)).slice(-6); }

  function makeBox(b, V) {
    var color = tok(b.mat);
    var mat = new THREE.MeshLambertMaterial({ color: color });
    if (b.emissive) { mat.emissive = new THREE.Color(color); mat.emissiveIntensity = 0.55; }
    var g = new THREE.BoxGeometry(b.w * V, b.h * V, b.d * V);
    var m = new THREE.Mesh(g, mat);
    m.castShadow = true; m.receiveShadow = true;
    m.position.set((b.x + b.w / 2) * V, (b.y + b.h / 2) * V, (b.z + b.d / 2) * V);
    return m;
  }

  // A sign = a frame slab + a canvas-textured plate, authored on the building.
  function makeSign(s, V) {
    var grp = new THREE.Group();
    var w = s.w * V, h = s.h * V;

    // frame slab (slightly larger, sits just behind the plate)
    var frameMat = new THREE.MeshLambertMaterial({ color: tok(s.frame || "sign.frame") });
    var frame = new THREE.Mesh(new THREE.BoxGeometry(w * 1.08, h * 1.16, 0.18 * V), frameMat);
    frame.castShadow = true; grp.add(frame);

    // text plate (canvas texture)
    var cw = 512, ch = Math.max(128, Math.round(512 * (h / w)));
    var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = css(tok(s.bg || "sign.board")); ctx.fillRect(0, 0, cw, ch);
    // inner border
    ctx.strokeStyle = css(tok(s.frame || "sign.frame")); ctx.lineWidth = Math.round(ch * 0.06);
    ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, cw - ctx.lineWidth * 2, ch - ctx.lineWidth * 2);
    // text
    ctx.fillStyle = css(tok(s.fg || "sign.text"));
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var hasSub = !!s.subtitle;
    ctx.font = "bold " + Math.round(ch * (hasSub ? 0.34 : 0.42)) + "px Georgia, 'Times New Roman', serif";
    ctx.fillText(s.title || "", cw / 2, hasSub ? ch * 0.40 : ch * 0.5);
    if (hasSub) {
      ctx.font = "bold " + Math.round(ch * 0.22) + "px Georgia, serif";
      ctx.fillText(s.subtitle, cw / 2, ch * 0.74);
    }
    var tex = new THREE.CanvasTexture(cv); tex.anisotropy = 8;
    var plate = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    plate.position.z = 0.11 * V;
    grp.add(plate);

    // face direction: "front" => face -Z (toward the approaching viewer).
    if ((s.face || "front") === "front") grp.rotation.y = Math.PI;
    grp.position.set(s.x * V, s.y * V, s.z * V);
    return grp;
  }

  GRT.PartKit = {
    tok: tok,
    css: css,
    build: function (spec) {
      var V = spec.voxel || 0.5;
      var group = new THREE.Group();
      (spec.boxes || []).forEach(function (b) { group.add(makeBox(b, V)); });
      (spec.signs || []).forEach(function (s) { group.add(makeSign(s, V)); });

      // bounds (for the viewer to frame the camera)
      var bb = new THREE.Box3().setFromObject(group);
      var size = new THREE.Vector3(), center = new THREE.Vector3();
      bb.getSize(size); bb.getCenter(center);
      return { group: group, size: size, center: center };
    }
  };
})();
