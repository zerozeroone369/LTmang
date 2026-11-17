import { SubjectItem } from './document';

export interface AnswerItem {
  id: number;
  questionId: number;
  authorId: number;
  content: string;
  isCorrect: boolean;
  upvotesCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    fullName: string;
    studentCode: string | null;
    avatarUrl: string | null;
  };
  userVote?: number; // 1 | -1 | 0
}

export interface QuestionItem {
  id: number;
  title: string;
  content: string;
  subjectId: number;
  authorId: number;
  tags: string | null;
  isSolved: boolean;
  viewsCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  subject: SubjectItem;
  author: {
    id: number;
    fullName: string;
    studentCode: string | null;
    avatarUrl: string | null;
  };
  answersCount?: number;
  answers?: AnswerItem[];
}

export interface CreateQuestionPayload {
  title: string;
  content: string;
  subjectId: number;
  tags?: string;
}
