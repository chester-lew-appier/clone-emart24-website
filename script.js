/* emart24 prototype — nav, hero rotator, food tabs, locations filter. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ------------------------------------------------------------- header -- */

  var header = document.querySelector(".site-header");
  var rail = document.querySelector(".side-rail");
  var toTop = document.querySelector(".to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 90);
    if (toTop) toTop.classList.toggle("is-shown", y > 700);

    // swap the rail to dark icons once it leaves the hero photography
    if (rail) {
      var hero = document.querySelector(".hero");
      var limit = hero ? hero.offsetHeight - window.innerHeight / 2 : 0;
      rail.classList.toggle("on-light", y > limit);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* --------------------------------------------------------- mobile nav -- */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  function isMobileNav() {
    return window.matchMedia("(max-width: 860px)").matches;
  }

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.hidden = !open;
  }

  function syncNav() {
    if (!nav) return;
    if (isMobileNav()) setNav(false);
    else {
      nav.hidden = false;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobileNav()) setNav(false);
    });
  }

  window.addEventListener("resize", syncNav);
  syncNav();

  /* ------------------------------------------------------ hero rotator -- */

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dotWrap = document.querySelector(".hero-dots");

  if (slides.length > 1 && dotWrap) {
    var current = 0;
    var timer = null;

    var dots = slides.map(function (_, i) {
      var b = el("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Show banner " + (i + 1));
      b.addEventListener("click", function () {
        show(i);
        rest();
      });
      dotWrap.appendChild(b);
      return b;
    });

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === current); });
      dots.forEach(function (d, k) { d.setAttribute("aria-selected", String(k === current)); });
    }

    function rest() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1); }, 6000);
    }

    show(0);
    rest();
  }

  /* --------------------------------------------------------- food page --- */

  var foodRoot = document.querySelector("[data-food]");

  if (foodRoot && typeof MENU !== "undefined") {
    var LEDE = {
      "ready-to-eat": "Enjoy a quick bite, imbued with Korean flavours, and pair it with our specialty single-origin Brazilian coffee.",
      "street-food": "Dive into our signature Korean street food experience, with innovative flavours, wild spices, and exciting toppings!"
    };
    var LABEL = { "ready-to-eat": "Ready-To-Eat", "street-food": "Street Food" };

    var railEl = foodRoot.querySelector(".food-tabs-rail");
    var panelWrap = foodRoot.querySelector(".food-panels");
    var keys = Object.keys(MENU);

    keys.forEach(function (key) {
      var btn = el("button", null, LABEL[key] || key);
      btn.type = "button";
      btn.id = "tab-" + key;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-controls", "panel-" + key);
      btn.addEventListener("click", function () { selectFood(key); });
      railEl.appendChild(btn);

      var panel = el("section", "food-panel");
      panel.id = "panel-" + key;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "tab-" + key);

      panel.appendChild(el("h2", null, (LABEL[key] || key).toUpperCase()));
      panel.appendChild(el("p", "lede", LEDE[key] || ""));

      MENU[key].forEach(function (cat) {
        var block = el("div", "cat-block");
        var lab = el("div", "cat-label");
        lab.appendChild(el("h3", null, cat.cat));
        block.appendChild(lab);

        var grid = el("div", "prod-grid");
        cat.items.forEach(function (item) {
          var card = el("div", "prod-card");
          var fig = el("figure");
          var thumb = el("div", "thumb");
          var img = el("img");
          img.src = "assets/" + item.img;
          img.alt = item.name;
          img.loading = "lazy";
          img.decoding = "async";
          thumb.appendChild(img);
          fig.appendChild(thumb);
          fig.appendChild(el("figcaption", null, item.name));
          card.appendChild(fig);
          grid.appendChild(card);
        });
        block.appendChild(grid);
        panel.appendChild(block);
      });

      panelWrap.appendChild(panel);
    });

    function selectFood(key) {
      keys.forEach(function (k) {
        var t = document.getElementById("tab-" + k);
        var p = document.getElementById("panel-" + k);
        var on = k === key;
        if (t) t.setAttribute("aria-selected", String(on));
        if (p) p.hidden = !on;
      });
      if (history.replaceState) history.replaceState(null, "", "#" + key);
    }

    var wanted = (location.hash || "").replace("#", "");
    selectFood(keys.indexOf(wanted) > -1 ? wanted : keys[0]);
  }

  /* ---------------------------------------------------- locations page --- */

  var locRoot = document.querySelector("[data-locations]");

  if (locRoot && typeof OUTLETS !== "undefined") {
    var chipWrap = locRoot.querySelector(".chips");
    var grid = locRoot.querySelector(".loc-grid");
    var countEl = locRoot.querySelector(".loc-count");

    var states = OUTLETS.map(function (o) { return o.stateKey; })
      .filter(function (v, i, a) { return v && a.indexOf(v) === i; })
      .sort();

    function card(o) {
      var wrap = el("div", "loc-card");

      var h = el("h3", null, o.name);
      if (o.state) {
        var st = el("span", "loc-state", o.state);
        h.appendChild(st);
      }
      wrap.appendChild(h);

      var box = el("div", "loc-box");

      var r1 = el("div", "loc-row");
      var i1 = el("img");
      i1.src = "assets/icon-address.png";
      i1.alt = "";
      i1.loading = "lazy";
      r1.appendChild(i1);
      var c1 = el("div");
      c1.appendChild(el("p", "loc-title", "Address:"));
      var addr = el("address");
      o.address.forEach(function (line, i) {
        if (i) addr.appendChild(document.createElement("br"));
        addr.appendChild(document.createTextNode(line));
      });
      c1.appendChild(addr);
      r1.appendChild(c1);
      box.appendChild(r1);

      var r2 = el("div", "loc-row");
      var i2 = el("img");
      i2.src = "assets/icon-hours.png";
      i2.alt = "";
      i2.loading = "lazy";
      r2.appendChild(i2);
      var c2 = el("div");
      c2.appendChild(el("p", "loc-title", "Business hours:"));
      c2.appendChild(el("p", "loc-hours", o.hours));
      r2.appendChild(c2);
      box.appendChild(r2);

      if (o.map) {
        var r3 = el("div", "loc-row");
        var i3 = el("img");
        i3.src = "assets/icon-direction.png";
        i3.alt = "";
        i3.loading = "lazy";
        r3.appendChild(i3);
        var a = el("a", "loc-directions", "Get directions >");
        a.href = o.map;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", "Get directions to emart24 " + o.name);
        r3.appendChild(a);
        box.appendChild(r3);
      }

      wrap.appendChild(box);
      return wrap;
    }

    function render(state) {
      var list = state === "All"
        ? OUTLETS
        : OUTLETS.filter(function (o) { return o.stateKey === state; });

      grid.textContent = "";
      if (!list.length) {
        var empty = el("p", "loc-empty", "No outlets listed for this state.");
        grid.appendChild(empty);
      } else {
        list.forEach(function (o) { grid.appendChild(card(o)); });
      }

      if (countEl) {
        countEl.textContent = list.length + (list.length === 1 ? " outlet" : " outlets")
          + (state === "All" ? "" : " in " + state);
      }

      Array.prototype.forEach.call(chipWrap.children, function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.state === state));
      });
    }

    ["All"].concat(states).forEach(function (s) {
      var b = el("button", null, s);
      b.type = "button";
      b.dataset.state = s;
      b.addEventListener("click", function () { render(s); });
      chipWrap.appendChild(b);
    });

    render("All");
  }

  /* -------------------------------------------------------- halal page --- */

  var certList = document.querySelector("[data-certified]");
  if (certList && typeof CERTIFIED !== "undefined") {
    CERTIFIED.forEach(function (name) {
      certList.appendChild(el("li", null, name));
    });
  }

  var newsGrid = document.querySelector("[data-news]");
  if (newsGrid && typeof NEWS !== "undefined") {
    NEWS.forEach(function (n) {
      var a = el("a", "news-card");
      a.href = n.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.appendChild(el("div", "news-source", n.source));
      a.appendChild(el("p", "news-date", n.date));
      a.appendChild(el("h4", null, n.title));
      newsGrid.appendChild(a);
    });
  }

  /* ------------------------------------------- subscribe form (inert) ---- */

  var sub = document.querySelector(".subscribe form");
  if (sub) {
    sub.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = sub.parentNode.querySelector(".footer-note");
      if (note) note.textContent = "Prototype only — this form is not connected to a mailing list.";
    });
  }
})();
