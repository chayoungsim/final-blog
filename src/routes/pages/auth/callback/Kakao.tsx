import axios from "axios";
import { Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Redirection from "../../../../components/common/Redirection";
import { axiosInstance } from "../../../../api/axios";
import { useAuthStore } from "../../../../store/authStore";
import AuthCard from "../../../../components/auth/AuthCard";
import AuthField from "../../../../components/auth/AuthField";

export default function Kakao() {
  const navigate = useNavigate();
  const setUserData = useAuthStore((state) => state.setUserData)
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get("access_token");
  const emailYn = searchParams.get("email");

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("")

  const handleFormAction = async () => {
    setError("");
    try{
      const {data : {user}} = await axiosInstance.patch("/auth/update-email",{
        email
      })

      setUserData({
          id: user._id,
          kakaoId: user.kakaoId,
          profileImage: user.profileImage,
          nickname: user.nickname,  
          email: user.email
      })

      // 이메일 등록 성공 시 홈으로 이동
      navigate("/");
    } catch(e) {
      if (axios.isAxiosError(e)) {
        // 서버가 내려준 메시지를 우선 표시
        setError(e.response?.data?.error ?? e.message);
      } else {
        setError(e instanceof Error ? e.message : "unknown error");
      }
    }
  }

  const fetchAndSaveUser = useCallback(async () => {
    setError("");
    try {
        if (accessToken) sessionStorage.setItem("access_token", accessToken);
        const {data} = await axiosInstance.get("/auth/me");
        setUserData(data)
        navigate("/")
        //console.log(data)
    } catch (e) {
      // 사용자 정보 조회 실패 시 저장한 토큰을 지우고 로그인 페이지로 이동
      console.error(e);
      sessionStorage.removeItem("access_token");
      navigate("/auth/login", { replace: true });
    }
  },[accessToken,navigate,setUserData])

  useEffect(() => {   

    if (emailYn === "N") {
      setShowForm(true);
    } else {
      fetchAndSaveUser();
    }
  }, [emailYn, fetchAndSaveUser]);

  return (
    <>
      {/* 이메일 정보를 받아야 할 때 */}
      {showForm ? (
        <AuthCard
          title="You're almost there"
          description="Sign up with just your email!"
          error={error}
        >
          <title>Email Registration - Blog</title>
          <form className="space-y-4" action={handleFormAction}>
            <AuthField
              id="email"
              type="email"
              label="Email Address"
              icon={Mail}
              placeholder="Enter your email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                type="button"
                className="min-h-11 flex-1 rounded-lg bg-slate-600 py-3 text-white transition-colors hover:bg-slate-500"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-11 flex-1 rounded-lg bg-accent-solid py-3 text-white transition-colors hover:bg-accent-solid-hover"
              >
                Continue
              </button>
            </div>
          </form>
        </AuthCard>
      ) : (
        <Redirection />
      )}
    </>
  );
}
