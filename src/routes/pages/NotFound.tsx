import { FileQuestion } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <title>404 Page Not Found - Blog</title>
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex rounded-full bg-blue-900/20 p-6">
          <FileQuestion
            aria-hidden="true"
            className="h-12 w-12 text-accent-hover"
          />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-white">
          <span className="block text-6xl">404</span>
          <span className="mt-2 block text-2xl font-semibold text-slate-200">
            Page Not Found
          </span>
        </h1>
        <p className="mb-8 text-muted">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            className="min-h-11 rounded-lg bg-slate-700 px-6 py-3 text-white transition-colors hover:bg-slate-600"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
          <Link
            to="/"
            className="flex min-h-11 items-center justify-center rounded-lg bg-accent px-6 py-3 text-white transition-colors hover:bg-accent-hover"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
