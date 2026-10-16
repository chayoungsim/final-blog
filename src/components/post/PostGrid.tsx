import { Link } from "react-router";
import PostCard from "./PostCard";
import PostMainZero from "./PostMainZero";
// import PostMainZero from "./PostMainZero";

export default function PostGrid({
  title = "Posts", 
  posts = [],
  viewAllPosts ="/posts",
} : {
  title?:string;
  posts?:Post[];
  viewAllPosts?:string;
}) {

  if(posts.length === 0) return <PostMainZero title={title} />;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link
          to={viewAllPosts}
          className="inline-flex min-h-11 items-center text-sm text-accent-hover hover:text-white transition-colors"
        >
          View All Post
          {/* 같은 이름의 링크를 구분하기 위한 보조 텍스트 (보이는 글자를 포함해 2.5.3 충족) */}
          <span className="sr-only"> - {title}</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} {...post} headingLevel="h3" />
        ))}
      </div>
    </section>
  );
}
