# 📋 Cinemaguide (cinemaguide) — 기획 및 요구사항 정의서 (PRD)

> **프로젝트 경로**: `C:\projects\cinemaguide`
> **서비스 설명**: 전국 영화관과 지점·주차 정보를 찾는 안내 서비스 (cinemaguide.kr)
> **운영 URL**: https://cinemaguide.kr

---

## 1. 서비스 개요 및 핵심 목표
- **서비스명**: Cinemaguide
- **핵심 가치**: 전국 영화관과 지점·주차 정보를 찾는 안내 서비스 (cinemaguide.kr)
- **운영 환경**: cf

## 2. 주요 기능 및 아키텍처 요약
# 영화관 지점안내

CGV·롯데시네마·메가박스 전국 425개 지점의 위치, 교통, 주차, 관람료 정보를 정리한 비공식 정보 안내 사이트.

각 영화관 공식 서비스와 무관하며, 실시간 상영시간표는 제공하지 않고 공식 예매 페이지로 연결한다.

## 기술 구성

| 항목 | 값 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 렌더링 | 정적 생성 (`output: 'export'`) |
| 호스팅 | Cloudflare Workers Static Assets |
| 데이터 | 빌드 시점에 `data/*.json`을 읽어 정적 페이지 생성 |

본문은 빌드 결과물인 HTML·CSS·JS로 제공한다. HTTP→HTTPS는 Cloudflare 도메인의 SSL/TLS → Edge Certificates → Always Use HTTPS 설정을 켜서 처리한다. www의 대표 주소 이동은 기존 도메인 설정을 사용한다.

정적 자산에는 Worker 스크립트를 두지 않는다. `assets.run_worker_first: true`를 추가하면 HTML·JS·CSS뿐 아니라 Next.js 화면 전환용 `.txt` 요청도 모두 Worker 실행으로 집계되어 무료 일일 요청 한도를 소모한다. 요청량 때문에 런타임이 꼭 필요해지면 실행할 경로부터 제한한다.

운영 배포는 `.github/workflows/deploy-cloudflare.yml`의 `wrangler deploy`를 사용한다. 아래 Pages 설정은 다른 정적 호스팅으로 옮길 때 참고용이다.

## Cloudflare Pages 배포 설정

GitHub 저장소를 연결할 때 아래 값을 사용한다.

## 3. 향후 추가 기획 및 개선 범위
- **다음 목표**: 네이버 사이트맵 제출 · CSP가 막는 AdSense 동의 메시지 해소
- 신규 대규모 기능 추가 시 본 `PRD.md`에 요구사항과 수정 대상 파일 범위를 먼저 업데이트한 후 구현을 진행합니다.
