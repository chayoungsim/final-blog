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

## 5. 컴포넌트 의존성

### 5-1. 컴포넌트 포함 관계 (import 기준)

화살표는 "import해서 렌더링한다"는 뜻이다. `routes/index.tsx`는 `FullLoading`(로딩)과 `ErrorState`(에러)를 라우터 옵션으로 연결한다.
`PostGrid`는 `Home`, `PostRead`에서 공유되고, `Posts`는 `PostGrid` 없이 `PostCard`를 직접 사용한다.

```mermaid
flowchart TB
  subgraph pages["routes/pages · layouts"]
    Default["Default 레이아웃"]
    Home
    Posts
    PostRead
    Kakao
  end

  subgraph common["components/common"]
    Header
    Footer
    AuthProfile
    AdBanner
    Redirection
    FullLoading
    ErrorState
  end

  subgraph post["components/post"]
    FeaturedPost
    PostGrid
    PostCard
    PostMainZero
    PostZero
    Pagination
  end

  subgraph comment["components/comment"]
    CommentForm
    CommentComponent
  end

  Router["routes/index.tsx"] -- "HydrateFallback" --> FullLoading
  Router -- "errorElement" --> ErrorState

  Default --> Header
  Default --> Footer
  Header --> AuthProfile

  Home --> FeaturedPost
  Home --> PostGrid
  Home --> AdBanner
  PostGrid --> PostCard
  PostGrid --> PostMainZero

  Posts --> PostCard
  Posts --> Pagination
  Posts --> PostZero
  Posts --> AdBanner

  PostRead --> PostGrid
  PostRead --> CommentForm
  PostRead --> CommentComponent
  PostRead --> AdBanner

  Kakao --> Redirection
```

참고: `PostCardLoading` 컴포넌트는 어디에서도 import되지 않는다(미사용).

### 5-2. 컴포넌트와 데이터 계층 의존성

UI 컴포넌트가 `authStore`와 `axiosInstance`를 어디서 직접 쓰는지 보여준다. 서비스 레이어가 없어서 페이지와 컴포넌트가 `axiosInstance`를 직접 호출한다.

```mermaid
flowchart LR
  subgraph ui["UI"]
    Header
    AuthProfile
    CommentForm
    CommentComponent
    PostRead
    PostCreate
    Kakao
    EmailLogin
    Signup
  end

  subgraph loader["routes/loader"]
    authLoader["auth.loader"]
    postLoader["post.loader"]
  end

  store[("authStore")]
  ax["axiosInstance"]

  Header --> store
  AuthProfile --> store
  CommentForm --> store
  CommentComponent --> store
  PostRead --> store
  Kakao --> store
  EmailLogin --> store
  authLoader --> store

  CommentForm --> ax
  PostRead --> ax
  PostCreate --> ax
  Kakao --> ax
  EmailLogin --> ax
  Signup --> ax
  authLoader --> ax
  postLoader --> ax
  store --> ax
  postLoader --> authLoader
```

## 6. 상태 흐름

### 6-1. 상태 종류별 위치

같은 정보를 여러 곳에 중복 보관하지 않는 것이 원칙이다. 서버 데이터는 loader, 화면 조건은 URL, 로그인 정보는 `authStore`, 그 외 UI 상태는 컴포넌트 `useState`에 둔다.
예외로 `PostRead`의 `comments`와 `PostCreate`의 `formState`는 loader 값을 로컬 state로 복사해서 쓴다.

```mermaid
flowchart TB
  subgraph server["① 서버 데이터 (loader → useLoaderData)"]
    direction LR
    L1["fetchOverview"] --> C1["Home"]
    L2["fetchPosts"] --> C2["Posts"]
    L3["fetchPostsDetail"] --> C3["PostRead"]
    L4["fetchPostModify"] --> C4["PostCreate 수정 모드"]
  end

  subgraph url["② URL 상태 (useSearchParams)"]
    direction LR
    Q1["sort · category · page · search"] --> C5["Posts<br/>읽기 · setSearchParams 로 변경"]
    Q1 --> C6["Header<br/>search 가 없으면 keyword 초기화"]
    C7["Header 검색 입력"] -- "navigate /posts?search=" --> Q1
    Q2["access_token · email 콜백 쿼리"] --> C8["Kakao"]
  end

  subgraph global["③ 전역 상태 (Zustand authStore)"]
    direction LR
    T[("sessionStorage<br/>access_token")] -. "토큰 있으면 user 복원" .-> A[("authStore<br/>user · isLogin")]
    A -- "셀렉터 구독" --> C9["Header · AuthProfile<br/>CommentForm · CommentComponent · PostRead"]
  end

  subgraph local["④ 로컬 상태 (useState 등)"]
    direction LR
    S1["Header<br/>keyword · isSearchOpen"]
    S2["PostRead<br/>comments · showDeleteConfirm"]
    S3["PostCreate<br/>formState · errorState · previewImage"]
    S4["Kakao · EmailLogin<br/>email · error · showForm"]
  end

  server ~~~ url
  url ~~~ global
  global ~~~ local
```

### 6-2. authStore 상태 전이

로그인 여부는 `user`가 있는지로 결정되고, 새로고침해도 `sessionStorage`의 토큰이 있으면 레이아웃 loader(`fetchuserData`)가 복원한다.

```mermaid
stateDiagram-v2
  [*] --> 비로그인: 앱 시작 · 토큰 없음
  [*] --> 복원중: 앱 시작 · 토큰 있음

  복원중 --> 로그인: GET /auth/me 성공 후 setUserData
  복원중 --> 비로그인: 조회 실패 · user는 null 유지

  비로그인 --> 로그인: 이메일 로그인 성공 후 setUserData
  비로그인 --> 로그인: 카카오 콜백 성공 후 setUserData
  비로그인 --> 로그인: 카카오 이메일 등록 성공 후 setUserData

  로그인 --> 비로그인: logout 후 토큰 삭제 · revalidate
  로그인 --> 비로그인: refresh 실패 후 토큰 삭제
```

### 6-3. 댓글 상태 (로컬 state + 낙관적 업데이트)

`PostRead`가 loader의 `post.comments`를 `comments` state로 복사하고, `useOptimistic`으로 화면용 목록을 만든다. 서버 응답 전에는 임시 댓글이 보이고, 실패하면 자동으로 사라진다.

```mermaid
sequenceDiagram
  actor User as 사용자
  participant CF as CommentForm
  participant PR as PostRead
  participant API as 백엔드 API

  Note over PR: comments = loader post.comments 복사
  Note over PR: optimisticComments = useOptimistic(comments)

  User->>CF: 댓글 입력 후 제출
  CF->>CF: 공백이면 중단
  CF->>PR: addOptimisticComments(임시 댓글)
  PR-->>User: 임시 댓글을 즉시 표시
  CF->>API: POST /posts/:id/comments
  alt 성공
    API-->>CF: 저장된 댓글
    CF->>PR: setComments 로 목록에 추가 (startTransition)
    PR-->>User: 실제 댓글로 교체
  else 실패
    CF->>User: alert 로 에러 표시
    PR-->>User: 임시 댓글 자동 제거
  end

  User->>PR: 댓글 삭제 클릭
  PR->>API: DELETE /posts/:id/comments/:commentId
  API-->>PR: 성공
  PR->>PR: setComments 에서 해당 댓글 제거
```

### 6-4. PostCreate 폼 상태 (작성 · 수정 공용)

```mermaid
flowchart TD
  LD["loader 데이터<br/>post 있으면 수정 모드"] --> EF["useEffect<br/>formState · previewImage 채움"]
  IN["입력 변경"] --> FS["formState 갱신<br/>해당 필드 errorState 초기화"]
  IMG["이미지 선택"] --> CHK{"확장자 · 10MB 검사"}
  CHK -- "통과" --> PV["previewImage<br/>FileReader dataURL"]
  CHK -- "실패" --> AL["alert 후 선택 취소"]

  FS --> SUB["제출 · useTransition"]
  PV --> SUB
  SUB --> VAL{"필수값 검사"}
  VAL -- "실패" --> ES["errorState 표시"]
  VAL -- "통과" --> UP{"썸네일 변경됨?"}
  UP -- "예" --> CL["Cloudinary 업로드 후 url"]
  UP -- "아니오" --> MODE
  CL --> MODE{"수정 모드?"}
  MODE -- "예" --> PUT["PUT /posts/:id 후 상세로 이동"]
  MODE -- "아니오" --> POST["POST /posts 후 홈으로 이동"]
```
