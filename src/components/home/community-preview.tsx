"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ArrowRight,
  Info,
  Code2,
  BookOpen,
  TrendingUp,
  User,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CommunityPost {
  id: string;
  type: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
}

interface CommunityStats {
  totalMembers: number;
  totalPosts: number;
  activeProjects: number;
  ongoingStudies: number;
}

interface CommunityPreviewProps {
  className?: string;
}

export function CommunityPreview({ className = "" }: CommunityPreviewProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    totalPosts: 0,
    activeProjects: 0,
    ongoingStudies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommunityData() {
      try {
        // 커뮤니티 게시글과 통계 데이터를 병렬로 가져오기
        const [postsResponse, usersResponse] = await Promise.all([
          fetch("/api/posts?limit=3&sortBy=popular"),
          fetch("/api/users?countOnly=true"),
        ]);

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          if (postsData.success && postsData.data) {
            setPosts(postsData.data);
          }
        }

        // 사용자 수 가져오기
        let totalMembers = 0;
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          totalMembers = usersData.success
            ? usersData.data?.count || usersData.count || 0
            : 0;
        }

        // 게시글 통계 계산
        const totalPostsResponse = await fetch("/api/posts?countOnly=true");
        let totalPosts = 0;
        let activeProjects = 0;
        let ongoingStudies = 0;

        if (totalPostsResponse.ok) {
          const totalPostsData = await totalPostsResponse.json();
          totalPosts = totalPostsData.success
            ? totalPostsData.data?.count || totalPostsData.count || 0
            : 0;
        }

        // 타입별 통계 계산
        const [projectsResponse, studiesResponse] = await Promise.all([
          fetch("/api/posts?type=project&status=recruiting&countOnly=true"),
          fetch("/api/posts?type=study&status=recruiting&countOnly=true"),
        ]);

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          activeProjects = projectsData.success
            ? projectsData.data?.count || projectsData.count || 0
            : 0;
        }

        if (studiesResponse.ok) {
          const studiesData = await studiesResponse.json();
          ongoingStudies = studiesData.success
            ? studiesData.data?.count || studiesData.count || 0
            : 0;
        }

        setStats({
          totalMembers,
          totalPosts,
          activeProjects,
          ongoingStudies,
        });
      } catch (error) {
        console.error("Failed to load community data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCommunityData();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <Code2 className="w-4 h-4" />;
      case "study":
        return <BookOpen className="w-4 h-4" />;
      case "mentoring":
        return <Info className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "study":
        return "bg-green-100 text-green-700 border-green-200";
      case "mentoring":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "프로젝트";
      case "study":
        return "스터디";
      case "mentoring":
        return "정보공유";
      default:
        return type;
    }
  };

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              활발한 커뮤니티
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              함께 성장하는 개발자들의 공간
            </p>
          </div>
        </div>
        <Link
          href="/community"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          커뮤니티 참여
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {loading ? "..." : stats.totalMembers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">총 회원수</div>
        </div>
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {loading ? "..." : stats.activeProjects}
          </div>
          <div className="text-xs text-gray-600">모집 중인 프로젝트</div>
        </div>
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {loading ? "..." : stats.ongoingStudies}
          </div>
          <div className="text-xs text-gray-600">모집 중인 스터디</div>
        </div>
        <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
          <div className="text-2xl font-bold text-pink-600 mb-1">
            {loading ? "..." : stats.totalPosts}
          </div>
          <div className="text-xs text-gray-600">전체 게시글</div>
        </div>
      </div>

      {/* Hot Posts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-800">인기 글</span>
        </div>

        {loading ? (
          // 로딩 스켈레톤
          [...Array(3)].map((_, index) => (
            <div
              key={index}
              className="group p-5 bg-white/40 rounded-xl border border-white/30 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                  <div className="flex gap-1 mb-3">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>아직 게시글이 없습니다.</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className={`block group p-5 bg-white/40 hover:bg-white/70 rounded-xl border border-white/30 hover:border-white/50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1 animate-in fade-in-50 slide-in-from-left-4`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  {post.author.image ? (
                    <Image
                      src={post.author.image}
                      alt={post.author.name}
                      width={36}
                      height={36}
                      className="rounded-full ring-2 ring-white shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">${post.author.name.charAt(
                            0
                          )}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">
                      {post.author.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${getTypeColor(post.type)} text-xs`}>
                      <span className="mr-1">{getTypeIcon(post.type)}</span>
                      {getTypeLabel(post.type)}
                    </Badge>
                    {post.likesCount > 10 && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                        🔥 인기
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                    {post.description.replace(/[#*`]/g, "").slice(0, 100)}
                    {post.description.length > 100 && "..."}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-md transition-colors cursor-pointer"
                      >
                        #{tag.name}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-400">
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {post.commentsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {post.viewsCount}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs px-3 py-1"
                    >
                      자세히 보기
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
        <h4 className="font-semibold text-gray-800 mb-2">
          아직 커뮤니티에 참여하지 않으셨나요?
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          동료들과 함께 프로젝트를 만들고, 스터디를 진행하며 성장해보세요!
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/community">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              커뮤니티 둘러보기
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">프로필 만들기</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
