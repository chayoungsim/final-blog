import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { axiosInstance } from "../../../api/axios";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate } from "react-router";
import AuthCard from "../../../components/auth/AuthCard";
import AuthField from "../../../components/auth/AuthField";

export default function EmailLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const setUserData = useAuthStore((state) => state.setUserData);

  const handleLogin = async () => {
    setError("");
    try {
      if (email.trim() === "") {
        setError("Email Required");
        return;
      }
      if (password.trim().length < 6) {
        setError("Password must be at least 6 characters long");
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
            className="min-h-11 flex-1 rounded-lg bg-accent py-3 text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
