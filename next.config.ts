import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker prod 컨테이너용 standalone 출력 — .next/standalone에 server.js 생성
  output: "standalone",
  // 동시 dev 서버 실행용 — NEXT_DIST_DIR=.next-3031 같은 식으로 lockfile 분리
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return [
      // Phase 1.4 — 미시 학습 허브 라우트 단일화. 구 explain 직링은 새 분석 hub로 흡수.
      {
        source: "/q/infinity/explain/:sku",
        destination: "/q/analysis/:sku?from=library",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
