import { Send } from "lucide-react";
import { Dispatch, SetStateAction, startTransition, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { Link, useParams } from "react-router";
import { axiosInstance } from "../../api/axios";

export default function CommentForm({
  addOptimisticComments,
  setComments,
  onAdded,
}: {
  addOptimisticComments: (action: Comment) => void;
  setComments: Dispatch<SetStateAction<Comment[]>>;
  // 등록 성공 후 호출 (상태 안내용)
  onAdded?: () => void;
}) {
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleCommentAdd = async () => {
    // 빈 댓글은 낙관적 업데이트 전에 걸러냄
    if (!text.trim()) return;
    setError("");

    addOptimisticComments({
      author: {
        _id: Date.now().toString(),
        profileImage: user?.profileImage,
        nickname: user?.nickname,
      },
      content: text,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    } as Comment);

    try {
      const { data } = await axiosInstance.post(`/posts/${params.id}/comments`, {
        content: text,
      });
      setText("");
      startTransition(() => {
        setComments((comments) => [...comments, data]);
      });
      onAdded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    }
  };

  // 포커스만으로 화면이 이동하면 안 되므로(WCAG 3.2.1) 비로그인 시 안내 링크를 보여준다
  if (!user) {
    return (
      <p className="mt-4 rounded-xl bg-card p-4 text-slate-300">
        댓글을 작성하려면{" "}
        <Link
          to="/auth/login"
          className="font-medium text-accent-hover underline underline-offset-2 hover:text-white"
        >
          로그인
        </Link>
        이 필요합니다.
      </p>
    );
  }

  return (
    <form className="mt-4" action={handleCommentAdd}>
      <div className="flex gap-4">
        <img
          src={user.profileImage}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <label htmlFor="comment-content" className="sr-only">
            댓글 작성
          </label>
          <textarea
            id="comment-content"
            placeholder={"Write a comment..."}
            className="w-full resize-none rounded-xl bg-card px-4 py-2.5 text-white placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-accent"
            rows={3}
            value={text}
            aria-invalid={!!error}
            aria-describedby={error ? "comment-error" : undefined}
            onChange={(e) => setText(e.target.value)}
          />
          {error && (
            <p
              id="comment-error"
              role="alert"
              className="mt-2 text-sm text-red-400"
            >
              {error}
            </p>
          )}
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="flex min-h-11 items-center gap-2 rounded-lg bg-accent-solid px-4 py-2 text-white transition-colors hover:bg-accent-solid-hover"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Comment
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
