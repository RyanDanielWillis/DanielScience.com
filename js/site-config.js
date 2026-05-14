window.DS_SITE_CONFIG = {
  name: "DanielScience",
  owner: "Ryan Willis",
  domain: "danielscience.com",
  contactEmail: "ryan@danielscience.com",
  logo: "./daniel_sience_logo.png",
  tagline: "Full-stack, DevSecOps, cloud, and IT systems",
  metadata: {
    title: "DanielScience | Ryan Willis Full-Stack, DevSecOps, Cloud, and IT Portfolio",
    description:
      "Recruiter-focused portfolio for Ryan Willis, a full-stack developer and infrastructure-minded technologist focused on automation, secure workflows, cloud systems, and modern IT operations."
  },
  navLinks: [
    { label: "Home", href: "./index.html" },
    { label: "Services", href: "./services.html" },
    { label: "Projects", href: "./project-case-studies.html" },
    { label: "Blog", href: "./index.html#blog" },
    { label: "Approach & Rates", href: "./pricing.html" },
    { label: "Experience", href: "./resume.html" },
    { label: "Contact", href: "./contact.html" }
  ],
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ryanmovesdata/" },
    { label: "GitHub", href: "https://github.com/RyanDanielWillis" },
    { label: "CallSentry", href: "https://callsentry.danielscience.com/" }
  ],
  cta: {
    primaryLabel: "View Projects",
    secondaryLabel: "Contact Ryan",
    projectsHref: "./project-case-studies.html",
    contactHref: "mailto:ryan@danielscience.com",
    contactPageHref: "./contact.html"
  },
  trustItems: [
    "Full-Stack Development",
    "DevSecOps Mindset",
    "Cloud & Infrastructure",
    "Automation & Tooling",
    "MSP / IT Operations",
    "Secure Workflows"
  ],
  projects: [
    {
      title: "CallSentry",
      eyebrow: "Live technical product",
      description:
        "A VoIP and network diagnostics platform built around real troubleshooting workflows, plain-English reporting, and infrastructure-aware support decisions.",
      stack: ["Python", "FastAPI", "SQLite", "Diagnostics", "VoIP"],
      github: "https://github.com/RyanDanielWillis/CallSentry",
      demo: "https://callsentry.danielscience.com/",
      preview: "Signal health, incident evidence, and operational clarity"
    },
    {
      title: "Infrastructure Automation",
      eyebrow: "Operations tooling",
      description:
        "Reusable scripts, dashboards, and process tooling for reducing repetitive support work, improving visibility, and giving teams clearer deployment and maintenance paths.",
      stack: ["Automation", "Dashboards", "APIs", "Monitoring", "Workflows"],
      github: "https://github.com/RyanDanielWillis",
      demo: "./project-case-studies.html",
      preview: "Less manual work, better reporting, cleaner handoffs"
    },
    {
      title: "Modern Portfolio System",
      eyebrow: "Frontend foundation",
      description:
        "A responsive, editable portfolio architecture with centralized content, reusable layout pieces, and a design system ready for richer components and case studies.",
      stack: ["HTML", "CSS", "JavaScript", "Responsive UI", "Design Systems"],
      github: "https://github.com/RyanDanielWillis/DanielScience.com",
      demo: "./index.html",
      preview: "Fast static delivery with a polished recruiter experience"
    }
  ],
  services: [
    {
      title: "Full-stack application development",
      description:
        "Responsive interfaces, backend logic, API integrations, and practical product workflows that move from idea to usable system."
    },
    {
      title: "React / Next.js and UI modernization",
      description:
        "Modern frontend architecture, accessible layouts, component cleanup, performance improvements, and interfaces that feel polished without becoming heavy."
    },
    {
      title: "Backend and API integration",
      description:
        "Service wiring, data flow, authentication-aware patterns, reporting endpoints, and the glue code that makes business systems work together."
    },
    {
      title: "Cloud and deployment tooling",
      description:
        "Deployment paths, environment setup, automation scripts, monitoring hooks, and pipelines designed for maintainability."
    },
    {
      title: "DevSecOps-aware workflows",
      description:
        "Security-conscious delivery habits, safer configuration, access-aware processes, and practical checks that reduce operational risk."
    },
    {
      title: "MSP and IT operations support",
      description:
        "Endpoint support, infrastructure troubleshooting, documentation, reliability improvements, and help for teams that need someone who understands the whole stack."
    }
  ],
  blogPosts: [
    {
      label: "Future article",
      title: "Building useful internal tools without turning them into science projects",
      description:
        "Notes on keeping automation practical, maintainable, and valuable for real IT and business workflows."
    },
    {
      label: "Future article",
      title: "What DevSecOps looks like for small teams and MSP environments",
      description:
        "A plain-language look at secure workflows, deployment habits, visibility, and operational guardrails."
    },
    {
      label: "Future article",
      title: "AI-assisted engineering workflows that still require judgment",
      description:
        "How modern tools can accelerate delivery while the human engineer stays responsible for architecture, reliability, and quality."
    }
  ]
};
