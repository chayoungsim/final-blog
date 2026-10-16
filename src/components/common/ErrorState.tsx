import { AlertCircle } from "lucide-react";
import { useRouteError } from "react-router";

type ErrorStateProps = {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export default function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the content. \nPlease try again later.",
  action,
}: ErrorStateProps) {
  const error = useRouteError();
  if (error instanceof Response) {
    message = `Error ${error.status}: ${error.statusText}`;
  }

  if (error instanceof Error) {
    message = `${error.name}: ${error.message}`;
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page">
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-16 px-4"
      >
        <div className="bg-red-900/20 rounded-full p-6 mb-6">
          <AlertCircle
            aria-hidden="true"
            className="w-12 h-12 text-red-400"
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {title}
        </h2>
        <p className="text-muted text-center mb-6 max-w-md whitespace-pre-wrap">
          {message}
        </p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="min-h-11 px-6 py-3 bg-accent-solid text-white rounded-lg hover:bg-accent-solid-hover transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
