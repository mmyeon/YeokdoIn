# PWA Phase 1 Design — Installability

**Date:** 2026-05-10
**Scope:** Phase 1 (설치 가능성만, 오프라인/푸시 알림 제외)
**Goal:** 5명 초기 사용자에게 앱 설치 경험 제공 및 PWA 사용성 검증

---

## 1. 아키텍처 개요

```
next.config.ts
  └── withPWA() 래핑
        ├── public/manifest.json       # 앱 이름, 아이콘, 테마 색상
        ├── public/icons/              # 192x192, 512x512 PNG (logo.svg 변환)
        └── public/sw.js              # 빌드 시 next-pwa가 자동 생성

features/pwa/
  ├── ui/
  │   └── InstallBanner.tsx           # 상단 설치 배너 컴포넌트
  └── model/
      └── useInstallPrompt.ts         # beforeinstallprompt 이벤트 훅
```

- `next-pwa`가 빌드 시 Workbox 기반 service worker 자동 생성
- 설치 배너는 독립 feature 모듈로 분리 → 나중에 교체/삭제 용이
- iOS 감지는 `useInstallPrompt` 훅 내부에서 처리

---

## 2. manifest.json

```json
{
  "name": "역도인",
  "short_name": "역도인",
  "description": "역도 훈련 보조 앱",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0B0C",
  "theme_color": "#0A0B0C",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- `theme_color` / `background_color`: 디자인 시스템 다크 배경 `#0A0B0C` 사용
- 나중에 실제 아이콘 디자인 완성 시 PNG 파일만 교체하면 됨

---

## 3. 아이콘 생성

- **소스:** `public/logo.svg`
- **출력:** `public/icons/icon-192.png`, `public/icons/icon-512.png`
- **방법:** `npx svgexport` 또는 sharp one-time 스크립트로 생성 후 git 커밋
- **재생성:** 불필요 — 파일을 git에 커밋하면 빌드마다 재생성 안 함
- iOS `apple-touch-icon`도 동일한 PNG 파일 사용

---

## 4. next-pwa 설정

```ts
// next.config.ts
import withPWA from "next-pwa";

const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default nextConfig;
```

- 개발 환경에서 SW 비활성화 → 개발 편의성 확보
- 캐싱 전략: next-pwa 기본값 (정적 자산 cache-first)
- 오프라인 fallback: Phase 1 범위 밖

---

## 5. 설치 배너

### useInstallPrompt.ts

- `beforeinstallprompt` 이벤트 캐치 → deferredPrompt 저장
- `isIOS`: `navigator.userAgent`로 감지
- `isDismissed`: `localStorage.getItem('pwa-install-dismissed')` 확인
- `handleInstall()`: Android/Desktop용 `prompt()` 호출
- `handleDismiss()`: `localStorage.setItem('pwa-install-dismissed', 'true')` 저장

### InstallBanner.tsx

- 위치: 앱 상단 고정 배너
- **Android/Desktop:** "앱으로 설치하기" 버튼 → `handleInstall()` 호출
- **iOS Safari:** "Safari 공유 버튼(↑) → 홈 화면에 추가" 텍스트 안내
- **닫기:** X 버튼 → `handleDismiss()` → 이후 재노출 없음
- 이미 설치됐거나 dismissed면 배너 미노출

### app/layout.tsx 연결

```tsx
import { InstallBanner } from "@/features/pwa/ui/InstallBanner";

// <body> 최상단에 추가
<InstallBanner />
```

### app/layout.tsx 메타태그 추가

```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0A0B0C" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

---

## 6. 범위

### Phase 1 포함

- [ ] `next-pwa` 설치 및 `next.config.ts` 설정
- [ ] `public/manifest.json` 작성
- [ ] 아이콘 PNG 생성 (192, 512) → git 커밋
- [ ] `useInstallPrompt` 훅
- [ ] `InstallBanner` 컴포넌트 (Android/Desktop + iOS 분기)
- [ ] `app/layout.tsx` 메타태그 및 배너 연결

### Phase 2+ (미포함)

- 오프라인 fallback 페이지
- 백그라운드 동기화
- 푸시 알림 (정책 수립 후 진행)
