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

function decodeHtmlOnce(text) {
  return text
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)));
}

function decodeHtml(text) {
  let out = text;
  for (let i = 0; i < 3; i++) out = decodeHtmlOnce(out);
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

function section(html, id) {
  const re = new RegExp(`<section[^>]*aria-labelledby=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`, 'i');
  return html.match(re)?.[1] ?? '';
}

function listItemHtml(html) {
  return [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1]);
}

function listItems(html) {
  return listItemHtml(html).map(plain).filter(Boolean);
}

function transitNarratives(html) {
  return listItemHtml(html)
    .map((item) =>
      item.replace(
        /<span[^>]*class=["'][^"']*\btb-route\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi,
        ' ',
      ),
    )
    .map(plain)
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function urlOf(file) {
  return decodeURIComponent('/' + path.relative(OUT, file).split(path.sep).join('/').replace(/index\.html$/, ''));
}

function hasVisibleEntityResidue(text) {
  return /&(?:nbsp|amp|lt|gt|quot|apos)(?:;|\b)|&#(?:160|\d+|x[0-9a-f]+);?/i.test(text);
}

function duplicateValues(values, minLength = 1) {
  const seen = new Set();
  const dup = new Set();
  for (const value of values.map((v) => v.trim()).filter((v) => v.length >= minLength)) {
    if (seen.has(value)) dup.add(value);
    seen.add(value);
  }
  return [...dup];
}

const files = walk(OUT);
const branchPages = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('id="transit"') && !html.includes('id="parking"')) continue;
  if (!html.includes('id="nearby-cinemas"') && !html.includes('class="branch-hero"')) continue;
  branchPages.push({ file, url: urlOf(file), html });
}

const issues = [];
const add = (url, kind, detail) => issues.push({ url, kind, detail });

const PRICE_JUDGMENT_PATTERNS = [
  /가장 싼 조합/,
  /가장 비싼 줄/,
  /가장 싼 금액/,
  /가장 비싼 금액/,
  /더 싼 영화관/,
  /더 싼 곳/,
  /가장 싼 곳/,
  /\d[\d,]*원\s*저렴/,
  /\d[\d,]*원\s*비쌈/,
  /보다\s*[\d,]+원\s*쌉니다/,
  /보다\s*[\d,]+원\s*비쌉니다/,
  /중 가장 싼/,
  /중 가장 비싼/,
];

for (const page of branchPages) {
  const { url, html } = page;
  const parkingHtml = section(html, 'parking');
  const transitHtml = section(html, 'transit');
  const pageText = plain(html);

  if (/현재 상영중인 영화 순위|박스오피스 TOP\s*10/i.test(pageText)) {
    add(url, '상세 박스오피스 잔존', '지점 상세에 공통 박스오피스 문구가 있음');
  }
  if (/\bundefined\b|\bnull\b/.test(pageText)) add(url, '깨진 값 노출', 'undefined/null 문자열 노출');

  const priceJudgment = PRICE_JUDGMENT_PATTERNS.find((re) => re.test(pageText));
  if (priceJudgment) {
    const match = pageText.match(priceJudgment);
    add(url, '가격 평가 문구 잔존', match?.[0] ?? String(priceJudgment));
  }

  if (/가까운 특별관/.test(pageText)) {
    add(url, '주변 섹션 중복 잔존', '가까운 특별관 섹션이 별도로 남아 있음');
  }

  if (parkingHtml) {
    const parkingText = plain(parkingHtml);
    const items = listItems(parkingHtml);

    if (hasVisibleEntityResidue(parkingText)) {
      add(url, '주차 HTML 엔티티', parkingText.match(/&[^\s]{1,20}/)?.[0] ?? '엔티티 잔존');
    }

    const longItems = items.filter((t) => t.length > 105);
    if (longItems.length) {
      add(url, '주차 긴 문장', `${longItems.length}개 · 최장 ${Math.max(...longItems.map((t) => t.length))}자`);
    }

    if (!/이용 조건에 따라|조건별/.test(parkingText)) {
      const free = [...parkingText.matchAll(/(\d+)시간(?:\s*(\d+)분)?\s*무료/g)].map((m) => `${m[1]}:${m[2] ?? '0'}`);
      if (new Set(free).size > 1) add(url, '주차 무료시간 충돌', [...new Set(free)].join(', '));
    }

    const capacityRows = [...parkingHtml.matchAll(/<dt>주차 규모<\/dt>[\s\S]*?<dd>([\s\S]*?)<\/dd>/gi)];
    for (const row of capacityRows) {
      const t = plain(row[1]);
      if (t.length > 45 || /엘리베이터|연결통로|입구|이동|구역/.test(t)) {
        add(url, '주차 규모 오분류', `${t.length}자 · ${t.slice(0, 80)}`);
      }
    }

    const duplicates = duplicateValues(items, 30);
    if (duplicates.length) add(url, '주차 중복 문장', duplicates.slice(0, 2).join(' / '));
  }

  if (transitHtml) {
    const transitText = plain(transitHtml);
    const narratives = transitNarratives(transitHtml);

    if (hasVisibleEntityResidue(transitText)) {
      add(url, '교통 HTML 엔티티', transitText.match(/&[^\s]{1,20}/)?.[0] ?? '엔티티 잔존');
    }

    const long = narratives.filter((t) => t.length > 125);
    if (long.length) {
      add(url, '교통 긴 문장', `${long.length}개 · 최장 ${Math.max(...long.map((t) => t.length))}자 · ${long[0].slice(0, 90)}`);
    }

    const routeBlob = narratives.find((t) => /(?:[A-Za-z가-힣]*\d[\w-]*(?:\([^)]{1,18}\))?[,，]\s*){5,}[A-Za-z가-힣]*\d[\w-]*/.test(t));
    if (routeBlob) add(url, '교통 노선 원문 잔존', routeBlob.slice(0, 140));

    const artifact = narratives.find((t) => /&nbsp;|(?:^|\s)_[^_]|■|(?<!\w)#\s*(?:지하철|버스)/.test(t));
    if (artifact) add(url, '교통 원자료 기호', artifact.slice(0, 120));

    const duplicates = duplicateValues(narratives, 55);
    if (duplicates.length) add(url, '교통 중복 문장', duplicates.slice(0, 2).join(' / '));
  }

  if (!/정보 확인일|자료 출처/.test(pageText)) {
    add(url, '출처 블록 누락', '정보 확인일 또는 자료 출처 문구가 없음');
  }
}

const byKind = new Map();
for (const issue of issues) byKind.set(issue.kind, (byKind.get(issue.kind) ?? 0) + 1);

console.log(`\n=== 지점 상세 전수 가독성 검사 ===`);
console.log(`검사 지점: ${branchPages.length}개`);
console.log(`문제 건수: ${issues.length}건`);
if (byKind.size === 0) console.log('문제 없음');
else {
  for (const [kind, count] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`- ${kind}: ${count}건`);
  }
  console.log('\n상세 목록:');
  for (const issue of issues.slice(0, 200)) {
    console.log(`[${issue.kind}] ${issue.url} — ${issue.detail}`);
  }
  if (issues.length > 200) console.log(`... ${issues.length - 200}건 추가`);
}

process.exit(0);
