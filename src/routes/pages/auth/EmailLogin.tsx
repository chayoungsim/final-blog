import { Mail, Lock } from "lucide-react";
import { useRef, useState } from "react";
import { axiosInstance } from "../../../api/axios";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router";
import AuthCard from "../../../components/auth/AuthCard";
import AuthField from "../../../components/auth/AuthField";

export default function EmailLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 필드별 오류(email, password)와 서버 등 폼 전체 오류(form)를 구분한다
  const [fieldError, setFieldError] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const setUserData = useAuthStore((state) => state.setUserData);

  const handleLogin = async () => {
    setError("");
    setFieldError({ email: "", password: "" });
    try {
      // 오류가 있는 첫 필드에 오류를 연결하고 포커스를 옮긴다
      if (email.trim() === "") {
        setFieldError({ email: "Email Required", password: "" });
        emailRef.current?.focus();
        return;
      }
      if (password.trim().length < 6) {
        setFieldError({
          email: "",
          password: "Password must be at least 6 characters long",
        });
        passwordRef.current?.focus();
        return;
      }

      const {
        data: { accessToken, user },
      } = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const userData = {
        id: user._id,
        kakaoId: user.kakaoId,
        profileImage: user.profileImage,
        nickname: user.nickname,
        email: user.email,
      };

      sessionStorage.setItem("access_token", accessToken);
      setUserData(userData);
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    }
  };

  return (
    <AuthCard
      title="Welcome to SULOG"
      description="Please enter your credentials to continue"
      error={error}
    >
      <title>Email Login - Blog</title>
      <form className="space-y-4" action={handleLogin}>
        <AuthField
          id="email"
          type="email"
          label="Email Address"
          icon={Mail}
          placeholder="Enter your email"
          autoComplete="email"
          aria-required="true"
          ref={emailRef}
          error={fieldError.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthField
          id="password"
          type="password"
          label="Password"
          icon={Lock}
          showToggle
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-required="true"
          ref={passwordRef}
          hint="At least 6 characters"
          error={fieldError.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            className="min-h-11 flex-1 rounded-lg bg-accent-solid py-3 text-white transition-colors hover:bg-accent-solid-hover"
          >
            Sign In
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
