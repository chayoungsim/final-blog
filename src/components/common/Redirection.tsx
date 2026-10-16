import { Loader2 } from "lucide-react";

export default function Redirection() {
  return (
    <div
      role="status"
      className="min-h-[60vh] flex flex-col items-center justify-center px-4"
    >
      <title>리다이렉션 중 - Blog</title>
      <Loader2
        aria-hidden="true"
        className="w-12 h-12 text-accent animate-spin mb-4"
      />
      <p className="text-xl font-semibold text-white">리다이렉션 중...</p>
    </div>
  );
}
