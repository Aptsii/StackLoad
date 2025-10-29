"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  MessageCircle,
  ThumbsUp,
  Reply,
  Edit,
  Trash2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    level: string;
  };
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  repliesCount: number;
  parentId: string | null;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<
    Record<string, number>
  >({});

  // 댓글 작성자인지 확인하는 함수
  const isCommentAuthor = (comment: Comment): boolean => {
    if (!session?.user?.id) return false;
    return comment.author.id === session.user.id;
  };

  // 로그인 상태 확인 함수
  const isLoggedIn = (): boolean => {
    return status === "authenticated" && !!session?.user;
  };

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data);
        // 좋아요 수 초기화
        const likeCounts: Record<string, number> = {};
        data.data.forEach((comment: Comment) => {
          likeCounts[comment.id] = comment.likesCount;
        });
        setCommentLikeCounts(likeCounts);
      }
    } catch (error) {
      console.error("댓글 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 대댓글 조회
  const fetchReplies = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/comments?postId=${postId}&parentId=${commentId}`
      );
      const data = await response.json();

      if (data.success) {
        setReplies((prev) => ({
          ...prev,
          [commentId]: data.data,
        }));
      }
    } catch (error) {
      console.error("대댓글 조회 오류:", error);
    }
  };

  // 새 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!isLoggedIn()) {
      alert("댓글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setComments((prev) => [...prev, data.data]);
        setNewComment("");
      } else {
        alert(data.message || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  // 대댓글 작성
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: replyContent.trim(),
          parentId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 대댓글 목록에 추가
        setReplies((prev) => ({
          ...prev,
          [parentId]: [...(prev[parentId] || []), data.data],
        }));

        // 부모 댓글의 repliesCount 증가
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentId
              ? { ...comment, repliesCount: comment.repliesCount + 1 }
              : comment
          )
        );

        setReplyContent("");
        setReplyingTo(null);

        // 대댓글 섹션 자동 확장
        setExpandedReplies((prev) => new Set(prev).add(parentId));
      }
    } catch (error) {
      console.error("대댓글 작성 오류:", error);
    }
  };

  // 댓글 수정
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? data.data : comment
          )
        );
        setEditingComment(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("댓글 수정 오류:", error);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
      }
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
    }
  };

  // 댓글 좋아요 토글
  const handleToggleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setCommentLikes((prev) => ({
          ...prev,
          [commentId]: data.data.liked,
        }));
        setCommentLikeCounts((prev) => ({
          ...prev,
          [commentId]: data.data.liked
            ? (prev[commentId] || 0) + 1
            : (prev[commentId] || 0) - 1,
        }));
      }
    } catch (error) {
      console.error("댓글 좋아요 토글 오류:", error);
    }
  };

  // 대댓글 토글
  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);

    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
      // 대댓글이 로드되지 않았다면 로드
      if (!replies[commentId]) {
        fetchReplies(commentId);
      }
    }

    setExpandedReplies(newExpanded);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const getUserInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          댓글 {comments.length}개
        </h3>
      </div>

      {/* 새 댓글 작성 */}
      {isLoggedIn() ? (
        <div className="space-y-3">
          <Textarea
            placeholder="댓글을 작성해주세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              size="sm"
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              댓글 작성
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/auth/signin")}
          >
            로그인하기
          </Button>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.author.image || undefined} />
                <AvatarFallback className="text-sm">
                  {getUserInitial(comment.author.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-900">
                    {comment.author.name}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {comment.author.level}
                  </span>
                  <span className="text-gray-500">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                  {comment.createdAt !== comment.updatedAt && (
                    <span className="text-gray-400 text-xs">(수정됨)</span>
                  )}
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditComment(comment.id)}
                        disabled={!editContent.trim()}
                      >
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingComment(null);
                          setEditContent("");
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                )}

                {/* 댓글 액션 버튼 */}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleToggleCommentLike(comment.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      commentLikes[comment.id]
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-gray-500 hover:text-blue-600"
                    }`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${
                        commentLikes[comment.id] ? "fill-current" : ""
                      }`}
                    />
                    <span>
                      {commentLikeCounts[comment.id] ?? comment.likesCount}
                    </span>
                  </button>

                  {isLoggedIn() && (
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      답글
                    </button>
                  )}

                  {comment.repliesCount > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      답글 {comment.repliesCount}개{" "}
                      {expandedReplies.has(comment.id) ? "숨기기" : "보기"}
                    </button>
                  )}

                  {/* 본인 댓글인 경우에만 수정/삭제 버튼 표시 */}
                  {isCommentAuthor(comment) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        수정
                      </button>

                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </>
                  )}
                </div>

                {/* 답글 작성 */}
                {replyingTo === comment.id && (
                  <div className="space-y-2 ml-4 border-l-2 border-gray-200 pl-4">
                    <Textarea
                      placeholder="답글을 작성해주세요..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        답글 작성
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}

                {/* 대댓글 목록 */}
                {expandedReplies.has(comment.id) && replies[comment.id] && (
                  <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
                    {replies[comment.id].map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={reply.author.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {getUserInitial(reply.author.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-gray-900">
                              {reply.author.name}
                            </span>
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {reply.author.level}
                            </span>
                            <span className="text-gray-500">
                              {formatTimeAgo(reply.createdAt)}
                            </span>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <button
                              onClick={() => handleToggleCommentLike(reply.id)}
                              className={`flex items-center gap-1 transition-colors ${
                                commentLikes[reply.id]
                                  ? "text-blue-600 hover:text-blue-700"
                                  : "text-gray-500 hover:text-blue-600"
                              }`}
                            >
                              <ThumbsUp
                                className={`w-3 h-3 ${
                                  commentLikes[reply.id] ? "fill-current" : ""
                                }`}
                              />
                              <span>
                                {commentLikeCounts[reply.id] ??
                                  reply.likesCount}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>아직 댓글이 없습니다.</p>
          <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
        </div>
      )}
    </div>
  );
}
