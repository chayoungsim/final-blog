import { Clock, TrendingUp } from "lucide-react";
import PostCard from "../../../components/post/PostCard";
import AdBanner from "../../../components/common/AdBanner";
import Pagination from "../../../components/post/Pagination";

import { useLoaderData, useSearchParams } from "react-router";
import PostZero from "../../../components/post/PostZero";
import { categories } from "../../../constants/categories";

const sortOptions = [
  { value: "newest", label: "Latest", Icon: Clock },
  { value: "views", label: "Popular", Icon: TrendingUp },
];

// 빈 값은 "전체"를 뜻한다
const categoryOptions = ["", ...categories];

export default function Posts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { posts, pagination }: { posts: Post[]; pagination: Pagination } =
    useLoaderData();

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";

  // 정렬·카테고리가 바뀌면 이전 페이지 번호가 범위를 벗어날 수 있어 1페이지로 되돌린다
  const handleSortChange = (sort: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", sort);
    next.delete("page");
    setSearchParams(next);
  };

  const handleCategoryChange = (category: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("category", category);
    next.delete("page");
    setSearchParams(next);
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <title>Post Lists</title>
      {/* Header: Title + Sort */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Blog Posts</h1>

        <div
          role="group"
          aria-label="정렬 기준"
          className="flex gap-1 rounded-lg bg-card p-1"
        >
          {sortOptions.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={sort === value}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 transition-colors ${
                sort === value
                  ? "bg-accent-solid text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
              onClick={() => handleSortChange(value)}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리: 방향키로 옵션을 훑기만 해도 목록이 갱신되던 select 대신 버튼 그룹을 사용 (WCAG 3.2.2) */}
      <div
        role="group"
        aria-label="카테고리"
        className="mb-8 flex flex-wrap gap-2"
      >
        {categoryOptions.map((item) => (
          <button
            key={item || "all"}
            type="button"
            aria-pressed={category === item}
            className={`min-h-11 rounded-full px-4 text-sm transition-colors ${
              category === item
                ? "bg-accent-solid text-white"
                : "bg-card text-slate-300 hover:bg-slate-700"
            }`}
            onClick={() => handleCategoryChange(item)}
          >
            {item === "" ? "All" : item}
          </button>
        ))}
      </div>

      {/* 필터·정렬·페이지가 바뀌었을 때 결과를 알린다 */}
      <p role="status" className="sr-only">
        {posts ? `${posts.length}개의 게시글이 표시됩니다.` : ""}
      </p>

      {posts && posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} {...post} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.maxPage > 1 && (
            <Pagination
              pageRange={5}
              currentPage={page}
              maxPage={pagination.maxPage}
              onPageChange={(page: number) => handlePageChange(page)}
            />
          )}
        </>
      )}

      {posts && posts.length === 0 && (
        <PostZero
          selectedCategory={category}
          onShowAll={() => handleCategoryChange("")}
        />
      )}
      {/* Ad Banner */}
      <div className="mt-12">
        <AdBanner />
      </div>
    </div>
  );
}
