/*
Website System Name: DONORDOC-01 V1
Author: FRONTLENS LLC
License: For personal/business use only. Redistribution, resale, or sublicensing is strictly Copyright (c) 2026 FRONTLENS LLC. All rights reserved.
*/
import { getSiteConfig } from "../utilities/site-config.js";

function closeAllDropdowns(allDropdowns, exceptThis = null) {
  allDropdowns.forEach((select) => {
    if (select !== exceptThis) {
      const options = select.querySelector("[data-select-options]");
      options.classList.remove("show-drop");
    }
  });
}

export function initConsultationSection() {
  try {
    const section = document.getElementById("consultation-cta");
    if (!section) return;

    const scheduling = getSiteConfig()?.sections?.consultation?.scheduling || {};
    const fields = getSiteConfig()?.sections?.consultation?.form?.fields || {};

    if (typeof window.FLDatePicker === "function") {
      const dateEl = document.getElementById("consultation-date");
      const timeEl = document.getElementById("consultation-time");

      if (dateEl) {
        new window.FLDatePicker(dateEl, {
          type: "date",
          placeholder: fields.preferredDate?.placeholder || "Select date",
          disablePast: true,
          closeOnSelect: false,
          closeOnSelectDelay: 400,
        });
      }

      if (timeEl) {
        new window.FLDatePicker(timeEl, {
          type: "time",
          timeStep: scheduling.timeStepMinutes || 15,
          placeholder: fields.preferredTime?.placeholder || "Select time",
          closeOnSelect: false,
          closeOnSelectDelay: 400,
          disabledTimes: scheduling.disabledTimes || [],
        });
      }
    }

    const selects = section.querySelectorAll("[data-select]");
    let activeSelect = null;

    selects.forEach((select) => {
      const selected = select.querySelector("[data-select-value]");
      const options = select.querySelector("[data-select-options]");
      if (!selected || !options) return;

      selected.addEventListener("click", function (e) {
        e.stopPropagation();

        if (select === activeSelect) {
          options.classList.remove("show-drop");
          activeSelect = null;
          return;
        }

        closeAllDropdowns(selects, select);
        options.classList.add("show-drop");
        activeSelect = select;
      });

      selected.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selected.click();
        }
      });

      select.querySelectorAll("[data-select-option]").forEach((option) => {
        option.addEventListener("click", function (e) {
          e.stopPropagation();
          selected.textContent = this.textContent;
          selected.classList.remove("is-placeholder");
          options.classList.remove("show-drop");
          activeSelect = null;
        });
      });
    });

    document.addEventListener("click", function () {
      if (!activeSelect) return;
      const options = activeSelect.querySelector("[data-select-options]");
      if (options) options.classList.remove("show-drop");
      activeSelect = null;
    });

    const form = section.querySelector("[data-consultation-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const coverage =
          section
            .querySelector("#consultation-coverage [data-select-value]")
            ?.textContent.trim() || "";
        const contactMethod =
          section
            .querySelector("#consultation-contact [data-select-value]")
            ?.textContent.trim() || "";

        const payload = {
          date:
            section
              .querySelector("#consultation-date .fl-picker-input")
              ?.value.trim() || "",
          time:
            section
              .querySelector("#consultation-time .fl-picker-input")
              ?.value.trim() || "",
          coverageType: coverage,
          contactMethod,
          firstName:
            section.querySelector("#consultation-first-name")?.value.trim() ||
            "",
          lastName:
            section.querySelector("#consultation-last-name")?.value.trim() ||
            "",
          email:
            section.querySelector("#consultation-email")?.value.trim() || "",
          phone:
            section.querySelector("#consultation-phone")?.value.trim() || "",
          notes:
            section.querySelector("#consultation-notes")?.value.trim() || "",
        };

        alert(JSON.stringify(payload, null, 2));
      });
    }
  } catch (err) {
    console.error("initConsultationSection error:", err);
  }
}
