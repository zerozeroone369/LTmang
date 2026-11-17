import { NextFunction, Request, Response } from 'express';
import { sendCreated, sendSuccess } from '../../utils/apiResponse';
import { qaService } from './qa.service';
import {
  CreateAnswerInput,
  CreateQuestionInput,
  QuestionQueryInput,
  UpdateAnswerInput,
  UpdateQuestionInput,
  VoteAnswerInput,
} from './qa.validator';

export class QAController {
  async createQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.auth!.userId;
      const input = req.body as CreateQuestionInput;
      const question = await qaService.createQuestion(userId, input);
      return sendCreated(res, question, 'Đặt câu hỏi thành công');
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query || {}) as unknown as QuestionQueryInput;
      const { questions, meta } = await qaService.getQuestions(query);
      return sendSuccess(res, questions, 'Danh sách câu hỏi học thuật', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getQuestionById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const currentUserId = req.auth?.userId;
      const question = await qaService.getQuestionById(id, currentUserId);
      return sendSuccess(res, question, 'Chi tiết câu hỏi');
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const input = req.body as UpdateQuestionInput;
      const question = await qaService.updateQuestion(id, userId, userRole, input);
      return sendSuccess(res, question, 'Cập nhật câu hỏi thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const result = await qaService.deleteQuestion(id, userId, userRole);
      return sendSuccess(res, result, 'Xóa câu hỏi thành công');
    } catch (error) {
      next(error);
    }
  }

  async addAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const questionId = Number(req.params.id);
      const userId = req.auth!.userId;
      const input = req.body as CreateAnswerInput;
      const answer = await qaService.addAnswer(questionId, userId, input);
      return sendCreated(res, answer, 'Đăng câu trả lời thành công');
    } catch (error) {
      next(error);
    }
  }

  async updateAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const answerId = Number(req.params.answerId);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const input = req.body as UpdateAnswerInput;
      const answer = await qaService.updateAnswer(answerId, userId, userRole, input);
      return sendSuccess(res, answer, 'Cập nhật câu trả lời thành công');
    } catch (error) {
      next(error);
    }
  }

  async deleteAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const answerId = Number(req.params.answerId);
      const userId = req.auth!.userId;
      const userRole = req.auth!.role;
      const result = await qaService.deleteAnswer(answerId, userId, userRole);
      return sendSuccess(res, result, 'Xóa câu trả lời thành công');
    } catch (error) {
      next(error);
    }
  }

  async toggleAcceptAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const answerId = Number(req.params.answerId);
      const userId = req.auth!.userId;
      const result = await qaService.toggleAcceptAnswer(answerId, userId);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async voteAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const answerId = Number(req.params.answerId);
      const userId = req.auth!.userId;
      const input = req.body as VoteAnswerInput;
      const result = await qaService.voteAnswer(answerId, userId, input);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const qaController = new QAController();
