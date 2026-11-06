(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* -------------------------------------------------------------------------
     1. Content: read content.yml and turn it into the page's HTML.
     ------------------------------------------------------------------------- */

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));

  // Web links, e-mail links, and paths to files in this repository are allowed.
  const safeUrl = (value) => {
    const url = String(value ?? "").trim();
    const scheme = url.match(/^([a-z][a-z\d+.-]*):/i);
    return !scheme || ["http", "https", "mailto"].includes(scheme[1].toLowerCase()) ? url : "";
  };
  const attr = (value) => escapeHtml(safeUrl(value));
  const list = (value) => (Array.isArray(value) ? value : []);
  const icon = (id) => `<svg class="icon" aria-hidden="true"><use href="#${id}"/></svg>`;

  // **bold** and *italic*, applied to text that is already escaped.
  const emphasis = (html) => html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Text that may contain **bold**, *italic*, and [link text](address).
  const inline = (value) => {
    const text = String(value ?? "");
    let html = "";
    let last = 0;
    for (const match of text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
      html += emphasis(escapeHtml(text.slice(last, match.index)));
      const label = emphasis(escapeHtml(match[1]));
      const href = safeUrl(match[2]);
      html += href ? `<a href="${escapeHtml(href)}">${label}</a>` : label;
      last = match.index + match[0].length;
    }
    return html + emphasis(escapeHtml(text.slice(last)));
  };

  // Paragraphs are separated by empty lines; single line breaks become spaces.
  const paragraphs = (value) => String(value ?? "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .map((block) => `<p>${inline(block)}</p>`)
    .join("");

  const boldAuthor = (authors, name) => {
    const text = String(authors ?? "");
    return name && !text.includes(`**${name}**`) ? text.split(name).join(`**${name}**`) : text;
  };

  // "years" is either "2024: link" lines or a plain list of years without links.
  const yearEntries = (years) => (Array.isArray(years) ? years.map((year) => [year, ""]) : Object.entries(years ?? {}));

  const render = {
    brand: (c) => escapeHtml(c.name),

    profile: (c) => {
      const email = String(c.email ?? "").replace(/\s*\[at\]\s*/i, "@").trim();
      const profiles = list(c.profiles).map((p) => `<li><a href="${attr(p.link)}" title="${escapeHtml(p.name)}"><img src="${attr(p.icon)}" alt="${escapeHtml(p.name)}" width="48" height="48"></a></li>`).join("");
      return `
        <h1 id="name">${escapeHtml(c.name)}</h1>
        <p class="hero-role">${escapeHtml(c.position)}</p>
        <p class="hero-org">${escapeHtml(c.organization)}</p>
        <ul class="hero-meta">
          ${c.location ? `<li>${icon("i-pin")}<span>${escapeHtml(c.location)}</span></li>` : ""}
          ${email ? `<li>${icon("i-mail")}<a class="email-link" href="mailto:${attr(email)}">${escapeHtml(email)}</a></li>` : ""}
        </ul>
        ${profiles ? `<ul class="profile-links" aria-label="Profiles">${profiles}</ul>` : ""}
        ${c.last_update ? `<p class="hero-updated">Last Update in: ${escapeHtml(c.last_update)}</p>` : ""}`;
    },

    photo: (c) => {
      if (!c.photo) return "";
      const image = `<img src="${attr(c.photo)}" alt="${escapeHtml(c.photo_description)}" width="513" height="513">`;
      return c.photo_link
        ? `<a class="photo-frame" target="_blank" rel="noopener" href="${attr(c.photo_link)}">${image}</a>`
        : `<span class="photo-frame">${image}</span>`;
    },

    summary: (c) => paragraphs(c.summary) + (c.cv
      ? `<p class="section-actions"><a class="button button-primary" href="${attr(c.cv)}">CV${icon("i-arrow-right")}</a></p>`
      : ""),

    publications_note: (c) => inline(c.publications_note),

    publications: (c) => list(c.publications).map((group) => {
      const items = list(group.items).map((item) => {
        const title = emphasis(escapeHtml(item.title));
        const link = safeUrl(item.link);
        return `
          <li class="pub">
            <p class="pub-title">${link ? `<a target="_blank" rel="noopener" href="${escapeHtml(link)}">${title}</a>` : title}</p>
            ${item.authors ? `<p class="pub-authors">${inline(boldAuthor(item.authors, c.bold_author))}</p>` : ""}
            ${item.venue ? `<p class="pub-venue">${inline(item.venue)}</p>` : ""}
          </li>`;
      }).join("");
      return `
        <div class="group">
          <h3 class="group-title">${escapeHtml(group.group)}</h3>
          <ul class="panel pub-list">${items}</ul>
        </div>`;
    }).join(""),

    awards: (c) => {
      const items = list(c.awards).map((award) => `<li><span class="tag">${escapeHtml(award.tag)}</span><p>${inline(award.text)}</p></li>`).join("");
      return items && `<ul class="award-list">${items}</ul>`;
    },

    service: (c) => list(c.service).map((group) => {
      const venues = list(group.venues).map((venue) => {
        const years = yearEntries(venue.years).map(([year, link]) => {
          const href = safeUrl(link);
          return `<li>${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(year)}</a>` : `<span>${escapeHtml(year)}</span>`}</li>`;
        }).join("");
        return `
          <li class="service-row">
            <p class="service-venue"><span class="service-acronym">${escapeHtml(venue.acronym)}</span><span class="service-name">${escapeHtml(venue.name)}</span></p>
            ${years ? `<ul class="years" aria-label="${escapeHtml(venue.acronym)} years">${years}</ul>` : ""}
          </li>`;
      }).join("");
      const links = list(group.links).map((item) => {
        const href = safeUrl(item.link);
        const label = `<span>${emphasis(escapeHtml(item.name))}</span>`;
        return `<li>${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${label}${icon("i-external")}</a>` : `<span class="link-text">${label}</span>`}</li>`;
      }).join("");
      return `
        <div class="group">
          <h3 class="group-title">${escapeHtml(group.group)}</h3>
          ${venues ? `<ul class="panel service-list">${venues}</ul>` : ""}
          ${links ? `<ul class="panel link-list">${links}</ul>` : ""}
        </div>`;
    }).join(""),

    other_passions: (c) => {
      const items = list(c.other_passions).map((item) => `<li><span class="passion-label">${escapeHtml(item.name)}</span><p>${inline(item.text)}</p></li>`).join("");
      return items && `<ul class="passion-list">${items}</ul>`;
    },

    downloads: (c) => {
      const items = list(c.downloads).map((item) => `
        <li class="download">
          <span class="badge-icon" aria-hidden="true">${icon("i-archive")}</span>
          <p>${inline(item.text)} <a class="download-link" href="${attr(item.file)}">here${icon("i-download")}</a></p>
        </li>`).join("");
      return items && `<ul class="panel download-list">${items}</ul>`;
    }
  };

  async function loadContent() {
    if (!window.jsyaml) throw new Error("js/js-yaml.min.js did not load.");
    const response = await fetch("content.yml", { cache: "no-cache" });
    if (!response.ok) throw new Error(`content.yml could not be downloaded (HTTP ${response.status}).`);
    const content = window.jsyaml.load(await response.text());
    if (!content || typeof content !== "object") throw new Error("content.yml is empty.");
    return content;
  }

  function fillPage(content) {
    document.querySelectorAll("[data-content]").forEach((element) => {
      const build = render[element.dataset.content];
      if (build) element.innerHTML = build(content);
    });
    // Hide a section (and its menu item) when content.yml has nothing for it.
    document.querySelectorAll("main > section[id]:not(#home)").forEach((section) => {
      const slots = [...section.querySelectorAll("[data-content]")];
      if (slots.length && slots.every((slot) => !slot.innerHTML.trim())) {
        section.hidden = true;
        document.querySelector(`#site-nav a[href="#${section.id}"]`)?.closest("li")?.setAttribute("hidden", "");
      }
    });
  }

  // Shown on the page when content.yml cannot be read (for example, a typo).
  function showError(error) {
    const details = error.mark ? `content.yml, line ${error.mark.line + 1}: ${error.reason}` : error.message;
    const message = document.createElement("div");
    message.className = "page-message";
    message.setAttribute("role", "alert");
    message.innerHTML = `<strong>The page content could not be loaded.</strong> ${escapeHtml(details)}`
      + (error.mark?.snippet ? `<pre>${escapeHtml(error.mark.snippet)}</pre>` : "");
    document.getElementById("main").prepend(message);
    console.error(error);
  }

  /* -------------------------------------------------------------------------
     2. Page behavior: mobile menu, current-section highlight, scroll to top.
     ------------------------------------------------------------------------- */

  function setUpPage() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");

    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("click", (event) => {
      if (nav.classList.contains("is-open") && !header.contains(event.target)) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });

    // The summary belongs to "Home" in the menu.
    const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
    const sections = [...document.querySelectorAll("main > section[id]:not([hidden])")];
    const navTarget = (id) => (id === "intro" ? "home" : id);
    const isNavTarget = (id) => navLinks.some((link) => link.hash === `#${navTarget(id)}`);
    const setCurrent = (id) => {
      navLinks.forEach((link) => {
        if (link.hash === `#${navTarget(id)}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    // After a jump to a section, keep it highlighted until the visitor scrolls manually;
    // short sections near the end of the page cannot always reach the top of the window.
    let lockedId = isNavTarget(location.hash.slice(1)) ? location.hash.slice(1) : null;
    const unlock = () => { lockedId = null; };
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", (event) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) unlock();
    });
    document.addEventListener("click", (event) => {
      const id = event.target.closest('a[href^="#"]')?.hash.slice(1);
      if (id && isNavTarget(id)) {
        lockedId = id;
        setCurrent(id);
      }
    });

    const toTop = document.querySelector(".to-top");
    toTop.hidden = false;
    toTop.addEventListener("click", () => {
      lockedId = "home";
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
      document.getElementById("main").focus({ preventScroll: true });
    });

    let ticking = false;
    const update = () => {
      ticking = false;
      toTop.classList.toggle("is-visible", window.scrollY > 100);
      if (lockedId) {
        setCurrent(lockedId);
        return;
      }
      const threshold = header.offsetHeight + window.innerHeight * 0.25;
      let current = sections[0].id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= threshold) current = section.id;
      });
      if (window.innerHeight + window.scrollY >= root.scrollHeight - 4) current = sections[sections.length - 1].id;
      setCurrent(current);
    };
    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  // The content arrives after the browser's own jump to #section, so jump again.
  const jumpToHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    root.style.scrollBehavior = "auto";
    target.scrollIntoView();
    root.style.scrollBehavior = "";
  };

  loadContent()
    .then(fillPage)
    .catch(showError)
    .finally(() => {
      root.classList.add("content-ready");
      setUpPage();
      jumpToHash();
    });
})();
