export type DocType = 'SLIDE' | 'EXAM' | 'SYLLABUS' | 'EXERCISE' | 'REFERENCE';

export interface SubjectItem {
  id: number;
  code: string;
  name: string;
  facultyId: number | null;
  description: string | null;
  _count?: {
    documents: number;
    questions: number;
  };
}

export interface DocumentItem {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  docType: DocType;
  subjectId: number;
  uploaderId: number;
  downloadsCount: number;
  avgRating: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  subject: SubjectItem;
  uploader: {
    id: number;
    fullName: string;
    studentCode: string | null;
    avatarUrl: string | null;
  };
  myRating?: number | null;
  ratingsCount?: number;
  ratings?: {
    id: number;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      id: number;
      fullName: string;
      avatarUrl: string | null;
    };
  }[];
}

export interface CreateDocumentPayload {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  docType: DocType;
  subjectId: number;
}
