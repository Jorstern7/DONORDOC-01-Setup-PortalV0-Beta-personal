/*
Website System Name: DONORDOC-01 V1
Author: FRONTLENS LLC
License: For personal/business use only. Redistribution, resale, or sublicensing is strictly Copyright (c) 2026 FRONTLENS LLC. All rights reserved.
*/
import { themeRegistry } from "../../config/themeRegistry.js";

const VISIBILITY_SECTIONS = [
  "hero",
  "trust",
  "services",
  "pricing",
  "howItWorks",
  "reviews",
  "consultation",
];

const THEME_CSS_VARS = [
  ["brand", "--color-brand"],
  ["brandHover", "--color-brand-hover"],
  ["accent", "--color-accent"],
  ["accentHover", "--color-accent-hover"],
  ["brandSoft", "--color-brand-soft"],
  ["brandMuted", "--color-brand-muted"],
  ["brandLine", "--color-brand-line"],
  ["brandTint", "--color-brand-tint"],
  ["brandFaint", "--color-brand-faint"],
];

let siteConfig = null;

export function getSiteConfig() {
  return siteConfig;
}

export function getTheme(config) {
  const variant = config?.theme?.variant;
  return themeRegistry[variant] || themeRegistry.trustGreen;
}

export function resolveHeroImage(config) {
  const image = config?.sections?.hero?.image || {};
  if (image.mode === "custom" && image.customSrc) {
    return image.customSrc;
  }
  return getTheme(config).heroImage;
}

function getPath(object, path) {
  return path.split(".").reduce(function (current, key) {
    if (current == null) return undefined;
    return current[key];
  }, object);
}

function setTextPreserveChildren(el, value) {
  if (value == null) return;
  const text = String(value);
  const labeled = el.querySelector("[data-config-text]");
  if (labeled) {
    labeled.textContent = text;
    return;
  }
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: function (node) {
      return node.textContent.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });
  const first = walker.nextNode();
  if (first) {
    first.textContent = text;
    return;
  }
  el.textContent = text;
}

function applyDataConfig(config) {
  document.querySelectorAll("[data-config]").forEach(function (el) {
    const path = el.getAttribute("data-config");
    const attr = el.getAttribute("data-config-attr");
    const value = getPath(config, path);
    if (value == null || typeof value === "object") return;
    if (attr) {
      el.setAttribute(attr, String(value));
      return;
    }
    setTextPreserveChildren(el, value);
  });
}

function applyTheme(config) {
  const theme = getTheme(config);
  const root = document.documentElement;
  root.setAttribute("data-theme", config?.theme?.variant || "trustGreen");
  THEME_CSS_VARS.forEach(function (pair) {
    root.style.setProperty(pair[1], theme[pair[0]]);
  });

  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement("meta");
    themeMeta.setAttribute("name", "theme-color");
    document.head.appendChild(themeMeta);
  }
  themeMeta.setAttribute("content", theme.manifestThemeColor);
  applyManifest(theme);
}

function applyManifest(theme) {
  const link = document.querySelector('link[rel="manifest"]');
  if (!link) return;
  const manifest = {
    name: "Donordoc-01",
    short_name: "Donordoc",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: theme.manifestThemeColor,
    background_color: theme.manifestBackgroundColor,
    display: "standalone",
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }),
  );
  if (link.dataset.manifestUrl) URL.revokeObjectURL(link.dataset.manifestUrl);
  link.dataset.manifestUrl = url;
  link.setAttribute("href", url);
}

function applySeo(config) {
  const seo = config.seo || {};
  const social = seo.socialSharing || {};
  if (seo.title) document.title = seo.title;
  setMeta('meta[name="description"]', "content", seo.description);
  setLink('link[rel="canonical"]', "href", seo.canonicalUrl);
  setMeta('meta[property="og:title"]', "content", social.title);
  setMeta('meta[property="og:description"]', "content", social.description);
  setMeta('meta[property="og:image"]', "content", social.image);
  setMeta('meta[property="og:url"]', "content", social.url);
  setMeta('meta[name="twitter:title"]', "content", social.title);
  setMeta('meta[name="twitter:description"]', "content", social.description);
  setMeta('meta[name="twitter:image"]', "content", social.image);
}

function setMeta(selector, attr, value) {
  if (value == null) return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function setLink(selector, attr, value) {
  if (value == null) return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function applyBranding(config) {
  const logo = config.branding?.logo || {};
  document.querySelectorAll("[data-branding-logo]").forEach(function (img) {
    if (logo.src) img.setAttribute("src", logo.src);
    if (logo.alt != null) img.setAttribute("alt", logo.alt);
  });

  const favicon = config.branding?.favicon?.src;
  if (favicon) {
    document.querySelectorAll('link[rel="icon"]').forEach(function (icon) {
      icon.setAttribute("href", favicon);
    });
  }
}

function applyNavigation(config) {
  const nav = config.navigation || {};
  (nav.items || []).forEach(function (item) {
    document.querySelectorAll('[data-nav-item="' + item.id + '"]').forEach(function (el) {
      if (item.href) el.setAttribute("href", item.href);
      setTextPreserveChildren(el, item.label);
    });
  });

  if (nav.primaryAction) {
    document.querySelectorAll("[data-nav-primary]").forEach(function (el) {
      if (nav.primaryAction.href) el.setAttribute("href", nav.primaryAction.href);
      setTextPreserveChildren(el, nav.primaryAction.label);
    });
  }

  if (nav.secondaryAction) {
    document.querySelectorAll("[data-nav-secondary]").forEach(function (el) {
      if (nav.secondaryAction.href) el.setAttribute("href", nav.secondaryAction.href);
      setTextPreserveChildren(el, nav.secondaryAction.label);
    });
  }
}

function applyHero(config) {
  const hero = document.querySelector('[data-section="hero"]');
  if (!hero) return;
  const src = resolveHeroImage(config);
  const alt = config.sections?.hero?.image?.alt ?? "";
  hero.querySelectorAll("[data-hero-image]").forEach(function (img) {
    img.setAttribute("src", src);
    img.setAttribute("alt", alt);
  });
  const preload = document.querySelector('link[rel="preload"][href*="hero"]');
  if (preload) preload.setAttribute("href", src);
}

function applyImage(selector, image) {
  if (!image) return;
  document.querySelectorAll(selector).forEach(function (img) {
    if (image.src) img.setAttribute("src", image.src);
    if (image.alt != null) img.setAttribute("alt", image.alt);
  });
}

function applyIndexed(section, selector, items, writer) {
  if (!section || !items) return;
  const nodes = section.querySelectorAll(selector);
  items.forEach(function (item, index) {
    if (nodes[index]) writer(nodes[index], item);
  });
}

function configField(el, name) {
  return el.querySelector('[data-config-field="' + name + '"]');
}

function configFields(el, name) {
  return el.querySelectorAll('[data-config-field="' + name + '"]');
}

function applySectionLists(config) {
  const sections = config.sections || {};

  applyIndexed(
    document.querySelector('[data-section="trust"]'),
    '[data-config-item="trust"]',
    sections.trust?.stats,
    function (el, item) {
      const value = configField(el, "value");
      const label = configField(el, "label");
      if (value) value.textContent = item.value;
      if (label) label.textContent = item.label;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="trust"]'),
    '[data-config-item="trustBenefits"]',
    sections.trust?.benefits,
    function (el, item) {
      const title = configField(el, "title");
      const desc = configField(el, "description");
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.description;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="hero"]'),
    '[data-config-item="hero"]',
    sections.hero?.benefits,
    function (el, item) {
      const nodes = Array.from(el.childNodes).filter(function (node) {
        return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      });
      if (nodes[0]) nodes[0].textContent = " " + item.text;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="services"]'),
    '[data-config-item="services"]',
    sections.services?.items,
    function (el, item) {
      const title = configField(el, "title");
      const desc = configField(el, "description");
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.description;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="pricing"]'),
    '[data-config-item="pricing"]',
    sections.pricing?.plans,
    function (el, item) {
      const name = configField(el, "name");
      const desc = configField(el, "description");
      const badge = configField(el, "badge");
      const prefix = configField(el, "prefix");
      const amount = configField(el, "amount");
      const suffix = configField(el, "suffix");
      const cta = configField(el, "cta");
      if (name) name.textContent = item.name;
      if (desc) desc.textContent = item.description;
      if (badge) badge.textContent = item.badge || "";
      if (prefix && item.price) prefix.textContent = item.price.prefix;
      if (amount && item.price) amount.textContent = item.price.amount;
      if (suffix && item.price) suffix.textContent = item.price.suffix;
      if (cta) {
        if (item.cta?.href) cta.setAttribute("href", item.cta.href);
        setTextPreserveChildren(cta, item.cta?.label);
      }
      applyIndexed(el, '[data-config-item="pricingFeatures"]', item.features, function (li, feature) {
        const texts = Array.from(li.childNodes).filter(function (node) {
          return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
        });
        if (texts[0]) texts[0].textContent = " " + feature;
      });
    },
  );

  const how = document.querySelector('[data-section="howItWorks"]');
  if (how && sections.howItWorks) {
    const groups = sections.howItWorks.groups || [];
    applyIndexed(how, '[data-config-item="howItWorksGroup"]', groups, function (el, group) {
      const text = Array.from(el.childNodes).filter(function (node) {
        return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      });
      if (text[0]) text[0].textContent = " " + group.label;
    });

    const steps = groups.reduce(function (all, group) {
      return all.concat(group.steps || []);
    }, []);
    applyIndexed(how, '[data-config-item="howItWorks"]', steps, function (el, step) {
      const number = configField(el, "number");
      const title = configField(el, "title");
      const desc = configField(el, "description");
      if (number) number.textContent = step.number;
      if (title) title.textContent = step.title;
      if (desc) desc.textContent = step.description;
    });
    applyIndexed(how, '[data-config-item="howItWorksMarkers"]', steps, function (el, step) {
      el.textContent = step.number;
    });
  }

  const advisor = document.querySelector('[data-config-item="advisorCta"]');
  if (advisor && sections.pricing?.advisorCta) {
    const title = configField(advisor, "headline");
    const desc = configField(advisor, "description");
    const button = configField(advisor, "button");
    if (title) title.textContent = sections.pricing.advisorCta.headline;
    if (desc) desc.textContent = sections.pricing.advisorCta.description;
    if (button) {
      if (sections.pricing.advisorCta.button?.href) {
        button.setAttribute("href", sections.pricing.advisorCta.button.href);
      }
      setTextPreserveChildren(button, sections.pricing.advisorCta.button?.label);
    }
  }

  applyIndexed(
    document.querySelector('[data-section="reviews"]'),
    '[data-config-item="reviews"]',
    sections.reviews?.items,
    function (el, item) {
      const quote = configField(el, "quote");
      const name = configField(el, "name");
      const role = configField(el, "clientType");
      const status = configField(el, "enrollmentText");
      const img = configField(el, "image");
      const stars = configField(el, "rating");
      if (quote) quote.textContent = "\u201C" + item.quote + "\u201D";
      if (name) name.textContent = item.name;
      if (role) role.textContent = item.clientType;
      if (status) status.textContent = item.enrollmentText;
      if (img && item.image) {
        img.setAttribute("src", item.image.src);
        img.setAttribute("alt", item.image.alt || item.name);
      }
      if (stars && item.rating) {
        const rating = Number(item.rating) || 0;
        stars.setAttribute("aria-label", rating + " out of 5 stars");
        stars.querySelectorAll("svg").forEach(function (star, index) {
          star.style.opacity = index < rating ? "1" : "0.22";
        });
      }
    },
  );

  applyIndexed(
    document.querySelector('[data-section="consultation"]'),
    '[data-config-item="consultation"]',
    sections.consultation?.benefits,
    function (el, item) {
      const title = configField(el, "title");
      const desc = configField(el, "description");
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.description;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="finalCta"]'),
    '[data-config-item="finalCta"]',
    sections.finalCta?.features,
    function (el, item) {
      el.textContent = item.text;
    },
  );

  const footer = document.querySelector('[data-section="footer"]');
  if (footer && sections.footer) {
    applyIndexed(footer, '[data-config-item="footerSocial"]', sections.footer.socialLinks, function (el, item) {
      el.setAttribute("href", item.href);
      el.setAttribute("aria-label", item.label);
    });
    applyIndexed(footer, "[data-footer-nav-group]", sections.footer.linkGroups, function (el, group) {
      configFields(el, "title").forEach(function (node) {
        node.textContent = group.title;
      });
      applyIndexed(el, "[data-footer-nav-panel] a", group.links, function (link, item) {
        link.setAttribute("href", item.href);
        link.textContent = item.label;
      });
    });
    applyIndexed(footer, '[data-config-item="footerLegal"]', sections.footer.legalLinks, function (el, item) {
      el.setAttribute("href", item.href);
      el.textContent = item.label;
    });
    const phone = configField(footer, "phone");
    const email = configField(footer, "email");
    if (phone && sections.footer.contact?.phone) {
      phone.setAttribute("href", sections.footer.contact.phone.href);
      setTextPreserveChildren(phone, sections.footer.contact.phone.display);
    }
    if (email && sections.footer.contact?.email) {
      email.setAttribute("href", "mailto:" + sections.footer.contact.email);
      setTextPreserveChildren(email, sections.footer.contact.email);
    }
  }
}

function applyConsultationOptions(config) {
  const fields = config.sections?.consultation?.form?.fields;
  if (!fields) return;
  fillSelect("#consultation-coverage", fields.coverageType);
  fillSelect("#consultation-contact", fields.contactMethod);
}

function fillSelect(rootId, field) {
  if (!field) return;
  const root = document.getElementById(rootId.replace("#", ""));
  if (!root) return;
  const placeholder = root.querySelector("[data-select-value]");
  const box = root.querySelector("[data-select-options]");
  if (placeholder && field.placeholder) placeholder.textContent = field.placeholder;
  if (!box || !field.options) return;
  box.innerHTML = field.options
    .map(function (option) {
      return '<div class="option" data-select-option>' + option + "</div>";
    })
    .join("");
}

export function applySectionVisibility(config) {
  VISIBILITY_SECTIONS.forEach(function (key) {
    const enabled = config.sections?.[key]?.enabled;
    if (enabled !== false) return;
    const section = document.querySelector('[data-section="' + key + '"]');
    if (section) section.remove();
  });
}

function applySiteConfig(config) {
  applyTheme(config);
  applySeo(config);
  applyBranding(config);
  applyNavigation(config);
  applyDataConfig(config);
  applyHero(config);
  applyImage('[data-section="about"] img', config.sections?.about?.image);
  applyImage(
    '[data-section="consultation"] img',
    config.sections?.consultation?.image,
  );
  applyImage('[data-section="finalCta"] img', config.sections?.finalCta?.image);
  applySectionLists(config);
  applyConsultationOptions(config);
  applySectionVisibility(config);
}

export function initSiteConfig() {
  return fetch("config/siteConfig.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Failed to load siteConfig.json");
      return response.json();
    })
    .then(function (config) {
      siteConfig = config;
      applySiteConfig(config);
      return config;
    })
    .catch(function (error) {
      console.error("initSiteConfig error:", error);
      siteConfig = null;
      return null;
    });
}
