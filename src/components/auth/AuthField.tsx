import { useState } from "react";
import type { ComponentPropsWithRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type AuthFieldProps = Omit<ComponentPropsWithRef<"input">, "id"> & {
  id: string;
  label: string;
  icon: LucideIcon;
  // 입력 전에 보여줄 도움말 (예: 비밀번호 규칙)
  hint?: string;
  // 필드별 오류 메시지. 있으면 aria-invalid와 aria-describedby로 입력에 연결한다
  error?: string;
  // true면 우측에 비밀번호 보기/숨기기 토글을 표시한다 (type="password"와 함께 사용)
  showToggle?: boolean;
};

export default function AuthField({
  id,
  label,
  icon: Icon,
  type = "text",
  hint,
  error,
  showToggle = false,
  ...inputProps
}: AuthFieldProps) {
  const [isShown, setIsShown] = useState(false);

  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        />
        <input
          id={id}
          type={showToggle && isShown ? "text" : type}
          className={`min-h-11 w-full rounded-lg bg-slate-700 py-3 pl-10 text-white placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-accent aria-invalid:ring-2 aria-invalid:ring-red-400 ${
            showToggle ? "pr-12" : "pr-4"
          }`}
          {...inputProps}
          aria-invalid={!!error}
          aria-describedby={describedBy}
        />
        {showToggle && (
          // 이름은 고정하고 눌림 상태(aria-pressed)로만 현재 상태를 전달한다
          <button
            type="button"
            aria-label="비밀번호 표시"
            aria-pressed={isShown}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:text-slate-200"
            onClick={() => setIsShown((shown) => !shown)}
          >
            {isShown ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
