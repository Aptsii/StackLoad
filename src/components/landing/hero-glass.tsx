"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { HeroSearch } from "@/components/landing/hero-search";

export function HeroGlass() {
  return (
    <section id="hero" className="relative py-32">
      {/* 배경 그라데이션 - 페이지 전체와 일치 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(1200px_600px_at_50%_-10%,oklch(0.95_0.06_260)_0%,transparent_60%)]" />
        <div
          className="absolute -inset-1 blur-3xl opacity-60 animate-[gradientMove_8s_ease-in-out_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, oklch(0.95 0.08 260), oklch(0.96 0.06 300), oklch(0.95 0.08 260))",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* 메인 제목 */}
          <div className="relative mb-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-wider text-gray-900 mb-4 leading-none">
              <span className="block opacity-90 animate-[slideInFromLeft_2s_ease-out_forwards] transform-gpu text-shadow-2xl">
                Stack
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-[slideInFromRight_2s_ease-out_forwards] opacity-80 transform-gpu">
                Load
              </span>
            </h1>

            {/* 부제목 */}
            <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2 animate-[fadeInUp_1s_ease-out_0.5s_both]">
              Developer Tech Stack Guide
            </p>
            <p className="text-lg text-gray-500 animate-[fadeInUp_1s_ease-out_0.7s_both]">
              방향을 제시하는 기술 스택 로드맵
            </p>
          </div>

          {/* 설명 텍스트 */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12 animate-[fadeInUp_1s_ease-out_0.9s_both]">
            <span className="inline-block animate-[bounceIn_0.8s_ease-out_1.2s_both]">
              탐색
            </span>
            <span className="mx-2 text-purple-600 animate-[pulse_2s_ease-in-out_infinite]">
              →
            </span>
            <span className="inline-block animate-[bounceIn_0.8s_ease-out_1.4s_both]">
              비교
            </span>
            <span className="mx-2 text-purple-600 animate-[pulse_2s_ease-in-out_infinite]">
              →
            </span>
            <span className="inline-block animate-[bounceIn_0.8s_ease-out_1.6s_both]">
              수집/학습
            </span>
            <span className="animate-[fadeIn_1s_ease-out_1.8s_both]">
              . 기술 의사결정의 모든 흐름을 한 곳에서.
            </span>
          </p>

          {/* 검색 영역 */}
          <div className="mb-16 flex justify-center">
            <HeroSearch />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/search">
                <Search className="size-5 mr-2" />
                전체 검색으로 이동
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 hover:border-white/60 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/community">
                <Sparkles className="size-5 mr-2" />
                커뮤니티 보기
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradientMove {
          0% {
            transform: translateY(-10%) rotate(0deg);
          }
          50% {
            transform: translateY(0%) rotate(180deg);
          }
          100% {
            transform: translateY(-10%) rotate(360deg);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.9;
          }
          25% {
            transform: translateY(-8px) scale(1.02);
            opacity: 1;
          }
          50% {
            transform: translateY(-12px) scale(1.05);
            opacity: 0.95;
          }
          75% {
            transform: translateY(-6px) scale(1.02);
            opacity: 1;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.9;
          }
        }

        @keyframes textGlow {
          0% {
            text-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
          }
          50% {
            text-shadow: 0 0 40px rgba(147, 51, 234, 0.6),
              0 0 60px rgba(59, 130, 246, 0.4);
          }
          100% {
            text-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
          }
        }

        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100vw) rotate(-15deg) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-10vw) rotate(-5deg) scale(0.9);
            opacity: 0.7;
          }
          80% {
            transform: translateX(5vw) rotate(2deg) scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: translateX(0) rotate(0deg) scale(1);
            opacity: 0.9;
          }
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(100vw) rotate(15deg) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(10vw) rotate(5deg) scale(0.9);
            opacity: 0.7;
          }
          80% {
            transform: translateX(-5vw) rotate(-2deg) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: translateX(0) rotate(0deg) scale(1);
            opacity: 0.8;
          }
        }

        @keyframes fadeInUp {
          0% {
            transform: translateY(30px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0.3) translateY(-20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) translateY(-10px);
            opacity: 0.8;
          }
          70% {
            transform: scale(0.9) translateY(5px);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
