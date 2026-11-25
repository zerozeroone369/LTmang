import { NextFunction, Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/apiResponse';
import { postService } from './post.service';
import {
  CreateCommentInput,
  CreatePostInput,
  PostQueryInput,
  ReportPostInput,
  UpdatePostInput,
} from './post.validator';

export class PostController {
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth!.userId;
      const input = req.body as CreatePostInput;
      const post = await postService.createPost(userId, input);
      return sendCreated(res, post, 'Tạo bài viết thành công');
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query || {}) as unknown as PostQueryInput;
      const currentUserId = req.auth?.userId;
      const { posts, meta } = await postService.getPosts(query, currentUserId);
      return sendSuccess(res, posts, 'Danh sách bài viết', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const currentUserId = req.auth?.userId;
      const post = await postService.getPostById(id, currentUserId);
      return sendSuccess(res, post, 'Chi tiết bài viết');
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.auth!.userId;
      const input = req.body as UpdatePostInput;
      const post = await postService.updatePost(id, userId, input);
      return sendSuccess(res, post, 'Cập nhật bài viết thành công');
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const result = await postService.deletePost(id, userId, userRole);
      return sendSuccess(res, result, 'Xóa bài viết thành công');
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.id);
      const userId = req.auth!.userId;
      const result = await postService.toggleLike(postId, userId);
      const message = result.liked ? 'Đã thích bài viết' : 'Đã bỏ thích bài viết';
      return sendSuccess(res, result, message);
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.id);
      const userId = req.auth!.userId;
      const input = req.body as CreateCommentInput;
      const comment = await postService.addComment(postId, userId, input);
      return sendCreated(res, comment, 'Thêm bình luận thành công');
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.id);
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const { comments, meta } = await postService.getComments(postId, page, limit);
      return sendSuccess(res, comments, 'Danh sách bình luận', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = Number(req.params.commentId);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const result = await postService.deleteComment(commentId, userId, userRole);
      return sendSuccess(res, result, 'Xóa bình luận thành công');
    } catch (error) {
      next(error);
    }
  }

  async reportPost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = Number(req.params.id);
      const reporterId = req.auth!.userId;
      const input = req.body as ReportPostInput;
      const report = await postService.reportPost(postId, reporterId, input);
      return sendCreated(res, report, 'Đã gửi báo cáo vi phạm bài viết');
    } catch (error) {
      next(error);
    }
  }

  async uploadMedia(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp tải lên' });
      }
      const fileUrl = `/uploads/posts/${req.file.filename}`;
      return sendCreated(
        res,
        {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        'Tải tệp lên thành công',
      );
    } catch (error) {
      next(error);
    }
  }
}

export const postController = new PostController();
