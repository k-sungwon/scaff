# CLAUDE.md — Scaff 프로젝트 지침

> 핵심 규칙만 담는다. 길어지면 실패한 것이다.

---

## 1. 프로젝트 개요

- **Scaff**: 수능 기출 킬러문제 해설 서비스 (사고 회로 중심)
- **목표**: 2025 수능 킬러 5문제 해설 + 로그인 + RAG 기반 AI 질의응답
- **배포**: Vercel
- **노션 컨텍스트**: https://www.notion.so/2f033b9842a18120b723d2a3eae39540

---

## 2. 기술 스택

| 영역       | 스택                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 프레임워크 | Next.js 15 (App Router)                                               |
| 언어       | TypeScript (strict)                                                   |
| UI         | React 19 + Tailwind CSS 4                                             |
| 콘텐츠     | MDX + KaTeX                                                           |
| 상태관리   | TanStack Query (서버) / useReducer (로컬 복합) / useState (로컬 단순) |
| 인증/DB    | Supabase (Auth, PostgreSQL, Storage)                                  |
| Vector DB  | Supabase pgvector                                                     |
| RAG        | LangChain.js                                                          |
| LLM        | Gemini 1.5 Flash                                                      |
| 임베딩     | OpenAI text-embedding-3-small                                         |
| 검증       | Zod                                                                   |
| E2E        | Playwright                                                            |

---

## 3. 명령어

```bash
npm run dev          # 로컬 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npx playwright test  # E2E 테스트
```

---

## 4. 환경변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

---

## 5. 폴더 구조

```
app/
  (auth)/login, signup
  (main)/problems/[subject]/[year]/[id]
  api/chat/, api/auth/
  layout.tsx, page.tsx

features/              ← 기능 단위 (독립적 레고 블록)
  clue-reveal/
    components/        ← 이 기능 전용 UI
    hooks/             ← 이 기능 전용 훅
    types.ts
    index.ts           ← public API (외부는 이것만 import)
  step-navigation/
  ai-chat/

components/            ← 공유 UI (2개 이상 feature에서 쓰는 것만)
  ui/                  ← Button, Input, Modal (도메인 무관)
  layout/              ← Header, Footer, Sidebar

services/              ← 비즈니스 로직
  chat/chat.service.ts
  llm/gemini.provider.ts
  embedding/embedding.service.ts

lib/
  supabase/client.ts, server.ts
  langchain/config.ts, prompts.ts, chains/

content/problems/math/2025/21.mdx

types/                 ← 공유 타입 (Problem, User 등)
```

### 규칙

- **feature 폴더는 독립적**: feature끼리 서로 import 금지. 공유 필요하면 `components/`나 `types/`로 올린다.
- **index.ts = public API**: feature 외부에서는 `index.ts`를 통해서만 접근.
- **components/ui/에 올리는 기준**: 2개 이상 feature에서 쓰일 때. 1개 feature 전용이면 그 feature 안에 둔다.
- 폴더가 비대해지면 그때 쪼갠다. 미리 쪼개지 않는다.

### 의존성 방향 (한 방향만)

```
app/ → features/ → components/, services/, lib/, types/
                    services/ → lib/
```

역방향 금지. `services/`가 `features/`를 import하면 안 된다.

---

## 6. 코드 작성 패턴

### 컴포넌트 패턴

```
1개 컴포넌트 = 1가지 책임.
- 데이터 fetch → 서버 컴포넌트 (async)
- 상호작용 → 클라이언트 컴포넌트 ('use client')
- 둘 다 필요 → 서버가 fetch, 클라이언트에 props로 전달
```

**서버 컴포넌트 (기본값)**: DB 조회, MDX 컴파일, 환경변수 접근. 병렬 fetch는 `Promise.all`.
**클라이언트 컴포넌트**: `useState`, `useReducer`, 이벤트 핸들러, 브라우저 API.
**컴포넌트 크기 기준**: JSX가 80줄 넘으면 쪼갠다.

### 상태관리 패턴

```
서버 데이터            → TanStack Query (캐시, 리페칭, 로딩/에러)
로컬 단순 (1~2개 독립) → useState
로컬 복합 (3개+ 또는 의존적) → useReducer + 커스텀 훅으로 감싸기
```

**useReducer 기준**: 상태가 서로 의존적이거나, 상태 전환 로직이 있을 때.

```typescript
// ✅ useReducer: 단서 열기 → 설명 로딩 → 설명 표시 (상태 의존)
type State = {
  isOpen: boolean;
  isLoading: boolean;
  explanation: string | null;
};
type Action =
  | { type: "OPEN" }
  | { type: "LOADED"; payload: string }
  | { type: "CLOSE" };

// ✅ useState: 독립적 토글
const [isOpen, setIsOpen] = useState(false);
```

### 커스텀 훅 패턴

```
UI 로직이 10줄 넘으면 커스텀 훅으로 추출.
훅 이름: use + 동사/명사 (useClueReveal, useExplanation)
리턴: { state, handlers } 형태
```

```typescript
// features/clue-reveal/hooks/useClueReveal.ts
export function useClueReveal(clueId: string) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const open = () => dispatch({ type: "OPEN" });
  const close = () => dispatch({ type: "CLOSE" });
  return { state, open, close };
}
```

### API Route 패턴

```typescript
// 이 순서를 따른다: 인증 → 검증 → Service 호출 → 응답
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = RequestSchema.parse(await request.json());
  const result = await chatService.answer(body);
  return NextResponse.json(result);
}
// ❌ 여기서 직접 DB 접근 금지. 반드시 Service를 거친다.
```

### Service 패턴

```typescript
class ChatService {
  // Public: API Route가 호출
  async answer(input: AnswerInput): Promise<AnswerOutput> { ... }
  // Private: 내부 단계별 로직
  private async createEmbedding(text: string): Promise<number[]> { ... }
  private async searchSimilar(embedding: number[]): Promise<Context[]> { ... }
}
// Public/Private 구분 필수.
```

### LangChain 패턴

```typescript
// lib/langchain/chains/ragChain.ts — 체인은 함수로 분리
export function createRAGChain(llm: BaseChatModel) {
  return RunnableSequence.from([
    PromptTemplate.fromTemplate(RAG_PROMPT),
    llm,
    new StringOutputParser(),
  ]);
}
// ❌ 인라인 체인 금지.
```

### 에러 처리 패턴

- Zod parse 실패 → 400 + 구체적 메시지
- 인증 실패 → 401
- Service 에러 → try/catch + 로깅 + 500
- 클라이언트: TanStack Query의 isError + error boundary

---

## 7. 코드 스타일

- **Zod 스키마 먼저** → `z.infer<>` 타입 추론. 수동 타입 중복 금지.
- 함수 파라미터, 리턴 타입 명시.
- `any` 금지. `as` 최소화 (불가피하면 주석).
- 조건부 렌더링: `&&` 대신 삼항 연산자.
- 인라인 스타일 금지. Tailwind만.
- key prop에 index 금지.

### 네이밍

```
컴포넌트: PascalCase.tsx  |  훅: use*.ts  |  유틸: camelCase.ts
함수/변수: camelCase  |  상수: UPPER_SNAKE  |  타입: PascalCase
```

---

## 8. 코드 작성 프로세스 (⭐ Claude Code 필수)

모든 컴포넌트, 훅, Service, API Route 작성 시:

1. **1차 작성** → 요구사항대로 코드 작성
2. **자체 리뷰** → 아래 체크리스트 검토
3. **개선 후 출력** → 문제 있으면 수정하고 최종 코드만 보여주기

### 자체 리뷰 체크리스트

- 1컴포넌트 1책임인가?
- 상태관리 선택이 맞는가? (TanStack Query / useReducer / useState)
- feature 간 import 없는가?
- 서버/클라이언트 구분 맞는가?
- Zod 검증 있는가? (외부 입력)
- 에러 처리 있는가?
- 80줄 넘는 컴포넌트 없는가?

**왜 이렇게 했는지 한 줄 설명은 항상 붙인다.**

---

## 9. 금지사항

- ❌ `any` / `var` / 인라인 스타일 / `key={index}`
- ❌ API Route에서 직접 DB 접근
- ❌ LangChain 체인 인라인 작성
- ❌ feature 간 직접 import
- ❌ 설명 없이 코드만 던지기
- ❌ 현재 필요 없는 기능 미리 구현 (YAGNI)

---

## 10. Git

```
feat: 새 기능  |  fix: 버그  |  docs: 문서  |  refactor: 리팩토링  |  chore: 설정
```

---

## 11. 현재 상태

> 작업 진행에 따라 업데이트.

- [ ] 프로젝트 초기 세팅
- [ ] MDX 렌더링 + KaTeX 수식
- [ ] Supabase Auth
- [ ] 킬러 5문제 해설 페이지
- [ ] RAG 질의응답
- [ ] Vercel 배포

---

## 12. 새 채팅 시작 시

```
Scaff 프로젝트 계속합니다.
- CLAUDE.md 확인
- devlog/ 최근 파일 확인
- 다음 작업: [내용]
```
