import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  error?: string;
  children: ReactNode;
};

export default function AuthCard({
  title,
  description,
  error = "",
  children,
}: AuthCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-card p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-white">{title}</h1>
            <p className="text-muted">{description}</p>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
