import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { qaController } from './qa.controller';
import {
  createAnswerSchema,
  createQuestionSchema,
  questionQuerySchema,
  updateAnswerSchema,
  updateQuestionSchema,
  voteAnswerSchema,
} from './qa.validator';

const router = Router();

// Questions
router.get(
  '/questions',
  optionalAuthenticate,
  validate({ query: questionQuerySchema }),
  qaController.getQuestions.bind(qaController),
);

router.post(
  '/questions',
  authenticate,
  validate({ body: createQuestionSchema }),
  qaController.createQuestion.bind(qaController),
);

router.get('/questions/:id', optionalAuthenticate, qaController.getQuestionById.bind(qaController));

router.put(
  '/questions/:id',
  authenticate,
  validate({ body: updateQuestionSchema }),
  qaController.updateQuestion.bind(qaController),
);

router.delete('/questions/:id', authenticate, qaController.deleteQuestion.bind(qaController));

// Answers
router.post(
  '/questions/:id/answers',
  authenticate,
  validate({ body: createAnswerSchema }),
  qaController.addAnswer.bind(qaController),
);

router.put(
  '/answers/:answerId',
  authenticate,
  validate({ body: updateAnswerSchema }),
  qaController.updateAnswer.bind(qaController),
);

router.delete('/answers/:answerId', authenticate, qaController.deleteAnswer.bind(qaController));

// Accept best answer
router.post('/answers/:answerId/accept', authenticate, qaController.toggleAcceptAnswer.bind(qaController));

// Vote on answer (upvote/downvote)
router.post(
  '/answers/:answerId/vote',
  authenticate,
  validate({ body: voteAnswerSchema }),
  qaController.voteAnswer.bind(qaController),
);

export const qaRoutes = router;
