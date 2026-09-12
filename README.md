# ISYT Website

Site for the International Seminar of Young Tibetologists (ISYT) —
conference announcements, Call for Papers, past proceedings and reports.
Built with [Astro](https://astro.build) as a static site.

## Local development

```
npm install
npm run dev      # dev server
npm run build    # static build to dist/
npm run check    # content/regression checks against dist/
npm run verify   # build + check
```

## Deploying

Deploys are automatic: **pushing to `main`** triggers
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds
the site and uploads `dist/` to the production host over FTP using the
`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` repo secrets.

There is no separate `master` branch — `main` is the only branch that matters.
Just commit and `git push origin main`; no manual deploy step needed.

Run `npm run verify` locally before pushing to catch broken content/links
before the CI build does.
