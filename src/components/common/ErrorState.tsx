import { AlertCircle } from "lucide-react";
import { useRouteError } from "react-router";

type ErrorStateProps = {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  // 레이아웃(Header, Footer) 밖에서 단독으로 렌더될 때 true. main landmark를 직접 제공한다.
  standalone?: boolean;
};

export default function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the content. \nPlease try again later.",
  action,
  standalone = false,
}: ErrorStateProps) {
  const error = useRouteError();
  if (error instanceof Response) {
    message = `Error ${error.status}: ${error.statusText}`;
  }

  if (error instanceof Error) {
    message = `${error.name}: ${error.message}`;
  }

  const Wrapper = standalone ? "main" : "div";

  return (
    <Wrapper
      className={`flex flex-col items-center justify-center bg-page ${
        standalone ? "min-h-screen" : "min-h-[60vh]"
      }`}
    >
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-red-900/20 rounded-full p-6 mb-6">
          <AlertCircle
            aria-hidden="true"
            className="w-12 h-12 text-red-400"
          />
        </div>
        {/* 오류 내용만 alert로 알리고 버튼은 밖에 둔다 */}
        <div role="alert" className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            {title}
          </h1>
          <p className="text-muted text-center mb-6 max-w-md whitespace-pre-wrap">
            {message}
          </p>
        </div>
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
    </Wrapper>
  );
}
