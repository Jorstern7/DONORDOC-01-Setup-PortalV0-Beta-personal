Website System Name: DONORDOC-01 V1
Author: FRONTLENS LLC
License: For personal/business use only. Redistribution, resale, or sublicensing is strictly Copyright (c) 2026 FRONTLENS LLC. All rights reserved.

Frontlens Portal metadata for DONORDOC-01. It stays in this development tree for PART 2. The Website System does not load this directory. Taking it out of the customer copy is a later step.

`setupPortalSchema.js` is `websiteSystemId` DONORDOC-01, `schemaVersion` 1.

A group contains `groups` or `fields`. Branding, Theme, SEO & Social Sharing, and Navigation are top-level. `sections` contains the section groups. Group ids, field ids, and paths match schema version 1, except legal links.

Version 1 used six legal-link fields: `footer-privacy-label`, `footer-privacy-href`, `footer-terms-label`, `footer-terms-href`, `footer-site-map-label`, `footer-site-map-href`. Version 2 uses the collection `footer-legal-links` on `sections.footer.legalLinks`, with `itemKey` `id`. Item ids stay `privacy`, `terms`, and `siteMap`. `itemRules` is keyed by those ids. The collection does not grant add, remove, reorder, or edit. That stays Step 3.

Phone, email, address, and hours may be absent. For those contact values, absence is a missing key, null, or a blank string, which is how the footer drops the row. Phone is one item: a missing phone or a blank display drops the display and href requirements together. A present phone requires both.

Site Map is removed by deleting the whole `sections.footer.legalLinks` item whose `id` is `siteMap`. Blanking that item's label or href is not removal. A Site Map item that is still in the array requires its label and href, and the label max length stays 13. Privacy and Terms items stay required. Their labels have no max length.

A `url` field names a `destinationRule`. Patterns live on `destinationRules.formats`. A value is valid when it matches one accepted format. Canonical and social URLs use `absoluteWebUrl` only.

`sections.footer.businessName` has no max length. No approved limit is on record for image file type, file size, image dimensions, or collection `minItems` / `maxItems`. Those stay unset.

`sections.reviews.items[].rating` is an integer from 1 to 5.

`sections.consultation.scheduling.timeStepMinutes` and `disabledTimes` stay out of the schema. They are Frontlens runtime settings in siteConfig. The Consultation date picker reads them from there. They are not customer-editable.
