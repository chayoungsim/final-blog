import { format } from "date-fns";
import { CalendarDays, Eye } from "lucide-react";
import { Link } from "react-router";

export default function PostCard({
  _id,
  title,
  category,
  thumbnail,
  author,
  createdAt,
  viewCount,
}: Post) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-lg transition-transform duration-300 motion-safe:hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-video overflow-hidden">
        {/* 제목 링크와 중복되므로 보조기기에서는 숨기고 키보드 탭 순서에서도 제외 */}
        <Link to={`/post/${_id}`} tabIndex={-1} aria-hidden="true">
          <img
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={thumbnail}
          />
        </Link>
        <span className="absolute top-3 left-3 rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-white">
          {category}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <h2 className="line-clamp-2 text-lg font-bold text-white">
          <Link
            to={`/post/${_id}`}
            className="rounded transition-colors hover:text-accent-hover"
          >
            {title}
          </Link>
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-2">
            <img
              alt=""
              src={author.profileImage}
              className="size-6 shrink-0 rounded-full object-cover"
            />
            <span className="text-sm text-slate-300">{author.nickname}</span>
          </div>
          <div className="flex items-center text-xs text-muted">
            <Eye className="mr-1 h-3 w-3" aria-hidden="true" />
            <span className="sr-only">조회수</span>
            <span>{viewCount}</span>
          </div>
          <div className="flex items-center text-xs text-muted">
            <CalendarDays className="mr-1 h-3 w-3" aria-hidden="true" />
            <time dateTime={new Date(createdAt).toISOString()}>
              {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
}
