import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const allRoutes = [
  '/',
  '/about-us/',
  '/proceedings/',
  '/previous-seminars/',
  '/conference-faq/',
  '/conference-reports/1st-isyt-conference-report/',
  '/conference-reports/2nd-isyt-conference-report/',
  '/conference-reports/3rd-isyt-conference-report/',
  '/conference-reports/4th-isyt-conference-report/',
  '/conference-reports/5th-isyt-conference-report/',
  '/conference-reports/6th-isyt-conference-report/',
  '/conference-reports/7th-isyt-conference-report/',
  '/proceedings/1st-isyt-proceedings/',
  '/proceedings/2nd-isyt-proceedings-pt-1/',
  '/proceedings/2nd-isyt-proceedings-pt-2/',
  '/proceedings/3rd-isyt-proceedings-2012/',
  '/proceedings/4th-isyt-proceedings-2015/',
  '/proceedings/5th-isyt-proceedings/',
  '/proceedings/6th-isyt-proceedings/',
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
  assert(!/role="tabpanel"[^>]*\shidden(?:[=>\s])/i.test(html), `${route} hides tab content without JavaScript`);
}

const localTarget = (reference) => {
  const path = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  return extname(path) ? join(dist, path.slice(1)) : join(dist, path.slice(1), 'index.html');
};

async function checkReferences(references, label) {
  for (const reference of references.filter((value) => value.startsWith('/') && !value.startsWith('//'))) {
    await access(localTarget(reference)).catch(() => assert.fail(`${label} has a broken local reference: ${reference}`));
  }
}

for (const [route, html] of pages) {
  const attributes = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1]);
  const sourceSets = [...html.matchAll(/\bsrcset=["']([^"']+)["']/g)].flatMap((match) => match[1].split(',').map((item) => item.trim().split(/\s+/, 1)[0]));
  await checkReferences([...attributes, ...sourceSets], route);
  assert.equal((html.match(/class="menu-bar"/g) ?? []).length, 3, `${route} must render one three-bar menu icon`);
  assert(!html.includes('☰'), `${route} contains the duplicate hamburger glyph`);
}

for (const route of ['/proceedings/', '/previous-seminars/']) {
  if (pages.has(route)) assert.match(pages.get(route), /class="listing-overlay"/, `${route} has no hover overlay`);
}

if (pages.has('/')) {
  const home = pages.get('/');
  assert.match(home, /International Seminar of/);
  assert.match(home, /action="https:\/\/eu-submit\.jotform\.com\/submit\/231243775978065"/);
  assert.match(home, /name="formID" value="231243775978065"/);
  assert.match(home, /name="q6_name"/);
  assert.match(home, /name="q4_email"/);
  assert.match(home, /name="q5_message"/);
  assert.match(home, /19–23 July 2027/);
  assert.match(home, /Korea University · Seoul, South Korea/);
  assert.match(home, /<p class="eyebrow">Welcome to the<\/p><h1>International Seminar of<br>Young Tibetologists<\/h1>/);
  assert.match(home, /isyt2027koreauniversity@gmail\.com/);
  assert.ok((home.match(/href="mailto:isyt2027koreauniversity@gmail\.com"/g) ?? []).length >= 3);
  assert.match(home, /invite you to submit your abstract/);
  assert.match(home, /November 1st, 2026/);
  assert.match(home, /href="\/assets\/conferences\/8th\/call-for-papers\.pdf" download/);
  assert(!home.includes('For more information on the conference and its history'));
  assert(!home.includes('གྲོས་ཚོགས་འདིའི་ལོ་རྒྱུས་སོགས'));
  assert.match(home, /Seongmin, Anju, Seungjong, Shawo and Youjung/);
  assert.match(home, /class="announcement-languages"/);
  assert.match(home, /<header class="announcement-heading"><p class="eyebrow">Call for papers<\/p><h2>8th International Seminar of Young Tibetologists<\/h2><p class="announcement-date">19–23 July 2027<\/p><p class="announcement-venue">Korea University · Seoul, South Korea<\/p><\/header>/);
  const hero = home.match(/<section class="hero">(.*?)<\/section>/s)?.[1] ?? '';
  assert(!hero.includes('19–23 July 2027'));
  assert(!hero.includes('Korea University'));
  assert(!home.includes('23–27 August 2027'));
  assert(!home.includes('isyt2024@wolfson.ox.ac.uk'));
  assert(!home.includes('Document.pdf'));
  assert.match(home, /data-copyright-year/);

  const announcementArticles = [...home.matchAll(/<article class="announcement-language"[^>]*>(.*?)<\/article>/gs)].map((match) => match[1]);
  assert.equal(announcementArticles.length, 2);
  assert(announcementArticles.every((article) => !article.includes('<h3>')));
  assert.deepEqual(announcementArticles.map((article) => (article.match(/<p(?:\s[^>]*)?>/g) ?? []).length), [12, 12]);
  const tibetanText = announcementArticles[1].replace(/<[^>]+>/g, '');
  assert.equal(tibetanText, tibetanText.normalize('NFC'));
  assert(!tibetanText.includes('\uFFFD'));
  assert([...tibetanText].filter((character) => character >= '\u0F00' && character <= '\u0FFF').length > 500);
}

if (pages.has('/about-us/')) {
  const about = pages.get('/about-us/');
  assert.match(about, /data-language="en"/);
  assert.match(about, /data-language="bo"/);
  assert.match(about, /རྒྱབ་ལྗོངས་ཀྱི་ལོ་རྒྱུས།/);
  assert.match(about, /རྒྱལ་སྤྱིའི་གཞོན་ནུ་བོད་རིག་པའི་ཚོགས་པའི་གཞུང་འབྲེལ་བཅའ་ཡིག/);
  assert.match(about, /class="gallery" data-gallery/, 'About gallery was removed');
  assert.equal((about.match(/class="people-column"/g) ?? []).length, 2);
  assert.match(about, /class="role"/);
  assert.match(about, /class="statutes-intro"/);
  assert.equal((about.match(/class="about-row"/g) ?? []).length, 6);
  assert.equal((about.match(/<details>/g) ?? []).length, 6);
  assert.match(about, /<h2>རྒྱུན་དུ་འདྲི་བའི་དྲི་བ།<\/h2>/);
}

if (pages.has('/conference-reports/5th-isyt-conference-report/')) {
  const report = pages.get('/conference-reports/5th-isyt-conference-report/');
  assert.equal((report.match(/data-src=/g) ?? []).length, 11);
  assert.match(report, /events\.spbu\.ru\/eventsContent\/events\/2018\/tibetology\/Program_2908\.pdf/);
  assert.match(report, /Russian Foundation for Basic Research/);
  assert.match(report, /dialog-previous/);
  assert.match(report, /dialog-next/);
}

if (pages.has('/conference-reports/6th-isyt-conference-report/')) {
  const report = pages.get('/conference-reports/6th-isyt-conference-report/');
  assert.equal((report.match(/data-src=/g) ?? []).length, 9);
  assert.match(report, /Participants in the various workshops learned/);
  assert.match(report, /khyentse-foundation\.png/);
}

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : path;
  }));
  return nested.flat();
}

const builtFiles = await filesUnder(dist);
const css = (await Promise.all(
  builtFiles.filter((file) => extname(file) === '.css').map((file) => readFile(file, 'utf8')),
)).join('\n');
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /\.listing-page \.menu-toggle/);
assert.match(css, /\.listing-card:is\(:hover,\s*:focus-visible\) \.listing-overlay/);
assert.match(css, /\.about-history \.faq-list summary/);
assert.match(css, /\.statutes \.tab-list button:is\([^}]*aria-selected=["']?true["']?/);
assert.match(css, /--link:#76501c/);
assert.match(css, /\.announcement\{color:var\(--black\)/);
assert.match(css, /:focus-visible\{outline:3px solid var\(--black\)/);
assert.match(css, /\.statutes \.tab-list button:is\(:hover,:focus-visible,\[aria-selected=true\]\)\{color:var\(--white\);background:var\(--black\)/);
assert.match(css, /\.announcement-date\{font-family:Josefin Sans/);
assert.match(css, /\.announcement-language\[lang=bo\]\{font-size:17px/);

for (const file of builtFiles) {
  if (!['.html', '.css', '.js'].includes(extname(file))) continue;
  const contents = await readFile(file, 'utf8');
  assert(!/wp-content|wp-includes|elementor/i.test(contents), `${file} contains a legacy reference`);
  assert(!contents.includes('Document.pdf'), `${file} exposes the source announcement PDF`);
  if (extname(file) === '.css') {
    const urls = [...contents.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((match) => match[1]);
    await checkReferences(urls, file);
  }
}

for (const download of [
  'Book-of-Abstracts_FINAL.pdf', 'ISYT2024--poster_template.pptx',
  'archive/ISYT-Paris-Programme-2009.pdf',
  'assets/conferences/8th/call-for-papers.pdf',
]) await access(join(dist, download));

await access(join(dist, 'Document.pdf')).then(
  () => assert.fail('Document.pdf must not be published'),
  () => {},
);

console.log(`Verified ${routes.length} route(s).`);
