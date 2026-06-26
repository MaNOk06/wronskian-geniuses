/* cases.js - the four canonical damping cases (m=1, k=16; c = 0,2,8,10),
   y(0)=1, y'(0)=0 over [0,20]. Replicates the figures in the report/paper. */
(function () {
  "use strict";
  if (!window.MSD || !window.Plot) return;
  var m = 1, k = 16, T = 20, dt = 0.01;
  var cases = [
    { c: 0,  label: "No resistance",   color: "#BC5B3C" },
    { c: 2,  label: "Light",           color: "#C2913B" },
    { c: 8,  label: "Just enough",     color: "#6E7E5E" },
    { c: 10, label: "Heavy",           color: "#4F6D7A" }
  ];

  var solved = cases.map(function (cs) {
    var sol = window.MSD.integrate(window.MSD.freeMSD(m, cs.c, k), [1, 0], 0, T, dt);
    return { cs: cs, sol: sol };
  });

  var cmp = document.getElementById("cmp-canvas");
  if (cmp) {
    var chart = new window.Plot.Chart(cmp, { xlabel: "time (seconds)", ylabel: "position", aspect: 0.5 });
    var series = solved.map(function (o) {
      return { label: o.cs.label, color: o.cs.color, width: o.cs.c === 0 ? 1.8 : 2.4,
        pts: o.sol.t.map(function (t, i) { return [t, o.sol.y[i][0]]; }) };
    });
    chart.setData(series, [0, T], [-1.05, 1.05]);
    onView(cmp, function () { chart.animate(1100); });
  }

  var ph = document.getElementById("cmp-phase");
  if (ph) {
    var pchart = new window.Plot.Chart(ph, { xlabel: "position", ylabel: "speed", aspect: 0.62, equalAspect: true });
    var pseries = solved.map(function (o) {
      return { label: o.cs.label, color: o.cs.color, width: o.cs.c === 0 ? 1.8 : 2.2,
        pts: o.sol.y.map(function (r) { return [r[0], r[1]]; }) };
    });
    pchart.setData(pseries);
    onView(ph, function () { pchart.animate(1200); });
  }

  function onView(node, cb) {
    if (!("IntersectionObserver" in window)) { cb(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { cb(); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    io.observe(node);
  }
})();
