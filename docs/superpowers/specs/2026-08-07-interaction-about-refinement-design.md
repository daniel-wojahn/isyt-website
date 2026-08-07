# ISYT Interaction and About Page Refinement

## Goal

Restore the original site's hover behavior, correct low-contrast colors, and refine the Astro About page against the live site while retaining the Astro page's gallery strip and bilingual English/Tibetan content.

## Header and navigation

- Render one hamburger made from three unequal CSS bars, matching the original site's 17/25/30px rhythm.
- Expand the bars on hover and transform them into a close mark while the menu is open.
- Use white bars over gold listing pages and gold bars over white pages.
- Keep the existing accessible button state, keyboard operation, focus treatment, and readable no-JavaScript navigation.
- Use the existing dropdown and native JavaScript; add no dependency.

## Hover and focus behavior

- Restore the original half-second card overlay: image tiles reveal their white title over an 80%-opaque gray overlay.
- Fade gallery images to 80% opacity on hover.
- Add short color/background transitions to links, buttons, navigation, language controls, tabs, and pagination.
- Give keyboard focus the same visual clarity as hover.
- Disable nonessential motion under `prefers-reduced-motion: reduce`.

## Contextual color system

- Keep the established gold `#ce933a`, link brown `#b98535`, black, white, and gray palette.
- On white sections, retain brown links with gold hover states.
- On gold sections, use white text and links with a black hover state so no link, subheading, FAQ label, or selected tab disappears into the background.
- On black sections, use white text with gold hover states.
- Keep visible focus outlines in every context.

## About page layout

- Keep the four-image gallery strip directly beneath the page heading and language switch.
- Retain the live page's 30/70 history rows, generous gold-section spacing, white typography, and light separators.
- Style FAQ summaries as visible white rows with a small disclosure marker and clear hover/focus feedback.
- Center the leadership and Board of Advisors content in two equal white columns separated by a vertical gray rule. Use small uppercase, letter-spaced role labels.
- Retain the gold statutes section with a centered heading, constrained introduction, and a bordered two-column tab interface. Active and hover states remain legible against gold.
- Apply the same layout and contrast rules to Tibetan content without changing the supplied translations.
- On mobile, stack history rows, leadership columns, and tabs while preserving readable spacing and controls.

## Verification

- Extend the existing build checker to require a single three-bar hamburger, listing-card overlay markup, and the retained About gallery.
- Verify all 18 routes, internal assets, downloads, JotForm fields, Tibetan markers, and no-JavaScript fallbacks as before.
- Browser-check desktop and mobile About, Proceedings, and Previous Seminars pages, including hamburger open/close and representative hover states.

## Exclusions

- Do not import WordPress or Elementor CSS/JavaScript.
- Do not add an animation library or new runtime dependency.
- Do not change content, routes, translations, downloads, or form endpoints.
