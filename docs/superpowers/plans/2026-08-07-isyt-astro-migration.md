# ISYT Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the downloaded ISYT WordPress export with a clean Astro project that produces the same static public site, retained URLs, interactions, and approved English/Tibetan About Us content.

**Architecture:** Astro 7.2.0 renders one static HTML file tree with directory-style URLs. Shared Astro components own only genuinely repeated layout or behavior; individual `.astro` pages keep the long-form content easy to edit. One Node standard-library script verifies routes, links, assets, translations, the JotForm contract, and removal of WordPress output.

**Tech Stack:** Astro 7.2.0, semantic HTML5, CSS, Astro-processed TypeScript, Node.js 26 standard library, npm.

## Global Constraints

- Follow `docs/superpowers/specs/2026-08-07-astro-migration-design.md` exactly.
- Preserve the current visible layout at desktop and mobile sizes; this is a migration, not a redesign.
- Preserve all retained route URLs, page copy, downloadable-file URLs, external links, social links, and mail links.
- Keep the JotForm `POST` target `https://eu-submit.jotform.com/submit/231243775978065`, form ID `231243775978065`, and existing field names.
- Use the supplied Tibetan translations verbatim; do not machine-translate or rewrite them.
- Use no UI framework, CMS, database, server runtime, translation library, lightbox library, or test framework.
- Keep JavaScript limited to the mobile menu, tabs, gallery lightbox, and About Us language switch.
- Do not delete legacy inputs until a production build and the complete verification script pass.
- Execute in the current workspace: the legacy migration inputs are untracked and therefore unavailable in a new Git worktree.

---

## File Map

**Project foundation**

- Create: `package.json` — npm scripts and the single Astro dependency.
- Create: `package-lock.json` — npm-generated dependency lock.
- Create: `astro.config.mjs` — static directory-style output.
- Create: `.gitignore` — dependency/cache/build exclusions.
- Create: `scripts/check-build.mjs` — dependency-free production-output verification.

**Shared presentation**

- Create: `src/layouts/BaseLayout.astro` — document metadata, shared header/footer, global CSS.
- Create: `src/components/Header.astro` — logo and desktop/mobile navigation.
- Create: `src/components/Footer.astro` — copyright, credit, social/mail links, back-to-top.
- Create: `src/components/LanguageSwitch.astro` — About Us English/Tibetan control.
- Create: `src/components/Tabs.astro` — accessible statutes and FAQ tabs.
- Create: `src/components/Gallery.astro` — responsive gallery and native-dialog lightbox.
- Create: `src/layouts/ProceedingLayout.astro` — shared proceedings-detail presentation.
- Create: `src/layouts/ConferenceReportLayout.astro` — shared conference-report metadata presentation.
- Create: `src/styles/global.css` — all site styling and responsive rules.

**Pages**

- Create: `src/pages/index.astro`
- Create: `src/pages/about-us.astro`
- Create: `src/pages/proceedings.astro`
- Create: `src/pages/previous-seminars.astro`
- Create: `src/pages/conference-faq.astro`
- Create: `src/pages/1st-isyt-conference-report.astro`
- Create: `src/pages/2nd-isyt-conference-report.astro`
- Create: `src/pages/3rd-isyt-conference-report.astro`
- Create: `src/pages/4th-isyt-conference-report.astro`
- Create: `src/pages/5th-isyt-conference-report.astro`
- Create: `src/pages/6th-isyt-conference-report.astro`
- Create: `src/pages/reports/1st-isyt-proceedings.astro`
- Create: `src/pages/reports/2nd-isyt-proceedings-pt-1.astro`
- Create: `src/pages/reports/2nd-isyt-proceedings-pt-2.astro`
- Create: `src/pages/reports/3rd-isyt-proceedings-2012.astro`
- Create: `src/pages/reports/4th-isyt-proceedings-2015.astro`
- Create: `src/pages/reports/5th-isyt-proceedings.astro`
- Create: `src/pages/reports/6th-isyt-proceedings.astro`

**Static files**

- Create: `public/assets/` — only images and fonts referenced by retained pages.
- Create: `public/7th ISYT-Call for Papers.pdf`
- Create: `public/7th-ISYT-first_announcement.pdf`
- Create: `public/Book-of-Abstracts_FINAL.pdf`
- Create: `public/ISYT2024--poster_template.pptx`
- Create: `public/LMH-instructions.pdf`
- Create: `public/Presentation_Q&A.pdf`
- Create: `public/archive/ISYT-Paris-Programme-2009.pdf`

### Task 1: Establish the Static Astro Shell and Homepage

**Files:**

- Create: `package.json`
- Create: `package-lock.json`
- Create: `astro.config.mjs`
- Create: `.gitignore`
- Create: `scripts/check-build.mjs`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro`

**Interfaces:**

- `BaseLayout.astro` consumes `title: string`, `description?: string`, and a default slot.
- `Header.astro` emits the canonical four-link navigation.
- `Footer.astro` emits footer links and the `#top` anchor target.
- `scripts/check-build.mjs` accepts optional route arguments; with no route arguments it checks every final route.

- [ ] **Step 1: Preserve a temporary recovery copy and baseline images**

Confirm the exact workspace before creating a temporary archive:

```bash
test "$PWD" = "/Users/danielwojahn/Downloads/ISYT"
tar -czf /private/tmp/isyt-legacy-export.tgz \
  index.html about-us proceedings previous-seminars conference-faq \
  1st-isyt-conference-report 2nd-isyt-conference-report \
  3rd-isyt-conference-report 4th-isyt-conference-report \
  5th-isyt-conference-report 6th-isyt-conference-report \
  reports wp-content wp-includes Translations archive \
  "7th ISYT-Call for Papers.pdf" 7th-ISYT-first_announcement.pdf \
  Book-of-Abstracts_FINAL.pdf ISYT2024--poster_template.pptx \
  LMH-instructions.pdf Presentation_Q&A.pdf
```

Serve the untouched export and capture desktop/mobile baselines for `/`, `/about-us/`, `/proceedings/`, `/previous-seminars/`, `/conference-faq/`, one conference report, and one proceedings detail page. Store the screenshots under `/private/tmp/isyt-baseline/`; do not add them to the repository.

- [ ] **Step 2: Write the failing production-output check**

Create `scripts/check-build.mjs` with Node standard-library assertions:

```js
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const allRoutes = [
  '/', '/about-us/', '/proceedings/', '/previous-seminars/',
  '/conference-faq/', '/1st-isyt-conference-report/',
  '/2nd-isyt-conference-report/', '/3rd-isyt-conference-report/',
  '/4th-isyt-conference-report/', '/5th-isyt-conference-report/',
  '/6th-isyt-conference-report/', '/reports/1st-isyt-proceedings/',
  '/reports/2nd-isyt-proceedings-pt-1/',
  '/reports/2nd-isyt-proceedings-pt-2/',
  '/reports/3rd-isyt-proceedings-2012/',
  '/reports/4th-isyt-proceedings-2015/',
  '/reports/5th-isyt-proceedings/', '/reports/6th-isyt-proceedings/'
];
const requested = process.argv.slice(2);
const routes = requested.length ? requested : allRoutes;
const routeFile = (route) => join(dist, route.replace(/^\//, ''), 'index.html');
const pages = new Map();

for (const route of routes) {
  const file = routeFile(route);
  await access(file);
  pages.set(route, await readFile(file, 'utf8'));
}

for (const [route, html] of pages) {
  assert(!/wordpress|elementor|wp-content|wp-includes/i.test(html), `${route} contains WordPress output`);
}

if (pages.has('/')) {
  const home = pages.get('/');
  assert.match(home, /International Seminar of/);
  assert.match(home, /action="https:\/\/eu-submit\.jotform\.com\/submit\/231243775978065"/);
  assert.match(home, /name="formID" value="231243775978065"/);
  assert.match(home, /name="q6_name"/);
  assert.match(home, /name="q4_email"/);
  assert.match(home, /name="q5_message"/);
}

if (pages.has('/about-us/')) {
  const about = pages.get('/about-us/');
  assert.match(about, /data-language="en"/);
  assert.match(about, /data-language="bo"/);
  assert.match(about, /རྒྱལ་སྤྱིའི་གཞོན་ནུ་བོད་རིག་པའི་ཚོགས་པའི་སྐོར།/);
  assert.match(about, /རྒྱལ་སྤྱིའི་གཞོན་ནུ་བོད་རིག་པའི་ཚོགས་པའི་གཞུང་འབྲེལ་བཅའ་ཡིག/);
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : path;
  }));
  return nested.flat();
}

for (const file of await filesUnder(dist)) {
  if (!['.html', '.css', '.js'].includes(extname(file))) continue;
  const contents = await readFile(file, 'utf8');
  assert(!/wp-content|wp-includes|elementor/i.test(contents), `${file} contains a legacy reference`);
}

console.log(`Verified ${routes.length} route(s).`);
```

- [ ] **Step 3: Run the check and confirm RED**

Run:

```bash
node scripts/check-build.mjs /
```

Expected: failure because `dist/index.html` does not exist.

- [ ] **Step 4: Add the minimal Astro configuration**

Create `package.json`:

```json
{
  "name": "isyt",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "check": "node scripts/check-build.mjs",
    "verify": "npm run build && npm run check"
  },
  "dependencies": {
    "astro": "7.2.0"
  }
}
```

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'always'
});
```

Create `.gitignore`:

```gitignore
node_modules/
.astro/
dist/
.DS_Store
```

Run `npm install` to generate `package-lock.json`.

- [ ] **Step 5: Implement the shared shell**

Create `BaseLayout.astro` with semantic metadata and imports:

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'International Seminar of Young Tibetologists' } = Astro.props;
---

<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body id="top">
    <Header />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

Implement `Header.astro` with the four exact links: About us, Proceedings, Previous Seminars, and Conference FAQs. Use one `<button aria-expanded="false">` for the mobile menu and an Astro-processed `<script>` that toggles only the menu’s `hidden` state and `aria-expanded` value.

Implement `Footer.astro` with `© 2023 ISYT. All rights reserved.`, `Webdesign by Daniel Wojahn`, the existing Facebook group URL, the existing `mailto:` URL, and an accessible “Back to top” link to `#top`.

- [ ] **Step 6: Rebuild the homepage without WordPress markup**

Use `index.html` as the verbatim copy/link/image source. Recreate these sections in `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="International Seminar of Young Tibetologists – རྒྱལ་སྤྱིའི་གཞོན་ནུའི་བོད་རིག་པའི་གྲོས་ཚོགས།">
  <section class="hero">
    <p class="eyebrow">Welcome to the</p>
    <h1>International Seminar of<br />Young Tibetologists</h1>
    <p class="hero-date">23–27 August 2027</p>
  </section>
  <section class="announcement content-width">
    <h2>First Announcement<br /><span lang="bo">གསལ་བསྒྲགས་དང་པོ།</span></h2>
  </section>
  <section class="feature-links content-width" aria-label="Explore ISYT"></section>
  <section class="contact-section">
    <h2>Get in touch</h2>
    <form action="https://eu-submit.jotform.com/submit/231243775978065" method="post" id="231243775978065">
      <input type="hidden" name="formID" value="231243775978065" />
      <label>Name <input name="q6_name" required /></label>
      <label>Email <input type="email" name="q4_email" required /></label>
      <label>Message <textarea name="q5_message" required></textarea></label>
      <input class="honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <button type="submit">Submit</button>
    </form>
  </section>
</BaseLayout>
```

Fill the announcement and three feature-link cards with the exact current text and retained links from `index.html`. Preserve the existing hero/background/logo images with new `/assets/` URLs. Do not copy JotForm’s remote styles or JavaScript.

Recreate the current gold/black/white palette, Josefin Sans/Biryani typography, 1190px content width, responsive breakpoints, hero proportions, card layout, contact section, focus treatment, and mobile menu in `global.css`.

- [ ] **Step 7: Build and confirm GREEN for the homepage**

Run:

```bash
npm run build
node scripts/check-build.mjs /
```

Expected: build succeeds and prints `Verified 1 route(s).`

- [ ] **Step 8: Compare the homepage with its baseline**

Run the Astro preview, capture the same desktop/mobile dimensions as the baseline, and compare header, hero, type scale, spacing, feature cards, form, footer, mobile menu, and focus states. Correct only migration differences, then rerun Step 7.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs .gitignore scripts src
git commit -m "feat: establish Astro site shell and homepage"
```

### Task 2: Build the Bilingual About Us Page

**Files:**

- Create: `src/components/LanguageSwitch.astro`
- Create: `src/components/Tabs.astro`
- Create: `src/pages/about-us.astro`
- Modify: `src/styles/global.css`
- Modify: `scripts/check-build.mjs`

**Interfaces:**

- `LanguageSwitch.astro` controls sibling elements with `data-language="en"` and `data-language="bo"` inside the nearest `data-language-root`.
- `Tabs.astro` consumes `items: { label: string; content: string }[]` and `label: string`.

- [ ] **Step 1: Confirm the About Us check is RED**

Run:

```bash
npm run build
node scripts/check-build.mjs /about-us/
```

Expected: failure because `dist/about-us/index.html` does not exist.

- [ ] **Step 2: Implement the language control**

Create `LanguageSwitch.astro`:

```astro
<div class="language-switch" role="group" aria-label="Page language">
  <button type="button" data-language-button="en" aria-pressed="true">English</button>
  <button type="button" data-language-button="bo" aria-pressed="false" lang="bo">བོད་ཡིག</button>
</div>

<script>
  const root = document.querySelector('[data-language-root]');
  if (root) {
    const buttons = root.querySelectorAll<HTMLButtonElement>('[data-language-button]');
    const panels = root.querySelectorAll<HTMLElement>('[data-language]');
    const select = (language: string) => {
      panels.forEach((panel) => { panel.hidden = panel.dataset.language !== language; });
      buttons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.languageButton === language));
      });
      sessionStorage.setItem('isyt-language', language);
    };
    buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.languageButton!)));
    select(sessionStorage.getItem('isyt-language') === 'bo' ? 'bo' : 'en');
  }
</script>
```

- [ ] **Step 3: Implement accessible reusable tabs**

Create `Tabs.astro` so it renders a `role="tablist"`, one button per item with `aria-controls`, and one `role="tabpanel"` per item. Its Astro-processed script must support click, ArrowUp/ArrowDown or ArrowLeft/ArrowRight, Home, and End; it must keep `aria-selected`, `tabindex`, and `hidden` synchronized. Render the supplied trusted page content with `set:html`.

- [ ] **Step 4: Import the approved translations**

Extract without rewriting:

```bash
pandoc "Translations/About the ISYT .docx" -t html --wrap=none -o /private/tmp/isyt-about-bo.html
pandoc "Translations/The Statutes of ISYT .docx" -t html --wrap=none -o /private/tmp/isyt-statutes-bo.html
```

Use the two temporary HTML files only as transcription sources. Preserve every Tibetan character and paragraph boundary in the Astro page. Map the nine Tibetan statute headings in order to the same nine tabs as the English statutes.

- [ ] **Step 5: Build the About Us page**

Create one `data-language-root` containing `LanguageSwitch`, an English panel, and a Tibetan panel:

```astro
<div data-language-root>
  <LanguageSwitch />
  <div data-language="en">
    <section class="about-copy"></section>
    <section class="statutes"><Tabs label="The Statutes of the ISYT" items={englishStatutes} /></section>
  </div>
  <div data-language="bo" lang="bo" hidden>
    <section class="about-copy"></section>
    <section class="statutes"><Tabs label="རྒྱལ་སྤྱིའི་གཞོན་ནུ་བོད་རིག་པའི་ཚོགས་པའི་གཞུང་འབྲེལ་བཅའ་ཡིག" items={tibetanStatutes} /></section>
  </div>
</div>
```

Transcribe the English About Us page and nine English statutes verbatim from `about-us/index.html`. Preserve the existing photo grid and “Young Tibetologist” expandable content, using `Gallery` later for the photo grid and native `<details>` for the expandable definition.

Add Tibetan-capable font fallbacks, increased Tibetan line height, responsive tabs, language-button states, and `[hidden] { display: none !important; }` to `global.css`.

- [ ] **Step 6: Build and confirm GREEN**

Run:

```bash
npm run build
node scripts/check-build.mjs /about-us/
```

Expected: build succeeds, both Tibetan assertions pass, and the route is WordPress-free.

- [ ] **Step 7: Compare and keyboard-test**

Compare the English page to the desktop/mobile baseline. Switch languages, reload within the same tab to verify session persistence, open every statute tab in both languages, and test the switch/tabs using only the keyboard.

- [ ] **Step 8: Commit**

```bash
git add src/components/LanguageSwitch.astro src/components/Tabs.astro src/pages/about-us.astro src/styles/global.css scripts/check-build.mjs
git commit -m "feat: add bilingual About Us and statutes"
```

### Task 3: Build Proceedings, Seminar Listings, and Conference FAQs

**Files:**

- Create: `src/pages/proceedings.astro`
- Create: `src/pages/previous-seminars.astro`
- Create: `src/pages/conference-faq.astro`
- Modify: `src/styles/global.css`

**Interfaces:**

- Listing cards are ordinary semantic links styled by `.listing-grid` and `.listing-card`; do not add a card component.
- `conference-faq.astro` reuses `Tabs.astro`.

- [ ] **Step 1: Confirm the three routes are RED**

Run:

```bash
npm run build
node scripts/check-build.mjs /proceedings/ /previous-seminars/ /conference-faq/
```

Expected: failure on the first missing route.

- [ ] **Step 2: Implement the proceedings listing**

Transcribe the seven cards from `proceedings/index.html` in their current order. Preserve every title, image, and link. Use this semantic structure for each card:

```astro
<a class="listing-card" href="/reports/6th-isyt-proceedings/">
  <img src="/assets/elementor/thumbs/Screenshot-2025-08-03-at-11.07.12-r9pwfs33c41mmivhwte8f7kehysbgcg3nksxvgdchc.png" alt="" />
  <h2>6th ISYT Proceedings</h2>
</a>
```

- [ ] **Step 3: Implement the previous-seminars listing**

Transcribe the six conference-report cards from `previous-seminars/index.html`, preserving order, images, titles, and links to the six conference-report routes listed in the File Map.

- [ ] **Step 4: Implement the FAQ page**

Transcribe all current English and Tibetan FAQ content from `conference-faq/index.html`. Reuse `Tabs.astro` for Accommodation, Travel Grants, Final upload of abstracts, and Getting to Oxford. Preserve every external booking/travel link and the local `LMH-instructions.pdf` and `Presentation_Q&A.pdf` URLs.

- [ ] **Step 5: Match listing and FAQ layouts**

Add only the shared grid, card hover/focus, vertical FAQ tab, and responsive rules needed to reproduce the current pages.

- [ ] **Step 6: Build and confirm GREEN**

```bash
npm run build
node scripts/check-build.mjs /proceedings/ /previous-seminars/ /conference-faq/
```

Expected: `Verified 3 route(s).`

- [ ] **Step 7: Compare and commit**

Compare all three routes at desktop/mobile sizes, keyboard-test the FAQ tabs, rerun Step 6, then commit:

```bash
git add src/pages/proceedings.astro src/pages/previous-seminars.astro src/pages/conference-faq.astro src/styles/global.css
git commit -m "feat: migrate site indexes and conference FAQs"
```

### Task 4: Build All Proceedings Detail Pages

**Files:**

- Create: `src/layouts/ProceedingLayout.astro`
- Create: all seven `src/pages/reports/*.astro` files listed in the File Map.
- Modify: `src/styles/global.css`

**Interfaces:**

- `ProceedingLayout.astro` consumes `title`, `subtitle`, `image`, `editors`, optional `isbn`, optional `issn`, optional `openAccess`, optional `publisher`, optional `previous`, and optional `next`.

- [ ] **Step 1: Confirm the seven proceedings routes are RED**

Run `npm run build`, then run `node scripts/check-build.mjs` with the seven proceedings-detail URLs from the File Map. Expected: failure on the first missing route.

- [ ] **Step 2: Implement the shared proceedings layout**

Use a typed props interface and this content order:

```astro
<BaseLayout title={`${title} – International Seminar of Young Tibetologists`}>
  <article class="proceeding-detail content-width">
    <img class="book-cover" src={image} alt="" />
    <div class="book-details">
      <h1>{title}</h1>
      <p class="subtitle">{subtitle}</p>
      <h2>Edited by:</h2>
      <ul>{editors.map((editor) => <li>{editor}</li>)}</ul>
      <slot />
    </div>
  </article>
  <nav class="previous-next" aria-label="Proceedings navigation"></nav>
</BaseLayout>
```

Render metadata and previous/next links only when their corresponding props exist. Do not create empty labels.

- [ ] **Step 3: Transcribe all proceedings data**

Use each matching legacy file as the sole source:

- `reports/1st-isyt-proceedings/index.html`
- `reports/2nd-isyt-proceedings-pt-1/index.html`
- `reports/2nd-isyt-proceedings-pt-2/index.html`
- `reports/3rd-isyt-proceedings-2012/index.html`
- `reports/4th-isyt-proceedings-2015/index.html`
- `reports/5th-isyt-proceedings/index.html`
- `reports/6th-isyt-proceedings/index.html`

Preserve title, subtitle, editors, identifiers, open-access links, publisher links, book-cover images, and the exact previous/next chain. Use one small `.astro` page per route; do not add a data layer for seven static records.

- [ ] **Step 4: Match the detail layout**

Add the shared two-column cover/details layout, gray offset cover shadow, uppercase metadata labels, and responsive single-column behavior to `global.css`.

- [ ] **Step 5: Build and confirm GREEN**

Run the seven-route check from Step 1. Expected: `Verified 7 route(s).`

- [ ] **Step 6: Compare and commit**

Compare the first, middle, and final proceedings pages at desktop/mobile sizes; follow every previous/next link; rerun Step 5; then commit:

```bash
git add src/layouts/ProceedingLayout.astro src/pages/reports src/styles/global.css
git commit -m "feat: migrate proceedings detail pages"
```

### Task 5: Build Conference Reports and Galleries

**Files:**

- Create: `src/layouts/ConferenceReportLayout.astro`
- Create: `src/components/Gallery.astro`
- Create: the six conference-report pages listed in the File Map.
- Modify: `src/styles/global.css`

**Interfaces:**

- `ConferenceReportLayout.astro` consumes `ordinal`, `title`, `conveners`, `sponsorship`, `city`, and `year`, then renders a default content slot.
- `Gallery.astro` consumes `images: { src: string; alt: string }[]`.

- [ ] **Step 1: Confirm the six report routes are RED**

Run `npm run build`, then run `node scripts/check-build.mjs` with `/1st-isyt-conference-report/` through `/6th-isyt-conference-report/`. Expected: failure on the first missing route.

- [ ] **Step 2: Implement the shared report layout**

Use semantic definition-list metadata and a default slot:

```astro
<BaseLayout title={`${title} – International Seminar of Young Tibetologists`}>
  <article class="conference-report content-width">
    <header class="report-header">
      <p class="eyebrow">{ordinal}</p>
      <h1>{title}</h1>
      <p>Meeting report</p>
    </header>
    <dl class="report-facts">
      <dt>Conveners</dt><dd>{conveners.join(', ')}</dd>
      <dt>Sponsorship</dt><dd>{sponsorship}</dd>
      <dt>City</dt><dd>{city}</dd>
      <dt>Year</dt><dd>{year}</dd>
    </dl>
    <div class="report-body"><slot /></div>
  </article>
</BaseLayout>
```

Use singular “Convener” on pages with one convener.

- [ ] **Step 3: Implement the gallery with native dialog**

Render a button-wrapped thumbnail grid and one `<dialog>` containing a large image, close button, previous button, and next button. The processed script must open the selected image, cycle within the array, close on the close button or Escape, and update the dialog image’s `src` and `alt`. Keep focus visible and return focus to the thumbnail that opened the dialog.

- [ ] **Step 4: Transcribe all six reports**

Use the matching root legacy `index.html` file for each route. Preserve every paragraph, heading, list, local PDF link, external link, image, and gallery item. Remove only author/date/category chrome and WordPress wrappers. Use `Gallery.astro` for the fifth-conference gallery and any other multi-image report gallery.

- [ ] **Step 5: Match the report layouts**

Add shared report header, fact grid, prose rhythm, image, responsive gallery, native-dialog, and mobile rules. Keep page-specific differences in the page markup; do not add configuration flags for one-off styling.

- [ ] **Step 6: Build and confirm GREEN**

Run the six-route check from Step 1. Expected: `Verified 6 route(s).`

- [ ] **Step 7: Compare, keyboard-test, and commit**

Compare all six pages against the export, with special attention to the long second/sixth reports and fifth-report gallery. Keyboard-test the gallery. Rerun Step 6, then commit:

```bash
git add src/layouts/ConferenceReportLayout.astro src/components/Gallery.astro src/pages/*-isyt-conference-report.astro src/styles/global.css
git commit -m "feat: migrate conference reports"
```

### Task 6: Stage Only Used Assets and Downloads

**Files:**

- Create: `public/assets/`
- Create: the seven public download files listed in the File Map.
- Modify: Astro pages/styles only when an asset filename must be corrected.

**Interfaces:**

- Every local source reference begins with `/assets/` or an approved root/archive download URL.
- `public/assets/` contains no file that is absent from the Astro source or global stylesheet.

- [ ] **Step 1: Copy the approved downloads**

```bash
mkdir -p public/archive
cp "7th ISYT-Call for Papers.pdf" public/
cp 7th-ISYT-first_announcement.pdf public/
cp Book-of-Abstracts_FINAL.pdf public/
cp ISYT2024--poster_template.pptx public/
cp LMH-instructions.pdf public/
cp Presentation_Q&A.pdf public/
cp archive/ISYT-Paris-Programme-2009.pdf public/archive/
```

- [ ] **Step 2: Produce the referenced asset manifest**

```bash
rg -o --no-filename '/assets/[^"'"'"'()[:space:]]+' src \
  | sed 's/[?#].*$//' \
  | sort -u > /private/tmp/isyt-assets.txt
```

Review `/private/tmp/isyt-assets.txt` for malformed or remote paths. Every entry must map to a real file under `wp-content/uploads/` or, for theme fonts, the corresponding downloaded font file.

- [ ] **Step 3: Copy only referenced assets**

For each manifest entry, create its destination directory under `public/assets/` and copy the matching legacy upload. Preserve the portion below `wp-content/uploads/` so similarly named files cannot collide. Copy only the downloaded Josefin Sans and Biryani font files declared in `global.css`; use the CSS Tibetan fallback stack rather than adding another font download.

- [ ] **Step 4: Extend the checker to resolve local links and assets**

Add a pass to `scripts/check-build.mjs` that extracts root-relative `href`, `src`, and `srcset` URLs from every generated HTML file, decodes URL paths, skips anchors and non-HTTP schemes, maps extensionless paths to `index.html`, and calls `access()` on the corresponding file in `dist`. Also scan emitted CSS `url(...)` values and assert that local targets exist.

- [ ] **Step 5: Confirm RED on an intentionally missing asset**

Temporarily rename one copied image in `public/assets/`, run `npm run verify`, and confirm the checker fails with that missing path. Restore the exact filename and rerun.

- [ ] **Step 6: Confirm GREEN for the complete site**

```bash
npm run verify
```

Expected: Astro build succeeds and the checker prints `Verified 18 route(s).`

- [ ] **Step 7: Audit unused public assets**

Compare the manifest from Step 2 with `find public/assets -type f`. Remove only files that are absent from the manifest, rebuild, and rerun Step 6.

- [ ] **Step 8: Commit**

```bash
git add public scripts/check-build.mjs src
git commit -m "chore: add retained site assets and downloads"
```

### Task 7: Full Visual Verification and Legacy Cleanup

**Files:**

- Delete: legacy root HTML and page directories.
- Delete: `wp-content/`, `wp-includes/`, `author/`, `category/`, and `Translations/`.
- Delete: original root copies of files now stored under `public/`.
- Preserve: `src/`, `public/`, `scripts/`, `docs/`, package/config files, lockfile, and generated `dist/`.

**Interfaces:**

- `npm run verify` is the final acceptance command.
- `dist/` is the upload-ready artifact.

- [ ] **Step 1: Run the pre-cleanup acceptance gate**

```bash
npm run verify
git status --short
```

Expected: 18 routes pass, all links/assets resolve, both translations are present, and generated code contains no legacy references.

- [ ] **Step 2: Perform complete visual and interaction QA**

Compare all retained route types against the saved desktop/mobile baselines and the live URL. Check:

- Header, logo, navigation, hero, colors, typography, spacing, images, cards, and footer
- Every retained route and previous/next chain
- Mobile menu by touch and keyboard
- About Us language persistence and every English/Tibetan statute tab
- FAQ tabs
- Galleries and native-dialog controls
- JotForm field validation and action without submitting the form
- All seven downloads

Fix discrepancies, then rerun Step 1.

- [ ] **Step 3: Resolve the exact cleanup targets**

```bash
test "$PWD" = "/Users/danielwojahn/Downloads/ISYT"
test -f package.json
test -d src/pages
test -d public/assets
test -f /private/tmp/isyt-legacy-export.tgz
```

Stop if any assertion fails.

- [ ] **Step 4: Delete the approved legacy inputs**

Delete exactly these legacy paths, all of which are replaced by Astro source or `public/` copies:

```bash
rm -rf \
  ./wp-content ./wp-includes ./author ./category ./Translations \
  ./about-us ./proceedings ./previous-seminars ./conference-faq \
  ./1st-isyt-conference-report ./2nd-isyt-conference-report \
  ./3rd-isyt-conference-report ./4th-isyt-conference-report \
  ./5th-isyt-conference-report ./6th-isyt-conference-report \
  ./reports ./archive
rm -f \
  ./index.html "./7th ISYT-Call for Papers.pdf" \
  ./7th-ISYT-first_announcement.pdf ./Book-of-Abstracts_FINAL.pdf \
  ./ISYT2024--poster_template.pptx ./LMH-instructions.pdf \
  ./Presentation_Q&A.pdf
```

Do not delete `public/archive/` or `src/pages/reports/`.

- [ ] **Step 5: Prove the build no longer depends on deleted files**

```bash
npm run verify
find . -maxdepth 2 -type d | sort
rg -n 'wp-content|wp-includes|elementor|wordpress' src public dist || true
```

Expected: 18 routes pass; no legacy directory is present; the final `rg` prints nothing.

- [ ] **Step 6: Commit the final source state**

```bash
git add -A
git commit -m "chore: remove legacy WordPress export"
```

- [ ] **Step 7: Run fresh final verification**

```bash
npm run verify
git status --short --branch
```

Expected: build and all 18 route checks pass; the worktree is clean except for ignored `dist/`.

- [ ] **Step 8: Remove temporary migration artifacts**

After Step 7 succeeds, delete `/private/tmp/isyt-legacy-export.tgz`, `/private/tmp/isyt-assets.txt`, extracted translation HTML, and baseline/comparison screenshots. Report that the legacy export and translation documents were removed and are no longer recoverable from the project folder.

## Plan Self-Review

- Every approved retained route is assigned to exactly one implementation task.
- The two translation documents map only to About Us and Statutes, with English as the default and session-only persistence.
- The JotForm endpoint, ID, and field names are explicit and testable.
- The checker has a demonstrated RED state before implementation and a missing-asset RED check before final acceptance.
- Cleanup is gated by a successful build, exact-path assertions, a temporary recovery archive, and a second build after deletion.
- No task introduces an unrequested dependency, CMS, data layer, page-builder abstraction, or test framework.
