import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker prod 컨테이너용 standalone 출력 — .next/standalone에 server.js 생성
  output: "standalone",
  // 동시 dev 서버 실행용 — NEXT_DIST_DIR=.next-3031 같은 식으로 lockfile 분리
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
