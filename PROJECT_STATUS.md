# 📊 Cinemaguide (cinemaguide) — 프로젝트 진행 및 운영 현황판 (PROJECT_STATUS)

> **최종 동기화**: 2026-11-07
> **현재 단계**: `auto`
> **서비스 주소**: https://cinemaguide.kr

---

## 1. 현재 구현 및 운영 상태
- **핵심 요약**: 전국 영화관과 지점·주차 정보를 찾는 안내 서비스 (cinemaguide.kr)
- **관제탑(project_hub) 연동**: ✅ 등록됨 (`cinemaguide`)
- **운영 메모**: 배포 방식: C:\projects\websites\cinemaguide 에서 main에 push 또는 `npx wrangler deploy`로 Cloudflare Workers(cinemaguide.kr) 배포
- **운영 메모**: 계정: GSC·GA4(G-FVSVDPVRFF)·Bing은 savezenith, 네이버는 elkoaw38. AdSense만 jinppp1508(ca-pub-4378510721922617)
- **SEO·AEO·GEO 25항목 진단**: ✅ **100점 (25/25 통과)** — 지점 `sitemap.xml` `lastmod`(2026-07-23 고정 버그) 해소, `HowTo`·`SpeakableSpecification` 적용, AI 검색 봇 9종 명시 허용, 홈·가이드 메타 설명 80자 이내 최적화 완료

## 2. 검색엔진 · 애널리틱스 · 계정 등록 현황
| 항목 | 상태 | 담당 계정 / 비고 |
| :--- | :--- | :--- |
| **Google Search Console** | ✅ 등록 및 사이트맵/RSS 재제출 완료 (`sc-domain:cinemaguide.kr`) | `savezenith@gmail.com` (`sitemap.xml`, `rss.xml`) |
| **Google Analytics 4 (GA4)** | ✅ 등록 완료 (`G-FVSVDPVRFF`) | `savezenith@gmail.com` |
| **네이버 서치어드바이저** | ✅ 등록 및 IndexNow 458개 URL 제출 완료 (`elkoaw38@naver.com`) | `elkoaw38@naver.com` |
| **Bing Webmaster Tools** | ✅ 소유권 인증(`msvalidate.01` / `BingSiteAuth.xml`) 및 피드 제출 완료 | `savezenith@gmail.com` |

## 3. 다음 작업 및 유지보수 할 일 (TODO)
- [x] CSP가 막는 AdSense 동의 메시지 해소 (`fundingchoicesmessages.google.com`, `adtrafficquality.google` 허용)
- [x] 지점 상세 페이지 사이트맵 `lastmod` 고정(2026-07-23)으로 인한 구글봇 재크롤링 누락 수정 및 25항목 100점 달성
- [ ] 배포 후 14일간 Google Search Console 색인 회복 추이 점검
