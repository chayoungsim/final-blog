import { FileX, RefreshCw } from "lucide-react";

export default function PostMainZero({ title }: { title: string }) {
  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-xl">
        <div className="bg-slate-700 rounded-full p-6 mb-6">
          <FileX aria-hidden="true" className="w-12 h-12 text-muted" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No posts found</h3>
        <p className="text-muted text-center mb-6 max-w-md">
          There are no blog posts available at the moment.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex min-h-11 items-center gap-2 px-6 py-3 bg-accent-solid text-white rounded-lg hover:bg-accent-solid-hover transition-colors"
        >
          <RefreshCw aria-hidden="true" className="w-4 h-4" />
          Refresh page
        </button>
      </div>
    </section>
  );
}
