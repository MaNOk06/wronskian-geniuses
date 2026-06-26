/* =========================================================================
   solver.js - the numerical heart of the site.
   A small, exact RK4 integrator for first-order vector systems, plus the
   physical systems we study. No external dependencies.
   ========================================================================= */
window.MSD = (function () {
  "use strict";

  /* Classic 4th-order Runge-Kutta step for y' = f(t, y), y a number[] */
  function rk4Step(f, t, y, h) {
    var n = y.length, i;
    var k1 = f(t, y);
    var y2 = new Array(n); for (i = 0; i < n; i++) y2[i] = y[i] + 0.5 * h * k1[i];
    var k2 = f(t + 0.5 * h, y2);
    var y3 = new Array(n); for (i = 0; i < n; i++) y3[i] = y[i] + 0.5 * h * k2[i];
    var k3 = f(t + 0.5 * h, y3);
    var y4 = new Array(n); for (i = 0; i < n; i++) y4[i] = y[i] + h * k3[i];
    var k4 = f(t + h, y4);
    var out = new Array(n);
    for (i = 0; i < n; i++) out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    return out;
  }

  /* Integrate over [t0,t1]. Returns {t:[], y:[[...]]} where y[i] is the state at t[i]. */
  function integrate(f, y0, t0, t1, dt) {
    var t = [t0], y = [y0.slice()], cur = y0.slice(), tc = t0;
    var steps = Math.max(1, Math.ceil((t1 - t0) / dt));
    for (var s = 0; s < steps; s++) {
      cur = rk4Step(f, tc, cur, dt); tc += dt;
      t.push(tc); y.push(cur);
    }
    return { t: t, y: y };
  }

  /* Pull one state component into a flat series, e.g. column(sol,0) = displacement */
  function column(sol, idx) { return sol.y.map(function (row) { return row[idx]; }); }

  /* ---- 1-DOF free oscillator:  m y'' + c y' + k y = 0  ---- */
  function freeMSD(m, c, k) {
    return function (t, y) { return [y[1], (-c * y[1] - k * y[0]) / m]; };
  }

  /* ---- 1-DOF forced:  m y'' + c y' + k y = F0 cos(W t)  ---- */
  function forcedMSD(m, c, k, F0, W) {
    return function (t, y) { return [y[1], (F0 * Math.cos(W * t) - c * y[1] - k * y[0]) / m]; };
  }

  /* ---- 2-DOF tuned mass damper ----
     Primary (m1,k1,c1) driven by F0 cos(Wt); absorber (m2,k2,c2) attached to it.
     state = [x1, v1, x2, v2] */
  function tmd(m1, k1, c1, m2, k2, c2, F0, W) {
    return function (t, y) {
      var x1 = y[0], v1 = y[1], x2 = y[2], v2 = y[3];
      var a1 = (F0 * Math.cos(W * t) - c1 * v1 - k1 * x1 - k2 * (x1 - x2) - c2 * (v1 - v2)) / m1;
      var a2 = (-k2 * (x2 - x1) - c2 * (v2 - v1)) / m2;
      return [v1, a1, v2, a2];
    };
  }

  /* ---- analytic descriptors ---- */
  function describe(m, c, k) {
    var disc = c * c - 4 * m * k;            // c^2 - 4mk
    var w0 = Math.sqrt(k / m);               // natural frequency
    var zeta = c / (2 * Math.sqrt(m * k));   // damping ratio
    var regime, color;
    if (Math.abs(disc) < 1e-9) { regime = "Just enough"; color = "#6E7E5E"; }
    else if (disc > 0)         { regime = "Heavy resistance"; color = "#4F6D7A"; }
    else                       { regime = (c === 0 ? "No resistance" : "Light resistance"); color = (c === 0 ? "#BC5B3C" : "#C2913B"); }
    var wd = disc < 0 ? Math.sqrt(4 * m * k - c * c) / (2 * m) : 0; // damped freq
    var cCrit = 2 * Math.sqrt(m * k);
    return { disc: disc, w0: w0, zeta: zeta, wd: wd, cCrit: cCrit, regime: regime, color: color };
  }

  /* steady-state amplitude of forced 1-DOF oscillator (for resonance curve) */
  function forcedAmplitude(m, c, k, F0, W) {
    var denom = Math.sqrt(Math.pow(k - m * W * W, 2) + Math.pow(c * W, 2));
    return F0 / denom;
  }

  return {
    rk4Step: rk4Step, integrate: integrate, column: column,
    freeMSD: freeMSD, forcedMSD: forcedMSD, tmd: tmd,
    describe: describe, forcedAmplitude: forcedAmplitude
  };
})();
