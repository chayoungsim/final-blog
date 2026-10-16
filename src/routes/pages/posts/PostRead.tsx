import { useOptimistic, useState } from "react";
import { CalendarDays, Trash2, Pencil, Eye } from "lucide-react";
import AdBanner from "../../../components/common/AdBanner";
import PostGrid from "../../../components/post/PostGrid";
import DeleteConfirmModal from "../../../components/post/DeleteConfirmModal";
import CommentForm from "../../../components/comment/CommentForm";
import CommentComponent from "../../../components/comment/CommentComponent";
import { useLoaderData, useNavigate } from "react-router";
import { format } from "date-fns";
import { useAuthStore } from "../../../store/authStore";
import { axiosInstance } from "../../../api/axios";

export default function PostRead() {
  const navigate = useNavigate();
  const { post, relatedPosts }: { post: Post; relatedPosts: Post[] } =
    useLoaderData();
  const user = useAuthStore((state) => state.user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // loader 실패로 post가 null이어도 아래 "Post Not Found" 화면까지 도달하도록 안전하게 접근
  const [comments, setComments] = useState<Comment[]>(post?.comments ?? []);
  const [optimisticComments, addOptimisticComments] = useOptimistic<
    Comment[],
    Comment
  >(comments, (comment, value) => [...comment, value]);

  const deletePost = async () => {
    setIsDeleting(true);
    setErrorMessage("");
    try {
      await axiosInstance.delete("/posts/" + post._id);
      navigate("/");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "unknown error");
      setIsDeleting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setErrorMessage("");
    try {
      await axiosInstance.delete(`/posts/${post._id}/comments/${commentId}`);
      setComments((comments) =>
        comments.filter((comment) => comment._id !== commentId),
      );
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "unknown error");
    }
  };

  // 게시글이 없으면
  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center flex flex-col justify-center min-h-[calc(100vh-76px)]">
        <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
        <p className="text-muted">The post you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isAuthor = post.author._id === user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <title>{`${post.title} - Blog`}</title>
      <div className="max-w-4xl mx-auto">
        <article>
          <header>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <span className="inline-block rounded-md bg-accent px-3 py-1 text-sm font-semibold text-white">
                {post.category}
              </span>
              {isAuthor && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2 text-white transition-colors hover:bg-accent-hover"
                    onClick={() => navigate(`/edit/${post._id}`)}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="flex min-h-11 items-center gap-2 rounded-lg bg-danger px-4 py-2 text-white transition-colors hover:bg-red-600"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="mb-6 text-2xl font-bold leading-tight text-white lg:text-4xl">
              {post.title}
            </h1>

            <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center">
                <img
                  src={post.author.profileImage}
                  alt=""
                  className="mr-3 h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-white">
                    {post.author.nickname}
                  </p>
                  <div className="flex items-center text-sm text-muted">
                    <CalendarDays className="mr-1 h-4 w-4" aria-hidden="true" />
                    <time dateTime={new Date(post.createdAt).toISOString()}>
                      {format(new Date(post.createdAt), "yyyy-MM-dd HH:mm")}
                    </time>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted">
                <Eye className="mr-1 h-4 w-4" aria-hidden="true" />
                <span className="sr-only">조회수</span>
                <span>{post.viewCount}</span>
              </div>
            </div>
          </header>

          {errorMessage && !showDeleteConfirm && (
            <p
              role="alert"
              className="mb-6 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
            >
              {errorMessage}
            </p>
          )}

          <img
            src={post.thumbnail}
            alt=""
            className="mb-8 aspect-video w-full rounded-xl object-cover"
          />

          <div className="mb-12 max-w-[72ch] whitespace-pre-wrap break-words text-lg leading-relaxed text-slate-200">
            {post.content}
          </div>
        </article>

        {showDeleteConfirm && (
          <DeleteConfirmModal
            isPending={isDeleting}
            error={errorMessage}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setErrorMessage("");
            }}
            onConfirm={deletePost}
          />
        )}

        {/* Comments Section */}
        <section
          aria-labelledby="comments-heading"
          className="mt-8 border-t border-slate-700 pt-8"
        >
          <h2
            id="comments-heading"
            className="mb-8 text-2xl font-bold text-white"
          >
            Comments ({optimisticComments.length})
          </h2>

          <CommentForm
            addOptimisticComments={addOptimisticComments}
            setComments={setComments}
          />

          <ul className="mt-8 space-y-6">
            {optimisticComments.map((comment) => (
              <CommentComponent
                key={comment._id}
                deleteComment={deleteComment}
                {...comment}
              />
            ))}
          </ul>
        </section>

        <div className="my-12">
          <AdBanner />
        </div>

        <div className="mb-12">
          <PostGrid title="Related Posts" posts={relatedPosts} />
        </div>
      </div>
    </div>
  );
}
