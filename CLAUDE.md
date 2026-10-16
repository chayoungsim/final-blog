# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 목적

React 학습 과정(SECTION19)의 **블로그/게시글 서비스 프론트엔드**. 별도의 백엔드 REST API(`VITE_API_URL`)와 통신하는 SPA이며, 이 저장소에는 백엔드 코드가 없다.

주요 기능:
- 카카오 OAuth 로그인 + 이메일 회원가입/로그인 (JWT access token + refresh)
- 게시글 목록(정렬·카테고리·검색·페이지네이션), 상세, 작성, 수정, 삭제
- 댓글 작성/삭제, 홈 화면 개요(최신/인기/랜덤 게시글)

> `README.md`는 Vite 템플릿 기본 문서이므로 참고할 내용이 없다. `package.json`의 name(`context-user_settings`)도 템플릿 잔재다.

## 명령어

```bash
npm run dev       # Vite 개발 서버
npm run build     # tsc -b && vite build (타입 체크 포함)
npm run lint      # eslint .
npm run preview   # 빌드 결과 미리보기
```

- 테스트 러너는 설정되어 있지 않다.
- 환경변수: `.env`의 `VITE_API_URL`(백엔드 주소). `.env`, `atlas-credentials.env`에는 민감 정보가 있을 수 있으니 내용을 출력/커밋하지 말 것.
- 배포: Vercel. `vercel.json`은 모든 경로를 `/index.html`로 rewrite(SPA 라우팅용).

## 기술 스택

React 19 + TypeScript(strict) + Vite 6 + React Router 7(Data Router) + Zustand 5(+immer, devtools) + Axios + Tailwind CSS 4(`@tailwindcss/vite`) + lucide-react + date-fns.

- 스타일은 SCSS가 아니라 **Tailwind 유틸리티 클래스**를 JSX에 직접 작성한다(`src/css/index.css`가 `tailwind.css`를 import). 전체적으로 다크 테마(`bg-slate-900`, `bg-slate-800`).
- ESLint: `@typescript-eslint/no-unused-vars`, `no-explicit-any`는 꺼져 있고, `noUnusedLocals/Parameters`도 비활성이다.

## 아키텍처

### 구조 (`src/`)
```
main.tsx                  # 진입점, <Route /> 렌더
routes/index.tsx          # createBrowserRouter 정의 (라우트 + loader 연결의 단일 지점)
routes/layouts/Default    # Header/Outlet/Footer 공통 레이아웃
routes/loader/*.ts        # 라우트 loader (auth.loader, post.loader)
routes/pages/**           # 페이지 컴포넌트 (Home, Posts, PostRead, PostCreate, auth/*)
components/{common,post,comment}  # 재사용 컴포넌트
api/axios.ts              # axiosInstance (인터셉터 포함)
store/authStore.ts        # 로그인 사용자 상태
types/post.d.ts           # 전역 타입 (Post, Comment, Author, Pagination)
```

### 데이터 로딩: React Router loader 중심
- 모든 라우트는 `Default` 레이아웃의 children이다. 레이아웃 loader `fetchuserData`가 앱 시작 시 `/auth/me`로 사용자 정보를 복원해 store에 넣는다.
- 페이지 데이터는 `useEffect`가 아니라 **loader에서 가져오고 컴포넌트는 `useLoaderData()`로 읽는다.** 새 페이지는 loader를 `routes/loader/`에 만들고 `routes/index.tsx`에 연결한다.
- `Posts` loader는 URL 쿼리(`sort`, `category`, `page`, `search`)를 그대로 백엔드 `/posts?...`에 전달한다. 즉 필터/페이지 상태의 원천은 URL이다.
- loader는 실패 시 throw하지 않고 **빈 기본값/`null`을 반환**하는 패턴이다(예: `fetchOverview`는 `{latestPosts: [], popularPosts: [], randomPost: null}`). 컴포넌트가 빈 값 처리(`PostZero`, `PostMainZero` 등)를 한다. `fetchPostModify`/`fetchPosts`는 catch에서 아무것도 반환하지 않으므로(undefined) 주의.
- 접근 제어도 loader에서 한다: `requireAuth`(미로그인 → `/auth/login`), `redirectIfAuth`(로그인 상태 → `/`). 둘 다 `sessionStorage`의 `access_token` 존재 여부만 확인한다.
- `PostCreate` 컴포넌트는 `/create-post`(작성)와 `/edit/:id`(수정)에서 **공용**으로 쓰인다. loader 데이터(`post`) 유무로 모드를 구분하고 수정 시 `PUT /posts/:id`, 작성 시 `POST /posts`를 호출한다.

### 인증 흐름 (여러 파일에 걸침)
1. **토큰 저장**: access token은 `sessionStorage["access_token"]`, refresh는 `withCredentials: true`로 쿠키에 의존.
2. **`api/axios.ts`**: 요청 인터셉터가 `Authorization: Bearer`를 붙인다. 응답 인터셉터는 401 시 `POST /auth/refresh` → 새 토큰 저장 → 원 요청 재시도, 실패 시 토큰 삭제 + `/auth/logout` 호출. 재시도 중복 방지는 모듈 전역 `retry` 플래그 하나로 처리한다(동시 401이 여러 건이면 한계가 있음).
3. **카카오 로그인**: 백엔드가 `/auth/callback/kakao?access_token=...&email=Y|N`으로 리다이렉트 → `Kakao.tsx`가 토큰 저장 후 `/auth/me` 호출. `email=N`이면 이메일 입력 폼을 보여주고 `PATCH /auth/update-email`. `/auth/me` 조회가 실패하면 토큰을 지우고 `/auth/login`으로 이동한다.
4. **이메일 로그인/가입**: `EmailLogin.tsx`(`POST /auth/login`), `Signup.tsx`(`POST /auth/signup`).
5. **상태**: `authStore`(`isLogin`, `user`, `setUserData`, `logout`). 로그아웃은 `POST /auth/logout` 후 store 초기화 + 토큰 삭제.

### 사용하는 백엔드 엔드포인트
`/auth/{me,login,signup,refresh,logout,update-email}`, `/posts`(목록·생성), `/posts/overview`, `/posts/:id`(조회·수정·삭제), `/posts/:id/comments`, `/posts/:id/comments/:commentId`.

### 타입
`Post`, `Comment`, `Author`, `Pagination`은 `types/post.d.ts`의 **전역 선언**이다(import 없이 사용). 백엔드는 MongoDB로 보이며 id 필드는 `_id`이다. `authStore`의 `User`는 `id`를 쓰므로 `_id` ↔ `id` 매핑에 주의(`Kakao.tsx` 참고).

## 구현 패턴 (코드에서 발견한 규칙)

### 컴포넌트
- 모두 **함수 선언 + `export default`** (화살표 컴포넌트, named export 없음). props는 파라미터에서 바로 구조분해하고 타입은 인라인(`}: { ... }`) 또는 같은 파일의 `type XxxProps`로 선언한다. 기본값은 구조분해 단계에서 지정(`posts = []`, `size = "large"`).
- 전역 타입(`Post` 등)을 props에 바로 쓰고 `{...post}`로 펼쳐 넘기는 방식이 많다(`PostCard`). 단, `FeaturedPost`는 `post={post}`로 받는다.
- 구성: `routes/pages`(loader 데이터 + 조합) → `components/{post,comment,common}`(표현 위주). 빈 상태는 별도 `*Zero` 컴포넌트, 로딩은 `*Loading`, 에러는 `ErrorState`.
- 폼은 제어 컴포넌트(`useState` + `value/onChange`). 제출은 React 19 방식인 `<form action={fn}>`(EmailLogin, Kakao, CommentForm)이 주류다. 낙관적 UI는 `useOptimistic`(+`startTransition`), 비동기 제출 pending은 `useTransition`.
- 문서 제목은 컴포넌트 안에 `<title>`을 직접 렌더한다(React 19 metadata; Posts, PostRead, PostCreate).
- 스타일: Tailwind 클래스를 JSX에 인라인, 조건부는 템플릿 리터럴. 공통 색상은 `bg-slate-800`(카드), `bg-blue-500`(주 버튼), `bg-red-500`(삭제), `rounded-lg`. 페이지 래퍼는 `max-w-7xl mx-auto px-4 md:px-8 py-8`. 아이콘은 `lucide-react`, 날짜는 `format(new Date(x), "yyyy-MM-dd HH:mm")`(date-fns).

### 상태관리
- **서버 데이터**: loader → `useLoaderData()` (전역 스토어에 넣지 않음). 갱신은 `useRevalidator().revalidate()`(로그아웃 시) 또는 `navigate`로 loader 재실행.
- **전역 클라이언트 상태**: Zustand는 `authStore` 하나뿐. `create<T>()(devtools(immer(...)))` 구성이며, 컴포넌트에서는 항상 **셀렉터**로 구독(`useAuthStore((s) => s.user)`), loader 등 React 밖에서는 `useAuthStore.getState()`.
- **URL 상태**: 정렬/카테고리/페이지/검색은 `useSearchParams`가 원천(`new URLSearchParams(searchParams)` 복사 후 `set` → `setSearchParams`).
- **로컬 상태**: 폼 값, 모달 표시(`showDeleteConfirm`), 메뉴 토글은 컴포넌트 `useState`. 댓글 목록은 loader 데이터를 `useState`로 복사해 로컬에서 갱신한다.

### API 호출
- 서비스 레이어 없이 **`axiosInstance`를 loader/컴포넌트에서 직접 호출**한다. 경로는 상대 경로(`/posts/...`)이고 baseURL은 인스턴스가 처리한다.
- 읽기는 loader, 쓰기(생성·수정·삭제·댓글)는 이벤트 핸들러 안에서 `try/catch`로 호출한다. 쓰기 성공 후에는 `navigate(...)` 또는 로컬 state 갱신.
- 응답 해석: `const { data } = await ...`, 상태 코드는 `status === 200/201`로 분기하기도 한다.
- 외부 이미지 업로드(Cloudinary)만 예외로 **일반 `axios`**를 직접 사용한다(`PostCreate`). 인증 헤더가 붙으면 안 되므로 `axiosInstance`를 쓰지 말 것.
- 에러 판별은 `axios.isAxiosError(e)` 후 `e.response?.data?.error`를 우선 사용(Kakao).

### 네이밍
- 파일: 컴포넌트/페이지는 PascalCase(`PostCard.tsx`), loader는 `도메인.loader.ts`, 스토어는 `xxxStore.ts`, 전역 타입은 `*.d.ts`.
- 이벤트 핸들러: `handleXxx`(`handleSearch`, `handlePageChange`), prop으로 내려가는 콜백은 `onXxx`(`onPageChange`) 또는 동사형(`deleteComment`).
- loader: `fetchXxx`(데이터) / `requireAuth`, `redirectIfAuth`(가드). 불리언은 `isXxx`/`showXxx`. 빈 상태 컴포넌트는 `*Zero`.

## 일관성 없는 부분과 신규 작업 기준

**원칙**: 기존 코드는 일관성 목적만으로 수정하지 않는다. 신규 코드는 아래 "신규 기준"을 따르고, 어차피 수정하는 파일에서만 해당 부분을 함께 맞춘다. (2, 6번 기준은 제안 단계로 미확정)

1. **폼 제출 방식 혼재** — `action={fn}`(EmailLogin, Kakao, CommentForm) / `useActionState`(Signup) / `onSubmit`+`preventDefault`(PostCreate). **신규 기준**: 현상 유지, 3가지 모두 허용. 수정하는 파일 또는 인접 파일의 패턴을 따른다.
2. **에러 처리 혼재** — `alert(e.message)`(PostRead, CommentForm) / `setError` 화면 표시(EmailLogin) / `console.error`+한글 `alert`(PostCreate) / loader는 조용히 삼킴. 문구 오타(`unknow error` vs `unknown error`, "must e at least"). **신규 기준**: 폼은 화면 인라인 에러(`role="alert"`), 문구는 `unknown error`.
3. **`_id` ↔ `id` 변환 중복** — 서버 응답 → `User` 매핑을 `EmailLogin`, `Kakao`에서 각각 작성. 비교는 `author._id === user?.id`. **신규 기준**: 매핑을 새로 복붙하지 말고 헬퍼로 분리.
4. **토큰 접근 산재** — `sessionStorage` `"access_token"`이 axios, loader, Kakao, EmailLogin, store에 흩어져 있고 키 상수가 없다. `logout`은 `immer set` 안에서 `sessionStorage`를 건드리고 타입은 `() => void`인데 실제로는 async. `isLogin`은 `user`와 중복. **신규 기준**: 키 문자열을 새로 쓰지 말고, 접근이 필요하면 헬퍼 도입을 먼저 제안.
5. **loader 실패 반환값 불일치** — `fetchOverview`는 빈 기본값, `fetchPostsDetail`은 `{post: null,...}`, `fetchPosts`/`fetchPostModify`는 undefined. 이름도 `fetchuserData`(소문자 u) 등 불규칙. **신규 기준**: throw하지 않고 빈 기본값 반환(`fetchOverview` 방식).
6. **다크 모드 스타일 혼재** — 대부분 `bg-slate-800` 하드코딩인데 `Pagination`, `Posts`, `AuthProfile`, `ErrorState`만 `dark:` 변형을 써서, 다크 토글이 없어 OS 설정에 따라 이 컴포넌트들만 밝게 보일 수 있다. **신규 기준**: 앱이 다크 고정이므로 `dark:` 없이 slate 색을 직접 사용.
7. **중복 상수/로직** — 카테고리 목록이 `Posts.tsx`와 `PostCreate.tsx`에 각각 있고, 날짜 포맷·Cloudinary 주소/preset이 하드코딩. `Header` 검색어는 `encodeURIComponent` 없이 URL에 붙임. **신규 기준**: 상수는 한 곳에 정의, 쿼리 값은 `encodeURIComponent`.
8. **네이밍** — `CommentComponent`만 `Component` 접미사, 삭제 핸들러는 `deletePost`/`deleteComment`(handle 없음), 루트 컴포넌트명 `Route`(react-router와 혼동), 파일 `NotFound.tsx` ↔ 컴포넌트 `NotFoundPage`. **신규 기준**: 핸들러 `handleXxx`, `Component` 접미사 금지, 파일명=컴포넌트명.
9. **들여쓰기/포맷** — 대부분 2칸이지만 `Pagination.tsx`는 4칸. 세미콜론·따옴표·공백이 파일마다 다르고 import는 `../../../../` 상대 경로(alias 없음). **신규 기준**: 2칸, 수정 파일의 기존 스타일 유지.
10. **접근성 누락** — `alt` 없음/고정 문구(`PostCard`), 삭제 모달 `role="dialog"`·포커스 관리 없음, 아이콘 버튼 `aria-label` 없음, `Pagination`/`Header` 버튼 `type`·`aria-current` 없음. **신규 기준**: 위 항목을 신규 코드에서는 필수로 지킨다.

**알려진 이슈(미수정)**: `Signup.tsx`는 `status === 201`에서 `navigate`한 뒤에도 `return {error: "Signup failed"}`로 떨어져 성공 후 에러 상태를 반환한다.

## 컨벤션 / 작업 규칙

- 코드 주석·커밋 메시지·문서는 한국어, 변수/함수명은 영어. 들여쓰기 2칸, 컴포넌트는 PascalCase, 그 외 camelCase.
- 컴포넌트는 분리·재사용하고, 반응형과 접근성(시맨틱 마크업, label, aria)을 지킨다.
- 브랜치명은 `feature/기능명`, `fix/버그명`. 커밋은 작은 단위로 나눈다.
- 파일 수정 전 변경 계획을 먼저 제시하고, 한 번에 너무 많은 파일을 수정하지 않는다.
- 현재 코드 스타일은 일관되지 않다(세미콜론, 공백, 따옴표 혼재). 수정하는 파일의 기존 스타일을 따른다.
