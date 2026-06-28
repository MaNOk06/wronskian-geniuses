/* future.js - vehicle suspension demo. A car corner is a mass-spring-damper:
   after hitting a bump the body is displaced and settles. We vary the shock
   absorber (damping) and report the ride feel via the damping ratio. */
(function () {
  "use strict";
  if (!window.MSD || !window.Plot) return;
  var canvas = document.getElementById("fc-canvas");
  if (!canvas) return;

  var m = 1, k = 16, T = 20, dt = 0.01, bump = 1; // normalised car corner
  var chart = new window.Plot.Chart(canvas, { xlabel: "time  t  (s)", ylabel: "car body displacement", aspect: 0.5, legend: false });

  function feel(zeta) {
    if (zeta < 0.15) return ["Very bouncy, like worn-out shock absorbers", "#BC5B3C"];
    if (zeta < 0.5)  return ["Comfortable and controlled, the usual target", "#6E7E5E"];
    if (zeta < 1)    return ["Firm and sporty", "#C2913B"];
    return ["Harsh and sluggish, over-damped", "#4F6D7A"];
  }

  function update(animate) {
    var c = parseFloat(document.getElementById("fc-c").value);
    document.getElementById("fc-v-c").textContent = c.toFixed(1);
    var d = window.MSD.describe(m, c, k);
    var f = feel(d.zeta);
    var pill = document.getElementById("fc-feel");
    pill.textContent = f[0]; pill.style.background = f[1];
    document.getElementById("fc-zeta").textContent = d.zeta.toFixed(2);
    document.getElementById("fc-regime").textContent = d.regime;

    var sol = window.MSD.integrate(window.MSD.freeMSD(m, c, k), [bump, 0], 0, T, dt);
    chart.setData([{ color: f[1], width: 2.6, pts: sol.y.map(function (r, i) { return [sol.t[i], r[0]]; }) }],
                  [0, T], [-1.05, 1.05]);
    animate ? chart.animate(800) : chart.draw(1);
  }

  document.getElementById("fc-c").addEventListener("input", function () { update(false); });
  var rb = document.getElementById("fc-reset");
  if (rb) rb.addEventListener("click", function () { document.getElementById("fc-c").value = 2.4; update(true); });
  update(true);
})();
