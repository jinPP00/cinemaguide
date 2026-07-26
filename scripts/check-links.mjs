/**
 * 빌드 산출물(out/)의 내부 링크가 실제 파일로 존재하는지 검사한다.
 *   npm run build && node scripts/check-links.mjs
 *
 * 정적 사이트는 깨진 링크가 있어도 빌드가 실패하지 않으므로 별도로 확인한다.
 * (가이드 13장 "깨진 링크 없음")
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'out');

if (!existsSync(OUT)) {
  console.error('out/ 이 없습니다. 먼저 npm run build 를 실행하세요.');
  process.exit(1);
}

/** out/ 아래 모든 html 파일 수집 */
function htmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...htmlFiles(full));
    else if (entry.endsWith('.html')) found.push(full);
  }
  return found;
}

const files = htmlFiles(OUT);
const broken = [];
const internalLinks = new Set();

for (const file of files) {
  const html = readFileSync(file, 'utf-8');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

  for (const href of hrefs) {
    // 외부 링크·앵커·특수 스킴 제외
    if (!href.startsWith('/')) continue;
    if (href.startsWith('//')) continue;

    const clean = href.split('#')[0].split('?')[0];
    if (!clean || clean === '/') continue;

    internalLinks.add(clean);

    const decoded = decodeURIComponent(clean);
    const candidates = [
      join(OUT, decoded, 'index.html'), // /cgv/서울/ → out/cgv/서울/index.html
      join(OUT, decoded), // /sitemap.xml 같은 실제 파일
    ];

    if (!candidates.some((p) => existsSync(p))) {
      broken.push({
        page: file.replace(OUT, '').replace(/\\/g, '/'),
        href: decoded,
      });
    }
  }
}

console.log(`검사한 HTML ${files.length}개, 내부 링크 ${internalLinks.size}종`);

if (broken.length === 0) {
  console.log('깨진 내부 링크 0건');
  process.exit(0);
}

// 같은 링크가 여러 페이지에서 깨지므로 링크 기준으로 묶어서 보고
const byHref = new Map();
for (const b of broken) {
  byHref.set(b.href, (byHref.get(b.href) ?? 0) + 1);
}

console.log(`\n깨진 링크 ${byHref.size}종 (총 ${broken.length}건):`);
for (const [href, count] of [...byHref].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${href}  (${count}개 페이지에서 참조)`);
}
process.exit(1);
