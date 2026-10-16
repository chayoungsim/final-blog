import { Clock, Filter, TrendingUp } from "lucide-react";
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
      {/* Header: Title + Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Blog Posts</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 rounded-lg bg-card px-3">
            <Filter className="h-4 w-4 text-muted" aria-hidden="true" />
            <label htmlFor="post-category" className="sr-only">
              카테고리
            </label>
            <select
              id="post-category"
              className="min-h-11 flex-1 bg-transparent text-slate-300 focus:outline-none"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
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
                    ? "bg-accent text-white"
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
      </div>

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
