"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Item = { slug: string; name: string; category?: string; logoUrl?: string };

export function HeroSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  // 타이핑 애니메이션 상태
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "기술을 검색해보세요!";

  // 기술별 로고 반환 함수 (기존 logoUrl 사용)
  const getTechLogo = (tech: Item) => {
    if (tech.logoUrl) {
      return (
        <img
          src={tech.logoUrl}
          alt={tech.name}
          className="w-10 h-10 object-contain"
        />
      );
    }

    // 기본 로고 (첫 글자)
    return (
      <span className="text-lg font-bold text-purple-600">
        {tech.name.charAt(0).toUpperCase()}
      </span>
    );
  };

  // 타이핑 애니메이션 효과
  useEffect(() => {
    if (!isTyping) return;

    const timer = setTimeout(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else {
        // 타이핑 완료 후 잠시 대기
        setTimeout(() => {
          setCurrentIndex(0);
          setDisplayText("");
        }, 2000);
      }
    }, 150); // 타이핑 속도 조절

    return () => clearTimeout(timer);
  }, [currentIndex, isTyping, fullText]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (open && !target.closest("[data-search-container]")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/techs");
        const jsonResponse = r.ok ? await r.json() : { data: [] };
        const extra: Item[] = jsonResponse.data || [];
        setItems(extra);
      } catch (error) {
        console.error("Error fetching techs:", error);
      }
    })();
  }, []);

  const fuse = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return new Fuse(items, {
      keys: ["name", "slug", "category"],
      threshold: 0.4,
    });
  }, [items]);
  const results = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return query && fuse
      ? fuse
          .search(query)
          .map((r) => r.item)
          .slice(0, 8)
      : items.slice(0, 8);
  }, [query, fuse, items]);

  console.log(items, results);
  return (
    <div className="relative w-full max-w-6xl mx-auto" data-search-container>
      {/* 검색창 */}
      <div className="relative group">
        {/* 검색 아이콘 */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
          <svg
            className="w-8 h-8 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Input
          placeholder="기술 검색 (예: Next.js, Kafka)"
          value={query || (isTyping ? displayText : "")}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setIsTyping(false); // 사용자가 타이핑하면 애니메이션 중지
          }}
          onFocus={() => {
            setOpen(true);
            setIsTyping(false); // 포커스 시 애니메이션 중지
          }}
          className="pl-20 pr-8 py-8 text-xl md:text-2xl lg:text-3xl rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100/50 focus:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
        />
      </div>

      {/* 검색 결과 드롭다운 */}
      {open && (
        <div className="absolute z-20 mt-3 w-full animate-in slide-in-from-top-2 duration-200">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl overflow-hidden pb-4">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>검색 결과</span>
                <span className="ml-auto text-xs text-gray-400">
                  {results.length}개
                </span>
              </div>
            </div>

            {/* 결과 목록 */}
            <div className="max-h-80 overflow-y-auto">
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((t) => (
                    <button
                      key={t.slug}
                      onClick={() => router.push(`/tech/${t.slug}`)}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        {/* 로고 영역 */}
                        <div className="w-12 h-12 flex items-center justify-center">
                          {getTechLogo(t)}
                        </div>

                        {/* 텍스트 영역 */}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                            {t.name}
                          </div>
                          {t.category && (
                            <div className="text-sm text-gray-500">
                              {t.category}
                            </div>
                          )}
                        </div>

                        {/* 화살표 */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg
                            className="w-5 h-5 text-purple-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    검색 결과가 없습니다
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    다른 키워드로 시도해보세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
