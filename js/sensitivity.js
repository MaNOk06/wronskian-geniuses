/* sensitivity.js - the live parameter Lab. Everything recomputes with RK4
   as the sliders move. One canvas, one chart, reconfigured per view. */
(function () {
  "use strict";
  if (!window.MSD || !window.Plot) return;
  var canvas = document.getElementById("lab-canvas");
  if (!canvas) return;

  var T = 20, dt = 0.01, view = "time", sweep = false;
  var chart = new window.Plot.Chart(canvas, { xlabel: "time (seconds)", ylabel: "position", aspect: 0.56, legend: false });

  var ids = ["m", "c", "k", "y0", "v0"];
  function get(id) { return parseFloat(document.getElementById("s-" + id).value); }
  function setVal(id, v) { document.getElementById("v-" + id).textContent = v.toFixed(id === "c" ? 2 : 1); }

  function shade(c) {
    var ramp = ["#E8C9B6", "#E0B79C", "#D6A079", "#B79A6E", "#94A07E", "#6E7E5E", "#4F6D7A"];
    return ramp[Math.min(ramp.length - 1, Math.round(c / 10 * (ramp.length - 1)))];
  }

  function update(animate) {
    var m = get("m"), c = get("c"), k = get("k"), y0 = get("y0"), v0 = get("v0");
    ids.forEach(function (id) { setVal(id, get(id)); });

    var d = window.MSD.describe(m, c, k);
    var pill = document.getElementById("r-regime");
    pill.textContent = d.regime; pill.style.background = d.color;
    document.getElementById("r-zeta").textContent = d.zeta.toFixed(3);
    document.getElementById("r-w0").textContent = d.w0.toFixed(2);
    document.getElementById("r-wd").textContent = d.wd > 0 ? d.wd.toFixed(2) : "\u2014";
    document.getElementById("r-ccrit").textContent = d.cCrit.toFixed(2);

    var sol = window.MSD.integrate(window.MSD.freeMSD(m, c, k), [y0, v0], 0, T, dt);
    var series = [];

    if (view === "time") {
      chart.xlabel = "time (seconds)"; chart.ylabel = "position"; chart.equalAspect = false;
      if (sweep) [0, 1, 2, 4, 6, 8, 10].forEach(function (cc) {
        var s = window.MSD.integrate(window.MSD.freeMSD(m, cc, k), [y0, v0], 0, T, dt);
        series.push({ color: shade(cc), width: 1.5, pts: s.y.map(function (r, i) { return [s.t[i], r[0]]; }) });
      });
      series.push({ color: d.color, width: 2.6, pts: sol.y.map(function (r, i) { return [sol.t[i], r[0]]; }) });
      var ymax = Math.max(1, Math.abs(y0), Math.abs(v0) / d.w0) * 1.12;
      chart.setData(series, [0, T], [-ymax, ymax]);
    } else {
      chart.xlabel = "position"; chart.ylabel = "speed"; chart.equalAspect = true;
      if (sweep) [0, 2, 4, 6, 8, 10].forEach(function (cc) {
        var s = window.MSD.integrate(window.MSD.freeMSD(m, cc, k), [y0, v0], 0, T, dt);
        series.push({ color: shade(cc), width: 1.4, pts: s.y.map(function (r) { return [r[0], r[1]]; }) });
      });
      series.push({ color: d.color, width: 2.4, pts: sol.y.map(function (r) { return [r[0], r[1]]; }) });
      chart.setData(series);
    }
    animate ? chart.animate(700) : chart.draw(1);
  }

  ids.forEach(function (id) {
    document.getElementById("s-" + id).addEventListener("input", function () { update(false); });
  });

  var viewSeg = document.getElementById("lab-view");
  if (viewSeg) viewSeg.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    view = b.dataset.view;
    viewSeg.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    update(true);
  });

  var sw = document.getElementById("s-sweep");
  if (sw) sw.addEventListener("change", function () { sweep = sw.checked; update(true); });

  var resetBtn = document.getElementById("lab-reset");
  if (resetBtn) resetBtn.addEventListener("click", function () {
    var def = { m: 1, c: 2, k: 16, y0: 1, v0: 0 };
    ids.forEach(function (id) { document.getElementById("s-" + id).value = def[id]; });
    sweep = false; var swEl = document.getElementById("s-sweep"); if (swEl) swEl.checked = false;
    update(true);
  });

  update(true);
})();
