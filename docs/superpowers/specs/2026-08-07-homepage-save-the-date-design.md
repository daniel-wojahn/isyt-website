# ISYT 2027 Homepage Announcement

## Goal

Replace the outdated homepage notice with the complete bilingual announcement for the 8th International Seminar of Young Tibetologists while preserving the existing visual identity, contact form, routes, and static Astro architecture.

## Hero

- Show `19–23 July 2027` as the event date.
- Show `Korea University · Seoul, South Korea` directly beneath it.
- Retain the current hero photograph and typography.

## Announcement

- Present the full English and user-supplied Tibetan announcements together in the existing gold section.
- Use two parallel columns at desktop widths and stack English before Tibetan on mobile.
- Keep one large “8th International Seminar of Young Tibetologists” section heading and omit duplicate English/Tibetan column titles.
- Link the contact address to `mailto:isyt2027koreauniversity@gmail.com`; do not include a conference-history or website paragraph.
- Use the English convenor list exactly as approved: `Seongmin, Anju, Seungjong, Shawo and Youjung`.
- Preserve the Tibetan text exactly as supplied by the user.
- Do not expose or link `Document.pdf`.

## Footer

- Replace the old conference email with `isyt2027koreauniversity@gmail.com`.
- Generate the copyright year from the current year rather than retaining the hard-coded 2023 value.

## Responsive and accessibility behavior

- Keep semantic headings, paragraphs, articles, links, and language attributes.
- Maintain accessible black-on-gold contrast and visible hover/focus states.
- Stack the announcement columns without horizontal overflow on narrow screens.
- Preserve the existing accessible JotForm fields and endpoint unchanged.

## Verification

- Require the new date, venue, email, exact English convenor list, and supplied Tibetan title in the built homepage.
- Reject the old August 2027 date and old footer email.
- Require the bilingual announcement structure and automatic copyright-year marker.
- Continue verifying all routes, local references, downloads, form fields, and legacy WordPress exclusions.
