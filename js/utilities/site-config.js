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
    const icon = document.querySelector('link[rel="icon"][sizes="any"]');
    if (icon) icon.setAttribute("href", favicon);
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

function applySectionLists(config) {
  const sections = config.sections || {};

  applyIndexed(
    document.querySelector('[data-section="trust"]'),
    ".trust__stat",
    sections.trust?.stats,
    function (el, item) {
      const value = el.querySelector(".trust__stat-value");
      const label = el.querySelector(".trust__stat-label");
      if (value) value.textContent = item.value;
      if (label) label.textContent = item.label;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="trust"]'),
    ".trust__benefit",
    sections.trust?.benefits,
    function (el, item) {
      const title = el.querySelector(".trust__benefit-title");
      const desc = el.querySelector(".trust__benefit-desc");
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.description;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="hero"]'),
    ".hero__benefits li",
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
    ".service-card",
    sections.services?.items,
    function (el, item) {
      const title = el.querySelector(".service-card__title");
      const full = el.querySelector(".service-card__desc-full");
      const short = el.querySelector(".service-card__desc-short");
      const desc = el.querySelector(".service-card__desc");
      if (title) title.textContent = item.title;
      if (full) full.textContent = item.description;
      if (short) short.textContent = item.shortDescription || item.description;
      if (!full && desc) desc.textContent = item.description;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="pricing"]'),
    ".pricing-card",
    sections.pricing?.plans,
    function (el, item) {
      const name = el.querySelector(".pricing-card__title");
      const desc = el.querySelector(".pricing-card__desc");
      const badge = el.querySelector(".pricing-card__badge");
      const prefix = el.querySelector(".pricing-card__price-label");
      const amount = el.querySelector(".pricing-card__price-amount");
      const suffix = el.querySelector(".pricing-card__price-period");
      const cta = el.querySelector(".pricing-card__btn");
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
      applyIndexed(el, ".pricing-card__features li", item.features, function (li, feature) {
        const texts = Array.from(li.childNodes).filter(function (node) {
          return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
        });
        if (texts[0]) texts[0].textContent = " " + feature;
      });
    },
  );

  const how = document.querySelector('[data-section="howItWorks"]');
  if (how && sections.howItWorks) {
    const headline = sections.howItWorks.headline;
    if (headline?.desktop) {
      const parts = how.querySelectorAll(
        ".how-it-works__heading-desktop .how-it-works__heading-part",
      );
      if (parts[0]) parts[0].textContent = headline.desktop.first;
      if (parts[1]) parts[1].textContent = headline.desktop.second;
    }
    if (headline?.mobile) {
      const mobile = how.querySelector(".how-it-works__heading-mobile");
      if (mobile) {
        const accent = mobile.querySelector(
          ".how-it-works__heading-part-accent",
        );
        if (accent) {
          const idx = headline.mobile.lastIndexOf(accent.textContent.trim());
          if (idx >= 0) {
            const walker = document.createTreeWalker(
              mobile,
              NodeFilter.SHOW_TEXT,
              {
                acceptNode: function (node) {
                  return node.textContent.trim() &&
                    node.parentElement !== accent
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
                },
              },
            );
            const first = walker.nextNode();
            if (first) first.textContent = headline.mobile.slice(0, idx);
          }
        }
      }
    }
    const groups = sections.howItWorks.groups || [];
    const labels = how.querySelectorAll(".how-it-works__part-header-label");
    groups.forEach(function (group, index) {
      if (!labels[index]) return;
      const text = Array.from(labels[index].childNodes).filter(function (node) {
        return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
      });
      if (text[0]) text[0].textContent = " " + group.label;
    });

    const steps = groups.reduce(function (all, group) {
      return all.concat(group.steps || []);
    }, []);
    applyIndexed(how, ".how-it-works__card", steps, function (el, step) {
      const number = el.querySelector(".how-it-works__card-number");
      const title = el.querySelector(".how-it-works__card-title");
      const desc = el.querySelector(".how-it-works__card-desc");
      if (number) number.textContent = step.number;
      if (title) title.textContent = step.title;
      if (desc) desc.textContent = step.description;
    });
    applyIndexed(how, ".how-it-works__step-marker", steps, function (el, step) {
      el.textContent = step.number;
    });
  }

  const advisor = document.querySelector(".pricing-advisor-cta");
  if (advisor && sections.pricing?.advisorCta) {
    const title = advisor.querySelector(".pricing-advisor-cta__title");
    const desc = advisor.querySelector(".pricing-advisor-cta__desc");
    const button = advisor.querySelector(".pricing-advisor-cta__btn");
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
    ".testimonial-card",
    sections.reviews?.items,
    function (el, item) {
      const quote = el.querySelector(".testimonial-card__text");
      const name = el.querySelector(".testimonial-card__name");
      const role = el.querySelector(".testimonial-card__role");
      const status = el.querySelector(".testimonial-card__status");
      const img = el.querySelector(".testimonial-card__avatar");
      const stars = el.querySelector(".testimonial-card__stars");
      if (quote) quote.textContent = "\u201C" + item.quote + "\u201D";
      if (name) name.textContent = item.name;
      if (role) role.textContent = item.clientType;
      if (status) status.textContent = item.enrollmentText;
      if (img && item.image) {
        img.setAttribute("src", item.image.src);
        img.setAttribute("alt", item.image.alt || item.name);
      }
      if (stars && item.rating) {
        stars.setAttribute("aria-label", item.rating + " out of 5 stars");
      }
    },
  );

  applyIndexed(
    document.querySelector('[data-section="consultation"]'),
    ".consultation__benefit",
    sections.consultation?.benefits,
    function (el, item) {
      const title = el.querySelector("strong");
      const desc = el.querySelector("span:not([aria-hidden])");
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.description;
    },
  );

  applyIndexed(
    document.querySelector('[data-section="finalCta"]'),
    ".final-cta__feature-label",
    sections.finalCta?.features,
    function (el, item) {
      el.textContent = item.text;
    },
  );

  const footer = document.querySelector('[data-section="footer"]');
  if (footer && sections.footer) {
    applyIndexed(footer, ".footer__social a", sections.footer.socialLinks, function (el, item) {
      el.setAttribute("href", item.href);
      el.setAttribute("aria-label", item.label);
    });
    applyIndexed(footer, ".footer__nav-group", sections.footer.linkGroups, function (el, group) {
      const heading = el.querySelector(".footer__nav-heading");
      const trigger = el.querySelector(".footer__nav-trigger-label");
      if (heading) heading.textContent = group.title;
      if (trigger) trigger.textContent = group.title;
      applyIndexed(el, ".footer__nav-list a", group.links, function (link, item) {
        link.setAttribute("href", item.href);
        link.textContent = item.label;
      });
    });
    applyIndexed(footer, ".site-footer__bar-links a", sections.footer.legalLinks, function (el, item) {
      el.setAttribute("href", item.href);
      el.textContent = item.label;
    });
    const phone = footer.querySelector('.footer__contact-list a[href^="tel:"]');
    const email = footer.querySelector('.footer__contact-list a[href^="mailto:"]');
    if (phone && sections.footer.contact?.phone) {
      phone.setAttribute("href", sections.footer.contact.phone.href);
      setTextPreserveChildren(phone, sections.footer.contact.phone.display);
    }
    if (email && sections.footer.contact?.email) {
      email.setAttribute("href", "mailto:" + sections.footer.contact.email);
      setTextPreserveChildren(email, sections.footer.contact.email);
    }
    const contactItems = footer.querySelectorAll(".footer__contact-list li span");
    contactItems.forEach(function (span) {
      const text = span.textContent;
      if (text.includes("SE 2nd") && sections.footer.contact?.address) {
        setTextPreserveChildren(span, sections.footer.contact.address);
      }
      if (text.includes("Mon") && sections.footer.contact?.hours) {
        setTextPreserveChildren(span, sections.footer.contact.hours);
      }
    });
    const desc = footer.querySelector(".footer__brand-desc");
    if (desc && sections.footer.description) desc.textContent = sections.footer.description;
    const secure = footer.querySelector(".site-footer__bar-secure");
    if (secure && sections.footer.secureNote) {
      setTextPreserveChildren(secure, sections.footer.secureNote);
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
  applyImage(".about__image", config.sections?.about?.image);
  applyImage(
    ".consultation__visual-img",
    config.sections?.consultation?.image,
  );
  applyImage(".final-cta__visual img", config.sections?.finalCta?.image);
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
