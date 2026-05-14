(function () {
  const config = window.DS_SITE_CONFIG;
  if (!config) return;

  function isCurrent(href) {
    const current = window.location.pathname.split("/").pop() || "index.html";
    const target = href.replace("./", "").split("#")[0];
    return target === current || (current === "" && target === "index.html");
  }

  function createNavLinks(links) {
    return links
      .map((link) => {
        const current = isCurrent(link.href) ? ' aria-current="page"' : "";
        return `<a href="${link.href}"${current}>${link.label}</a>`;
      })
      .join("");
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
          <nav class="nav-links" aria-label="Primary">
            ${createNavLinks(config.navLinks)}
          </nav>
          <a class="header-cta" href="${config.cta.contactHref}">${config.cta.primaryLabel}</a>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    const mount = document.querySelector("[data-layout-footer]");
    if (!mount) return;
    const footerLinks = [...config.navLinks, ...config.socialLinks]
      .map((link) => {
        const external = /^https?:\/\//.test(link.href);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${link.href}"${attrs}>${link.label}</a>`;
      })
      .join("");

    mount.innerHTML = `
      <footer class="site-footer">
        <div class="page-container footer-inner">
          <div class="footer-brand">
            <strong>${config.owner}</strong>
            <span>© 2026 Ryan Willis</span><br>
            <a href="${config.cta.contactHref}">${config.contactEmail}</a>
          </div>
          <nav class="footer-links" aria-label="Footer">
            ${footerLinks}
          </nav>
        </div>
      </footer>
    `;
  }

  renderHeader();
  renderFooter();
})();
