(function () {
  const config = window.DS_SITE_CONFIG || {};
  const memoryStore = {};

  function getStoredTheme() {
    try {
      return localStorage.getItem("ds-theme") || memoryStore.theme || "";
    } catch (error) {
      return memoryStore.theme || "";
    }
  }

  function setStoredTheme(theme) {
    memoryStore.theme = theme;
    try {
      localStorage.setItem("ds-theme", theme);
    } catch (error) {
      // Some browsers block storage in strict privacy modes; the button should still work.
    }
  }

  function externalAttrs(href) {
    return /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  function tagList(items) {
    return items.map((item) => `<span>${item}</span>`).join("");
  }

  function renderProjects() {
    const mount = document.querySelector("[data-projects]");
    if (!mount || !config.projects) return;
    mount.innerHTML = config.projects.map((project) => `
      <article class="project-card${project.featured ? " is-featured" : ""}">
        <div class="project-preview">
          <span>${project.category || project.eyebrow}${project.featured ? " / Featured" : ""}</span>
          <strong>${project.preview}</strong>
        </div>
        <div class="project-body">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="tag-list">${tagList(project.stack)}</div>
          <div class="card-actions">
            <a href="${project.github}"${externalAttrs(project.github)}>GitHub</a>
            <a href="${project.demo}"${externalAttrs(project.demo)}>Live / Details</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderServices() {
    const mount = document.querySelector("[data-services]");
    if (!mount || !config.services) return;
    mount.innerHTML = config.services.map((service, index) => `
      <article class="service-card">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h3>${service.title}</h3>
        <p>${service.description}</p>
      </article>
    `).join("");
  }

  function renderBlogPosts() {
    const mount = document.querySelector("[data-blog-posts]");
    if (!mount || !config.blogPosts) return;
    mount.innerHTML = config.blogPosts.map((post) => `
      <article class="blog-card">
        <span class="blog-meta">${post.category || post.label}</span>
        <h3>${post.title}</h3>
        <p>${post.description}</p>
      </article>
    `).join("");
  }

  function setupMenu() {
    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#primary-navigation");
    if (!button || !nav) return;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      button.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !open);
    });
  }

  function setupBackToTop() {
    const button = document.querySelector(".back-to-top");
    if (!button) return;

    function updateVisibility() {
      button.classList.toggle("is-visible", window.scrollY > 520);
    }

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
  }

  function setupThemeToggle() {
    const button = document.querySelector(".theme-toggle");
    if (!button) return;

    const savedTheme = getStoredTheme();
    const initialTheme = savedTheme || "light";

    function applyTheme(theme) {
      document.documentElement.dataset.theme = theme;
      const dark = theme === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      setStoredTheme(theme);
    }

    applyTheme(initialTheme);

    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  function setupSpotlights() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const targets = document.querySelectorAll(".project-card, .blog-card, .service-card, .info-card, .feature-card, .contact-panel");
    targets.forEach((target) => {
      target.addEventListener("pointermove", (event) => {
        const rect = target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        target.style.setProperty("--spotlight-x", `${x}%`);
        target.style.setProperty("--spotlight-y", `${y}%`);
      });
    });
  }

  function setupScrollReveals() {
    const targets = document.querySelectorAll(".section-head, .trust-strip span, .project-card, .service-card, .blog-card, .feature-card, .info-card, .contact-panel, .page-panel");
    if (!targets.length) return;
    document.body.classList.add("is-enhanced");
    targets.forEach((target) => target.classList.add("reveal-item"));

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    targets.forEach((target) => observer.observe(target));
  }

  setupThemeToggle();
  setupMenu();
  setupBackToTop();
  renderProjects();
  renderServices();
  renderBlogPosts();
  setupSpotlights();
  setupScrollReveals();
})();
