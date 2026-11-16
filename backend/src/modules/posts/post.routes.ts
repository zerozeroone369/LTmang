import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { postController } from './post.controller';
import {
  createCommentSchema,
  createPostSchema,
  postQuerySchema,
  reportPostSchema,
  updatePostSchema,
} from './post.validator';

const router = Router();

router.get(
  '/',
  optionalAuthenticate,
  validate({ query: postQuerySchema }),
  postController.getPosts.bind(postController),
);

router.post(
  '/',
  authenticate,
  validate({ body: createPostSchema }),
  postController.createPost.bind(postController),
);

router.get('/:id', optionalAuthenticate, postController.getPostById.bind(postController));

router.put(
  '/:id',
  authenticate,
  validate({ body: updatePostSchema }),
  postController.updatePost.bind(postController),
);

router.delete('/:id', authenticate, postController.deletePost.bind(postController));

router.post('/:id/like', authenticate, postController.toggleLike.bind(postController));

router.post(
  '/:id/comments',
  authenticate,
  validate({ body: createCommentSchema }),
  postController.addComment.bind(postController),
);

router.get('/:id/comments', postController.getComments.bind(postController));

router.delete(
  '/:postId/comments/:commentId',
  authenticate,
  postController.deleteComment.bind(postController),
);

router.post(
  '/:id/report',
  authenticate,
  validate({ body: reportPostSchema }),
  postController.reportPost.bind(postController),
);

export const postRoutes = router;
