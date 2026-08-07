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
  '/1st-isyt-conference-report/',
  '/2nd-isyt-conference-report/',
  '/3rd-isyt-conference-report/',
  '/4th-isyt-conference-report/',
  '/5th-isyt-conference-report/',
  '/6th-isyt-conference-report/',
  '/reports/1st-isyt-proceedings/',
  '/reports/2nd-isyt-proceedings-pt-1/',
  '/reports/2nd-isyt-proceedings-pt-2/',
  '/reports/3rd-isyt-proceedings-2012/',
  '/reports/4th-isyt-proceedings-2015/',
  '/reports/5th-isyt-proceedings/',
  '/reports/6th-isyt-proceedings/',
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

const localTarget = (reference) => {
  const path = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  return extname(path) ? join(dist, path.slice(1)) : join(dist, path.slice(1), 'index.html');
};

for (const [route, html] of pages) {
  const references = [...html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)].map((match) => match[1]);
  for (const reference of references) await access(localTarget(reference)).catch(() => assert.fail(`${route} has a broken local reference: ${reference}`));
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

for (const download of [
  '7th ISYT-Call for Papers.pdf', '7th-ISYT-first_announcement.pdf', 'Book-of-Abstracts_FINAL.pdf',
  'ISYT2024--poster_template.pptx', 'LMH-instructions.pdf', 'Presentation_Q&A.pdf',
  'archive/ISYT-Paris-Programme-2009.pdf',
]) await access(join(dist, download));

console.log(`Verified ${routes.length} route(s).`);
