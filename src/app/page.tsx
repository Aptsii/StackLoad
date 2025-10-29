import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";
import { InViewFade } from "@/components/inview";
import { HeroGlass } from "@/components/landing/hero-glass";
import { Ticker } from "@/components/landing/ticker";
import { TabsTrending } from "@/components/landing/tabs-trending";
import { TechCompaniesPreview } from "@/components/home/tech-companies-preview";
import { CommunityPreview } from "@/components/home/community-preview";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "conic-gradient(from 0deg, oklch(0.95 0.08 260), oklch(0.96 0.06 300), oklch(0.95 0.08 260))",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroGlass />

        <InViewFade>
          <Ticker />
        </InViewFade>

        <InViewFade>
          <TabsTrending />
        </InViewFade>

        {/* Section 4: 커뮤니티 */}
        <InViewFade>
          <section className="py-24">
            <CommunityPreview />
          </section>
        </InViewFade>

        {/* Section 5: 신뢰성 설명 */}
        <InViewFade>
          <section className="py-24 border-t">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  신뢰를 받는 이유
                </p>
                <h2 className="text-3xl font-bold">
                  의사결정 품질을 높이는 데이터와 워크플로
                </h2>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4" /> 대량 데이터 동기화
                    파이프라인
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4" /> 효율적인
                    검색/비교/컬렉션
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4" /> 기업-기술 양방향 연결
                  </li>
                </ul>
                <div className="mt-4 rounded-xl border p-4 bg-white/60 backdrop-blur">
                  <p className="text-sm font-medium">데이터 출처</p>
                  <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>공식 문서/레퍼런스(예: React/Next.js/Tailwind 등)</li>
                    <li>
                      StackShare 등 공개 레퍼런스(Trending/Top/New 섹션 참고)
                    </li>
                    <li>커뮤니티/블로그 큐레이션 및 수동 검수</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-2xl border p-6 bg-white/60 backdrop-blur">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="size-4" /> 업데이트 주기(예시)
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  {[
                    { k: "Sync", v: "매일" },
                    { k: "검수", v: "주 1회" },
                    { k: "피드백", v: "상시" },
                  ].map((m) => (
                    <div
                      key={m.k}
                      className="rounded-md border p-4 bg-white/70"
                    >
                      <div className="text-2xl font-bold">{m.v}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {m.k}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </InViewFade>
      </div>
    </div>
  );
}
