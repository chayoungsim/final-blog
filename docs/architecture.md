# 아키텍처 다이어그램

GitHub에서 열면 Mermaid가 자동으로 렌더링된다. VS Code에서는 Markdown Preview Mermaid Support 확장이 필요하다.
코드가 바뀌면 `CLAUDE.md`의 아키텍처 설명과 함께 갱신한다.

## 1. 라우트와 loader 구조

모든 라우트는 `Default` 레이아웃의 children이며, 레이아웃 loader가 앱 시작 시 사용자 정보를 복원한다.
가드 loader(`requireAuth`, `redirectIfAuth`)는 `sessionStorage`의 `access_token` 유무만 확인한다.

```mermaid
flowchart LR
  R["createBrowserRouter<br/>routes/index.tsx"] --> D["Default 레이아웃<br/>Header · Outlet · Footer"]
  D -. "loader" .-> U["fetchuserData<br/>GET /auth/me 로 user 복원"]
  U --> S[("authStore<br/>Zustand")]

  D --> H["/ · Home"]
  D --> PL["/posts · Posts"]
  D --> PR["/post/:id · PostRead"]
  D --> PC["/create-post · PostCreate"]
  D --> PE["/edit/:id · PostCreate"]
  D --> L["/auth/login · Login"]
  D --> EL["/auth/email-login · EmailLogin"]
  D --> SU["/auth/signup · Signup"]
  D --> K["/auth/callback/kakao · Kakao"]
  D --> NF["* · NotFound"]

  H -. "loader" .-> fo["fetchOverview"]
  PL -. "loader" .-> fp["fetchPosts"]
  PR -. "loader" .-> fd["fetchPostsDetail"]
  PE -. "loader" .-> fm["fetchPostModify"]
  PC -. "loader" .-> ra["requireAuth"]
  PE -. "내부 호출" .-> ra
  L -. "loader" .-> ria["redirectIfAuth"]
  EL -. "loader" .-> ria
  SU -. "loader" .-> ria
  K -. "loader" .-> ria

  ra -- "토큰 없음" --> L
  ria -- "토큰 있음" --> H
```

## 2. 인증 흐름

### 2-1. 카카오 로그인

```mermaid
sequenceDiagram
  actor User as 사용자
  participant Login as Login.tsx
  participant API as 백엔드 API
  participant Kakao as Kakao.tsx
  participant Store as authStore

  User->>Login: 카카오 로그인 클릭
  Login->>API: window.location.href = /auth/kakao
  API-->>Kakao: 리다이렉트 /auth/callback/kakao?access_token=...&email=Y|N
  alt email=N
    Kakao->>User: 이메일 입력 폼 표시
    User->>Kakao: 이메일 제출
    Kakao->>API: PATCH /auth/update-email
    API-->>Kakao: user
    Kakao->>Store: setUserData(user)
    Kakao->>User: 홈(/)으로 이동
  else email=Y
    Kakao->>Kakao: sessionStorage에 access_token 저장
    Kakao->>API: GET /auth/me
    alt 성공
      API-->>Kakao: user
      Kakao->>Store: setUserData(user)
      Kakao->>User: 홈(/)으로 이동
    else 실패
      Kakao->>Kakao: access_token 삭제
      Kakao->>User: /auth/login 으로 이동
    end
  end
```

### 2-2. 토큰 자동 갱신 (axios 인터셉터)

401 응답 시 한 번만 refresh를 시도한다. 중복 방지는 모듈 전역 `retry` 플래그 하나로 처리한다.

```mermaid
sequenceDiagram
  participant C as 컴포넌트 · loader
  participant AX as axiosInstance
  participant API as 백엔드 API

  C->>AX: 요청
  AX->>AX: 요청 인터셉터: Authorization Bearer 부착
  AX->>API: 요청
  API-->>AX: 401
  alt retry=false
    AX->>AX: retry = true
    AX->>API: POST /auth/refresh (쿠키)
    alt refresh 성공
      API-->>AX: accessToken
      AX->>AX: 토큰 저장 · retry = false
      AX->>API: 원래 요청 재시도
      API-->>C: 응답
    else refresh 실패
      AX->>AX: retry = false · 토큰 삭제
      AX->>API: POST /auth/logout (실패해도 무시)
      AX-->>C: 에러 reject
    end
  else 401 외 에러 또는 retry=true
    AX-->>C: 에러 reject
  end
```

### 2-3. 이메일 로그인 / 로그아웃

```mermaid
flowchart LR
  subgraph login["이메일 로그인"]
    A["EmailLogin.tsx"] -- "POST /auth/login" --> B["accessToken · user"]
    B --> C["sessionStorage 저장"]
    B --> D["setUserData"]
    D --> E["홈(/)으로 이동"]
  end
  subgraph logout["로그아웃"]
    F["AuthProfile · Sign out"] -- "POST /auth/logout" --> G["store 초기화 · 토큰 삭제"]
    G --> H["revalidate 로 loader 재실행"]
  end
```

## 3. 게시글 데이터 흐름

필터·정렬·페이지·검색의 원천은 URL 쿼리다. 컴포넌트는 `useLoaderData()`로 읽기만 한다.

```mermaid
flowchart TD
  U["URL 쿼리<br/>sort · category · page · search"] --> LD["fetchPosts loader"]
  LD -- "GET /posts?..." --> API[("백엔드 API")]
  API --> LD
  LD -- "useLoaderData()" --> P["Posts 페이지"]
  P --> G["PostCard 목록"]
  P --> PG["Pagination"]
  P --> Z["PostZero<br/>결과 없음"]

  P -- "정렬 · 카테고리 · 페이지 변경<br/>setSearchParams" --> U
  HD["Header 검색"] -- "navigate /posts?search=" --> U
```

### 게시글 상세와 쓰기 동작

```mermaid
flowchart TD
  FD["fetchPostsDetail loader"] -- "GET /posts/:id<br/>GET /posts?category=..&limit=3" --> API[("백엔드 API")]
  FD -- "post · relatedPosts" --> PR["PostRead"]
  PR --> CF["CommentForm"]
  PR --> CC["CommentComponent"]
  PR --> PGD["PostGrid · 관련 글"]

  CF -- "POST /posts/:id/comments<br/>useOptimistic 으로 먼저 표시" --> API
  CC -- "DELETE /posts/:id/comments/:commentId" --> API
  PR -- "삭제 DELETE /posts/:id" --> API
  PR -- "수정 버튼 navigate /edit/:id" --> PE["PostCreate 수정 모드"]

  PC["PostCreate"] -- "이미지 업로드<br/>일반 axios · Cloudinary" --> CL[("Cloudinary")]
  PC -- "작성 POST /posts<br/>수정 PUT /posts/:id" --> API
```

## 4. 계층 구조 요약

```mermaid
flowchart TB
  subgraph ui["UI"]
    pages["routes/pages"]
    comps["components/{common, post, comment}"]
  end
  subgraph data["데이터"]
    loaders["routes/loader"]
    store["store/authStore"]
    ax["api/axios · axiosInstance"]
  end
  types["types/post.d.ts<br/>전역 타입"]

  pages --> comps
  pages -- "useLoaderData" --> loaders
  pages --> store
  comps --> store
  loaders --> ax
  loaders --> store
  pages --> ax
  comps --> ax
  store --> ax
  pages -.-> types
  comps -.-> types
```
