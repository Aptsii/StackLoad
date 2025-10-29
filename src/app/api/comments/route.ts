import { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  createPagination,
} from "@/lib/api-response";
import {
  createCommentNotification,
  createCommentReplyNotification,
} from "@/lib/notification";
import type { Prisma } from "@prisma/client";

// GET /api/comments - 댓글 목록 조회 (특정 게시글)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const parentId = searchParams.get("parentId"); // 대댓글 조회용

    if (!postId) {
      return errorResponse("postId가 필요합니다.", 400);
    }

    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {
      postId: parseInt(postId),
    };

    // parentId가 있으면 대댓글 조회, 없으면 최상위 댓글만 조회
    if (parentId) {
      where.parentId = parseInt(parentId);
    } else {
      where.parentId = null;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              image: true,
              level: true,
            },
          },
          _count: {
            select: {
              replies: true,
              commentLikes: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const formattedComments = comments.map((comment) => ({
      ...comment,
      id: comment.id.toString(),
      postId: comment.postId.toString(),
      parentId: comment.parentId?.toString() || null,
      repliesCount: comment._count.replies,
      likesCount: comment._count.commentLikes,
    }));

    const pagination = createPagination(page, limit, total);

    return successResponse(formattedComments, 200, pagination);
  } catch (error) {
    console.error("댓글 목록 조회 오류:", error);
    return errorResponse("서버 오류가 발생했습니다.", 500);
  }
}

// POST /api/comments - 댓글 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return errorResponse("로그인이 필요합니다.", 401);
    }

    let userId: string;

    // 실제 세션이 있는 경우
    if (session.user.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (userExists) {
        userId = session.user.id;
        console.log("Using session user ID:", userId);
      } else {
        // 세션 ID가 데이터베이스에 없으면 이메일로 조회
        if (session.user.email) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
          });

          if (user) {
            userId = user.id;
            console.log("Found user by email:", userId);
          } else {
            // 새 사용자 생성
            const newUser = await prisma.user.create({
              data: {
                email: session.user.email,
                name: session.user.name || "Anonymous",
                image: session.user.image,
              },
            });
            userId = newUser.id;
            console.log("Created new user:", userId);
          }
        } else {
          return errorResponse("사용자 정보를 찾을 수 없습니다.", 401);
        }
      }
    } else if (session.user.email) {
      // 세션에 ID가 없으면 이메일로 조회하거나 생성
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        userId = user.id;
        console.log("Found user by email:", userId);
      } else {
        // 새 사용자 생성
        const newUser = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || "Anonymous",
            image: session.user.image,
          },
        });
        userId = newUser.id;
        console.log("Created new user:", userId);
      }
    } else {
      return errorResponse("사용자 정보를 찾을 수 없습니다.", 401);
    }
    const body = await request.json();
    const { postId, content, parentId } = body;

    if (!postId || !content) {
      return errorResponse("필수 필드가 누락되었습니다.", 400);
    }

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!post) {
      return errorResponse("게시글을 찾을 수 없습니다.", 404);
    }

    // 대댓글인 경우 부모 댓글 존재 확인
    let parentComment: {
      id: number;
      postId: number;
      authorId: string;
    } | null = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
        select: {
          id: true,
          postId: true,
          authorId: true,
        },
      });

      if (!parentComment) {
        return errorResponse("부모 댓글을 찾을 수 없습니다.", 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId: parseInt(postId),
        authorId: userId,
        content,
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            image: true,
            level: true,
          },
        },
        _count: {
          select: {
            replies: true,
            commentLikes: true,
          },
        },
      },
    });

    // 게시글의 댓글 수 증가
    await prisma.post.update({
      where: { id: parseInt(postId) },
      data: { commentsCount: { increment: 1 } },
    });

    // 대댓글인 경우 부모 댓글의 대댓글 수 증가
    if (parentId) {
      await prisma.comment.update({
        where: { id: parseInt(parentId) },
        data: { repliesCount: { increment: 1 } },
      });
    }

    // 알람 생성
    if (parentId && parentComment && parentComment.authorId !== userId) {
      // 대댓글인 경우 - 부모 댓글 작성자에게 알람
      await createCommentReplyNotification(
        parseInt(postId),
        userId,
        parentComment.authorId,
        post.title,
        comment.id
      );
    } else if (!parentId && post.authorId !== userId) {
      // 일반 댓글인 경우 - 게시글 작성자에게 알람
      await createCommentNotification(
        parseInt(postId),
        userId,
        post.title,
        post.authorId,
        comment.id
      );
    }

    const formattedComment = {
      ...comment,
      id: comment.id.toString(),
      postId: comment.postId.toString(),
      parentId: comment.parentId?.toString() || null,
      repliesCount: comment._count.replies,
      likesCount: comment._count.commentLikes,
    };

    return successResponse(formattedComment, 201);
  } catch (error) {
    console.error("댓글 생성 오류:", error);
    return errorResponse("서버 오류가 발생했습니다.", 500);
  }
}
