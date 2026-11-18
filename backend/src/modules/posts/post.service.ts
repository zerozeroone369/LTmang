import { prisma } from '../../config/database';
import { AppError } from '../../utils/errors';
import { sendNotification } from '../notifications/notifications.service';
import { postRepository } from './post.repository';
import {
  CreateCommentInput,
  CreatePostInput,
  PostQueryInput,
  ReportPostInput,
  UpdatePostInput,
} from './post.validator';

export class PostService {
  async createPost(userId: number, input: CreatePostInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        schoolId: true,
        facultyId: true,
        majorId: true,
        courseId: true,
        classId: true,
      },
    });

    const schoolId = input.schoolId ?? user?.schoolId;
    const facultyId = input.facultyId ?? user?.facultyId;
    const majorId = input.majorId ?? user?.majorId;
    const courseId = input.courseId ?? user?.courseId;
    const classId = input.classId ?? user?.classId;

    const post = await postRepository.create({
      authorId: userId,
      title: input.title,
      content: input.content,
      category: input.category,
      scope: input.scope,
      mediaUrls: input.mediaUrls ? JSON.stringify(input.mediaUrls) : undefined,
      schoolId,
      facultyId,
      majorId,
      courseId,
      classId,
    });

    return {
      ...post,
      mediaUrls: input.mediaUrls || [],
      isLikedByMe: false,
    };
  }

  async getPosts(query: PostQueryInput, currentUserId?: number) {
    const skip = (query.page - 1) * query.limit;
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (query.category) where.category = query.category;
    if (query.scope) where.scope = query.scope;
    if (query.classId) where.classId = query.classId;
    if (query.facultyId) where.facultyId = query.facultyId;
    if (query.authorId) where.authorId = query.authorId;
    if (query.search) {
      where.OR = [{ title: { contains: query.search } }, { content: { contains: query.search } }];
    }

    const [total, rawPosts] = await Promise.all([
      postRepository.count(where),
      postRepository.findMany({
        where,
        skip,
        take: query.limit,
      }),
    ]);

    const posts = rawPosts.map((p) => {
      let mediaUrls: string[] = [];
      if (p.mediaUrls) {
        try {
          mediaUrls = JSON.parse(p.mediaUrls);
        } catch {
          mediaUrls = [];
        }
      }
      const isLikedByMe = currentUserId
        ? p.reactions.some((r) => r.userId === currentUserId)
        : false;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { reactions, ...rest } = p;
      return {
        ...rest,
        mediaUrls,
        isLikedByMe,
      };
    });

    return {
      posts,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getPostById(id: number, currentUserId?: number) {
    const post = await postRepository.findById(id);
    if (!post || post.status === 'DELETED') {
      throw AppError.notFound('Bài viết không tồn tại hoặc đã bị xóa');
    }

    let mediaUrls: string[] = [];
    if (post.mediaUrls) {
      try {
        mediaUrls = JSON.parse(post.mediaUrls);
      } catch {
        mediaUrls = [];
      }
    }

    const isLikedByMe = currentUserId
      ? post.reactions.some((r) => r.userId === currentUserId)
      : false;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reactions, ...rest } = post;
    return {
      ...rest,
      mediaUrls,
      isLikedByMe,
    };
  }

  async updatePost(id: number, userId: number, input: UpdatePostInput) {
    const post = await postRepository.findById(id);
    if (!post || post.status === 'DELETED') {
      throw AppError.notFound('Bài viết không tồn tại');
    }

    if (post.authorId !== userId) {
      throw AppError.forbidden('Bạn không có quyền chỉnh sửa bài viết này');
    }

    const updated = await postRepository.update(id, {
      title: input.title,
      content: input.content,
      category: input.category,
      scope: input.scope,
      mediaUrls: input.mediaUrls ? JSON.stringify(input.mediaUrls) : undefined,
    });

    let mediaUrls: string[] = [];
    if (updated.mediaUrls) {
      try {
        mediaUrls = JSON.parse(updated.mediaUrls);
      } catch {
        mediaUrls = [];
      }
    }

    return {
      ...updated,
      mediaUrls,
    };
  }

  async deletePost(id: number, userId: number, userRole: string) {
    const post = await postRepository.findById(id);
    if (!post || post.status === 'DELETED') {
      throw AppError.notFound('Bài viết không tồn tại');
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw AppError.forbidden('Bạn không có quyền xoá bài viết này');
    }

    await postRepository.delete(id);
    return { id, message: 'Đã xóa bài viết thành công' };
  }

  async toggleLike(postId: number, userId: number) {
    const post = await postRepository.findById(postId);
    if (!post || post.status !== 'ACTIVE') {
      throw AppError.notFound('Bài viết không tồn tại');
    }

    const existingReaction = await postRepository.findReaction(postId, userId);

    if (existingReaction) {
      await postRepository.deleteReaction(postId, userId);
      return {
        liked: false,
        likesCount: Math.max(0, post.likesCount - 1),
      };
    } else {
      await postRepository.createReaction(postId, userId, 'LIKE');
      return {
        liked: true,
        likesCount: post.likesCount + 1,
      };
    }
  }

  async addComment(postId: number, userId: number, input: CreateCommentInput) {
    const post = await postRepository.findById(postId);
    if (!post || post.status !== 'ACTIVE') {
      throw AppError.notFound('Bài viết không tồn tại');
    }

    if (input.parentId) {
      const parent = await postRepository.findCommentById(input.parentId);
      if (!parent || parent.postId !== postId) {
        throw AppError.badRequest('Bình luận gốc không hợp lệ hoặc không thuộc bài viết này');
      }
    }

    const comment = await postRepository.createComment({
      postId,
      authorId: userId,
      content: input.content,
      parentId: input.parentId,
    });

    if (post.authorId !== userId) {
      await sendNotification(post.authorId, 'new_comment', {
        title: 'Bài viết có bình luận mới',
        message: comment.content,
        referenceType: 'POST',
        referenceId: postId,
      });
    }

    return comment;
  }

  async getComments(postId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, comments] = await Promise.all([
      postRepository.countComments(postId),
      postRepository.findComments(postId, skip, limit),
    ]);

    return {
      comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async deleteComment(commentId: number, userId: number, userRole: string) {
    const comment = await postRepository.findCommentById(commentId);
    if (!comment) {
      throw AppError.notFound('Bình luận không tồn tại');
    }

    const post = await postRepository.findById(comment.postId);
    const isCommentAuthor = comment.authorId === userId;
    const isPostAuthor = post?.authorId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      throw AppError.forbidden('Bạn không có quyền xoá bình luận này');
    }

    await postRepository.deleteComment(commentId, comment.postId);
    return { id: commentId, message: 'Đã xóa bình luận thành công' };
  }

  async reportPost(postId: number, reporterId: number, input: ReportPostInput) {
    const post = await postRepository.findById(postId);
    if (!post || post.status === 'DELETED') {
      throw AppError.notFound('Bài viết không tồn tại');
    }

    if (post.authorId === reporterId) {
      throw AppError.badRequest('Bạn không thể báo cáo bài viết của chính mình');
    }

    const existingReport = await prisma.postReport.findFirst({
      where: {
        postId,
        reporterId,
        status: 'PENDING',
      },
    });

    if (existingReport) {
      throw AppError.badRequest('Bạn đã gửi báo cáo cho bài viết này và đang chờ duyệt');
    }

    const report = await postRepository.createReport({
      postId,
      reporterId,
      reason: input.reason,
      description: input.description,
    });

    return report;
  }
}

export const postService = new PostService();
