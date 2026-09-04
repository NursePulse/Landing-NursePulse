(function () {
  "use strict";

  function shouldReduceMotion() {
    const motionMode = new URLSearchParams(window.location.search).get(
      "motion",
    );
    return (
      motionMode !== "full" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function shouldUseFullMotionEffects() {
    return new URLSearchParams(window.location.search).get("motion") === "full";
  }

  function initMotionPreference() {
    const motionMode = new URLSearchParams(window.location.search).get(
      "motion",
    );
    document.documentElement.classList.toggle(
      "force-full-motion",
      motionMode === "full",
    );
  }

  function initThemeToggle() {
    const STORAGE_KEY = "nursepulse_theme";
    const themeColorMeta = document.getElementById("themeColorMeta");
    const root = document.documentElement;

    function saveTheme(theme) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
        // Non-critical: the landing remains readable without persistence.
      }
    }

    function applyLightTheme() {
      const theme = "light";
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      saveTheme(theme);

      if (themeColorMeta) {
        themeColorMeta.setAttribute("content", "#0f766e");
      }
    }

    applyLightTheme();
  }

  function initMobileNav() {
    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      const labelKey = isOpen
        ? "accessibility.close-menu"
        : "accessibility.open-menu";
      toggle.setAttribute(
        "aria-label",
        window.i18n?.t(
          labelKey,
          isOpen ? "Close navigation menu" : "Open navigation menu",
        ),
      );
      toggle.classList.toggle("is-open", isOpen);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.classList.remove("is-open");
      });
    });

    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.classList.remove("is-open");
      }
    });
  }

  function initBackToTop() {
    const button = document.getElementById("backToTop");
    if (!button) return;

    let hideTimer;

    function update() {
      const shouldShow = window.scrollY > 700;
      window.clearTimeout(hideTimer);

      if (shouldShow) {
        button.hidden = false;
        requestAnimationFrame(() => button.classList.add("is-visible"));
      } else {
        button.classList.remove("is-visible");
        hideTimer = window.setTimeout(() => {
          if (!button.classList.contains("is-visible")) button.hidden = true;
        }, 250);
      }
    }

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion() ? "auto" : "smooth",
      });
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /*Hero animations*/

  function initHeroAnimations() {
    const prefersReduced = shouldReduceMotion();

    const hero = document.querySelector(".hero");
    if (!hero) return;

    hero.classList.add("hero--ready");

    if (prefersReduced) {
      hero.querySelectorAll("[data-hero-anim]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const items = hero.querySelectorAll("[data-hero-anim]");
    const introDelay = document.querySelector(".page-intro") ? 0.45 : 0;

    items.forEach((el, i) => {
      el.style.animationDelay = `${introDelay + i * 0.12 + 0.2}s`;
      el.classList.add("hero-anim-in");
    });

    const visual = hero.querySelector(".hero-visual");
    if (visual) {
      visual.classList.add("hero-visual--float");
    }
  }

  function initPageIntro() {
    if (shouldReduceMotion()) return;

    const intro = document.createElement("div");
    intro.className = "page-intro";
    intro.setAttribute("aria-hidden", "true");
    intro.innerHTML = `
      <span class="page-intro__grid"></span>
      <span class="page-intro__content">
        <span class="page-intro__mark">
          <i></i>
        </span>
        <strong>NursePulse</strong>
        <span class="page-intro__label">Clinical continuity</span>
        <span class="page-intro__progress"><i></i></span>
      </span>
    `;

    document.documentElement.classList.add("is-intro-playing");
    document.body.prepend(intro);

    let removed = false;

    function removeIntro() {
      if (removed) return;
      removed = true;
      intro.remove();
      document.documentElement.classList.remove("is-intro-playing");
    }

    intro.addEventListener("animationend", (event) => {
      if (event.animationName === "page-intro-shell") removeIntro();
    });
    window.setTimeout(removeIntro, 2200);
  }

  function prepareMotionReveals() {
    const revealGroups = [
      {
        selector: [
          ".product-demo__title",
          ".product-demo__lead",
          ".who-is-it-for > .container > .section-title",
          ".how-it-works > .container > .section-title",
        ].join(","),
        variant: "up",
        step: 70,
      },
      {
        selector: [
          ".value-card",
          ".benefits-stat",
          ".faq-item",
          ".footer-grid > *",
        ].join(","),
        variant: "scale",
        step: 75,
      },
      {
        selector: ".contact-info-card, .contact-map",
        variant: "right",
        step: 90,
      },
      {
        selector: ".testimonials-track-wrap, .testimonials-aggregate",
        variant: "up",
        step: 100,
      },
    ];

    revealGroups.forEach((group) => {
      document.querySelectorAll(group.selector).forEach((element, index) => {
        element.classList.add("reveal-on-scroll");

        if (!element.dataset.revealVariant) {
          element.dataset.revealVariant = group.variant;
        }

        if (!element.dataset.revealDelay) {
          element.dataset.revealDelay = String(
            Math.min(index * group.step, 300),
          );
        }
      });
    });

    document
      .querySelectorAll(
        ".problem-card, .feature-card, .team-card, .audience-card",
      )
      .forEach((element, index) => {
        if (element.dataset.revealVariant) return;

        if (element.matches(".team-card")) {
          element.dataset.revealVariant = "scale";
        } else {
          element.dataset.revealVariant = index % 2 === 0 ? "left" : "right";
        }
      });
  }

  function initScrollProgress() {
    const progress = document.createElement("div");
    progress.className = "page-scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    let ticking = false;

    function update() {
      const scrollable = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const value = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      progress.style.transform = `scaleX(${value})`;
      ticking = false;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    update();
  }

  function initInteractiveSurfaces() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const selector = [
      ".value-card",
      ".problem-card",
      ".audience-card",
      ".feature-card",
      ".benefit-item",
      ".benefits-stat",
      ".pricing-card",
      ".team-card",
      ".team-footer",
      ".testimonial-card",
      ".contact-info-card",
      ".faq-item",
      ".final-cta__panel",
    ].join(",");

    document.querySelectorAll(selector).forEach((surface) => {
      surface.classList.add("motion-surface");

      const glow = document.createElement("span");
      glow.className = "motion-surface__glow";
      glow.setAttribute("aria-hidden", "true");
      surface.appendChild(glow);

      surface.addEventListener("pointermove", (event) => {
        const bounds = surface.getBoundingClientRect();
        surface.style.setProperty(
          "--pointer-x",
          `${event.clientX - bounds.left}px`,
        );
        surface.style.setProperty(
          "--pointer-y",
          `${event.clientY - bounds.top}px`,
        );
        surface.classList.add("is-pointer-active");
      });

      surface.addEventListener("pointerleave", () => {
        surface.classList.remove("is-pointer-active");
      });
    });
  }

  function initMagneticControls() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document
      .querySelectorAll(
        ".btn, .contact-form__submit, .testimonials-nav, .back-to-top",
      )
      .forEach((control) => {
        control.classList.add("motion-control");

        control.addEventListener("pointermove", (event) => {
          const bounds = control.getBoundingClientRect();
          const x = event.clientX - bounds.left - bounds.width / 2;
          const y = event.clientY - bounds.top - bounds.height / 2;

          control.style.setProperty("--magnetic-x", `${x * 0.08}px`);
          control.style.setProperty("--magnetic-y", `${y * 0.08}px`);
        });

        control.addEventListener("pointerleave", () => {
          control.style.setProperty("--magnetic-x", "0px");
          control.style.setProperty("--magnetic-y", "0px");
        });
      });
  }

  function initMotionSystem() {
    document.documentElement.classList.add("motion-enabled");

    if (shouldUseFullMotionEffects()) {
      initPageIntro();
    }

    prepareMotionReveals();
    initScrollProgress();

    if (shouldReduceMotion()) {
      return;
    }

    if (shouldUseFullMotionEffects()) {
      initInteractiveSurfaces();
      initMagneticControls();
    }
  }

  function initScrollReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const prefersReduced = shouldReduceMotion();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || "0", 10);

          if (prefersReduced || delay === 0) {
            el.classList.add("is-visible");
          } else {
            setTimeout(() => el.classList.add("is-visible"), delay);
          }

          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      observer.observe(el);
    });
  }

  /* Hero Stats*/
  function animateCounter(el) {
    const target = parseFloat(el.dataset.counterTarget || el.textContent);
    const suffix = el.dataset.counterSuffix || "";
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll("[data-counter-target]").forEach((el) => {
      observer.observe(el);
    });
  }

  function initVisualSummaryScroll() {
    const summary = document.querySelector(".visual-summary");
    if (!summary) return;

    const list = summary.querySelector(".visual-summary__list");
    const items = Array.from(
      summary.querySelectorAll(".visual-summary__list li"),
    );
    const buttons = Array.from(
      summary.querySelectorAll("[data-scroll-direction]"),
    );
    if (!list || !items.length || !buttons.length) return;

    let ticking = false;

    function updateState() {
      const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
      const progress = maxScroll ? list.scrollTop / maxScroll : 0;
      const listCenter = list.scrollTop + list.clientHeight / 2;

      summary.classList.toggle("has-scroll-above", list.scrollTop > 3);
      summary.classList.toggle(
        "has-scroll-below",
        list.scrollTop < maxScroll - 3,
      );
      summary.style.setProperty(
        "--scroll-progress",
        String(Math.max(0.12, progress)),
      );

      buttons.forEach((button) => {
        const direction = Number(button.dataset.scrollDirection);
        button.disabled =
          direction < 0 ? list.scrollTop <= 3 : list.scrollTop >= maxScroll - 3;
      });

      let current = items[0];
      let closestDistance = Infinity;
      items.forEach((item) => {
        const center = item.offsetTop + item.offsetHeight / 2;
        const distance = Math.abs(center - listCenter);
        if (distance < closestDistance) {
          current = item;
          closestDistance = distance;
        }
      });
      items.forEach((item) =>
        item.classList.toggle("is-current", item === current),
      );
      ticking = false;
    }

    list.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateState);
      },
      { passive: true },
    );

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.scrollDirection);
        const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
        const distance = (items[0].offsetHeight + gap) * direction;
        list.scrollBy({ top: distance, behavior: "smooth" });
      });
    });

    window.addEventListener("resize", updateState, { passive: true });
    updateState();
  }

  function initActiveNav() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = Array.from(
      document.querySelectorAll('.nav-menu a[href^="#"]'),
    );
    if (!sections.length || !navLinks.length) return;

    const OFFSET = 120;

    function updateActive() {
      const scrollY = window.scrollY + OFFSET;
      let current = sections[0].id;

      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollY) current = sec.id;
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute("href").slice(1);
        link.classList.toggle("is-active", href === current);
        link.setAttribute("aria-current", href === current ? "true" : "false");
      });
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
  }

  /* Navbar scroll */
  function initNavbarShadow() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    function update() {
      navbar.classList.toggle("navbar--scrolled", window.scrollY > 10);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        /* Set focus for accessibility */
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true },
        );
      });
    });
  }

  /* Problem section */
  function initProblemCards() {
    document.querySelectorAll(".problem-card").forEach((card) => {
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("is-focused");
          setTimeout(() => card.classList.remove("is-focused"), 600);
        }
      });
    });
  }

  /* How it works section */
  function initStepCards() {
    document.querySelectorAll(".step").forEach((card) => {
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.add("is-pulsing");
          setTimeout(() => card.classList.remove("is-pulsing"), 600);
        }
      });
    });
  }

  function initHandoffFlowMotion() {
    const section = document.querySelector(".how-it-works");
    const layout = document.querySelector(".how-it-works-layout");
    const steps = Array.from(document.querySelectorAll(".step"));
    const summary = document.querySelector(".visual-summary");
    const list = summary?.querySelector(".visual-summary__list");
    const flowItems = Array.from(
      summary?.querySelectorAll(".visual-summary__list li") || [],
    );

    if (!section || !layout || !steps.length) return;

    const itemMap = [0, 2, Math.max(flowItems.length - 1, 0)];
    let activeIndex = -1;

    function setActiveStep(index, options = {}) {
      const nextIndex = Math.max(0, Math.min(index, steps.length - 1));
      if (nextIndex === activeIndex && !options.force) return;

      activeIndex = nextIndex;
      const progress =
        steps.length > 1 ? nextIndex / Math.max(steps.length - 1, 1) : 0;

      section.style.setProperty("--flow-progress", String(progress));
      layout.style.setProperty("--flow-progress", String(progress));
      section.dataset.flowStep = String(nextIndex + 1);

      steps.forEach((stepCard, stepIndex) => {
        stepCard.classList.toggle("is-active-step", stepIndex === nextIndex);
        stepCard.classList.toggle("is-before-active", stepIndex < nextIndex);
      });

      if (!flowItems.length) return;

      const activeItemIndex = Math.min(
        itemMap[nextIndex] ?? nextIndex,
        flowItems.length - 1,
      );

      flowItems.forEach((item, itemIndex) => {
        item.classList.toggle("is-current", itemIndex === activeItemIndex);
        item.classList.toggle("is-flow-complete", itemIndex < activeItemIndex);
      });

      const activeItem = flowItems[activeItemIndex];
      if (activeItem && list && !options.skipScroll) {
        const targetTop =
          activeItem.offsetTop - list.clientHeight / 2 + activeItem.offsetHeight / 2;

        list.scrollTo({
          top: Math.max(0, targetTop),
          behavior: shouldReduceMotion() ? "auto" : "smooth",
        });
      }

      summary?.classList.remove("is-flow-pulsing");
      window.requestAnimationFrame(() => {
        summary?.classList.add("is-flow-pulsing");
      });
    }

    steps.forEach((stepCard, index) => {
      stepCard.addEventListener("mouseenter", () =>
        setActiveStep(index, { skipScroll: true }),
      );
      stepCard.addEventListener("focus", () => setActiveStep(index));
    });

    if (!("IntersectionObserver" in window)) {
      setActiveStep(0, { force: true });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        setActiveStep(steps.indexOf(visible.target));
      },
      {
        threshold: [0.3, 0.45, 0.62, 0.78],
        rootMargin: "-18% 0px -26% 0px",
      },
    );

    steps.forEach((stepCard) => observer.observe(stepCard));
    setActiveStep(0, { force: true, skipScroll: true });
  }

  /* Features / Characteristics section */
  function initFeatureCards() {
    document.querySelectorAll(".feature-card").forEach((card) => {
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.add("is-pulsing");
          setTimeout(() => card.classList.remove("is-pulsing"), 600);
        }
      });
    });
  }
  /* Team section — keyboard interaction */
  function initTeamCards() {
    document.querySelectorAll(".team-card").forEach((card) => {
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // Brief visual pulse via temporary class
          card.classList.add("is-focused");
          setTimeout(() => card.classList.remove("is-focused"), 500);
        }
      });
    });
  }
  /* TESTIMONIALS*/
  function initTestimonials() {
    var track = document.getElementById("testimonials-track");
    var prevBtn = document.getElementById("testimonials-prev");
    var nextBtn = document.getElementById("testimonials-next");
    var dots = Array.from(document.querySelectorAll(".testimonials-dot"));
    var cards = track
      ? Array.from(track.querySelectorAll(".testimonial-card"))
      : [];

    if (!track || !cards.length) return;

    var prefersReduced = shouldReduceMotion();
    var currentIndex = 0;

    /* ── Scroll to a specific card ── */
    function scrollToCard(index) {
      if (index < 0 || index >= cards.length) return;
      var card = cards[index];
      var behavior = prefersReduced ? "auto" : "smooth";
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: behavior,
      });
      currentIndex = index;
      syncControls();
    }

    function syncControls() {
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === cards.length - 1;

      dots.forEach(function (dot, i) {
        var active = i === currentIndex;
        dot.classList.toggle("testimonials-dot--active", active);
        dot.setAttribute("aria-selected", String(active));
      });
    }

    /* ── Button clicks ── */
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        scrollToCard(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollToCard(currentIndex + 1);
      });
    }

    /* ── Dot clicks ── */
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var idx = parseInt(dot.dataset.index, 10);
        if (!isNaN(idx)) scrollToCard(idx);
      });

      /* Keyboard: arrow keys navigate between dots */
      dot.addEventListener("keydown", function (e) {
        var idx = parseInt(dot.dataset.index, 10);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          var next = dots[idx + 1];
          if (next) {
            next.focus();
            scrollToCard(idx + 1);
          }
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          var prev = dots[idx - 1];
          if (prev) {
            prev.focus();
            scrollToCard(idx - 1);
          }
        }
      });
    });

    /* ── IntersectionObserver: sync active dot with the card most in view ── */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              var idx = cards.indexOf(entry.target);
              if (idx !== -1 && idx !== currentIndex) {
                currentIndex = idx;
                syncControls();
              }
            }
          });
        },
        { root: track, threshold: 0.5 },
      );

      cards.forEach(function (card) {
        io.observe(card);
      });
    }

    /* ── Keyboard: left/right arrows on track ── */
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollToCard(currentIndex + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToCard(currentIndex - 1);
      }
    });

    syncControls();
  }
  /* FAQ */
  function initFaqAccordion() {
    const items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    const prefersReduced = shouldReduceMotion();

    items.forEach((details) => {
      const summary = details.querySelector("summary");
      if (!summary) return;

      details.addEventListener("toggle", () => {
        summary.setAttribute("aria-expanded", String(details.open));
      });

      if (prefersReduced || typeof details.animate !== "function") {
        return; // Let the native, instant open/close behavior handle it.
      }

      const answer = details.querySelector(".faq-answer");
      let animation = null;
      let isClosing = false;
      let isExpanding = false;

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        details.style.overflow = "hidden";

        if (isClosing || !details.open) {
          openItem();
        } else if (isExpanding || details.open) {
          shrinkItem();
        }
      });

      function shrinkItem() {
        isClosing = true;
        const startHeight = `${details.offsetHeight}px`;
        const endHeight = `${summary.offsetHeight}px`;

        if (animation) animation.cancel();
        animation = details.animate(
          { height: [startHeight, endHeight] },
          { duration: 300, easing: "ease-out" },
        );
        animation.onfinish = () => onAnimationFinish(false);
        animation.oncancel = () => {
          isClosing = false;
        };
      }

      function openItem() {
        details.style.height = `${details.offsetHeight}px`;
        details.open = true;
        window.requestAnimationFrame(() => expandItem());
      }

      function expandItem() {
        isExpanding = true;
        const startHeight = `${details.offsetHeight}px`;
        const endHeight = `${summary.offsetHeight + (answer ? answer.offsetHeight : 0)}px`;

        if (animation) animation.cancel();
        animation = details.animate(
          { height: [startHeight, endHeight] },
          { duration: 300, easing: "ease-out" },
        );
        animation.onfinish = () => onAnimationFinish(true);
        animation.oncancel = () => {
          isExpanding = false;
        };
      }

      function onAnimationFinish(open) {
        details.open = open;
        animation = null;
        isClosing = false;
        isExpanding = false;
        details.style.height = "";
        details.style.overflow = "";
      }
    });
  }
  /* Contact-Us Section*/
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var successNotice = document.getElementById("contactSubmitNotice");
    var errorNotice = document.getElementById("contactErrorNotice");
    var submitBtn = form ? form.querySelector('[type="submit"]') : null;
    if (!form || !submitBtn) return;

    /* ── Validation helpers ── */
    function isValidEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    }

    function validateField(field) {
      var wrap = field.closest(".contact-form__field");
      var name = field.name;
      var value = field.value.trim();
      var ok = true;

      if (field.required && !value) {
        ok = false;
      } else if (name === "email" && value && !isValidEmail(value)) {
        ok = false;
      }

      if (wrap) wrap.classList.toggle("has-error", !ok);
      return ok;
    }

    function validateAll() {
      var fields = Array.from(
        form.querySelectorAll('input[required], input[name="email"]'),
      );
      var allOk = true;
      fields.forEach(function (field) {
        if (!validateField(field)) allOk = false;
      });
      return allOk;
    }

    /* ── Real-time error clearing ── */
    form.querySelectorAll(".contact-form__input").forEach(function (input) {
      input.addEventListener("input", function () {
        var wrap = input.closest(".contact-form__field");
        if (wrap && wrap.classList.contains("has-error")) {
          validateField(input);
        }
      });

      input.addEventListener("blur", function () {
        if (input.value.trim() || input.required) validateField(input);
      });
    });

    /* ── Submit ── */
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Hide previous notices */
      successNotice && successNotice.setAttribute("hidden", "");
      errorNotice && errorNotice.setAttribute("hidden", "");

      if (!validateAll()) {
        errorNotice && errorNotice.removeAttribute("hidden");
        var firstError = form.querySelector(".has-error .contact-form__input");
        if (firstError) firstError.focus();
        return;
      }

      /* Loading state */
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      var spinner = document.createElement("span");
      spinner.className = "submit-spinner";
      spinner.setAttribute("aria-hidden", "true");
      submitBtn.appendChild(spinner);

      /* Simulated async send (replace with real fetch() when backend is ready) */
      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        if (spinner.parentNode) spinner.parentNode.removeChild(spinner);

        successNotice && successNotice.removeAttribute("hidden");
        form.reset();

        /* Auto-hide success notice after 7s */
        setTimeout(function () {
          successNotice && successNotice.setAttribute("hidden", "");
        }, 7000);
      }, 1400);
    });
  }
  // Footer
  function initFooter() {
    const overlay = document.getElementById("terms-modal");
    const closeBtn = document.getElementById("terms-modal-close");
    const triggers = document.querySelectorAll(".footer-terms-btn");

    if (!overlay || !closeBtn) return;

    let openerEl = null;

    function getFocusable() {
      return Array.from(
        overlay.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, textarea, select',
        ),
      );
    }

    function openModal(trigger) {
      openerEl = trigger || null;
      overlay.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      // Move focus to close button
      requestAnimationFrame(() => closeBtn.focus());
    }

    function closeModal() {
      overlay.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (openerEl) openerEl.focus();
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn));
    });

    closeBtn.addEventListener("click", closeModal);

    // Close on backdrop click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    // Close on Escape; trap Tab inside modal
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }
      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable.length) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  //Boot function
  function boot() {
    initMotionPreference();
    initThemeToggle();
    initMotionSystem();
    initMobileNav();
    initBackToTop();
    initHeroAnimations();
    initScrollReveal();
    initCounters();
    initVisualSummaryScroll();
    initActiveNav();
    initNavbarShadow();
    initContactForm();
    initSmoothScroll();
    initProblemCards();
    initStepCards();
    initFeatureCards();
    initTeamCards();
    initTestimonials();
    initFaqAccordion();
    initFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
