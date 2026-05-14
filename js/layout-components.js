(function () {
  const config = window.DS_SITE_CONFIG;
  if (!config) return;

  function isCurrent(href) {
    const current = window.location.pathname.split("/").pop() || "index.html";
    const target = href.replace("./", "").split("#")[0];
    return target === current || (current === "" && target === "index.html");
  }

  function externalAttrs(href) {
    return /^https?:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  function createNavLinks(links) {
    return links
      .map((link) => {
        const current = isCurrent(link.href) ? ' aria-current="page"' : "";
        return `<a href="${link.href}"${current}>${link.label}</a>`;
      })
      .join("");
  }

  function tagList(items) {
    return items.map((item) => `<span>${item}</span>`).join("");
  }

  function renderHeader() {
    const mount = document.querySelector("[data-layout-header]");
    if (!mount) return;
    mount.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <a class="brand-mark" href="./index.html" aria-label="${config.name} home">
            <img src="${config.logo}" alt="${config.name} logo" width="104" height="104">
            <span>
              <span class="brand-name">${config.name}</span>
              <span class="brand-kicker">${config.tagline}</span>
            </span>
          </a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav class="nav-links" id="primary-navigation" aria-label="Primary">
            ${createNavLinks(config.navLinks)}
          </nav>
        </div>
      </header>
    `;

    const button = mount.querySelector(".menu-toggle");
    const nav = mount.querySelector(".nav-links");
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      button.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !open);
    });
  }

  function renderFooter() {
    const mount = document.querySelector("[data-layout-footer]");
    if (!mount) return;
    const footerLinks = [...config.navLinks, ...config.socialLinks]
      .map((link) => `<a href="${link.href}"${externalAttrs(link.href)}>${link.label}</a>`)
      .join("");

    mount.innerHTML = `
      <footer class="site-footer">
        <div class="page-container footer-inner">
          <div class="footer-brand">
            <strong>${config.owner}</strong>
            <span>&copy; 2026 Ryan Willis</span><br>
            <a href="${config.cta.contactHref}">${config.contactEmail}</a>
          </div>
          <nav class="footer-links" aria-label="Footer">
            ${footerLinks}
          </nav>
        </div>
      </footer>
    `;
  }

  function renderTrustStrip() {
    const mount = document.querySelector("[data-trust-strip]");
    if (!mount) return;
    mount.innerHTML = config.trustItems.map((item) => `<span>${item}</span>`).join("");
  }

  function renderProjects() {
    const mount = document.querySelector("[data-projects]");
    if (!mount) return;
    mount.innerHTML = config.projects
      .map(
        (project) => `
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
        `
      )
      .join("");
  }

  function renderServices() {
    const mount = document.querySelector("[data-services]");
    if (!mount) return;
    mount.innerHTML = config.services
      .map(
        (service, index) => `
          <article class="service-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
          </article>
        `
      )
      .join("");
  }

  function renderBlogPosts() {
    const mount = document.querySelector("[data-blog-posts]");
    if (!mount) return;
    mount.innerHTML = config.blogPosts
      .map(
        (post) => `
          <article class="blog-card">
            <span class="blog-meta">${post.label}</span>
            <h3>${post.title}</h3>
            <p>${post.description}</p>
          </article>
        `
      )
      .join("");
  }

  renderHeader();
  renderFooter();
  renderTrustStrip();
  renderProjects();
  renderServices();
  renderBlogPosts();
})();
