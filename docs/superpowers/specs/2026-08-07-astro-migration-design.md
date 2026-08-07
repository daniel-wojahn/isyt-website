# ISYT Astro Migration Design

## Goal

Replace the downloaded WordPress/Elementor export with a maintainable Astro project that generates a static site matching the current ISYT site’s layout, content, routes, and behavior.

## Architecture

- Astro generates a fully static `dist/` directory for upload to the existing server.
- The project uses straightforward `.astro` pages, a shared layout, one global stylesheet, and minimal vanilla JavaScript.
- There is no CMS, database, WordPress API, Astro server runtime, or new client framework.
- Repeated structure is shared only where it already repeats: site layout, header, footer, conference-report shell, proceedings shell, tabs, and galleries.

## Retained Routes

- `/`
- `/about-us/`
- `/proceedings/`
- `/previous-seminars/`
- `/conference-faq/`
- `/1st-isyt-conference-report/` through `/6th-isyt-conference-report/`
- `/reports/1st-isyt-proceedings/`
- `/reports/2nd-isyt-proceedings-pt-1/`
- `/reports/2nd-isyt-proceedings-pt-2/`
- `/reports/3rd-isyt-proceedings-2012/`
- `/reports/4th-isyt-proceedings-2015/`
- `/reports/5th-isyt-proceedings/`
- `/reports/6th-isyt-proceedings/`
- `/7th ISYT-Call for Papers.pdf`
- `/7th-ISYT-first_announcement.pdf`
- `/Book-of-Abstracts_FINAL.pdf`
- `/ISYT2024--poster_template.pptx`
- `/LMH-instructions.pdf`
- `/Presentation_Q&A.pdf`
- `/archive/ISYT-Paris-Programme-2009.pdf`

The WordPress author, category, feed, REST, and administrative URLs are intentionally not retained.

## Layout and Content

- Preserve the current visible design at desktop and mobile sizes, including typography, colors, spacing, imagery, cards, report layouts, proceedings navigation, footer, and responsive navigation.
- Preserve current page copy, external links, PDF links, social links, and mail links.
- Copy only media and fonts used by retained pages into clean Astro asset locations.
- Remove Elementor class structures and WordPress-generated metadata rather than carrying them into the new source.

## Components and Interaction

- `BaseLayout`, `Header`, and `Footer` provide repeated site structure.
- Conference reports and proceedings reuse small page shells while retaining page-specific rich content.
- The mobile menu and tab interfaces use small accessible vanilla JavaScript modules.
- Expandable content uses native `<details>` where it preserves the current behavior.
- Galleries retain the current responsive grid and keyboard-accessible lightbox behavior.
- Back-to-top uses a normal page anchor.
- Navigation, tabs, galleries, and language controls support keyboard use and visible focus.

## Contact Form

- The homepage form continues to submit with `POST` directly to `https://eu-submit.jotform.com/submit/231243775978065`.
- The existing JotForm field names and form ID remain unchanged.
- Browser-native required-field and email validation remain enabled.
- Astro adds no server-side form handler and does not intercept successful submissions.

## Tibetan Content

- The About Us page includes an accessible `English / བོད་ཡིག` language switch.
- The switch replaces both the About Us content and the complete nine-part Statutes section.
- English is the default language.
- The selected language is remembered for the current browser session only.
- Both languages are included in the static page; there is no translation service or runtime content request.
- If JavaScript is unavailable, the English version remains readable.
- Tibetan text comes verbatim from `Translations/About the ISYT .docx` and `Translations/The Statutes of ISYT .docx`.

## Failure Handling

- The site remains readable and navigable without JavaScript; the mobile menu, tabs, lightbox, and language switch degrade to unenhanced static content.
- Broken local asset or internal-route references fail the build verification rather than being silently shipped.
- Automated verification checks the JotForm target and field names but does not submit the live form.

## Verification

- Run a production Astro build.
- Verify every retained route produces output.
- Verify all retained local images, fonts, PDFs, and internal links resolve.
- Verify external links and the JotForm action are preserved.
- Verify both approved Tibetan translations appear in the built About Us page.
- Verify generated pages contain no WordPress, Elementor, `wp-content`, or `wp-includes` references.
- Compare the Astro site with the current site at desktop and mobile sizes.
- Check keyboard operation for navigation, tabs, gallery lightbox, and language switch.

## Cleanup

Cleanup happens only after the production build and verification pass. Then delete:

- Legacy exported HTML
- `wp-content/` and `wp-includes/`
- `author/`, `category/`, and feed files
- Unused media and WordPress/plugin assets
- The two translation Word documents and their `Translations/` folder after their content has been imported

The final folder contains only the Astro source, configuration, retained media and downloads, project documentation, dependency lockfile, and generated build output.

## Out of Scope

- A replacement CMS or visual page builder
- WordPress-compatible archives, feeds, REST endpoints, or administration
- Server-side translation or form processing
- Redesigning the site or changing approved text
- Translating reports, proceedings, or other pages not covered by the supplied documents
