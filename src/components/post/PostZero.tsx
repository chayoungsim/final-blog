import { FileX, RefreshCw } from "lucide-react";

const buttonClass =
  "flex min-h-11 items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors";

export default function PostZero({
  selectedCategory,
}: {
  selectedCategory: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-xl">
      <div className="bg-slate-700 rounded-full p-6 mb-6">
        <FileX aria-hidden="true" className="w-12 h-12 text-muted" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        {selectedCategory === ""
          ? "No posts found"
          : `No posts in ${selectedCategory}`}
      </h2>
      <p className="text-muted text-center mb-6 max-w-md">
        {selectedCategory === ""
          ? "There are no blog posts available at the moment."
          : `We couldn't find any posts in the "${selectedCategory}" category.`}
      </p>
      {selectedCategory !== "" ? (
        <button type="button" className={buttonClass}>
          <RefreshCw aria-hidden="true" className="w-4 h-4" />
          Show all posts
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={buttonClass}
        >
          <RefreshCw aria-hidden="true" className="w-4 h-4" />
          Refresh page
        </button>
      )}
    </div>
  );
}
