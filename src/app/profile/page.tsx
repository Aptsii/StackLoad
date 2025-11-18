"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  User,
  MapPin,
  Calendar,
  Edit,
  MessageSquare,
  Eye,
  Heart,
  Clock,
  BookOpen,
  Code2,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  avatarUrl?: string;
  bio?: string;
  level?: string;
  location?: string;
  postsCount?: number;
  likesReceivedCount?: number;
  commentsCount?: number;
  createdAt?: string;
  userTechs?: Array<{
    techId: number;
    proficiencyLevel: number;
    tech?: {
      id: number;
      name: string;
      category: string;
      slug: string;
    };
  }>;
}

interface Post {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

const PostTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "project":
      return <Code2 className="w-4 h-4" />;
    case "study":
      return <BookOpen className="w-4 h-4" />;
    case "mentoring":
      return <Info className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

const getPostTypeLabel = (type: string) => {
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

const getStatusLabel = (status: string) => {
  switch (status) {
    case "recruiting":
      return "모집중";
    case "inProgress":
      return "진행중";
    case "completed":
      return "완료";
    case "closed":
      return "마감";
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "recruiting":
      return "bg-green-100 text-green-800";
    case "inProgress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatJoinedDate = (dateValue?: string) => {
  if (!dateValue) return "-";

  const parsedDate = new Date(dateValue);
  return isNaN(parsedDate.getTime())
    ? "-"
    : parsedDate.toLocaleDateString("ko-KR");
};

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const joinedDate = formatJoinedDate(userProfile?.createdAt);
  const profileImage =
    userProfile?.image ||
    userProfile?.avatarUrl ||
    user?.image ||
    user?.avatarUrl ||
    "";

  // 프로필 저장 함수
  const handleSaveProfile = async (profileData: any) => {
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Fetch updated profile data to include tech stack
          const profileResponse = await fetch("/api/users/me");
          if (profileResponse.ok) {
            const profileResult = await profileResponse.json();
            if (profileResult.success) {
              setUserProfile(profileResult.data);
            }
          }
          setIsEditing(false);
          // 성공 메시지 표시 (선택사항)
          alert("프로필이 성공적으로 업데이트되었습니다!");
        }
      } else {
        alert("프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 저장 오류:", error);
      alert("프로필 저장 중 오류가 발생했습니다.");
    }
  };

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserProfile(result.data);
          }
        }
      } catch (error) {
        console.error("프로필 정보 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  // 사용자가 작성한 글 가져오기
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingPosts(true);
        const response = await fetch(`/api/posts?authorId=${user.id}&limit=20`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserPosts(result.data);
          }
        }
      } catch (error) {
        console.error("작성한 글 조회 실패:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-lg">
          <Loader2 className="w-5 h-5 animate-spin" />
          프로필을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 프로필 헤더 */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={userProfile?.name || user?.name || "프로필"}
                    width={120}
                    height={120}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {userProfile?.name || user?.name || "사용자"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {userProfile?.email || user?.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    프로필 편집
                  </Button>
                </div>

                {/* 부가 정보 */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {userProfile?.level && (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">{userProfile.level}</Badge>
                    </div>
                  )}
                  {userProfile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {userProfile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    가입일: {joinedDate}
                  </div>
                </div>

                {/* Bio */}
                {userProfile?.bio && (
                  <p className="mt-4 text-gray-700">{userProfile.bio}</p>
                )}

                {/* 통계 */}
                <div className="flex items-center gap-6 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userProfile?.postsCount || userPosts.length}
                    </div>
                    <div className="text-sm text-gray-600">작성한 글</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userProfile?.likesReceivedCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">받은 좋아요</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {userProfile?.commentsCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">작성한 댓글</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 기술 스택 섹션 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                기술 스택
              </CardTitle>
              <CardDescription>
                보유한 기술과 숙련도를 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile?.userTechs && userProfile.userTechs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfile.userTechs.map((userTech, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {userTech.tech?.name || "Unknown Tech"}
                        </h3>
                        {userTech.tech?.category && (
                          <Badge variant="outline" className="text-xs">
                            {userTech.tech.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">숙련도:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < userTech.proficiencyLevel
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm font-medium text-blue-600 ml-1">
                            {userTech.proficiencyLevel}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    아직 등록된 기술 스택이 없습니다.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Code2 className="w-4 h-4" />
                    기술 스택 추가하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 작성한 글 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                작성한 글
              </CardTitle>
              <CardDescription>
                내가 커뮤니티에 작성한 글들을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    글을 불러오는 중...
                  </div>
                </div>
              ) : userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/community/${post.id}`}
                      className="block p-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              post.type === "project"
                                ? "bg-blue-100 text-blue-700"
                                : post.type === "study"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            <PostTypeIcon type={post.type} />
                            {getPostTypeLabel(post.type)}
                          </div>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(post.status)}
                          >
                            {getStatusLabel(post.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {post.description.replace(/[#*`]/g, "").slice(0, 150)}
                        {post.description.length > 150 && "..."}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.viewsCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likesCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {post.commentsCount}
                          </div>
                        </div>
                        {post.updatedAt !== post.createdAt && (
                          <div className="text-xs text-gray-400">
                            수정됨:{" "}
                            {new Date(post.updatedAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">아직 작성한 글이 없습니다.</p>
                  <Link href="/community/create">
                    <Button className="mt-4">첫 글 작성하기</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 프로필 편집 다이얼로그 */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>프로필 편집</DialogTitle>
              <DialogDescription>
                프로필 정보를 수정하고 업데이트할 수 있습니다.
              </DialogDescription>
            </DialogHeader>
            {userProfile && (
              <ProfileEditForm
                userProfile={{
                  ...userProfile,
                  techStack:
                    userProfile.userTechs?.map((ut: any) => ({
                      name: ut.tech?.name || "",
                      category: ut.tech?.category || "",
                      level: ut.proficiencyLevel || 1,
                    })) || [],
                }}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
