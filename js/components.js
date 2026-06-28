(function () {
  "use strict";

  // Brand mark: a stylised decaying oscillation inside a ring - the project's signature.
  var MARK =
    '<svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">' +
    '<circle cx="20" cy="20" r="18.5" fill="none" stroke="#BC5B3C" stroke-width="1.6"/>' +
    '<path d="M5 20 C8 9, 11 9, 13 20 S18 30, 20 20 S24 13, 25.5 20 S28.5 24, 30 20 L35 20" ' +
    'fill="none" stroke="#6E7E5E" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="35" cy="20" r="2.4" fill="#C2913B"/></svg>';

  // Navigation model. Items with `children` become dropdowns.
  var NAV = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "model", label: "Model", href: "model.html", children: [
      { label: "Overview", href: "model.html#overview" },
      { label: "Deriving the equation", href: "model.html#derivation" },
      { label: "Comparison with the paper", href: "model.html#comparison" },
      { label: "Damping regimes", href: "model.html#regimes" }
    ]},
    { id: "analysis", label: "Analysis", href: "analysis.html", children: [
      { label: "The four cases", href: "analysis.html#cases" },
      { label: "Replication of the paper", href: "analysis.html#replication" },
      { label: "Sensitivity analysis (time)", href: "analysis.html#lab" },
      { label: "Phase plane", href: "analysis.html#phase" },
      { label: "Sensitivity analysis (phase)", href: "analysis.html#lab-phase" }
    ]},
    { id: "creative", label: "Creative", href: "creative.html" },
    { id: "future", label: "What's Next", href: "future.html" },
    { id: "about", label: "About", href: "team.html", children: [
      { label: "The team", href: "team.html#team" },
      { label: "Contact", href: "team.html#contact" }
    ]},
    { id: "resources", label: "Resources", href: "resources.html"}
  ];

  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }

  function buildNav() {
    var page = document.body.getAttribute("data-page") || "home";
    var items = NAV.map(function (item) {
      var current = item.id === page ? ' aria-current="page"' : "";
      if (item.children) {
        var subs = item.children.map(function (c) {
          return '<li><a href="' + c.href + '">' + c.label + '</a></li>';
        }).join("");
        return '<li>' +
          '<button class="menu__btn" aria-expanded="false" aria-haspopup="true"' + current + '>' +
            item.label + '<i class="caret"></i></button>' +
          '<ul class="submenu">' + subs + '</ul></li>';
      }
      return '<li><a href="' + item.href + '"' + current + '>' + item.label + '</a></li>';
    }).join("");

    var nav = el(
      '<header class="nav">' +
        '<div class="nav__inner">' +
          '<a class="brand" href="index.html">' + MARK +
            '<span><span class="brand__name">Wronskian Geniuses</span>' +
          '<nav aria-label="Primary"><ul class="menu">' + items + '</ul></nav>' +
          '<button class="hamburger" aria-label="Menu" aria-expanded="false"><span></span></button>' +
        '</div>' +
      '</header>'
    );
    document.body.insertAdjacentElement("afterbegin", nav);
    document.body.insertAdjacentElement("afterbegin", el('<a class="skip" href="#main">Skip to content</a>'));
    wireNav(nav);
  }

  function wireNav(nav) {
    var burger = nav.querySelector(".hamburger");
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    var btns = nav.querySelectorAll(".menu__btn");
    var mobile = function () { return window.matchMedia("(max-width:980px)").matches; };

    btns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = btn.getAttribute("aria-expanded") === "true";
        btns.forEach(function (b) { if (b !== btn) b.setAttribute("aria-expanded", "false"); });
        btn.setAttribute("aria-expanded", open ? "false" : "true");
      });
      // hover on desktop
      var li = btn.parentElement;
      li.addEventListener("mouseenter", function () { if (!mobile()) btn.setAttribute("aria-expanded", "true"); });
      li.addEventListener("mouseleave", function () { if (!mobile()) btn.setAttribute("aria-expanded", "false"); });
    });

    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) btns.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { btns.forEach(function (b) { b.setAttribute("aria-expanded", "false"); }); nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  function buildFooter() {
    var foot = el(
      '<footer class="foot">' +
        '<div class="foot__top">' +
          '<div class="foot__brand">' +
            '<a class="brand" href="index.html" style="color:#fff">' + MARK +
              '<span class="brand__name" style="color:#fff">Wronskian Geniuses</span></a>' +
            '<p style="margin-top:.8rem">A differential equations project on a mass-spring-damper system</p>' +
          '</div>' +
          '<div><h5>Explore</h5><ul>' +
            '<li><a href="model.html">The model</a></li>' +
            '<li><a href="analysis.html">Analysis</a></li>' +
            '<li><a href="analysis.html#lab">Sensitivity analysis</a></li>' +
            '<li><a href="analysis.html#replication">Replication</a></li>' +
            '<li><a href="future.html">What\'s next</a></li>' +
            '<li><a href="creative.html">Creative</a></li>' +
          '</ul></div>' +
          '<div><h5>Project</h5><ul>' +
            '<li><a href="team.html">The team</a></li>' +
            '<li><a href="team.html#contact">Contact</a></li>' +
            '<li><a href="resources.html">Resources</a></li>' +
          '</ul></div>' +
          '<div><h5>Sources</h5><ul>' +
            '<li><a href="resources.html#paper">Original paper</a></li>' +
            '<li><a href="https://github.com/MaNOk06/Applied-Programming-Submission-1" target="_blank" rel="noopener">Project code \u2197</a></li>' +
            '<li><a href="resources.html">All sources</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="foot__bar">' +
          '<span> Differential Equations & Numerical Methods \u00B7 Ashesi University</span>' +
          '<span>June 2026</span>' +
        '</div>' +
      '</footer>'
    );
    document.body.appendChild(foot);
  }

  function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  function loadMathJax() {
    window.MathJax = {
      tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["$$", "$$"]] },
      svg: { fontCache: "global" },
      options: { renderActions: { addMenu: [] } }
    };
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    s.async = true; document.head.appendChild(s);
  }

  function init() { buildNav(); buildFooter(); reveals(); loadMathJax(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
