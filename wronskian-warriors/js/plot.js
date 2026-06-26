/* =========================================================================
   plot.js - a tiny, dependency-free canvas charting helper tuned to the
   warm-earthy palette. Supports time-series (multi-line), animated sweep
   draw, and phase-plane plots. Crisp on HiDPI; redraws on resize.
   ========================================================================= */
window.Plot = (function () {
  "use strict";

  var INK = "#2B2620", MUTED = "#897F6C", LINE = "#E2D7C2", SOFT = "#ECE3D2", PAPER = "#FCFAF4";

  function Chart(canvas, opts) {
    this.cv = typeof canvas === "string" ? document.getElementById(canvas) : canvas;
    this.ctx = this.cv.getContext("2d");
    opts = opts || {};
    this.pad = Object.assign({ l: 52, r: 16, t: 16, b: 40 }, opts.pad || {});
    this.xlabel = opts.xlabel || ""; this.ylabel = opts.ylabel || "";
    this.aspect = opts.aspect || 0.52;       // height / width
    this.series = []; this.xr = null; this.yr = null;
    this.legend = opts.legend !== false;
    this.equalAspect = !!opts.equalAspect;   // for phase planes
    this._raf = null;
    var self = this;
    this._resize = function () { self.resize(); };
    window.addEventListener("resize", this._resize);
    this.resize();
  }

  Chart.prototype.resize = function () {
    var cssW = this.cv.clientWidth || this.cv.parentElement.clientWidth || 600;
    var cssH = Math.round(cssW * this.aspect);
    var dpr = window.devicePixelRatio || 1;
    this.cv.style.height = cssH + "px";
    this.cv.width = Math.round(cssW * dpr);
    this.cv.height = Math.round(cssH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = cssW; this.H = cssH;
    this.draw();
  };

  Chart.prototype.setData = function (series, xr, yr) {
    this.series = series || [];
    this.xr = xr || this._auto(0);
    this.yr = yr || this._auto(1);
    return this;
  };

  Chart.prototype._auto = function (axis) {
    var lo = Infinity, hi = -Infinity;
    this.series.forEach(function (s) {
      (s.pts || []).forEach(function (p) { var v = p[axis]; if (v < lo) lo = v; if (v > hi) hi = v; });
    });
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    if (lo === hi) { lo -= 1; hi += 1; }
    var pad = (hi - lo) * 0.08; return [lo - pad, hi + pad];
  };

  Chart.prototype._sx = function (x) { var p = this.pad, r = this._xr || this.xr; return p.l + (x - r[0]) / (r[1] - r[0]) * (this.W - p.l - p.r); };
  Chart.prototype._sy = function (y) { var p = this.pad, r = this._yr || this.yr; return p.t + (1 - (y - r[0]) / (r[1] - r[0])) * (this.H - p.t - p.b); };

  Chart.prototype._ticks = function (lo, hi, n) {
    var span = hi - lo, raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag, step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    var out = [], start = Math.ceil(lo / step) * step;
    for (var v = start; v <= hi + step * 0.001; v += step) out.push(Math.abs(v) < step / 1e6 ? 0 : v);
    return out;
  };

  Chart.prototype.draw = function (progress) {
    var ctx = this.ctx, p = this.pad, W = this.W, H = this.H;
    progress = progress == null ? 1 : progress;
    ctx.clearRect(0, 0, W, H);
    if (!this.xr || !this.yr) return;
    this._xr = this.xr.slice(); this._yr = this.yr.slice();
    if (this.equalAspect) this._fixAspect();

    var plotW = W - p.l - p.r, plotH = H - p.t - p.b;

    // grid
    var xt = this._ticks(this._xr[0], this._xr[1], 7), yt = this._ticks(this._yr[0], this._yr[1], 5);
    ctx.lineWidth = 1; ctx.font = '11px "IBM Plex Mono", monospace'; ctx.fillStyle = MUTED;
    yt.forEach(function (v) {
      var y = this._sy(v);
      ctx.strokeStyle = Math.abs(v) < 1e-9 ? LINE : SOFT;
      ctx.beginPath(); ctx.moveTo(p.l, y); ctx.lineTo(p.l + plotW, y); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(fmt(v), p.l - 8, y);
    }, this);
    xt.forEach(function (v) {
      var x = this._sx(v);
      ctx.strokeStyle = SOFT; ctx.beginPath(); ctx.moveTo(x, p.t); ctx.lineTo(x, p.t + plotH); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = MUTED;
      ctx.fillText(fmt(v), x, p.t + plotH + 7);
    }, this);

    // frame
    ctx.strokeStyle = LINE; ctx.lineWidth = 1.2; ctx.strokeRect(p.l, p.t, plotW, plotH);

    // axis labels
    ctx.fillStyle = MUTED; ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText(this.xlabel, p.l + plotW / 2, H - 4);
    ctx.save(); ctx.translate(13, p.t + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = "top"; ctx.fillText(this.ylabel, 0, 0); ctx.restore();

    // clip to plot area
    ctx.save(); ctx.beginPath(); ctx.rect(p.l, p.t, plotW, plotH); ctx.clip();

    this.series.forEach(function (s) {
      var pts = s.pts; if (!pts || pts.length < 2) return;
      var n = Math.max(2, Math.floor(pts.length * progress));
      ctx.beginPath();
      ctx.lineWidth = s.width || 2.2; ctx.strokeStyle = s.color || INK;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      if (s.dash) ctx.setLineDash(s.dash); else ctx.setLineDash([]);
      for (var i = 0; i < n; i++) {
        var X = this._sx(pts[i][0]), Y = this._sy(pts[i][1]);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke(); ctx.setLineDash([]);
      // moving head dot during animation
      if (progress < 1 && n > 1) {
        var hx = this._sx(pts[n - 1][0]), hy = this._sy(pts[n - 1][1]);
        ctx.fillStyle = s.color || INK; ctx.beginPath(); ctx.arc(hx, hy, 3.4, 0, 7); ctx.fill();
      }
    }, this);
    ctx.restore();

    if (this.legend) this._drawLegend();
  };

  Chart.prototype._drawLegend = function () {
    var named = this.series.filter(function (s) { return s.label; });
    if (!named.length) return;
    var ctx = this.ctx, p = this.pad;
    ctx.font = '12px "IBM Plex Mono", monospace'; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    var lineH = 18, boxW = 0;
    named.forEach(function (s) { boxW = Math.max(boxW, ctx.measureText(s.label).width + 26); });
    var x = p.l + 12, y0 = p.t + 12;
    ctx.fillStyle = "rgba(252,250,244,.86)"; ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    roundRect(ctx, x - 8, y0 - 10, boxW + 16, named.length * lineH + 6, 8); ctx.fill(); ctx.stroke();
    named.forEach(function (s, i) {
      var y = y0 + i * lineH;
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2.4;
      if (s.dash) ctx.setLineDash(s.dash); else ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = INK; ctx.fillText(s.label, x + 22, y);
    });
  };

  Chart.prototype._fixAspect = function () {
    // keep x and y units visually proportional (phase plane) - derived, not persisted
    var p = this.pad, plotW = this.W - p.l - p.r, plotH = this.H - p.t - p.b;
    var xs = (this.xr[1] - this.xr[0]) / plotW, ys = (this.yr[1] - this.yr[0]) / plotH;
    var s = Math.max(xs, ys);
    var cx = (this.xr[0] + this.xr[1]) / 2, cy = (this.yr[0] + this.yr[1]) / 2;
    this._xr = [cx - s * plotW / 2, cx + s * plotW / 2];
    this._yr = [cy - s * plotH / 2, cy + s * plotH / 2];
  };

  Chart.prototype.animate = function (ms) {
    var self = this, t0 = null;
    if (this._raf) cancelAnimationFrame(this._raf);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { this.draw(1); return; }
    function frame(ts) {
      if (t0 == null) t0 = ts;
      var pr = Math.min(1, (ts - t0) / (ms || 900));
      self.draw(easeOut(pr));
      if (pr < 1) self._raf = requestAnimationFrame(frame);
    }
    this._raf = requestAnimationFrame(frame);
  };

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function fmt(v) {
    if (v === 0) return "0";
    var a = Math.abs(v);
    if (a >= 1000 || a < 0.01) return v.toExponential(0);
    return (Math.round(v * 1000) / 1000).toString();
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  return { Chart: Chart };
})();
