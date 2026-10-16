import { useMemo } from "react";

const baseButton =
  "h-11 rounded-lg bg-card text-slate-300 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-card";

export default function Pagination({
  pageRange = 5,
  currentPage,
  maxPage,
  onPageChange,
}: {
  pageRange?: number;
  currentPage: number;
  maxPage: number;
  onPageChange: (page: number) => void;
}) {
  const half = Math.floor(pageRange / 2);
  const pages = useMemo(() => {
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = Math.min(maxPage, pageRange);
    }

    if (end > maxPage) {
      end = maxPage;
      start = Math.max(1, maxPage - pageRange + 1);
    }
    const arr = [];
    for (let i = start; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  }, [currentPage, half, maxPage, pageRange]);

  return (
    <nav aria-label="페이지 이동" className="mt-12 flex flex-wrap justify-center gap-2">
      <button
        type="button"
        className={`${baseButton} px-4`}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          type="button"
          key={page}
          aria-label={`${page}페이지`}
          aria-current={page === currentPage ? "page" : undefined}
          className={
            page === currentPage
              ? "h-11 w-11 rounded-lg bg-accent-solid font-semibold text-white"
              : `${baseButton} w-11`
          }
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className={`${baseButton} px-4`}
        disabled={currentPage === maxPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}
