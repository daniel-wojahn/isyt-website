# ISYT Interaction and About Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original site's hover behavior, fix the hamburger regressions and low-contrast gold-on-gold text, refine the bilingual About page, and publish the bilingual 2027 homepage announcement.

**Architecture:** Keep the existing Astro components and add only semantic wrapper classes and native CSS transitions. Extend the current build checker so the required markup, contrast selectors, reduced-motion fallback, gallery, routes, assets, translations, and form remain covered.

**Tech Stack:** Astro 7.2, HTML, CSS, native browser JavaScript, Node `assert`

## Global Constraints

- Keep the four-image About gallery and the supplied English/Tibetan content.
- Keep gold `#ce933a`, accessible link brown `#76501c`, black, white, and gray as the palette.
- Do not import WordPress or Elementor CSS/JavaScript.
- Do not add an animation library or runtime dependency.
- Preserve all routes, downloads, JotForm fields, and no-JavaScript fallbacks.
- Respect `prefers-reduced-motion: reduce`.
- Do not include the user's existing `package.json` change in feature commits.
- Do not expose or link the source `Document.pdf`.

---

### Task 1: Header and listing-card interactions

**Files:**
- Modify: `scripts/check-build.mjs`
- Modify: `src/components/Header.astro`
- Modify: `src/pages/proceedings.astro`
- Modify: `src/pages/previous-seminars.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `BaseLayout` body classes `inner-page` and `listing-page`; the existing header toggle and listing data arrays.
- Produces: three `.menu-bar` elements inside `.menu-icon`, header `.is-open` state, and `.listing-overlay` card titles.

- [ ] **Step 1: Add failing build assertions**

In `scripts/check-build.mjs`, add shared header and listing assertions after the route reference checks:

```js
for (const [route, html] of pages) {
  assert.equal((html.match(/class="menu-bar"/g) ?? []).length, 3, `${route} must render one three-bar menu icon`);
  assert(!html.includes('☰'), `${route} contains the duplicate hamburger glyph`);
}

for (const route of ['/proceedings/', '/previous-seminars/']) {
  if (!pages.has(route)) continue;
  assert.match(pages.get(route), /class="listing-overlay"/, `${route} has no hover overlay`);
}
```

After `filesUnder`, collect the built CSS once and assert the required interaction selectors:

```js
const builtFiles = await filesUnder(dist);
const css = (await Promise.all(
  builtFiles.filter((file) => extname(file) === '.css').map((file) => readFile(file, 'utf8')),
)).join('\n');
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /\.listing-page \.menu-toggle/);
assert.match(css, /\.listing-card:is\(:hover,:focus-visible\) \.listing-overlay/);
```

Reuse `builtFiles` in the existing legacy-reference loop instead of calling `filesUnder(dist)` again.

- [ ] **Step 2: Run the checker and confirm the regression test fails**

Run:

```bash
npm run build
npm run check
```

Expected: `npm run check` fails because the current header has no `.menu-bar` markup and listing pages have no `.listing-overlay`.

- [ ] **Step 3: Render a single original-style hamburger**

Replace the two visual spans inside `src/components/Header.astro` with one accessible label and three real bars:

```astro
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">
  <span class="menu-label">Menu</span>
  <span class="menu-icon" aria-hidden="true">
    <span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>
  </span>
</button>
```

In the existing click handler, synchronize the open visual state:

```ts
header?.classList.toggle('is-open', !expanded);
```

Replace the current glyph/background rules in `src/styles/global.css` with three unequal animated bars:

```css
.menu-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.menu-icon { display: grid; width: 30px; gap: 6px; justify-items: end; }
.menu-bar { width: 17px; height: 3px; background: currentColor; transition: width .3s linear, transform .3s linear, opacity .3s linear; }
.menu-bar:first-child { width: 25px; }
.menu-bar:last-child { width: 30px; }
.menu-toggle:hover .menu-bar { width: 30px; }
.site-header.is-open .menu-bar:first-child { width: 30px; transform: translateY(9px) rotate(45deg); }
.site-header.is-open .menu-bar:nth-child(2) { opacity: 0; }
.site-header.is-open .menu-bar:last-child { width: 30px; transform: translateY(-9px) rotate(-45deg); }
.listing-page .menu-toggle { color: var(--black); }
.listing-page .site-header:not(.menu-ready) .site-navigation a { color: var(--black); }
```

- [ ] **Step 4: Add the original listing overlays**

In both listing pages, replace each card's direct image/title children with this structure, using each page's existing title expression:

```astro
<a class="listing-card" href={href}>
  <div class="listing-media">
    <img src={image} alt="" />
    <div class="listing-overlay"><h2>{title}</h2></div>
  </div>
</a>
```

Add the original half-second overlay behavior to `src/styles/global.css`:

```css
.listing-media { position: relative; overflow: hidden; }
.listing-overlay { position: absolute; inset: 0; display: grid; place-items: center; padding: 15px; color: var(--white); background: rgb(105 114 125 / 80%); opacity: 0; text-align: center; transition: opacity 1s; }
.listing-card:is(:hover, :focus-visible) .listing-overlay { opacity: 1; transition-duration: .5s; }
.listing-overlay h2 { margin: 0; color: inherit; }
@media (hover: none) { .listing-overlay { align-items: end; background: linear-gradient(transparent 45%, rgb(0 0 0 / 80%)); opacity: 1; } }
```

Remove the old grayscale hover rules and below-image title spacing that the overlay replaces.

- [ ] **Step 5: Add shared transitions and reduced-motion fallback**

Add focused native transitions without animating layout:

```css
a, button { transition: color .3s, background-color .3s, opacity .3s; }
.gallery > button img { transition: opacity .3s linear; }
.gallery > button:hover img { opacity: .8; }
.feature-links a:is(:hover, :focus-visible) h2 { color: var(--black); transform: translateX(8px); }
.action-links a:is(:hover, :focus-visible), .contact-grid button:is(:hover, :focus-visible) { color: var(--black); background: var(--white); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
```

- [ ] **Step 6: Run the checker and commit Task 1**

Run:

```bash
npm run verify
git diff --check
```

Expected: all 18 routes build and `Verified 18 route(s).` is printed.

Commit only Task 1 files:

```bash
git add scripts/check-build.mjs src/components/Header.astro src/pages/proceedings.astro src/pages/previous-seminars.astro src/styles/global.css
git commit -m "fix: restore header and listing interactions"
```

---

### Task 2: About layout and contextual contrast

**Files:**
- Modify: `scripts/check-build.mjs`
- Modify: `src/pages/about-us.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing `[data-language]`, `LanguageSwitch`, `Gallery`, `Tabs`, and translated HTML.
- Produces: `.person`, `.role`, `.people-history`, `.statutes-intro`, and context-safe About styles shared by both languages.

- [ ] **Step 1: Add failing About assertions**

Extend the existing `/about-us/` block in `scripts/check-build.mjs`:

```js
assert.match(about, /class="gallery" data-gallery/, 'About gallery was removed');
assert.equal((about.match(/class="people-column"/g) ?? []).length, 2);
assert.match(about, /class="role"/);
assert.match(about, /class="statutes-intro"/);
```

Add built-CSS assertions beside the Task 1 CSS assertions:

```js
assert.match(css, /\.about-history a/);
assert.match(css, /\.about-history \.faq-list summary/);
assert.match(css, /\.statutes \.tab-list button\[aria-selected=true\]/);
```

- [ ] **Step 2: Run the checker and confirm the About test fails**

Run:

```bash
npm run build
npm run check
```

Expected: the checker fails because the current leadership and statutes intro lack the new semantic classes.

- [ ] **Step 3: Add minimal About structure classes**

Keep `<Gallery images={images} />` in its existing position. Replace the leadership section with two `.people-column` wrappers and class the role/history copy:

```astro
<section class="people content-width">
  <div class="people-column">
    <div class="person"><h2>Darig Thokmay</h2><p class="role">Current President</p></div>
    <div class="person"><h2>Daniel Wojahn</h2><p class="role">Secretary-General</p></div>
    <p class="people-history"><strong>Previously:</strong><br />Natalia Mikhaylova (President)<br />Natasha Mikles (Secretary-General)<br /><br />Kalsang Norbu Gurung (President)<br />Lewis Doney (Secretary-General)</p>
  </div>
  <div class="people-column">
    <div class="person"><h2>Board of Advisors</h2><p class="role">Since 2024</p></div>
    <p>Joie Szu-Chiao Chen (Taiwan)<br />Baatra Erdene-Ochir (Mongolia)<br />Drolma Choekyi Jusal (Austria)<br />Geshe Tri Yungdrung (Tibet)<br />Rachael Griffiths (France)<br />Tenzin Desal (India)<br />Sonam Wangmo (Tibet)<br />Tenzin Choephel (UK)</p>
  </div>
</section>
```

Wrap each statutes language heading and introduction in `.statutes-intro`, leaving each `Tabs` invocation immediately after it. For English, insert `<div class="statutes-intro">` immediately before `<h2>The Statutes of the ISYT</h2>` and close it immediately after the second existing introduction paragraph. For Tibetan, insert the same opening wrapper immediately before its existing `<h2>` and close it immediately after `<div set:html={statutesBoIntro} />`. Do not change either language's content.

- [ ] **Step 4: Match the live About hierarchy and fix contrast**

Replace the affected About rules in `src/styles/global.css` with:

```css
.about-history { padding-block: 100px; color: var(--black); background: var(--gold); }
.about-row { grid-template-columns: 30% 70%; gap: 0; padding-block: 32px; border-bottom: 1px solid rgb(0 0 0 / 55%); }
.about-row h2 { padding-right: 60px; }
.about-row > div { padding-left: 10px; }
.about-history a, .about-history .faq-list summary { color: var(--black); }
.about-history a { text-decoration: underline; text-underline-offset: 3px; }
.about-history a:is(:hover, :focus-visible), .about-history .faq-list summary:is(:hover, :focus-visible) { color: var(--black); background: var(--white); }
.faq-list details { border-color: rgb(0 0 0 / 55%); }
.faq-list summary { font-weight: 700; }
.translated-copy > p:has(strong), .translated-copy > p:first-child { color: var(--black); }
.people { grid-template-columns: 1fr 1fr; gap: 0; padding-block: 85px; text-align: center; }
.people-column { min-height: 390px; padding: 0 70px; }
.people-column + .people-column { border-left: 4px solid #dcdcdc; }
.person { margin-bottom: 42px; }
.people h2 { margin-bottom: 4px; font-size: 25px; }
.people .role { color: var(--black); font-size: 12px; text-transform: uppercase; letter-spacing: 4px; }
.people-history { color: var(--black); }
.statutes { padding-block: 75px; color: var(--black); background: var(--gold); }
.statutes-intro { width: min(100%, 950px); margin-inline: auto; }
.statutes h2 { text-align: center; }
.statutes .tabs { border: 1px solid var(--black); gap: 0; }
.statutes .tab-list { border-right: 1px solid var(--black); }
.statutes .tab-list button { border-color: transparent; padding-inline: 20px; color: var(--black); }
.statutes .tab-list button:is(:hover, :focus-visible, [aria-selected="true"]) { color: var(--white); background: var(--black); }
.statutes .tab-panels { padding: 24px; }
```

Add gold-section contrast for the home announcement as well:

```css
.announcement a { color: var(--black); font-weight: 700; text-decoration: underline; }
.announcement a:is(:hover, :focus-visible) { color: var(--black); background: var(--white); }
```

In the mobile media query, stack and remove dividing borders:

```css
.about-row { grid-template-columns: 1fr; }
.about-row h2, .about-row > div { padding-inline: 0; }
.people-column { min-height: 0; padding: 35px 0; }
.people-column + .people-column { border-top: 4px solid #dcdcdc; border-left: 0; }
.statutes .tabs { border: 0; }
.statutes .tab-list { border-right: 0; }
.statutes .tab-panels { padding: 0; }
```

- [ ] **Step 5: Run the checker and commit Task 2**

Run:

```bash
npm run verify
git diff --check
```

Expected: all 18 routes build and `Verified 18 route(s).` is printed.

Commit only Task 2 files:

```bash
git add scripts/check-build.mjs src/pages/about-us.astro src/styles/global.css
git commit -m "fix: refine About layout and contrast"
```

---

### Task 3: Bilingual 2027 homepage announcement and current footer

**Files:**
- Modify: `scripts/check-build.mjs`
- Modify: `src/pages/index.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: the supplied English PDF content and user-provided Tibetan text.
- Produces: `.announcement-heading`, `.announcement-languages`, and `.announcement-language` content, the new conference email, and an automatically current copyright year.

- [ ] **Step 1: Add failing homepage assertions**

Extend the existing homepage and shared-output checks to require:

```js
assert.match(home, /19–23 July 2027/);
assert.match(home, /Korea University · Seoul, South Korea/);
assert.match(home, /isyt2027koreauniversity@gmail\.com/);
assert.match(home, /Seongmin, Anju, Seungjong, Shawo and Youjung/);
assert.match(home, /རྒྱལ་སྤྱིའི་གཞོན་ནུ་བོད་རིག་པའི་གྲོས་ཚོགས་ཐེངས་བརྒྱད་པ།/);
assert.match(home, /class="announcement-languages"/);
assert(!home.includes('23–27 August 2027'));
assert(!home.includes('isyt2024@wolfson.ox.ac.uk'));
assert.match(home, /data-copyright-year/);
```

- [ ] **Step 2: Run the checker and confirm the homepage test fails**

Run `npm run build && npm run check`. The checker must fail on the outdated homepage before implementation.

- [ ] **Step 3: Replace the announcement and footer content**

Update the hero date and venue, render the full English and supplied Tibetan text in two semantic language columns, update the email link, use the approved English convenor list exactly, and keep `Document.pdf` unlinked. Preserve the form unchanged.

Set the footer year from `new Date().getFullYear()` at build time and update it from the visitor's current year with the existing native inline-script pattern. Add no dependency.

- [ ] **Step 4: Add minimal responsive styles**

Use the existing gold section and typography. Create a two-column `.announcement-languages` grid, a constrained centered heading, a subtle column divider, accessible black underlined links, and a one-column mobile fallback.

- [ ] **Step 5: Run the checker and commit Task 3**

Run `npm run verify` and `git diff --check`, then commit only the homepage, footer, CSS, and checker changes.

---

### Task 4: Browser verification and cleanup

**Files:**
- Verify: `dist/`
- Delete after verification: `/private/tmp/isyt-original-*.css`, `/private/tmp/isyt-original-*.html`, `/private/tmp/isyt-*-compare.png`, and `/private/tmp/chrome-isyt-*-compare`

**Interfaces:**
- Consumes: production `dist/` output.
- Produces: no source changes; only verification evidence and removal of temporary comparison files.

- [ ] **Step 1: Run the final automated verification**

Run:

```bash
npm run verify
git diff --check
git status --short
```

Expected: 18 routes verified, no whitespace errors, and only the user's pre-existing `package.json` change and source `Document.pdf` remain uncommitted.

- [ ] **Step 2: Browser-check representative pages**

At desktop and mobile widths, check:

- `/about-us/`: gallery retained; all gold-section copy, FAQ summaries, links, and tab states visible; leadership centered; English/Tibetan switch works.
- `/proceedings/` and `/previous-seminars/`: black three-bar hamburger visible on gold; menu opens once; cards reveal title overlays on hover/focus.
- `/`: feature links, announcement links, gallery images, buttons, and footer links transition without losing contrast.

Open/close the menu with keyboard and pointer and verify the three bars become one close mark without a duplicate glyph.

- [ ] **Step 3: Remove temporary comparison artifacts**

Resolve the exact matching files with `find /private/tmp -maxdepth 1` before deleting them. Remove only the `isyt-original-*`, `isyt-*-compare.png`, and `chrome-isyt-*-compare` paths created for this task, then confirm the same `find` returns no matches.

- [ ] **Step 4: Run one fresh final verification**

Run:

```bash
npm run verify
git diff --check
git status --short
```

Expected: 18 routes verified, no whitespace errors, and no feature changes left uncommitted.
