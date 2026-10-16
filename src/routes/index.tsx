import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Default from "./layouts/Default";
import PostCreate from "./pages/posts/PostCreate";
import Login from "./pages/auth/Login";
import Posts from "./pages/posts/Posts";
import PostRead from "./pages/posts/PostRead";
import NotFoundPage from "./pages/NotFound";
import Kakao from "./pages/auth/callback/Kakao";
import Signup from "./pages/auth/Signup";
import EmailLogin from "./pages/auth/EmailLogin";
import { fetchuserData, redirectIfAuth, requireAuth } from "./loader/auth.loader";
import FullLoading from "../components/common/FullLoading";
import ErrorState from "../components/common/ErrorState";
import { fetchOverview, fetchPostModify, fetchPosts, fetchPostsDetail } from "./loader/post.loader";

const router = createBrowserRouter([
  {
    Component: Default,
    loader: fetchuserData,
    HydrateFallback: FullLoading,
    // 레이아웃 자체(loader 등)에서 난 오류는 레이아웃 밖에서 단독으로 보여준다
    errorElement: <ErrorState standalone />,
    children: [
      {
        // 자식 라우트 오류는 Header/Footer가 유지되는 레이아웃 안에서 보여준다
        errorElement: <ErrorState />,
        children: [
          {
            path: "",
            loader:fetchOverview,
            Component: Home,
          },
          {
            path: "/posts",
            loader:fetchPosts,
            Component: Posts,
          },
          {
            path: "/create-post",
            loader: requireAuth,
            Component: PostCreate,
          },
          {
            path: "/edit/:id",
            loader: fetchPostModify,
            Component: PostCreate,
          },
          {
            path: "/post/:id",
            loader : fetchPostsDetail,
            Component: PostRead,
          },
          {
            path: "/auth/login",
            loader: redirectIfAuth,
            Component: Login,
          },
          {
            path: "/auth/email-login",
            loader: redirectIfAuth,
            Component: EmailLogin,
          },
          {
            path: "/auth/signup",
            loader: redirectIfAuth,
            Component: Signup,
          },
          {
            path: "/auth/callback/kakao",
            loader: redirectIfAuth,
            Component: Kakao,
          },
          {
            path: "*",
            Component: NotFoundPage,
          },
        ],
      },
    ],
  },
]);

export default function Route() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
