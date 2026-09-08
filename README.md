# DONORDOC-01 V1

Website System for Frontlens. Static HTML, modular Sass, and ES module JavaScript.

Do not change visual design, copy, or interactions unless Frontlens asks.

## Layout

- `index.html` — page structure
- `scss/` — style source of truth (`style.scss` imports partials)
- `css/style.css` — compiled output. Do not edit by hand.
- `css/vendor/` — Bootstrap utilities and the date picker stylesheet
- `js/app.js` — JavaScript entry (`type="module"`)
- `js/components/`, `js/sections/`, `js/utilities/` — feature modules
- `js/vendor/` — FLDatePicker (global)
- `config/` — `siteConfig.json` and `themeRegistry.js`
- `assets/images/` — image assets

Empty `pages/`, `assets/icons/`, and `assets/fonts/` are omitted until those files exist.

## Sass

```bash
npm install
npm run build:css
```

`npm run watch:css` rebuilds while you edit `scss/`.

## JavaScript

`js/app.js` loads modules. A module initializes only when its DOM exists, so a missing section does not break navigation, forms, or other features.

Swiper loads from the CDN as a global. Date picker stays on `window.FLDatePicker`.

## Local preview

Do not double-click `index.html` to open it. Preview the site with Live Server (port 5506) or another local web preview from this folder. That is how the browser is able to load the split JavaScript files. On a real hosted website this is already handled for you.
