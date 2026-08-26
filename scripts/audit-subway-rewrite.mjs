import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
if (!fs.existsSync(OUT)) {
  console.error('out/ 이 없습니다. 먼저 npm run build 를 실행하세요.');
  process.exit(1);
}

const branches = JSON.parse(fs.readFileSync('data/branches.json', 'utf8'));

function decode(text) {
  return String(text ?? '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/<br\s*\/?\s*>/gi, '\n');
}

function plain(html) {
  return decode(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function transitSection(html) {
  const m = html.match(/<section[^>]*aria-labelledby=["']transit["'][^>]*>([\s\S]*?)<\/section>/i);
  return m?.[1] ?? '';
}

/** 시작 위치의 div 하나를 중첩 깊이까지 포함해 통째로 반환한다. */
function balancedDiv(html, start) {
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = start;
  let depth = 0;
  let started = false;
  let match;

  while ((match = tagRe.exec(html))) {
    const closing = /^<\/div/i.test(match[0]);
    if (!started) {
      if (closing) continue;
      started = true;
      depth = 1;
      continue;
    }
    depth += closing ? -1 : 1;
    if (depth === 0) return html.slice(start, tagRe.lastIndex);
  }
  return '';
}

/** 대중교통 섹션 중 '지하철' 카드만 검사한다. 버스 카드 문구를 오탐하지 않는다. */
function subwayCard(html) {
  const transit = transitSection(html);
  if (!transit) return '';

  const startRe = /<div[^>]*class=["'][^"']*\btransit-card\b[^"']*["'][^>]*>/gi;
  let match;
  while ((match = startRe.exec(transit))) {
    const block = balancedDiv(transit, match.index);
    if (!block) continue;
    const head = block.match(/<div[^>]*class=["'][^"']*\btransit-card-head\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    if (head && /지하철/.test(plain(head[1]))) return block;
  }
  return '';
}

function compareForm(text) {
  return decode(text)
    .replace(/^[\s\-·•●○★■ㆍ]+/, '')
    .replace(/[>→()[\]{}:：,./·'"\s_-]+/g, '')
    .toLowerCase();
}

function sourceSubwayLinesFromText(text) {
  if (!text) return [];
  const result = [];
  const lines = decode(text).split('\n').map((line) => line.trim()).filter(Boolean);
  let inSubway = false;

  for (const line of lines) {
    const plainLine = line.replace(/^[\-·•●○★■ㆍ]\s*/, '').trim();
    const inline = plainLine.match(/^(?:\d+[.)]\s*)?지하철\s*(?:이용\s*시|안내)?\s*[:：]\s*(.+)$/);
    if (inline) {
      result.push(inline[1]);
      continue;
    }

    if (/^(?:[#■]\s*|\[)?[^\n\]]*지하철(?:\s*이용\s*시|\s*안내)?\]?\s*$/.test(plainLine)) {
      inSubway = true;
      continue;
    }
    if (/^(?:[#■]\s*|\[)?[^\n\]]*버스(?:\s*이용\s*시|\s*안내)?\]?\s*$/.test(plainLine)) {
      inSubway = false;
      continue;
    }

    if (inSubway || (/\d{1,2}\s*호선/.test(plainLine) && /(?:역|출구)/.test(plainLine))) {
      result.push(plainLine);
    }
  }
  return result;
}

function sourceSubwayLines(branch) {
  const lines = [];
  if (branch.transit?.subway) lines.push(...decode(branch.transit.subway).split('\n'));
  if (branch.transit?.raw) lines.push(...sourceSubwayLinesFromText(branch.transit.raw));

  for (const value of [branch.parking?.raw, branch.parking?.guide, branch.parking?.howTo, branch.parking?.fee]) {
    if (value && /지하철/.test(value)) lines.push(...sourceSubwayLinesFromText(value));
  }

  return [...new Set(lines.map((line) => line.trim()).filter(Boolean))];
}

const residualPatterns = [
  /\d+번출구/,
  /도보\s*직진|도보직진/,
  /우측\s*방향|좌측\s*방향/,
  /엘레베이터/,
  /엘리베이터\s*(?:탑승|이용)\s*\d+층\s*이동/,
  /(?:문\s*)?통과\s*후/,
  /방향\s*\(\s*\d+(?:\.\d+)?m\s*직진\s*\)/i,
];

const issues = [];
let subwayCards = 0;
for (const branch of branches) {
  const file = path.join(OUT, branch.pageSlug, 'index.html');
  if (!fs.existsSync(file)) continue;

  const html = fs.readFileSync(file, 'utf8');
  const card = subwayCard(html);
  if (!card) continue;
  subwayCards++;

  const rendered = plain(card);
  const renderedCompare = compareForm(rendered);

  for (const sourceLine of sourceSubwayLines(branch)) {
    const sourceCompare = compareForm(sourceLine);
    if (sourceCompare.length < 28) continue;
    if (renderedCompare.includes(sourceCompare)) {
      issues.push({
        slug: branch.pageSlug,
        kind: '원문 긴 문장 잔존',
        detail: sourceLine.slice(0, 120),
      });
      break;
    }
  }

  const residual = residualPatterns.find((re) => re.test(rendered));
  if (residual) {
    issues.push({
      slug: branch.pageSlug,
      kind: '원문형 지하철 표현 잔존',
      detail: rendered.match(residual)?.[0] ?? String(residual),
    });
  }
}

console.log('\n=== 지하철 안내 문구 전수 검사 ===');
console.log(`전체 지점: ${branches.length}개 · 지하철 카드: ${subwayCards}개`);
console.log(`문제 건수: ${issues.length}건`);

if (issues.length) {
  for (const issue of issues.slice(0, 150)) {
    console.log(`[${issue.kind}] /${issue.slug}/ — ${issue.detail}`);
  }
  if (issues.length > 150) console.log(`... ${issues.length - 150}건 추가`);
  console.error('\n감사 실패: 공식 원문형 지하철 안내가 남아 있습니다.');
  process.exit(1);
}

console.log('문제 없음');
