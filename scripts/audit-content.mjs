/**
 * 콘텐츠 점검 리포트 — 얇은 페이지와 중복 title/description을 찾는다.
 *
 * 애드센스·색인 문제를 다룰 때 매번 같은 것을 손으로 확인하게 돼서 스크립트로
 * 남긴다. 새 기능이 아니라 out/ 산출물을 읽어 세는 것뿐이라 운영 구조에 영향이
 * 없다. 문제를 자동으로 고치지 않고 목록만 출력한다 — 얇은 페이지를 AI 글로
 * 채우는 것이야말로 피해야 할 일이기 때문이다.
 *
 * 사용법: npm run build && node scripts/audit-content.mjs
 */
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

const text = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const attr = (html, re) => (html.match(re) || [])[1] ?? '';

const pages = walk(OUT).map((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const url = decodeURIComponent(
    '/' + path.relative(OUT, file).split(path.sep).join('/').replace(/index\.html$/, ''),
  );
  return {
    url,
    title: attr(html, /<title>([^<]*)/),
    description: attr(html, /<meta name="description" content="([^"]*)"/),
    noindex: /<meta name="robots" content="noindex/.test(html),
    length: text(html).length,
    // 지점 상세인지. 정책·시도 페이지는 요금·주차 섹션이 없는 게 정상이라
    // "빠진 항목"을 따지면 안 된다.
    isBranch: html.includes('id="prices"') || html.includes('id="nearby-cinemas"'),
    // 지점 페이지에만 있는 섹션들 — 무엇이 비어 있는지 알려준다
    has: {
      요금: html.includes('id="prices"'),
      교통: html.includes('id="transit"') && !html.includes('대중교통 안내는 아직'),
      주차: html.includes('id="parking"') && !html.includes('주차 안내는 아직'),
      특별관: html.includes('id="special-screens"'),
      근처: html.includes('id="nearby-cinemas"'),
    },
  };
});

const indexable = pages.filter((p) => !p.noindex && !['/404/', '/_not-found/'].includes(p.url));

console.log(`검사한 페이지 ${pages.length}개 (색인 대상 ${indexable.length}개)\n`);

/* ── 얇은 페이지 ─────────────────────────────────────────────── */
const THIN = 1800;
const thin = indexable.filter((p) => p.length < THIN).sort((a, b) => a.length - b.length);
console.log(`## 얇은 페이지 (본문 ${THIN}자 미만) — ${thin.length}개`);
if (thin.length === 0) console.log('  없음');
for (const p of thin) {
  const missing = p.isBranch
    ? Object.entries(p.has)
        .filter(([, v]) => !v)
        .map(([k]) => k)
    : [];
  const kind = p.isBranch ? '' : '  (지점 아님)';
  console.log(
    `  ${p.length}자  ${p.url}${missing.length ? `  빠진 항목: ${missing.join(', ')}` : kind}`,
  );
}

/* ── 중복 title / description ────────────────────────────────── */
function duplicates(field) {
  const byValue = new Map();
  for (const p of indexable) {
    if (!p[field]) continue;
    byValue.set(p[field], [...(byValue.get(p[field]) ?? []), p.url]);
  }
  return [...byValue.entries()].filter(([, urls]) => urls.length > 1);
}

for (const field of ['title', 'description']) {
  const dup = duplicates(field);
  console.log(`\n## 중복 ${field} — ${dup.length}종`);
  if (dup.length === 0) console.log('  없음');
  for (const [value, urls] of dup.slice(0, 10)) {
    console.log(`  ${urls.length}개: "${value.slice(0, 60)}…"`);
    console.log(`     ${urls.slice(0, 4).join(', ')}${urls.length > 4 ? ' …' : ''}`);
  }
}

const missingDesc = indexable.filter((p) => !p.description);
console.log(`\n## description 없음 — ${missingDesc.length}개`);
for (const p of missingDesc.slice(0, 10)) console.log(`  ${p.url}`);

const longTitle = indexable.filter((p) => p.title.length > 50);
console.log(`\n## title 50자 초과 — ${longTitle.length}개`);
for (const p of longTitle.slice(0, 10)) console.log(`  ${p.title.length}자  ${p.url}`);
