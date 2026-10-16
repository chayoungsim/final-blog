import { format } from "date-fns";
import { Trash } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function CommentComponent({
  _id,
  author,
  content,
  createdAt,
  deleteComment,
}: Comment & {
  deleteComment: (id: string) => void;
}) {
  const user = useAuthStore((state) => state.user);

  return (
    <li className="flex gap-4">
      <img
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        src={author.profileImage}
      />
      <div className="min-w-0 flex-1">
        <div className="rounded-xl bg-card p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <span className="font-medium text-white">{author.nickname}</span>
            <time
              dateTime={new Date(createdAt).toISOString()}
              className="text-sm text-muted"
            >
              {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}
            </time>
          </div>
          <p className="whitespace-pre-wrap break-words text-slate-300">
            {content}
          </p>
        </div>
        {author._id === user?.id && (
          <div className="mt-1 flex items-center gap-4">
            <button
              type="button"
              aria-label={`${author.nickname}님의 댓글 삭제`}
              className="flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-accent-hover"
              onClick={() => deleteComment(_id)}
            >
              <Trash className="h-4 w-4" aria-hidden="true" />
              삭제
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
