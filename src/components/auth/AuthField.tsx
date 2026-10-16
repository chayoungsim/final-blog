import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  icon: LucideIcon;
  // true면 우측에 비밀번호 보기/숨기기 토글을 표시한다 (type="password"와 함께 사용)
  showToggle?: boolean;
};

export default function AuthField({
  id,
  label,
  icon: Icon,
  type = "text",
  showToggle = false,
  ...inputProps
}: AuthFieldProps) {
  const [isShown, setIsShown] = useState(false);

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
          className={`min-h-11 w-full rounded-lg bg-slate-700 py-3 pl-10 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent ${
            showToggle ? "pr-12" : "pr-4"
          }`}
          {...inputProps}
        />
        {showToggle && (
          <button
            type="button"
            aria-label={isShown ? "비밀번호 숨기기" : "비밀번호 보기"}
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
    </div>
  );
}
