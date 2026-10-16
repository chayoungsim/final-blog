import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Search, PenSquare, LogIn } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import AuthProfile from "./AuthProfile";
import { useAuthStore } from "../../store/authStore";

export default function Header() {
  const navigate = useNavigate();
  const isLogin = useAuthStore((state) => state.isLogin);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate("/posts?search=" + encodeURIComponent(trimmed));
    setIsSearchOpen(false);
  };

  useEffect(() => {
    if (!search) setKeyword("");
  }, [search]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-section/90 py-3 px-4 text-white backdrop-blur md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center rounded-lg transition-opacity hover:opacity-90"
        >
          <span
            aria-hidden="true"
            className="h-8 w-8 bg-accent rounded-full flex items-center justify-center mr-2"
          >
            <span className="text-white font-bold">S</span>
          </span>
          <span className="font-display text-xl font-bold">SULOG</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <form role="search" onSubmit={handleSearch} className="flex items-center">
            <button
              type="button"
              aria-label={isSearchOpen ? "검색창 닫기" : "검색창 열기"}
              aria-expanded={isSearchOpen}
              aria-controls="header-search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-card md:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
            <div
              className={`relative ${isSearchOpen ? "block" : "hidden"} md:block`}
            >
              <label htmlFor="header-search" className="sr-only">
                게시글 검색
              </label>
              <input
                id="header-search"
                type="search"
                placeholder="Search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-40 rounded-full bg-card py-2 pl-10 pr-4 text-white placeholder:text-muted transition-all focus:outline-hidden focus:ring-2 focus:ring-accent md:w-60"
              />
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
            </div>
          </form>

          <nav aria-label="주요 메뉴" className="flex items-center gap-2 md:gap-3">
            <Link
              to="/create-post"
              aria-label="글쓰기"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-accent transition-colors hover:bg-accent-hover"
            >
              <PenSquare className="h-5 w-5" aria-hidden="true" />
            </Link>
            {!isLogin && (
              <Link
                to="/auth/login"
                aria-label="로그인"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-card transition-colors hover:bg-slate-700"
              >
                <LogIn className="h-5 w-5" aria-hidden="true" />
              </Link>
            )}
            {/* 로그인 되면 아래 컴포넌트 보여주기 */}
            {isLogin && <AuthProfile />}
          </nav>
        </div>
      </div>
    </header>
  );
}
