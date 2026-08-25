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

function plain(html) {
  return decodeHtml(
    html
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

function listItems(html) {
  return [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => plain(m[1])).filter(Boolean);
}

function urlOf(file) {
  return decodeURIComponent('/' + path.relative(OUT, file).split(path.sep).join('/').replace(/index\.html$/, ''));
}

const files = walk(OUT);
const branchPages = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('id="transit"') && !html.includes('id="parking"')) continue;
  // 브랜드/정책 페이지가 아니라 지점 상세만 집계한다.
  if (!html.includes('id="nearby-cinemas"') && !html.includes('class="branch-hero"')) continue;
  branchPages.push({ file, url: urlOf(file), html });
}

const issues = [];
const add = (url, kind, detail) => issues.push({ url, kind, detail });

for (const page of branchPages) {
  const { url, html } = page;
  const parkingHtml = section(html, 'parking');
  const transitHtml = section(html, 'transit');

  if (parkingHtml) {
    const parkingText = plain(parkingHtml);
    const items = listItems(parkingHtml);

    // HTML 엔티티가 사용자에게 문자 그대로 보이는 회귀.
    if (/&nbsp;|&#160;|&(?:amp|lt|gt|quot|apos);/i.test(parkingHtml)) {
      add(url, '주차 HTML 엔티티', '렌더 결과에 HTML 엔티티 표기가 남아 있음');
    }

    // 한 항목이 길면 사실 추출이 아니라 원문을 통째로 끌고 왔을 가능성이 높다.
    const longItems = items.filter((t) => t.length > 105);
    if (longItems.length) {
      add(url, '주차 긴 문장', `${longItems.length}개 · 최장 ${Math.max(...longItems.map((t) => t.length))}자`);
    }

    // 무료시간이 조건 없이 여러 값으로 나열되는 문제(예: 3시간/2시간 동시 표기).
    if (!/이용 조건에 따라|조건별/.test(parkingText)) {
      const free = [...parkingText.matchAll(/(\d+)시간(?:\s*(\d+)분)?\s*무료/g)].map((m) => `${m[1]}:${m[2] ?? '0'}`);
      if (new Set(free).size > 1) add(url, '주차 무료시간 충돌', [...new Set(free)].join(', '));
    }

    // 숫자 하나 때문에 긴 동선 설명 전체가 '주차 규모'로 잘못 들어간 회귀를 잡는다.
    const capacityRows = [...parkingHtml.matchAll(/<dt>주차 규모<\/dt>[\s\S]*?<dd>([\s\S]*?)<\/dd>/gi)];
    for (const row of capacityRows) {
      const t = plain(row[1]);
      if (t.length > 45 || /엘리베이터|연결통로|입구|이동|구역/.test(t)) {
        add(url, '주차 규모 오분류', `${t.length}자 · ${t.slice(0, 80)}`);
      }
    }
  }

  if (transitHtml) {
    const items = listItems(transitHtml);
    if (/&nbsp;|&#160;|&(?:amp|lt|gt|quot|apos);/i.test(transitHtml)) {
      add(url, '교통 HTML 엔티티', '렌더 결과에 HTML 엔티티 표기가 남아 있음');
    }

    // 모바일/데스크톱 모두 한 불릿이 140자를 넘으면 읽기 어려운 원문 덩어리로 본다.
    const long = items.filter((t) => t.length > 140);
    if (long.length) {
      add(url, '교통 긴 문장', `${long.length}개 · 최장 ${Math.max(...long.map((t) => t.length))}자`);
    }

    // 버스 번호가 쉼표 없이/띄어쓰기 없이 길게 붙는 원자료 형태.
    const routeBlob = items.find((t) => /(?:\d{1,4}[,，]\s*){5,}\d{1,4}/.test(t));
    if (routeBlob) add(url, '교통 노선 나열', routeBlob.slice(0, 100));
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
  for (const issue of issues.slice(0, 120)) {
    console.log(`[${issue.kind}] ${issue.url} — ${issue.detail}`);
  }
  if (issues.length > 120) console.log(`... ${issues.length - 120}건 추가`);
}

// 감사 스크립트는 배포를 막지는 않는다. 결과를 보고 수정한 뒤 재검사한다.
process.exit(0);
