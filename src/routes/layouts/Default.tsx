import { useEffect, useRef } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

export default function Default() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const prevPathnameRef = useRef(pathname);

  // 페이지(경로)가 바뀌면 본문으로 포커스를 옮겨 스크린리더·키보드 사용자에게 전환을 알린다.
  // 쿼리 변경(정렬·페이지)은 경로가 같으므로 포커스를 가져가지 않는다.
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <ScrollRestoration />
      <div className="min-h-screen bg-page flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent-solid focus:px-4 focus:py-2 focus:text-white"
        >
          본문 바로가기
        </a>
        <Header />
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="grow focus:outline-hidden"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
