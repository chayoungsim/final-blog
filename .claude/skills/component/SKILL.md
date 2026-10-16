---
name: component
description: 공통 UI 컴포넌트를 새로 만들거나 분리·재사용 가능하게 리팩터링할 때 쓴다. "컴포넌트 만들어줘", "공통 컴포넌트로 분리", "버튼/모달/카드/입력 컴포넌트 추가", "새 UI 컴포넌트" 같은 요청에서 파일 위치, props 설계, 스타일, 접근성 규칙을 통일한다.
---

# 공통 UI 컴포넌트 생성 가이드

새 컴포넌트의 구조와 규칙을 통일하기 위한 스킬이다. 프로젝트 공통 규칙은 `CLAUDE.md`를 따르고, 여기서는 컴포넌트 생성에 필요한 부분만 다룬다.

## 0. 작업 전

1. 기존 컴포넌트에 같은 역할이 있는지 `src/components/` 하위를 먼저 검색한다. 있으면 새로 만들지 말고 재사용하거나 props를 확장한다.
2. 변경 계획(만들 파일, props, 사용처)을 먼저 사용자에게 제시한다.
3. 한 번에 수정하는 파일은 최소로 한다. 컴포넌트 생성과 기존 코드 교체는 커밋을 나눈다.

## 1. 위치 결정

| 위치 | 용도 | 예시 |
| --- | --- | --- |
| `src/components/common/` | 도메인과 무관한 공통 UI | `ErrorState`, `FullLoading` |
| `src/components/post/` | 게시글 도메인 UI | `PostCard`, `PostZero` |
| `src/components/comment/` | 댓글 도메인 UI | `CommentForm` |

- 2곳 이상에서 쓰이거나 도메인 지식이 없으면 `common/`에 둔다.
- 데이터 로딩(`useLoaderData`)과 조합은 `routes/pages`가 맡는다. 컴포넌트는 표현 위주로 만들고 props로 받는다.
- 빈 상태는 `*Zero`, 로딩은 `*Loading`, 에러는 `ErrorState` 이름을 따른다.

## 2. 파일과 이름

- 파일명 = 컴포넌트명 = PascalCase (`ConfirmModal.tsx` → `ConfirmModal`). `Component` 접미사는 쓰지 않는다.
- 컴포넌트 하나당 파일 하나. 폴더/인덱스 파일은 만들지 않는다.
- 이벤트 핸들러는 `handleXxx`, prop 콜백은 `onXxx`, 불리언은 `isXxx`/`showXxx`.
- 들여쓰기 2칸. 주석은 한국어, 변수/함수명은 영어.

## 3. 코드 구조

- **함수 선언 + `export default`**. 화살표 컴포넌트, named export는 쓰지 않는다.
- props는 파라미터에서 바로 구조분해하고, 타입은 같은 파일의 `type XxxProps`로 선언한다.
- 기본값은 구조분해 단계에서 지정한다 (`size = "large"`, `posts = []`).
- 전역 타입(`Post`, `Comment`, `Author`, `Pagination`)은 import 없이 쓴다.
- 서버 데이터를 전역 스토어에 넣지 않는다. 필요한 값은 props로 받는다.
- 스토어 구독이 필요하면 셀렉터로만 한다 (`useAuthStore((s) => s.user)`).
- `sessionStorage`의 `"access_token"` 같은 키 문자열을 새로 쓰지 않는다.
- `_id` ↔ `id` 매핑을 컴포넌트에 복붙하지 않는다.

```tsx
type ConfirmModalProps = {
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "확인",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // ...
}
```

## 4. 스타일 (Tailwind)

- Tailwind 유틸리티 클래스를 JSX에 인라인으로 쓴다. SCSS/CSS 파일을 새로 만들지 않는다.
- 조건부 클래스는 템플릿 리터럴로 조합한다.
- 앱은 다크 고정이므로 **`dark:` 변형을 쓰지 않고** slate 색을 직접 쓴다.
- 공통 토큰:
  - 카드: `bg-slate-800`, 모서리 `rounded-lg`
  - 주 버튼: `bg-blue-500 hover:bg-blue-600 text-white`
  - 삭제/위험: `bg-red-500 hover:bg-red-600 text-white`
  - 페이지 래퍼: `max-w-7xl mx-auto px-4 md:px-8 py-8`
- 아이콘은 `lucide-react`, 날짜는 `date-fns`의 `format(new Date(x), "yyyy-MM-dd HH:mm")`.
- 카테고리 목록 등 중복되기 쉬운 상수는 한 곳에 정의해서 import한다.

## 5. 반응형

- 모바일 우선으로 기본 클래스를 쓰고 `md:`, `lg:`로 확장한다.
- 고정 px 너비를 피하고 `w-full`, `max-w-*`, `flex`/`grid`로 구성한다.
- 터치 대상(버튼, 링크)은 최소 약 44px 높이를 확보한다 (`py-2`~`py-3`, `min-h-11`).

## 6. 접근성 (신규 코드 필수)

- 시맨틱 태그를 쓴다 (`button`, `nav`, `main`, `section`, `h1~h6`, `ul/li`). 클릭 가능한 `div`는 만들지 않는다.
- `<button>`에는 항상 `type`을 명시한다 (`type="button"` / `type="submit"`).
- 아이콘만 있는 버튼은 `aria-label`을 달고, 장식용 아이콘은 `aria-hidden="true"`로 가린다.
- 이미지는 의미 있는 `alt`를 받는다. 고정 문구를 쓰지 않고 props로 받으며, 장식이면 `alt=""`.
- 모든 입력은 `<label htmlFor>`로 연결한다. 오류는 화면에 인라인으로 표시하고 `role="alert"`를 단다.
- 현재 페이지/선택 상태는 `aria-current`, `aria-pressed`, `aria-expanded`로 노출한다.
- 모달은 `role="dialog"`, `aria-modal="true"`, `aria-labelledby`를 달고, 열릴 때 포커스를 안으로 옮기고 `Esc`로 닫으며 닫힌 뒤 트리거로 포커스를 돌려준다.
- 로딩/상태 변경 안내에는 `role="status"` 또는 `aria-live`를 쓴다.
- 포커스 스타일을 지우지 않는다 (`focus-visible:ring-2` 등으로 대체).
- 키보드(Tab, Enter, Space, Esc)만으로 모든 동작이 가능해야 한다.

## 7. 에러 처리와 폼

- 폼 에러는 화면 인라인(`role="alert"`)으로 보이며, 문구는 `unknown error` 표기를 따른다.
- 폼 제출 방식은 인접 파일 패턴을 따른다 (`<form action={fn}>` / `useActionState` / `onSubmit`+`preventDefault`).
- 외부 이미지 업로드(Cloudinary)는 `axiosInstance`가 아닌 일반 `axios`를 쓴다 (인증 헤더 금지).
- 쿼리 문자열 값은 `encodeURIComponent`를 거친다.

## 8. 마무리 체크리스트

- [ ] 같은 역할의 기존 컴포넌트가 없음을 확인했다
- [ ] 위치(`common`/`post`/`comment`)와 파일명=컴포넌트명을 지켰다
- [ ] 함수 선언 + `export default`, `type XxxProps` 사용
- [ ] `dark:` 없이 slate 색, 반응형 클래스 적용
- [ ] `button type`, `aria-label`, `alt`, `label`, 포커스 처리 등 접근성 항목 충족
- [ ] 키 문자열·`_id`↔`id` 매핑·상수를 중복 작성하지 않았다
- [ ] `npm run build`(타입 체크)와 `npm run lint`를 통과했다
- [ ] 컴포넌트 추가와 사용처 교체를 서로 다른 커밋으로 나눴다 (커밋 메시지는 한국어)
