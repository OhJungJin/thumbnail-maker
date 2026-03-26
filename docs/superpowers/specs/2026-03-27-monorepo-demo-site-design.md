# @rodang/thumbnail-maker - 모노레포 + 데모 사이트 설계

**작성일**: 2026-03-27
**상태**: 승인됨

---

## 개요

이 문서는 `@rodang/thumbnail-maker` 프로젝트의 두 가지 목표를 정의합니다:

1. **npm 패키지**: 재사용 가능한 AI 썸네일 생성 라이브러리
2. **데모 사이트**: 패키지 기능을 보여주는 마케팅용 랜딩 페이지

---

## 결정 사항

| 항목 | 결정 |
|------|------|
| 프로젝트 구조 | 모노레포 (pnpm workspaces) |
| 데모 사이트 역할 | 마케팅용 랜딩 페이지 (실제 이미지 생성 없음) |
| 데모 사이트 프레임워크 | Next.js |
| 모노레포 도구 | pnpm workspaces |
| 데모 사이트 콘텐츠 | 히어로 + 스타일 갤러리 + 코드 예시 + 설치 방법 |
| 샘플 이미지 | Fal.ai로 직접 생성하여 저장소에 포함 |
| 기존 계획 | PLAN.md Phase 구조 유지 + 확장 |
| 구현 전략 | 점진적 전환 (Phase 1 완료 후 모노레포 전환) |

---

## 최종 프로젝트 구조

```
thumbnail-maker/
├── pnpm-workspace.yaml
├── package.json                 # 루트 (워크스페이스 설정)
├── packages/
│   └── core/                    # npm 패키지 (@rodang/thumbnail-maker)
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── src/
│       │   ├── index.ts
│       │   ├── core/
│       │   │   ├── generator.ts
│       │   │   └── types.ts
│       │   ├── providers/
│       │   │   ├── base.ts
│       │   │   └── fal.ts
│       │   ├── presets/
│       │   │   ├── index.ts
│       │   │   └── pixar.ts
│       │   └── cli.ts
│       └── tests/
└── apps/
    └── demo/                    # Next.js 데모 사이트
        ├── package.json
        ├── next.config.js
        ├── public/
        │   └── samples/         # 생성된 샘플 이미지들
        └── src/
            └── app/
                ├── page.tsx     # 랜딩 페이지
                └── layout.tsx
```

---

## 수정된 Phase 구조

| Phase | 내용 | 상태 |
|-------|------|------|
| **Phase 0** | 프로젝트 초기화 | 완료 |
| **Phase 1** | Core 기능 (Fal.ai + Pixar) - 현재 구조에서 구현 | 다음 |
| **Phase 1.5** | 모노레포 전환 + 데모 사이트 기본 구조 | 신규 |
| **Phase 2** | 추가 프리셋 + 배치 처리 + CLI | 기존 |
| **Phase 2.5** | 데모 사이트 콘텐츠 완성 + 샘플 이미지 생성 | 신규 |
| **Phase 3** | 멀티 프로바이더 (DALL-E, Replicate) | 기존 |
| **Phase 4** | rodang-blog 통합 | 기존 |
| **Phase 5** | 테스트 & 문서화 | 기존 |
| **Phase 6** | npm 배포 + 데모 사이트 배포 | 기존 확장 |

### Phase 1.5 상세 (신규)

**목표**: 모노레포 구조로 전환하고 데모 사이트 기본 틀 생성

**작업 내용**:
1. pnpm-workspace.yaml 생성
2. 루트 package.json을 워크스페이스 루트로 변환
3. 기존 코드를 `packages/core/`로 이동
4. `apps/demo/` Next.js 프로젝트 초기화
5. 워크스페이스 의존성 설정 (`workspace:*`)
6. 빌드 스크립트 검증

### Phase 2.5 상세 (신규)

**목표**: 데모 사이트 콘텐츠 완성

**작업 내용**:
1. 랜딩 페이지 컴포넌트 구현
   - Header (로고 + GitHub 링크)
   - Hero Section
   - Style Gallery
   - Code Examples
   - Installation
   - Footer
2. 각 스타일별 샘플 이미지 생성 (Fal.ai API 사용)
3. 반응형 디자인
4. Vercel 배포 설정

---

## 데모 사이트 설계

### 페이지 레이아웃

```
┌─────────────────────────────────────┐
│           Header (로고 + GitHub)     │
├─────────────────────────────────────┤
│              Hero Section            │
│  "AI로 블로그 썸네일을 자동 생성하세요" │
│  [npm install 명령어] [GitHub 버튼]  │
├─────────────────────────────────────┤
│           Style Gallery              │
│  ┌───────┐ ┌───────┐ ┌───────┐      │
│  │Pixar  │ │Water  │ │Illust │ ...  │
│  │ 3D    │ │color  │ │ration │      │
│  └───────┘ └───────┘ └───────┘      │
│  (각 스타일별 샘플 이미지 2-3장)      │
├─────────────────────────────────────┤
│           Code Examples              │
│  - Programmatic API 예시             │
│  - CLI 사용 예시                     │
├─────────────────────────────────────┤
│           Installation               │
│  npm / pnpm / yarn 설치 명령어       │
├─────────────────────────────────────┤
│              Footer                  │
│  MIT License · GitHub · npm          │
└─────────────────────────────────────┘
```

### 샘플 이미지 계획

| 스타일 | 샘플 수 | 예시 주제 | 생성 시점 |
|--------|---------|----------|----------|
| pixar-3d | 3장 | React Hooks, TypeScript 기초, Git 사용법 | Phase 2.5 |
| watercolor | 3장 | TBD | Phase 2.5 (Phase 2 이후) |
| illustration | 3장 | TBD | Phase 2.5 (Phase 2 이후) |
| minimal | 3장 | TBD | Phase 2.5 (Phase 2 이후) |

초기에는 pixar-3d 3장만 생성, 추가 프리셋 구현 후 나머지 추가.

---

## Core 패키지 아키텍처

### 소스 구조

```
packages/core/src/
├── index.ts              # Public exports
├── core/
│   ├── types.ts          # 모든 TypeScript 인터페이스
│   └── generator.ts      # ThumbnailGenerator 클래스
├── providers/
│   ├── base.ts           # BaseProvider (retry, error handling)
│   └── fal.ts            # FalProvider (FLUX Pro v1.1)
├── presets/
│   ├── index.ts          # Preset registry
│   └── pixar.ts          # Pixar 3D prompt template
├── utils/
│   └── download.ts       # 이미지 다운로드 유틸리티
└── cli.ts                # Commander 기반 CLI
```

### 의존성 구조

```
apps/demo (Next.js)
    └── depends on → packages/core (workspace:*)
                         └── depends on → commander (CLI만)
                         └── zero deps (라이브러리 코어)
```

### 빌드 출력

```
packages/core/dist/
├── index.js      # CJS
├── index.mjs     # ESM
├── index.d.ts    # Types
├── cli.js        # CLI (shebang 포함)
└── cli.mjs
```

---

## 기술 스택 요약

| 영역 | 기술 |
|------|------|
| 모노레포 | pnpm workspaces |
| Core 패키지 | TypeScript, tsup |
| 데모 사이트 | Next.js (App Router) |
| 스타일링 | Tailwind CSS |
| 배포 | Vercel (데모 사이트), npm (패키지) |
| 테스트 | Vitest |

---

## 성공 기준

### Phase 1.5 완료 조건
- pnpm workspaces 설정 완료
- `packages/core`에서 빌드 성공
- `apps/demo`에서 core 패키지 import 성공
- 개발 서버 정상 동작

### Phase 2.5 완료 조건
- 랜딩 페이지 모든 섹션 구현
- 최소 pixar-3d 스타일 샘플 이미지 3장 포함
- 반응형 디자인 (모바일/데스크톱)
- Vercel 배포 성공

### 최종 완료 조건
- npm 패키지 배포 완료
- 데모 사이트 라이브
- rodang-blog에서 패키지 사용 중

---

## 참고

- 기존 계획: [PLAN.md](../../../PLAN.md)
- 원본 구현: `/Users/jungjin/Documents/code/rodang-blog/scripts/sync-notion.mjs`
