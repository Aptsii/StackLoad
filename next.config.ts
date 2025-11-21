import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  eslint: {
    // true로 하면 ESLint 에러가 있어도 빌드 계속 진행
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "assets.vercel.com" },
      // 기업 로고 호스트들 - 시드 데이터에서 사용
      { protocol: "https", hostname: "static.toss.im" }, // 토스
      { protocol: "https", hostname: "s.pstatic.net" }, // 네이버
      { protocol: "https", hostname: "t1.kakaocdn.net" }, // 카카오
      { protocol: "https", hostname: "www.woowahan.com" }, // 우아한형제들
      { protocol: "https", hostname: "assets.daangn.com" }, // 당근
      { protocol: "https", hostname: "scdn.line-apps.com" }, // 라인
      { protocol: "https", hostname: "image.coupangcdn.com" }, // 쿠팡
      { protocol: "https", hostname: "image.ohou.se" }, // 오늘의집
      { protocol: "https", hostname: "www.yanolja.com" }, // 야놀자
      { protocol: "https", hostname: "www.zigbang.com" }, // 직방
      // 사용자 아바터 이미지
      { protocol: "https", hostname: "images.unsplash.com" }, // Unsplash
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google profile images
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // GitHub avatars
      // 폴백용 안정적인 이미지 서비스
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "logo.clearbit.com" },
    ],
  },
};

export default nextConfig;
