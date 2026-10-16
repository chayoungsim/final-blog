import { Send } from "lucide-react";
import { Dispatch, SetStateAction, startTransition, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useParams } from "react-router";
import { axiosInstance } from "../../api/axios";

export default function CommentForm({
  addOptimisticComments,
  setComments,
}: {
  addOptimisticComments: (action: Comment) => void;
  setComments: Dispatch<SetStateAction<Comment[]>>;
}) {
  const params = useParams();
  const navigate = useNavigate();
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    }
  };

  const handleFocus = () => {
    if (!user) navigate("/auth/login");
  };
  return (
    <form className="mt-4" action={handleCommentAdd}>
      <div className="flex gap-4">
        {user && (
          <img
            src={user.profileImage}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <label htmlFor="comment-content" className="sr-only">
            댓글 작성
          </label>
          <textarea
            id="comment-content"
            placeholder={"Write a comment..."}
            className="w-full resize-none rounded-xl bg-card px-4 py-2.5 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={handleFocus}
          />
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-muted"
              disabled={!user}
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
