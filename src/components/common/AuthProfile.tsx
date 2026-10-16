import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useRevalidator } from "react-router";

export default function AuthProfile() {
  const { revalidate } = useRevalidator();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 메뉴가 열려 있을 때 ESC 또는 바깥 클릭으로 닫기
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsUserMenuOpen(false);
    };
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    revalidate();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="사용자 메뉴"
        aria-expanded={isUserMenuOpen}
        aria-controls="user-menu"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-full"
      >
        <img
          src={user?.profileImage}
          alt={user?.nickname ? `${user.nickname} 프로필 이미지` : "프로필 이미지"}
          className="h-8 w-8 rounded-full border-2 border-accent object-cover"
        />
      </button>

      {isUserMenuOpen && (
        <div
          id="user-menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-700 bg-card py-1 shadow-lg"
        >
          <div className="border-b border-slate-700 px-4 py-2">
            <p className="text-sm font-medium">{user?.nickname}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center px-4 py-2 text-sm hover:bg-slate-700"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
