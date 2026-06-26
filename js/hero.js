/* =========================================================================
   hero.js - the signature: a real spring-mass-damper, integrated live with
   RK4, drawn as a coil + dashpot + mass beside a streaming y(t) trace.
   Reads regime buttons in .hero__stagebar .seg.
   ========================================================================= */
(function () {
  "use strict";
  var cv = document.getElementById("hero-canvas");
  if (!cv || !window.MSD) return;
  var ctx = cv.getContext("2d");

  var REGIMES = {
    undamped:   { c: 0,  label: "Undamped",   color: "#BC5B3C" },
    under:      { c: 2,  label: "Underdamped", color: "#C2913B" },
    critical:   { c: 8,  label: "Critical",   color: "#6E7E5E" },
    over:       { c: 10, label: "Overdamped", color: "#4F6D7A" }
  };
  var m = 1, k = 16, dt = 1 / 120;
  var state, t, cycleT, current = "under", trace = [];
  var W, H, dpr;

  function reset() { state = [1, 0]; t = 0; cycleT = 0; trace = []; }
  reset();

  function size() {
    var cssW = cv.clientWidth || cv.parentElement.clientWidth || 640;
    var cssH = Math.round(cssW * 0.62);
    dpr = window.devicePixelRatio || 1;
    cv.style.height = cssH + "px";
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = cssW; H = cssH;
  }
  window.addEventListener("resize", size); size();

  function step() {
    var reg = REGIMES[current];
    var f = window.MSD.freeMSD(m, reg.c, k);
    // advance a few sub-steps per frame for smoothness
    for (var i = 0; i < 2; i++) { state = window.MSD.rk4Step(f, t, state, dt); t += dt; cycleT += dt; }
    trace.push(state[0]); if (trace.length > 520) trace.shift();
    // restart damped cases once settled to keep it alive
    var settled = Math.abs(state[0]) < 0.012 && Math.abs(state[1]) < 0.05;
    if ((reg.c > 0 && settled && cycleT > 1.2) || cycleT > 16) reset();
  }

  function draw() {
    var reg = REGIMES[current];
    ctx.clearRect(0, 0, W, H);

    // layout: left mechanical panel (~42%), right trace panel
    var splitX = Math.round(W * 0.42);

    /* ---------- mechanical panel ---------- */
    var cx = splitX * 0.5;
    var ceilY = 30, restY = H * 0.5, scale = (H * 0.26); // px per unit displacement
    var massY = restY + state[0] * scale;

    // ceiling
    ctx.fillStyle = "#EFE7D6"; ctx.fillRect(cx - 52, ceilY - 14, 104, 12);
    ctx.strokeStyle = "#E2D7C2"; ctx.lineWidth = 1;
    for (var hx = -52; hx < 52; hx += 9) {
      ctx.beginPath(); ctx.moveTo(cx + hx, ceilY - 14); ctx.lineTo(cx + hx + 9, ceilY - 2); ctx.stroke();
    }
    ctx.strokeStyle = "#C9BBA0"; ctx.beginPath(); ctx.moveTo(cx - 54, ceilY - 2); ctx.lineTo(cx + 54, ceilY - 2); ctx.stroke();

    // spring coil (left of centre) and dashpot (right of centre)
    var topY = ceilY - 2, springX = cx - 22, dashX = cx + 22;
    drawSpring(springX, topY, massY - 26, 9, 14);
    drawDashpot(dashX, topY, massY - 26, reg.c);

    // connector to mass
    ctx.strokeStyle = "#897F6C"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(springX, massY - 26); ctx.lineTo(springX, massY - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(dashX, massY - 26); ctx.lineTo(dashX, massY - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(springX, massY - 6); ctx.lineTo(dashX, massY - 6); ctx.stroke();

    // equilibrium guide
    ctx.setLineDash([4, 5]); ctx.strokeStyle = "#C9BBA0"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, restY); ctx.lineTo(splitX - 8, restY); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#897F6C"; ctx.font = '10px "IBM Plex Mono", monospace'; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText("rest", 10, restY - 3);

    // the mass
    var mw = 46, mh = 30, mx = cx - mw / 2, my = massY - 6;
    roundRect(mx, my, mw, mh, 7);
    var g = ctx.createLinearGradient(mx, my, mx, my + mh);
    g.addColorStop(0, "#C76B4C"); g.addColorStop(1, reg.color); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "rgba(43,38,32,.25)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#FCFAF4"; ctx.font = '600 15px "Fraunces", serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("m", cx, my + mh / 2 + 1);

    /* ---------- trace panel ---------- */
    var px = splitX + 14, pw = W - px - 14, py = 22, ph = H - 52;
    ctx.strokeStyle = "#E2D7C2"; ctx.lineWidth = 1; ctx.strokeRect(px, py, pw, ph);
    // zero line
    var zy = py + ph / 2;
    ctx.setLineDash([4, 5]); ctx.strokeStyle = "#ECE3D2"; ctx.beginPath(); ctx.moveTo(px, zy); ctx.lineTo(px + pw, zy); ctx.stroke(); ctx.setLineDash([]);
    // trace
    if (trace.length > 1) {
      ctx.beginPath(); ctx.lineWidth = 2.4; ctx.strokeStyle = reg.color; ctx.lineJoin = "round";
      for (var i = 0; i < trace.length; i++) {
        var X = px + (i / 519) * pw;
        var Y = zy - trace[i] * (ph * 0.42);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();
      var lx = px + ((trace.length - 1) / 519) * pw, ly = zy - trace[trace.length - 1] * (ph * 0.42);
      ctx.fillStyle = reg.color; ctx.beginPath(); ctx.arc(lx, ly, 3.6, 0, 7); ctx.fill();
    }
    ctx.fillStyle = "#897F6C"; ctx.font = '11px "IBM Plex Mono", monospace'; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText("position over time", px + 6, py + 6);
    ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText("time \u2192", px + pw - 6, py + ph - 6);

    function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  }

  function drawSpring(x, y1, y2, amp, coils) {
    ctx.strokeStyle = "#6E7E5E"; ctx.lineWidth = 2.4; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(x, y1);
    var lead = 10, span = (y2 - y1) - 2 * lead, seg = span / coils;
    ctx.lineTo(x, y1 + lead);
    for (var i = 0; i < coils; i++) {
      var yy = y1 + lead + i * seg;
      ctx.lineTo(x + (i % 2 ? -amp : amp), yy + seg * 0.5);
      ctx.lineTo(x, yy + seg);
    }
    ctx.lineTo(x, y2); ctx.stroke();
  }

  function drawDashpot(x, y1, y2, c) {
    // cylinder + piston; piston depth hints at damping strength
    ctx.strokeStyle = "#897F6C"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y1 + 18); ctx.stroke();
    var cyW = 16, cyTop = y1 + 18, cyBot = y2 - 6;
    ctx.fillStyle = "#F1EADD"; ctx.strokeStyle = "#C9BBA0"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.rect(x - cyW / 2, cyTop, cyW, cyBot - cyTop); ctx.fill(); ctx.stroke();
    // fluid level shaded by c
    var fill = Math.min(1, 0.25 + c / 14);
    ctx.fillStyle = "rgba(110,126,94,.30)";
    ctx.fillRect(x - cyW / 2 + 1, cyBot - (cyBot - cyTop) * fill, cyW - 2, (cyBot - cyTop) * fill);
    // piston
    var pistonY = cyTop + (cyBot - cyTop) * 0.35;
    ctx.strokeStyle = "#6E7E5E"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - cyW / 2 + 2, pistonY); ctx.lineTo(x + cyW / 2 - 2, pistonY); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, pistonY); ctx.lineTo(x, y2); ctx.stroke();
  }

  function loop() { step(); draw(); requestAnimationFrame(loop); }
  // honor reduced motion: draw a single settled frame instead of animating
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (var s = 0; s < 400; s++) step(); draw();
  } else { requestAnimationFrame(loop); }

  // regime buttons
  var seg = document.querySelector(".hero__stagebar .seg");
  if (seg) {
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      current = b.dataset.regime; reset();
      seg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    });
  }
})();
