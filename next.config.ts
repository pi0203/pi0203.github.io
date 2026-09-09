import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages는 정적 파일만 서빙한다. 서버 없이 HTML로 내보낸다.
  output: "export",
  // 디렉터리/index.html 형태로 내보내야 GitHub Pages가 주소를 제대로 찾는다.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
