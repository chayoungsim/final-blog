import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";

type DeleteConfirmModalProps = {
  title?: string;
  description?: string;
  isPending?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  title = "Delete Post",
  description = "Are you sure you want to delete this post? This action cannot be undone.",
  isPending = false,
  error = "",
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // 열릴 때 취소 버튼으로 포커스를 옮기고, 닫히면 원래 포커스 위치로 복귀
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  // ESC로 닫기, Tab 이동은 모달 안에서만 순환
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onCancel();
      return;
    }
    if (e.key !== "Tab") return;

    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled])",
    );
    if (!focusables || focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl"
      >
        <h2 id={titleId} className="mb-4 text-xl font-bold text-white">
          {title}
        </h2>
        <p id={descriptionId} className="mb-6 text-slate-300">
          {description}
        </p>
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-400">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="min-h-11 rounded-lg bg-slate-600 px-4 py-2 text-white transition-colors hover:bg-slate-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="min-h-11 rounded-lg bg-danger px-4 py-2 text-white transition-colors hover:bg-danger-hover disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
