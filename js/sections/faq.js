/*
Website System Name: DONORDOC-01 V1
Author: FRONTLENS LLC
License: For personal/business use only. Redistribution, resale, or sublicensing is strictly Copyright (c) 2026 FRONTLENS LLC. All rights reserved.
*/
import { getSiteConfig } from "../utilities/site-config.js";
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFaqItem(item, index) {
  const number = String(index + 1).padStart(2, "0");
  const triggerId = `faq-trigger-${number}`;
  const panelId = `faq-panel-${number}`;
  const isOpen = Boolean(item.openByDefault || item.open);
  const question = escapeHtml(item.question || "");
  const answer = escapeHtml(item.answer || "");

  return `
    <div class="faq-item${isOpen ? " is-open" : ""}" data-faq-item>
      <h3 class="faq-item__heading">
        <button
          type="button"
          class="faq-item__trigger"
          data-faq-trigger
          id="${triggerId}"
          aria-expanded="${isOpen ? "true" : "false"}"
          aria-controls="${panelId}"
        >
          <span class="faq-item__number">${number}</span>
          <span class="faq-item__divider" aria-hidden="true"></span>
          <span class="faq-item__question">${question}</span>
          <span class="faq-item__toggle" aria-hidden="true">
            <span class="faq-item__toggle-icon faq-item__toggle-icon-plus">+</span>
            <span class="faq-item__toggle-icon faq-item__toggle-icon-minus">&#8722;</span>
          </span>
        </button>
      </h3>
      <div
        class="faq-item__panel"
        data-faq-panel
        id="${panelId}"
        role="region"
        aria-labelledby="${triggerId}"
        ${isOpen ? "" : "hidden"}
      >
        <div class="faq-item__panel-inner">
          <div class="faq-item__panel-content">
            <p>${answer}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function wireFaqAccordion(section) {
  const items = Array.from(section.querySelectorAll("[data-faq-item]"));
  if (!items.length) return;

  const closePanel = (item, panel, trigger) => {
    if (!item.classList.contains("is-open")) return;

    item.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");

    panel.style.transition =
      "height 300ms ease-in-out, opacity 280ms ease-in-out";
    panel.style.height = `${panel.scrollHeight}px`;
    panel.style.opacity = "1";

    requestAnimationFrame(() => {
      panel.style.height = "0px";
      panel.style.opacity = "0";
    });

    const onCloseEnd = (event) => {
      if (event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onCloseEnd);
      panel.hidden = true;
      panel.style.height = "";
      panel.style.opacity = "";
      panel.style.transition = "";
    };

    panel.addEventListener("transitionend", onCloseEnd);
  };

  const openPanel = (item, panel, trigger) => {
    item.classList.add("is-open");
    panel.hidden = false;
    panel.style.transition = "height 350ms ease-out, opacity 350ms ease-out";
    panel.style.height = "0px";
    panel.style.opacity = "0";

    const targetHeight = panel.scrollHeight;

    requestAnimationFrame(() => {
      panel.style.height = `${targetHeight}px`;
      panel.style.opacity = "1";
    });

    const onOpenEnd = (event) => {
      if (event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onOpenEnd);
      panel.style.height = "auto";
      trigger.setAttribute("aria-expanded", "true");
    };

    panel.addEventListener("transitionend", onOpenEnd);
  };

  items.forEach((item) => {
    const trigger = item.querySelector("[data-faq-trigger]");
    const panel = item.querySelector("[data-faq-panel]");
    if (!trigger || !panel) return;

    if (item.classList.contains("is-open")) {
      panel.hidden = false;
      panel.style.height = "auto";
      panel.style.opacity = "1";
      trigger.setAttribute("aria-expanded", "true");
    }

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      if (isOpen) {
        closePanel(item, panel, trigger);
        return;
      }

      items.forEach((otherItem) => {
        if (otherItem === item) return;
        const otherTrigger = otherItem.querySelector("[data-faq-trigger]");
        const otherPanel = otherItem.querySelector("[data-faq-panel]");
        if (otherTrigger && otherPanel) {
          closePanel(otherItem, otherPanel, otherTrigger);
        }
      });

      openPanel(item, panel, trigger);
    });
  });
}

export function initFaqAccordion() {
  try {
    const section = document.querySelector('[data-section="faq"]');
    const faqList = document.getElementById("faq-list");
    if (!section || !faqList) return;

    const config = getSiteConfig();
    const items = Array.isArray(config?.sections?.faq?.items)
      ? config.sections.faq.items
      : [];
    if (!items.length) return;

    faqList.innerHTML = items.map(renderFaqItem).join("");
    wireFaqAccordion(section);
  } catch (e) {
    console.error("initFaqAccordion error:", e);
  }
}
