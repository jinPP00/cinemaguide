import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
if (!fs.existsSync(OUT)) {
  console.error('out/ 이 없습니다. 먼저 npm run build 를 실행하세요.');
  process.exit(1);
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (entry.name === 'index.html') acc.push(p);
  }
  return acc;
}

function decodeHtml(text) {
  let out = text;
  for (let i = 0; i < 3; i++) {
    out = out
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)));
  }
  return out;
}

function plain(html) {
  return decodeHtml(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function urlOf(file) {
  const rel = path.relative(OUT, file).split(path.sep).join('/').replace(/index\.html$/, '');
  return decodeURIComponent('/' + rel);
}

function attrs(tag) {
  const result = {};
  for (const m of tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)) {
    result[m[1].toLowerCase()] = decodeHtml(m[2]);
  }
  return result;
}

function metaContent(html, name) {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    if ((a.name ?? '').toLowerCase() === name.toLowerCase()) return a.content ?? '';
  }
  return '';
}

function ogUrl(html) {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    if (a.property === 'og:url') return a.content ?? '';
  }
  return '';
}

function canonical(html) {
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    if ((a.rel ?? '').toLowerCase().split(/\s+/).includes('canonical')) return a.href ?? '';
  }
  return '';
}

function normalizePath(value) {
  if (!value) return '';
  try {
    const u = new URL(value, 'https://cinemaguide.kr');
    let p = decodeURIComponent(u.pathname);
    if (!p.endsWith('/')) p += '/';
    return p;
  } catch {
    return value;
  }
}

const BRAND_SEGMENTS = new Set(['cgv', '롯데시네마', '메가박스']);
const PRICE_JUDGMENT = /가장\s*싼|가장\s*비싼|더\s*쌉|더\s*비쌉|저렴(?:한|합니다|하게)?|비싼\s*(?:곳|지점|요금)|최저\s*지점|최고\s*지점/;
const BOXOFFICE_MODULE = /현재\s*상영중인\s*영화\s*순위|박스오피스\s*TOP\s*10/i;
const TRUST_LINKS = ['/about/', '/privacy/', '/terms/', '/contact/'];

const issues = [];
const warnings = [];
const add = (url, kind, detail) => issues.push({ url, kind, detail });
const warn = (url, kind, detail) => warnings.push({ url, kind, detail });

const pages = walk(OUT).map((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const url = urlOf(file);
  const text = plain(html);
  const title = decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  const description = metaContent(html, 'description').trim();
  const canon = canonical(html).trim();
  const robots = metaContent(html, 'robots').toLowerCase();
  const noindex = robots.includes('noindex');
  return { file, html, url, text, title, description, canon, noindex };
});

const indexable = pages.filter((p) => !p.noindex);
const sitemap = new Map(
  [...fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(m => [normalizePath(m[1].match(/<loc>([^<]*)<\/loc>/)?.[1]), m[1].match(/<lastmod>([^<]*)<\/lastmod>/)?.[1]]),
);
for (const p of pages) {
  if (p.noindex && sitemap.has(p.url)) add(p.url, 'noindex 사이트맵 포함', '색인 제외 페이지가 사이트맵에 있음');
}
for (const url of sitemap.keys()) {
  if (!indexable.some(p => p.url === url)) add(url, '사이트맵 대상 없음', '색인 가능한 HTML이 없음');
}
for (const p of indexable) {
  if (!p.title) add(p.url, 'title 누락', 'title이 없음');
  if (!p.description) add(p.url, 'description 누락', 'meta description이 없음');
  if (ogUrl(p.html) !== p.canon) add(p.url, 'og:url 불일치', `공유 URL이 canonical과 다름: ${ogUrl(p.html)}`);
  if (!sitemap.has(p.url)) add(p.url, '사이트맵 누락', '색인 가능한 페이지가 사이트맵에 없음');
  for (const m of p.html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const value = JSON.parse(m[1]);
      for (const schema of Array.isArray(value) ? value : [value]) {
        if (schema['@type'] === 'WebPage' && schema.dateModified !== sitemap.get(p.url)) {
          add(p.url, '갱신일 불일치', 'WebPage.dateModified와 sitemap.lastmod가 다름');
        }
      }
    } catch {
      add(p.url, 'JSON-LD 문법 오류', '구조화 데이터를 JSON으로 읽을 수 없음');
    }
  }
  if (!p.canon) add(p.url, 'canonical 누락', 'canonical 링크가 없음');
  else if (normalizePath(p.canon) !== normalizePath(p.url)) {
    add(p.url, 'canonical 불일치', `${p.canon} → ${p.url}`);
  }

  const h1Count = (p.html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) add(p.url, 'H1 개수 이상', `${h1Count}개`);
  if (/\bundefined\b|\bnull\b/.test(p.text)) add(p.url, '깨진 값 노출', 'undefined/null 문자열 노출');

  for (const href of TRUST_LINKS) {
    if (!p.html.includes(`href="${href}"`) && !p.html.includes(`href='${href}'`)) {
      add(p.url, '신뢰 링크 누락', href);
    }
  }

  if (p.url !== '/박스오피스/' && BOXOFFICE_MODULE.test(p.text)) {
    add(p.url, '박스오피스 모듈 잔존', '전용 페이지 밖에 순위 모듈 문구가 있음');
  }

  const parts = p.url.split('/').filter(Boolean);
  const isRegion = parts.length === 2 && BRAND_SEGMENTS.has(parts[0]);
  if (isRegion) {
    const m = p.text.match(PRICE_JUDGMENT);
    if (m) add(p.url, '지역 가격 평가 문구', m[0]);
  }

  if (p.text.length < 450 && !/^\/(privacy|terms|contact|disclaimer|affiliate-disclosure)\//.test(p.url)) {
    warn(p.url, '짧은 본문 후보', `${p.text.length}자`);
  }
}

const boxoffice = JSON.parse(fs.readFileSync('public/boxoffice.json', 'utf8'));
if (sitemap.get('/박스오피스/') !== new Date(boxoffice.fetchedAt).toISOString()) {
  add('/박스오피스/', '박스오피스 갱신일 오류', '사이트맵이 실제 데이터 저장일을 반영하지 않음');
}
const llms = fs.readFileSync(path.join(OUT, 'llms.txt'), 'utf8');
const boxofficeDate = boxoffice.targetDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
if (!llms.includes(boxofficeDate) || llms.includes('실시간 박스오피스')) {
  add('/llms.txt', '박스오피스 안내 오류', '집계일 또는 갱신 주기 표기가 실제 데이터와 다름');
}

function duplicates(field) {
  const map = new Map();
  for (const p of indexable) {
    const value = p[field];
    if (!value) continue;
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(p.url);
  }
  return [...map.entries()].filter(([, urls]) => urls.length > 1);
}

for (const [title, urls] of duplicates('title')) warn(urls.join(', '), '중복 title', title);
for (const [description, urls] of duplicates('description')) warn(urls.join(', '), '중복 description', description);

console.log('\n=== 전체 사이트 정적 페이지 검사 ===');
console.log(`전체 HTML: ${pages.length}개 · 색인 대상: ${indexable.length}개`);
console.log(`오류: ${issues.length}건 · 검토 후보: ${warnings.length}건`);

if (issues.length) {
  console.log('\n오류:');
  for (const x of issues.slice(0, 200)) console.log(`[${x.kind}] ${x.url} — ${x.detail}`);
}
if (warnings.length) {
  console.log('\n검토 후보(배포 차단 안 함):');
  for (const x of warnings.slice(0, 100)) console.log(`[${x.kind}] ${x.url} — ${x.detail}`);
}

if (issues.length > 0) process.exit(1);
