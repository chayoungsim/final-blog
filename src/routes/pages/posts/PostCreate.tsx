import axios from "axios";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { axiosInstance } from "../../../api/axios";
import { categories } from "../../../constants/categories";

type FormStateType = {
  title: string;
  category: string;
  thumbnail: string;
  content: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; //10MB

const fieldClass =
  "w-full min-h-11 rounded-lg bg-card px-4 py-2.5 text-white placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-accent aria-invalid:ring-2 aria-invalid:ring-red-400";
const labelClass = "mb-2 block text-sm font-medium text-slate-300";
const errorClass = "mt-1 text-sm text-red-400";

export default function PostCreate() {
  const navigate = useNavigate();

  const post: Post = useLoaderData();

  const [formState, setFormState] = useState<FormStateType>({
    title: "",
    category: "",
    thumbnail: "",
    content: "",
  });

  const [errorState, setErrorState] = useState<FormStateType>({
    title: "",
    category: "",
    thumbnail: "",
    content: "",
  });
  const [submitError, setSubmitError] = useState("");

  const [previewImage, setPreviewImage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChangeFormState = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormState((formState) => ({
      ...formState,
      [e.target.name]: e.target.value,
    }));
    setErrorState((errorState) => ({
      ...errorState,
      [e.target.name]: "",
    }));
  };

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowExtensions = ["png", "webp", "jpeg", "jpg"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase(); //***.jpg */

    if (!fileExtension || !allowExtensions.includes(fileExtension)) {
      setErrorState((errorState) => ({
        ...errorState,
        thumbnail: `허용된 이미지 확장자는 ${allowExtensions.join(", ")} 입니다.`,
      }));
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorState((errorState) => ({
        ...errorState,
        thumbnail: "이미지 용량은 10MB 이하로 해주세요.",
      }));
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setErrorState((errorState) => ({ ...errorState, thumbnail: "" }));
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFormAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    startTransition(async () => {
      try {
        // 폼 유효성 검사
        const newErrors: FormStateType = {} as FormStateType;

        if (!formState.title.trim()) newErrors.title = "Please enter a title";
        if (!formState.category.trim())
          newErrors.category = "Please select a category";

        if (!previewImage.trim())
          newErrors.thumbnail = "Please upload a thumbnail";
        if (!formState.content.trim())
          newErrors.content = "Please enter the content";

        if (Object.keys(newErrors).length > 0) {
          setErrorState(newErrors);
          return;
        }

        let thumbnail = post?.thumbnail || "";
        if (previewImage !== thumbnail) {
          const formData = new FormData();
          formData.append("file", previewImage);
          formData.append("upload_preset", "react_blog");
          const {
            data: { url },
          } = await axios.post(
            "https://api.cloudinary.com/v1_1/tlctmose/image/upload",
            formData,
          );
          thumbnail = url;
        }

        if (post) {
          //수정모드
          const { status } = await axiosInstance.put(`/posts/${post._id}`, {
            title: formState.title,
            category: formState.category,
            thumbnail: thumbnail,
            content: formState.content,
          });

          if (status === 200) {
            alert("Post updated");
            navigate("/post/" + post._id);
          }
        } else {
          //등록모드
          const { status } = await axiosInstance.post("/posts", {
            title: formState.title,
            category: formState.category,
            thumbnail: thumbnail,
            content: formState.content,
          });

          if (status === 201) {
            alert("Post added!");
            navigate("/");
          }
        }
      } catch (e) {
        console.error(e instanceof Error ? e.message : "unknown error");
        setSubmitError("게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    });
  };

  useEffect(() => {
    if (post) {
      setFormState({
        title: post.title,
        category: post.category,
        thumbnail: post.thumbnail,
        content: post.content,
      });
      setPreviewImage(post.thumbnail);
    }
  }, [post]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <title>Create a Post - Blog</title>
      <h1 className="mb-8 text-3xl font-bold text-white">
        Write {post ? "Modify" : "New"} Post
      </h1>

      <form className="space-y-6" onSubmit={handleFormAction} noValidate>
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={fieldClass}
            placeholder="Enter post title"
            aria-required="true"
            aria-invalid={!!errorState.title}
            aria-describedby={errorState.title ? "title-error" : undefined}
            value={formState.title}
            onChange={handleChangeFormState}
          />
          {errorState.title && (
            <p id="title-error" role="alert" className={errorClass}>
              {errorState.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            name="category"
            className={fieldClass}
            aria-required="true"
            aria-invalid={!!errorState.category}
            aria-describedby={errorState.category ? "category-error" : undefined}
            value={formState.category}
            onChange={handleChangeFormState}
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errorState.category && (
            <p id="category-error" role="alert" className={errorClass}>
              {errorState.category}
            </p>
          )}
        </div>

        <div>
          <span id="thumbnail-label" className={labelClass}>
            Featured Image
          </span>
          {/* 이미지 선택 후 화면 (미리보기) */}
          {previewImage ? (
            <div className="relative mb-4 aspect-video w-full">
              <img
                src={previewImage}
                alt="썸네일 미리보기"
                className="h-full w-full rounded-xl object-cover"
              />
              <button
                type="button"
                aria-label="이미지 제거"
                className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-danger text-white transition-colors hover:bg-red-600"
                onClick={() => setPreviewImage("")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl border-2 border-dashed border-slate-600 p-8 text-center transition-colors focus-within:border-accent hover:border-slate-500">
              {/* hidden 대신 sr-only를 써서 키보드 포커스를 받을 수 있게 한다 */}
              <input
                type="file"
                id="image"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                aria-labelledby="thumbnail-label"
                aria-required="true"
                aria-invalid={!!errorState.thumbnail}
                aria-describedby={
                  errorState.thumbnail ? "thumbnail-error" : "thumbnail-hint"
                }
                onChange={handleChangeImage}
              />
              <label
                htmlFor="image"
                className="flex cursor-pointer flex-col items-center"
              >
                <ImagePlus
                  className="mb-3 h-12 w-12 text-muted"
                  aria-hidden="true"
                />
                <span className="text-slate-300">Click to upload image</span>
                <span id="thumbnail-hint" className="mt-1 text-sm text-muted">
                  PNG, JPG up to 10MB
                </span>
              </label>
            </div>
          )}
          {errorState.thumbnail && (
            <p id="thumbnail-error" role="alert" className={errorClass}>
              {errorState.thumbnail}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="content" className={labelClass}>
            Content
          </label>
          <textarea
            id="content"
            name="content"
            className={`${fieldClass} min-h-80 resize-y`}
            placeholder="Write your post content here..."
            aria-required="true"
            aria-invalid={!!errorState.content}
            aria-describedby={errorState.content ? "content-error" : undefined}
            value={formState.content}
            onChange={handleChangeFormState}
          />
          {errorState.content && (
            <p id="content-error" role="alert" className={errorClass}>
              {errorState.content}
            </p>
          )}
        </div>

        {submitError && (
          <p
            role="alert"
            className="rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400"
          >
            {submitError}
          </p>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="flex min-h-11 items-center justify-center rounded-lg bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">처리 중</span>
              </>
            ) : post ? (
              "Modify Post"
            ) : (
              "Publish Post"
            )}
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg bg-slate-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-slate-600"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
