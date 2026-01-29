# CLAUDE.md - Scaff 프로젝트 개발 지침

> **이 파일은 Claude Code가 자동으로 읽는 지침 파일입니다.**
> **프로젝트 루트에 위치해야 합니다.**

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정보

- **프로젝트명**: Scaff (스캐프)
- **목적**: 수능 기출 해설 서비스 - 사고 회로 중심 해설
- **MVP 목표**: 2025 수능 킬러 5문제 해설 + 로그인 기능
- **배포 플랫폼**: Vercel

### 1.2 기술 스택

```
프레임워크: Next.js 15 (App Router)
언어: TypeScript (strict mode)
UI: React 19 + Tailwind CSS 4
콘텐츠: MDX + KaTeX (수식)
백엔드: Supabase (Auth, PostgreSQL, Storage)
상태관리: TanStack Query
검증: Zod
테스트: Playwright (E2E)
배포: Vercel
```

### 1.3 핵심 컨텍스트 문서

- **노션 컨텍스트**: https://www.notion.so/2f033b9842a18120b723d2a3eae39540
- 대화가 끊기면 이 노션 문서를 참조해서 컨텍스트 복원

---

## 2. 사용자 프로필 (개발자)

### 2.1 현재 수준

- JavaScript/TypeScript: 기초
- React/Next.js: 기초
- 프로젝트 경험: 없음 (첫 프로젝트)

### 2.2 학습 목표

- Claude Code로 개발하면서 동시에 코드 이해도 높이기
- 면접에서 "왜 이렇게 했는지" 설명할 수 있어야 함
- 핵심 패턴은 직접 따라 쳐서 체득

### 2.3 선호 스타일

- 숲(전체 구조) 먼저, 나무(세부) 나중에
- "왜?" 설명 없으면 납득 안 함
- 단기 해킹보다 장기적으로 안정적인 설계 선호

---

## 3. 코드 작성 규칙

### 3.1 파일 구조

```
app/                    # Next.js App Router
  (auth)/              # 인증 관련 라우트 그룹
    login/page.tsx
    signup/page.tsx
  (main)/              # 메인 컨텐츠 라우트 그룹
    problems/[subject]/[year]/[id]/page.tsx
  api/                 # API Routes
  layout.tsx
  page.tsx

components/
  layout/              # Header, Footer, Navigation
  solution/            # 해설 관련 컴포넌트
  ui/                  # 재사용 가능한 UI 컴포넌트
  auth/                # 인증 관련 컴포넌트

content/
  problems/
    math/
      2025/
        21.mdx         # 해설 콘텐츠

lib/
  supabase/            # Supabase 클라이언트
  utils/               # 유틸리티 함수
  types.ts             # 전역 타입 정의
  constants.ts         # 상수

hooks/                 # 커스텀 훅

styles/                # 글로벌 스타일 (필요시)
```

### 3.2 네이밍 컨벤션

```typescript
// 컴포넌트: PascalCase
export function SolutionCard() {}

// 함수/변수: camelCase
const handleSubmit = () => {};
const userName = "test";

// 상수: UPPER_SNAKE_CASE
const API_BASE_URL = "https://...";

// 타입/인터페이스: PascalCase
interface Problem {}
type Subject = "math" | "physics" | "chemistry";

// 파일명
// - 컴포넌트: PascalCase.tsx (SolutionCard.tsx)
// - 유틸리티: camelCase.ts (formatDate.ts)
// - 타입: types.ts
```

### 3.3 TypeScript 규칙

```typescript
// ✅ 항상 타입 명시
function calculate(a: number, b: number): number {
  return a + b;
}

// ✅ 인터페이스 사용 (객체 타입)
interface User {
  id: string;
  email: string;
  name: string;
}

// ✅ 타입 사용 (유니온, 튜플)
type Status = "loading" | "success" | "error";

// ❌ any 사용 금지
// ❌ as 타입 단언 최소화
```

### 3.4 컴포넌트 작성 규칙

```typescript
// ✅ 서버 컴포넌트 (기본값) - DB 접근, 무거운 연산
// app/problems/[subject]/[year]/[id]/page.tsx
export default async function ProblemPage({ params }: Props) {
  const problem = await getProblem(params.id)
  return <ProblemDetail problem={problem} />
}

// ✅ 클라이언트 컴포넌트 - 상호작용 필요시
// components/solution/ClueToggle.tsx
'use client'

import { useState } from 'react'

export function ClueToggle({ clue }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? '닫기' : '열기'}
    </button>
  )
}
```

---

## 4. 응답 구조 (중요!)

### 4.1 기본 응답 구조

모든 코드 작성 시 다음 구조로 응답:

```markdown
## 🌲 숲 (이 작업의 위치)

[현재 작업이 전체 프로젝트에서 어디에 해당하는지 1-2줄로 설명]

## 📁 파일 경로

[정확한 파일 경로]

## 💡 이 코드가 하는 일

[코드의 목적을 3줄 이내로 설명]

## 📝 코드

[실제 코드]

## 🔑 핵심 개념 (면접 대비)

[이 코드에서 알아야 할 핵심 개념 2-3개]

- **개념명**: 한 줄 설명
- 왜 이렇게 했는지 (면접 답변용)

## ✍️ 직접 쳐보기 (선택)

[이 코드에서 직접 타이핑해서 익혀야 할 핵심 패턴이 있으면 표시]

- 해당 패턴이 중요한 이유
- 어디서 자주 쓰이는지

## ⚠️ 주의사항

[이 코드에서 실수하기 쉬운 부분]

## ✅ 성공 확인

[이 코드가 제대로 동작하는지 확인하는 방법]
```

### 4.2 핵심 패턴 표시 규칙

코드 내에서 직접 익혀야 할 부분은 주석으로 표시:

```typescript
// 🎯 [핵심 패턴] useState 기본 사용법 - 직접 쳐보기
const [count, setCount] = useState(0)

// 🎯 [핵심 패턴] 이벤트 핸들러 - 직접 쳐보기
const handleClick = () => {
  setCount(prev => prev + 1)
}

// 일반 코드 (따라치기 불필요)
return <div>{count}</div>
```

### 4.3 면접 질문 포맷

```markdown
## 🎤 예상 면접 질문

**Q: 왜 useState를 사용했나요?**
A: [2-3문장 답변]

**Q: 서버 컴포넌트와 클라이언트 컴포넌트를 어떻게 구분했나요?**
A: [2-3문장 답변]
```

---

## 5. 금지 사항

### 5.1 절대 금지

- ❌ `any` 타입 사용
- ❌ `var` 키워드 사용
- ❌ 인라인 스타일 (Tailwind 사용)
- ❌ 설명 없이 코드만 던지기
- ❌ 왜 이렇게 하는지 설명 없이 진행

### 5.2 피해야 할 것

- 과도한 추상화 (MVP 단계에서 불필요)
- 미리 최적화 (premature optimization)
- 현재 단계와 무관한 기능 제안

---

## 6. 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정, 패키지 설치 등
```

예시:

```
feat: 로그인 페이지 UI 구현
fix: 수식 렌더링 오류 수정
docs: README 업데이트
```

---

## 7. 개발 워크플로우

### 7.1 기능 구현 순서

1. **UI 먼저**: 하드코딩된 데이터로 화면 구현
2. **타입 정의**: 필요한 데이터 타입 정의
3. **데이터 연결**: 실제 데이터 연결
4. **상태 관리**: 필요시 상태 관리 추가
5. **에러 처리**: 에러 상태 처리
6. **로딩 상태**: 로딩 UI 추가

### 7.2 파일 생성 순서

1. 타입 정의 (lib/types.ts)
2. 컴포넌트 생성 (components/)
3. 페이지에서 조합 (app/)
4. 필요시 훅 분리 (hooks/)

---

## 8. 현재 진행 상황

### 8.1 완료된 작업

- [x] 프로젝트 초기 설정 (Next.js 15 + TypeScript)
- [x] Tailwind CSS 설정
- [x] 기본 폴더 구조 생성
- [x] Vercel 스킬 설치 (vercel-react-best-practices, web-design-guidelines)

### 8.2 다음 작업 (순서대로)

- [ ] 패키지 설치 (Supabase, Zod, TanStack Query)
- [ ] Supabase 프로젝트 설정
- [ ] 환경 변수 설정
- [ ] Vercel 연결
- [ ] 로그인 페이지 구현
- [ ] 해설 컴포넌트 구현
- [ ] MDX 설정

---

## 9. 참고 자료

### 9.1 공식 문서

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TanStack Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com/docs

### 9.2 프로젝트 노션

- 전체 컨텍스트: https://www.notion.so/2f033b9842a18120b723d2a3eae39540

## 10. Skills 적용 규칙 (필수)

### 10.1 우선순위

규칙이 충돌할 경우 우선순위는 다음과 같습니다.

1. 이 CLAUDE.md
2. .agents/skills/vercel-react-best-practices
3. .agents/skills/web-design-guidelines
4. 일반적인 웹 개발 관행

### 10.2 작업 전 절차 (⭐⭐⭐ 절대 건너뛰지 말 것!)

#### React/Next.js 컴포넌트 작성 시

**반드시 다음 순서대로:**

1. **Skills 문서 읽기**
   Read: .agents/skills/vercel-react-best-practices/AGENTS.md

2. **적용할 규칙 선택** (작업 타입별)

**서버 컴포넌트 작성 시:**

- `async-parallel`: Promise.all로 병렬 처리
- `server-cache-react`: React.cache로 중복 제거
- `server-serialization`: 클라이언트로 보내는 데이터 최소화

**클라이언트 컴포넌트 작성 시:**

- `rerender-memo`: 비싼 연산은 메모이제이션
- `rendering-conditional-render`: && 대신 삼항 연산자
- `rerender-lazy-state-init`: useState에 함수 전달

**번들 크기 신경 쓰는 작업:**

- `bundle-barrel-imports`: 직접 import
- `bundle-dynamic-imports`: next/dynamic 사용

3. **사용자에게 요약 제시**
   "이번 작업에 적용할 규칙:
   async-parallel: 데이터 페칭 병렬 처리
   rendering-conditional-render: 조건부 렌더링 삼항 연산자 사용
   rerender-memo: 비싼 컴포넌트 메모이제이션"

4. **규칙 따라 코드 작성**

#### UI 리뷰 요청 시

사용자가 "UI 리뷰해줘" 또는 "디자인 체크해줘" 요청 시:
Skill("web-design-guidelines")

### 10.3 예외 사항

다음 경우에만 skills 확인 생략 가능:

- 간단한 설정 파일 수정 (tsconfig.json 등)
- 문서 작성 (README, devlog 등)
- 타입 정의만 하는 경우

**컴포넌트, 페이지, API 작성 시에는 반드시 확인!**

### 10.4 체크리스트 (작업 시작 전)

- [ ] React/Next.js 코드 작성하는가? → Skills 확인
- [ ] 서버/클라이언트 컴포넌트? → 관련 규칙 확인
- [ ] 데이터 페칭하는가? → async 규칙 확인
- [ ] 상태 관리하는가? → rerender 규칙 확인
- [ ] 새 패키지 import하는가? → bundle 규칙 확인

## 11. Git 워크플로우

### 작업 시작 전

1. 이번 작업 내용 설명
2. 브랜치 생성 여부 확인
3. 작업 계획 공유 후 시작

### 브랜치 생성 기준

- 새 기능: feature/기능명
- 버그 수정: fix/버그명
- 작은 수정: main에서 직접 (MVP 단계)

## 12. 테스트 전략

### MVP 단계

- E2E 테스트만 (Playwright)
- 핵심 흐름 1~2개

### 테스트 대상

1. 회원가입 → 로그인
2. 로그인 → 해설 보기

## 13. devlog 작성 규칙

### 13.1 폴더 구조

devlog/ 2026-01/ 27.md 28.md 2026-02/ 01.md

### 13.2 작성 시점

매일 작업 종료 시: "오늘 작업 devlog에 정리해줘"

### 13.3 devlog 포맷 (개발 중심)

## 작업 요약

[오늘 한 작업을 1-2줄로]

## 변경된 파일

- `파일경로`: 변경 내용

## 기술적 결정 사항

### 1. 결정 제목

**결정**: 무엇을 선택했는가
**이유**: 왜 이렇게 했는가  
**트레이드오프**: 장단점

**코드 예시**:
`코드`

## 발생한 이슈

### 이슈 1: 제목

**증상**: 무슨 일이?
**원인**: 왜?
**해결**: 어떻게?
**교훈**: 다음엔?

## 다음 작업

구체적인 TODO 우선순위별로

## 참고 링크

관련 문서들

## 커밋 정보

- 브랜치, 메시지, 파일 수

## 작업 시간

HH:MM - HH:MM

### 13.4 포함할 것 ✅

- 기술적 결정과 이유
- 이슈와 해결 과정
- 트레이드오프
- 다음 작업 계획
- 참고 자료
- 커밋 정보

### 13.5 포함하지 않을 것 ❌

- 면접 질문/답변 (따로 요청)
- 학습 내용/개념 설명 (따로 요청)
- 연습 숙제 (따로 요청)

### 13.6 학습/면접은 별도 요청

"오늘 배운 핵심 패턴 알려줘"
"면접 질문 만들어줘"
"연습 코드 만들어줘"

### 13.7 새 채팅 시작 시

"Scaff 프로젝트 계속합니다.

- CLAUDE.md 확인
- devlog/ 하위 폴더 md파일 확인
- 다음: [작업]"

---

_이 파일은 프로젝트 진행에 따라 업데이트됩니다._
_최종 업데이트: 2026-01-29_
