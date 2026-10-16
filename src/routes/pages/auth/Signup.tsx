import { Mail, Lock, User } from "lucide-react";
import { useActionState, useEffect } from "react";
import { axiosInstance } from "../../../api/axios";
import { useNavigate } from "react-router";
import AuthCard from "../../../components/auth/AuthCard";
import AuthField from "../../../components/auth/AuthField";

export default function Signup() {
  const navigate = useNavigate();
  const [state, formAction, isPending] = useActionState(
    async (
      _: { error: string; payload: FormData; field?: string },
      formData: FormData,
    ) => {
      try {
        const email = (formData.get("email") as string) || "";
        const nickname = (formData.get("nickname") as string) || "";
        const password = (formData.get("password") as string) || "";
        const confirmPassword =
          (formData.get("confirmPassword") as string) || "";

        // 간단하게 입력양식 검사
        if (email.trim() === "")
          return { error: "Email is required", field: "email", payload: formData };
        if (nickname.trim() === "")
          return { error: "Nickname is required", field: "nickname", payload: formData };

        if (password.trim().length < 6)
          return {
            error: "Password must be at least 6 characters long",
            field: "password",
            payload: formData,
          };
        if (password !== confirmPassword)
          return {
            error: "Passwords do not match",
            field: "confirmPassword",
            payload: formData,
          };

        const { status } = await axiosInstance.post("/auth/signup", {
          email,
          password,
          nickname,
        });

        if (status === 201) {
          alert("회원가입 완료했습니다.");
          navigate("/auth/email-login");
          return { error: "", payload: formData };
        }
        return { error: "Signup failed", payload: formData };
      } catch (e) {
        return {
          error: e instanceof Error ? e.message : "unknown error",
          payload: formData,
        };
      }
    },
    {
      error: "",
      payload: new FormData(),
    } as { error: string; payload: FormData; field?: string },
  );

  // 검증 실패 시 오류가 있는 필드로 포커스를 옮긴다
  useEffect(() => {
    if (state.field) document.getElementById(state.field)?.focus();
  }, [state]);

  // 해당 필드의 오류만 골라서 전달한다
  const fieldError = (name: string) =>
    state.field === name ? state.error : "";

  // 에러로 폼이 다시 그려질 때 입력값을 유지
  const keep = (name: string) =>
    state.error ? String(state.payload?.get(name) ?? "") : "";

  return (
    <AuthCard
      title="Welcome to SULOG"
      description="Create your account"
      error={state.field ? "" : state.error}
    >
      <title>Sign Up - Blog</title>
      <form className="space-y-4" action={formAction}>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email Address"
          icon={Mail}
          placeholder="Enter your email"
          autoComplete="email"
          aria-required="true"
          error={fieldError("email")}
          defaultValue={keep("email")}
        />

        <AuthField
          id="nickname"
          name="nickname"
          label="Nickname"
          icon={User}
          placeholder="Choose a nickname"
          autoComplete="nickname"
          aria-required="true"
          error={fieldError("nickname")}
          defaultValue={keep("nickname")}
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Password"
          icon={Lock}
          showToggle
          placeholder="Create a password"
          autoComplete="new-password"
          aria-required="true"
          hint="At least 6 characters"
          error={fieldError("password")}
          defaultValue={keep("password")}
        />

        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          icon={Lock}
          placeholder="Confirm your password"
          autoComplete="new-password"
          aria-required="true"
          error={fieldError("confirmPassword")}
          defaultValue={keep("confirmPassword")}
        />

        <div className="flex gap-3">
          <button
            type="button"
            className="min-h-11 flex-1 rounded-lg bg-slate-600 py-3 text-white transition-colors hover:bg-slate-500"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            type="submit"
            className="min-h-11 flex-1 rounded-lg bg-accent-solid py-3 text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-muted"
            disabled={isPending}
            aria-busy={isPending}
          >
            Create Account
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
