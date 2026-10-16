export default function PostCardLoading() {
  return (
    <div
      aria-hidden="true"
      className="bg-card rounded-lg overflow-hidden shadow-lg animate-pulse"
    >
      <div className="aspect-video w-full bg-slate-700"></div>
      <div className="p-4 space-y-2">
        <div className="h-5.5 bg-slate-700 rounded"></div>
        <div className="h-5.5 bg-slate-700 rounded"></div>
        <div className="flex w-full space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-25"></div>
          </div>
          <div className="flex items-center space-x-2 grow-1">
            <div className="h-4 w-4 rounded-full bg-slate-700"></div>
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
