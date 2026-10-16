import { Mail } from "lucide-react";
import { Link } from "react-router";
import AuthCard from "../../../components/auth/AuthCard";

// 구분선: 선은 장식이므로 보조기기에서 숨기고 문구만 읽히게 한다
function Divider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-600"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-card px-2 text-muted">{label}</span>
      </div>
    </div>
  );
}

export default function Login() {
  const handleKakaoLogin = () => {
    window.location.href = import.meta.env.VITE_API_URL + "/auth/kakao";
  };
  return (
    <AuthCard title="Welcome to SULOG" description="Sign in with your account">
      <title>Login - Blog</title>
      <div className="space-y-4">
        {/* 이메일 로그인 */}
        <Link
          to="/auth/email-login"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-medium text-slate-900 transition-colors hover:bg-slate-100"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          Continue with Email
        </Link>

        <Divider label="Or continue with" />

        {/* 카카오 로그인 버튼 */}
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] py-3 font-medium text-black transition-colors hover:bg-[#FDD800]"
          onClick={handleKakaoLogin}
        >
          <img
            src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
            alt=""
            className="h-5 w-5"
          />
          Continue with Kakao
        </button>

        <Divider label="Don't have an account?" />

        {/* 회원가입 */}
        <Link
          to="/auth/signup"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-700 py-3 font-medium text-white transition-colors hover:bg-slate-600"
        >
          Create an account
        </Link>
      </div>
    </AuthCard>
  );
}
