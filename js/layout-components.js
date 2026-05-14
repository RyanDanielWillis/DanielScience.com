(function () {
  const config = window.DS_SITE_CONFIG || {};

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
      <article class="project-card">
        <div class="project-preview">
          <span>${project.eyebrow}</span>
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
        <span class="blog-meta">${post.label}</span>
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

  renderProjects();
  renderServices();
  renderBlogPosts();
  setupMenu();
  setupBackToTop();
})();
