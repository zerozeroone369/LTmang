import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class QARepository {
  async createQuestion(data: Prisma.QuestionUncheckedCreateInput) {
    return prisma.question.create({
      data,
      include: {
        subject: true,
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findQuestionById(id: number) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        subject: true,
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                avatarUrl: true,
              },
            },
            votes: true,
          },
          orderBy: [{ isCorrect: 'desc' }, { upvotesCount: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });
  }

  async findQuestions(params: {
    where: Prisma.QuestionWhereInput;
    skip: number;
    take: number;
    orderBy: Prisma.QuestionOrderByWithRelationInput;
  }) {
    return prisma.question.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: {
        subject: true,
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { answers: true },
        },
      },
    });
  }

  async countQuestions(where: Prisma.QuestionWhereInput) {
    return prisma.question.count({ where });
  }

  async updateQuestion(id: number, data: Prisma.QuestionUpdateInput) {
    return prisma.question.update({
      where: { id },
      data,
      include: {
        subject: true,
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async deleteQuestion(id: number) {
    return prisma.question.delete({ where: { id } });
  }

  async incrementQuestionViews(id: number) {
    return prisma.question.update({
      where: { id },
      data: {
        viewsCount: { increment: 1 },
      },
    });
  }

  async createAnswer(data: Prisma.AnswerUncheckedCreateInput) {
    return prisma.answer.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        votes: true,
      },
    });
  }

  async findAnswerById(id: number) {
    return prisma.answer.findUnique({
      where: { id },
      include: {
        question: true,
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        votes: true,
      },
    });
  }

  async updateAnswer(id: number, data: Prisma.AnswerUpdateInput) {
    return prisma.answer.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
        votes: true,
      },
    });
  }

  async deleteAnswer(id: number) {
    return prisma.answer.delete({ where: { id } });
  }

  async setAnswerAccepted(questionId: number, answerId: number, isCorrect: boolean) {
    // If setting true, first unmark any existing correct answer for this question
    if (isCorrect) {
      await prisma.answer.updateMany({
        where: { questionId, isCorrect: true },
        data: { isCorrect: false },
      });
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: { isCorrect },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            studentCode: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update question solved status
    const hasCorrectAnswer = isCorrect
      ? true
      : (await prisma.answer.count({ where: { questionId, isCorrect: true } })) > 0;

    await prisma.question.update({
      where: { id: questionId },
      data: { isSolved: hasCorrectAnswer },
    });

    return updatedAnswer;
  }

  async findVote(answerId: number, userId: number) {
    return prisma.vote.findUnique({
      where: {
        answerId_userId: { answerId, userId },
      },
    });
  }

  async upsertVote(answerId: number, userId: number, value: number) {
    return prisma.vote.upsert({
      where: {
        answerId_userId: { answerId, userId },
      },
      create: {
        answerId,
        userId,
        value,
      },
      update: {
        value,
      },
    });
  }

  async deleteVote(answerId: number, userId: number) {
    return prisma.vote.delete({
      where: {
        answerId_userId: { answerId, userId },
      },
    });
  }

  async calculateAnswerVotes(answerId: number): Promise<number> {
    const aggregate = await prisma.vote.aggregate({
      where: { answerId },
      _sum: { value: true },
    });

    const score = aggregate._sum.value || 0;

    await prisma.answer.update({
      where: { id: answerId },
      data: { upvotesCount: score },
    });

    return score;
  }
}

export const qaRepository = new QARepository();
