type AdBannerProps = {
  size?: "small" | "large";
};
export default function AdBanner({ size = "large" }: AdBannerProps) {
  return (
    // 실제 광고가 들어오기 전까지는 자리표시일 뿐이라 보조기기에서는 숨긴다
    <div
      aria-hidden="true"
      className={`w-full bg-slate-800 rounded-lg flex items-center justify-center ${
        size === "large" ? "h-24" : "h-16"
      }`}
    >
      <p className="text-muted text-sm">Advertisement</p>
      <p className="text-muted text-xs pl-2">
        You can place ads {size === "large" ? "728x90" : "300x50"}
      </p>
    </div>
  );
}
