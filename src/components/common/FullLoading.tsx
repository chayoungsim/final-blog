export default function FullLoading() {
  return (
    <div
      role="status"
      className="min-h-screen flex flex-col items-center justify-center bg-page"
    >
      <div aria-hidden="true" className="relative inline-flex">
        <div className="w-8 h-8 bg-accent rounded-full"></div>
        <div className="w-8 h-8 bg-accent rounded-full absolute top-0 left-0 animate-ping"></div>
        <div className="w-8 h-8 bg-accent rounded-full absolute top-0 left-0 animate-pulse"></div>
      </div>
      <span className="sr-only">로딩 중</span>
    </div>
  );
}
