import { Prisma } from '@prisma/client';
import { RoleName } from '../../constants/enums';
import { AppError } from '../../utils/errors';
import { documentRepository } from '../documents/document.repository';
import { sendNotification } from '../notifications/notifications.service';
import { qaRepository } from './qa.repository';
import {
  CreateAnswerInput,
  CreateQuestionInput,
  QuestionQueryInput,
  UpdateAnswerInput,
  UpdateQuestionInput,
  VoteAnswerInput,
} from './qa.validator';

export class QAService {
  async createQuestion(userId: number, input: CreateQuestionInput) {
    const subject = await documentRepository.findSubjectById(input.subjectId);
    if (!subject) {
      throw AppError.notFound('Môn học không tồn tại trong hệ thống');
    }

    const question = await qaRepository.createQuestion({
      title: input.title,
      content: input.content,
      subjectId: input.subjectId,
      authorId: userId,
      tags: input.tags,
      status: 'ACTIVE',
    });

    return question;
  }

  async getQuestions(query: QuestionQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.QuestionWhereInput = {
      status: 'ACTIVE',
    };

    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.isSolved !== undefined) where.isSolved = query.isSolved;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { content: { contains: query.search } },
        { tags: { contains: query.search } },
      ];
    }

    let orderBy: Prisma.QuestionOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'views') {
      orderBy = { viewsCount: 'desc' };
    } else if (query.sortBy === 'unanswered') {
      orderBy = { answers: { _count: 'asc' } };
    }

    const [total, rawQuestions] = await Promise.all([
      qaRepository.countQuestions(where),
      qaRepository.findQuestions({
        where,
        skip,
        take: query.limit,
        orderBy,
      }),
    ]);

    const questions = rawQuestions.map((q) => ({
      ...q,
      answersCount: q._count.answers,
    }));

    return {
      questions,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getQuestionById(id: number, currentUserId?: number) {
    const question = await qaRepository.findQuestionById(id);
    if (!question || question.status === 'DELETED') {
      throw AppError.notFound('Không tìm thấy câu hỏi');
    }

    // Increment view count asynchronously
    await qaRepository.incrementQuestionViews(id).catch(() => {});

    const formattedAnswers = question.answers.map((answer) => {
      let userVote = 0;
      if (currentUserId) {
        const found = answer.votes.find((v) => v.userId === currentUserId);
        if (found) userVote = found.value;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { votes, ...rest } = answer;
      return {
        ...rest,
        userVote,
      };
    });

    return {
      ...question,
      viewsCount: question.viewsCount + 1,
      answers: formattedAnswers,
      answersCount: formattedAnswers.length,
    };
  }

  async updateQuestion(id: number, userId: number, userRole: string, input: UpdateQuestionInput) {
    const question = await qaRepository.findQuestionById(id);
    if (!question || question.status === 'DELETED') {
      throw AppError.notFound('Không tìm thấy câu hỏi');
    }

    if (question.authorId !== userId && userRole !== RoleName.ADMIN) {
      throw AppError.forbidden('Bạn không có quyền chỉnh sửa câu hỏi này');
    }

    if (input.subjectId) {
      const subject = await documentRepository.findSubjectById(input.subjectId);
      if (!subject) throw AppError.notFound('Môn học không tồn tại');
    }

    const updated = await qaRepository.updateQuestion(id, input);
    return updated;
  }

  async deleteQuestion(id: number, userId: number, userRole: string) {
    const question = await qaRepository.findQuestionById(id);
    if (!question || question.status === 'DELETED') {
      throw AppError.notFound('Không tìm thấy câu hỏi');
    }

    if (question.authorId !== userId && userRole !== RoleName.ADMIN) {
      throw AppError.forbidden('Bạn không có quyền xóa câu hỏi này');
    }

    await qaRepository.deleteQuestion(id);
    return { success: true, message: 'Đã xóa câu hỏi thành công' };
  }

  async addAnswer(questionId: number, userId: number, input: CreateAnswerInput) {
    const question = await qaRepository.findQuestionById(questionId);
    if (!question || question.status !== 'ACTIVE') {
      throw AppError.notFound('Không tìm thấy câu hỏi để trả lời');
    }

    const answer = await qaRepository.createAnswer({
      questionId,
      authorId: userId,
      content: input.content,
    });

    if (question.authorId !== userId) {
      await sendNotification(question.authorId, 'new_answer', {
        title: 'Câu hỏi của bạn có câu trả lời mới',
        message: answer.content,
        referenceType: 'QUESTION',
        referenceId: questionId,
      });
    }

    return {
      ...answer,
      userVote: 0,
    };
  }

  async updateAnswer(answerId: number, userId: number, userRole: string, input: UpdateAnswerInput) {
    const answer = await qaRepository.findAnswerById(answerId);
    if (!answer) {
      throw AppError.notFound('Không tìm thấy câu trả lời');
    }

    if (answer.authorId !== userId && userRole !== RoleName.ADMIN) {
      throw AppError.forbidden('Bạn không có quyền chỉnh sửa câu trả lời này');
    }

    const updated = await qaRepository.updateAnswer(answerId, {
      content: input.content,
    });

    return updated;
  }

  async deleteAnswer(answerId: number, userId: number, userRole: string) {
    const answer = await qaRepository.findAnswerById(answerId);
    if (!answer) {
      throw AppError.notFound('Không tìm thấy câu trả lời');
    }

    if (answer.authorId !== userId && userRole !== RoleName.ADMIN) {
      throw AppError.forbidden('Bạn không có quyền xóa câu trả lời này');
    }

    await qaRepository.deleteAnswer(answerId);
    return { success: true, message: 'Đã xóa câu trả lời thành công' };
  }

  async toggleAcceptAnswer(answerId: number, userId: number) {
    const answer = await qaRepository.findAnswerById(answerId);
    if (!answer) {
      throw AppError.notFound('Không tìm thấy câu trả lời');
    }

    const question = await qaRepository.findQuestionById(answer.questionId);
    if (!question) {
      throw AppError.notFound('Không tìm thấy câu hỏi gốc');
    }

    // Only the question author can accept/unaccept an answer
    if (question.authorId !== userId) {
      throw AppError.forbidden('Chỉ người đặt câu hỏi mới có quyền xác nhận câu trả lời đúng');
    }

    const newAcceptedStatus = !answer.isCorrect;
    const updated = await qaRepository.setAnswerAccepted(question.id, answerId, newAcceptedStatus);

    return {
      answer: updated,
      isCorrect: newAcceptedStatus,
      message: newAcceptedStatus
        ? 'Đã chọn câu trả lời này là câu trả lời chính xác nhất'
        : 'Đã hủy đánh dấu câu trả lời chính xác',
    };
  }

  async voteAnswer(answerId: number, userId: number, input: VoteAnswerInput) {
    const answer = await qaRepository.findAnswerById(answerId);
    if (!answer) {
      throw AppError.notFound('Không tìm thấy câu trả lời');
    }

    if (answer.authorId === userId) {
      throw AppError.badRequest('Bạn không thể tự vote cho câu trả lời của chính mình');
    }

    const existingVote = await qaRepository.findVote(answerId, userId);

    let userVote = 0;
    if (existingVote) {
      if (existingVote.value === input.value) {
        // Toggle off: cancel existing vote
        await qaRepository.deleteVote(answerId, userId);
        userVote = 0;
      } else {
        // Change vote (e.g. from -1 to 1 or 1 to -1)
        await qaRepository.upsertVote(answerId, userId, input.value);
        userVote = input.value;
      }
    } else {
      // New vote
      await qaRepository.upsertVote(answerId, userId, input.value);
      userVote = input.value;
    }

    const score = await qaRepository.calculateAnswerVotes(answerId);

    return {
      answerId,
      score,
      userVote,
      message:
        userVote === 1
          ? 'Đã upvote câu trả lời (+1)'
          : userVote === -1
            ? 'Đã downvote câu trả lời (-1)'
            : 'Đã hủy vote',
    };
  }
}

export const qaService = new QAService();
