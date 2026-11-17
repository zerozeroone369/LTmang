import {
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  FileCode,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { documentApi } from '../api/documentApi';
import { useAuth } from '../context/auth-context';
import { DocType, DocumentItem, SubjectItem } from '../types/document';
import { formatRelativeTime } from '../utils/formatTime';

const DOC_TYPES: { key: DocType | 'ALL'; label: string; color: string }[] = [
  { key: 'ALL', label: 'Tất cả', color: 'bg-slate-100 text-slate-700' },
  { key: 'SLIDE', label: 'Slide bài giảng', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'EXAM', label: 'Đề thi & Đáp án', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'EXERCISE', label: 'Bài tập', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'SYLLABUS', label: 'Đề cương', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { key: 'REFERENCE', label: 'Tham khảo', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedDocType, setSelectedDocType] = useState<DocType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'rating'>('newest');

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadSubjectId, setUploadSubjectId] = useState<number | ''>('');
  const [uploadDocType, setUploadDocType] = useState<DocType>('SLIDE');

  // Rating modal state
  const [ratingModalDoc, setRatingModalDoc] = useState<DocumentItem | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [selectedSubject, selectedDocType, sortBy]);

  const loadSubjects = async () => {
    try {
      const data = await documentApi.getSubjects();
      setSubjects(data);
    } catch {
      // ignore
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getDocuments({
        subjectId: selectedSubject ? Number(selectedSubject) : undefined,
        docType: selectedDocType !== 'ALL' ? selectedDocType : undefined,
        search: search.trim() || undefined,
        sortBy,
      });
      setDocuments(res.documents);
    } catch {
      toast.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Tệp quá lớn! Dung lượng tối đa cho phép là 20MB.');
        return;
      }
      setUploadFile(file);
      if (!uploadTitle) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setUploadTitle(nameWithoutExt);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Vui lòng chọn tệp tài liệu');
      return;
    }
    if (!uploadSubjectId) {
      toast.error('Vui lòng chọn môn học tương ứng');
      return;
    }
    if (!uploadTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề tài liệu');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file to server
      const fileRes = await documentApi.uploadFile(uploadFile);

      // 2. Create document record
      await documentApi.createDocument({
        title: uploadTitle.trim(),
        description: uploadDescription.trim() || undefined,
        docType: uploadDocType,
        subjectId: Number(uploadSubjectId),
        fileUrl: fileRes.fileUrl,
        fileName: fileRes.fileName,
        fileType: fileRes.fileType,
        fileSize: fileRes.fileSize,
      });

      toast.success('Đăng tải tài liệu thành công!');
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      loadDocuments();
    } catch {
      toast.error('Tải lên thất bại, vui lòng kiểm tra lại');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      const res = await documentApi.downloadDocument(doc.id);
      // Update download count locally
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, downloadsCount: res.downloadsCount } : d)),
      );

      // Trigger browser download
      const downloadUrl = res.fileUrl.startsWith('http')
        ? res.fileUrl
        : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${res.fileUrl}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', res.fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Đang tải xuống: ${res.fileName}`);
    } catch {
      toast.error('Không thể tải tệp về máy');
    }
  };

  const handleOpenRating = (doc: DocumentItem) => {
    setRatingModalDoc(doc);
    setRatingScore(doc.myRating || 5);
    setRatingComment('');
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalDoc) return;

    setSubmittingRating(true);
    try {
      const res = await documentApi.rateDocument(
        ratingModalDoc.id,
        ratingScore,
        ratingComment.trim() || undefined,
      );
      toast.success(`Đã đánh giá ${ratingScore} sao cho tài liệu!`);

      // Update locally
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === ratingModalDoc.id
            ? { ...d, avgRating: res.avgRating, ratingsCount: res.ratingsCount, myRating: ratingScore }
            : d,
        ),
      );
      setRatingModalDoc(null);
    } catch {
      toast.error('Đánh giá không thành công');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) return;
    try {
      await documentApi.deleteDocument(id);
      toast.success('Đã xóa tài liệu');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      toast.error('Không thể xóa tài liệu');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-6 w-6 text-rose-500" />;
    if (ext === 'docx' || ext === 'doc') return <FileText className="h-6 w-6 text-blue-500" />;
    if (ext === 'pptx' || ext === 'ppt') return <BookOpen className="h-6 w-6 text-amber-500" />;
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
    if (ext === 'zip' || ext === 'rar') return <FileCode className="h-6 w-6 text-purple-500" />;
    return <FileQuestion className="h-6 w-6 text-slate-500" />;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold tracking-wide uppercase backdrop-blur-sm">
                Module 4 — Huy (Full-stack)
              </span>
              <span className="flex items-center gap-1 text-xs text-blue-100">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-300" /> Dung lượng &lt; 20MB
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Kho Tài Liệu Học Tập
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Tra cứu và chia sẻ slide bài giảng, đề thi, đề cương môn học cùng cộng đồng sinh viên UniConnect.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-md transition hover:bg-blue-50 hover:shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4" /> Đăng tải tài liệu
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu theo tiêu đề, tên file..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs text-slate-800 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        {/* Filter by Subject & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" /> Môn học:
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : '')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                [{sub.code}] {sub.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'downloads' | 'rating')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="newest">Mới nhất</option>
            <option value="downloads">Lượt tải nhiều nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>

          <button
            type="button"
            onClick={loadDocuments}
            title="Làm mới"
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* DocType Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {DOC_TYPES.map((type) => {
          const isActive = selectedDocType === type.key;
          return (
            <button
              key={type.key}
              type="button"
              onClick={() => setSelectedDocType(type.key)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white p-5" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">Chưa có tài liệu nào</h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Không tìm thấy tài liệu phù hợp với bộ lọc. Hãy là người đầu tiên chia sẻ tài liệu môn học!
          </p>
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Đăng tải tài liệu ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div>
                {/* Header: DocType badge & Subject */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {doc.subject?.code}
                  </span>
                  <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {DOC_TYPES.find((t) => t.key === doc.docType)?.label || doc.docType}
                  </span>
                </div>

                {/* Title & file icon */}
                <div className="mt-3 flex items-start gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition group-hover:bg-blue-50">
                    {getFileIcon(doc.fileName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-800 transition group-hover:text-blue-600">
                      {doc.title}
                    </h3>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">{doc.fileName}</p>
                  </div>
                </div>

                {/* Description if any */}
                {doc.description && (
                  <p className="mt-2.5 line-clamp-2 text-xs text-slate-600">{doc.description}</p>
                )}
              </div>

              {/* Footer info & Actions */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium text-slate-700">{doc.uploader?.fullName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatRelativeTime(doc.createdAt)}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-600">{formatFileSize(doc.fileSize)}</span>
                </div>

                {/* Rating and Download Buttons */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRating(doc)}
                    className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                    title="Đánh giá sao cho tài liệu"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.avgRating > 0 ? doc.avgRating.toFixed(1) : 'Chưa có'}</span>
                    <span className="text-[10px] text-amber-600">({doc.ratingsCount || 0})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {user?.id === doc.uploaderId && (
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Xóa tài liệu của tôi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Tải về ({doc.downloadsCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload Document */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Đăng tải tài liệu học tập mới</h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tệp tài liệu (&lt;20MB)</label>
                <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-500 hover:bg-blue-50/50">
                  <UploadCloud className="h-8 w-8 text-blue-500" />
                  <p className="mt-2 text-xs font-medium text-slate-700">
                    {uploadFile ? (
                      <span className="font-bold text-blue-600">{uploadFile.name}</span>
                    ) : (
                      'Kéo thả hoặc bấm để chọn file (PDF, DOCX, PPTX, XLSX...)'
                    )}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-400">Tối đa 20MB theo quy định hệ thống</p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tiêu đề tài liệu *</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ví dụ: Đề thi cuối kỳ môn Lập trình mạng K23..."
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Subject & DocType */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Môn học *</label>
                  <select
                    value={uploadSubjectId}
                    onChange={(e) => setUploadSubjectId(e.target.value ? Number(e.target.value) : '')}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        [{sub.code}] {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Loại tài liệu</label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value as DocType)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="SLIDE">Slide bài giảng</option>
                    <option value="EXAM">Đề thi & Đáp án</option>
                    <option value="EXERCISE">Bài tập</option>
                    <option value="SYLLABUS">Đề cương</option>
                    <option value="REFERENCE">Tài liệu tham khảo</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Mô tả / Ghi chú</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Ghi chú thêm về nội dung tài liệu..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Đang tải lên...
                    </>
                  ) : (
                    'Đăng tải ngay'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rating Document */}
      {ratingModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Đánh giá tài liệu</h3>
              <button
                type="button"
                onClick={() => setRatingModalDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="mt-4 space-y-4">
              <p className="text-xs font-semibold text-slate-700">{ratingModalDoc.title}</p>

              {/* Star Rating Selection */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 transition hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= ratingScore
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-bold text-amber-600">
                {ratingScore === 5 && 'Tuyệt vời, tài liệu rất hữu ích!'}
                {ratingScore === 4 && 'Rất tốt, nội dung chuẩn!'}
                {ratingScore === 3 && 'Bình thường, có thể cải thiện'}
                {ratingScore === 2 && 'Cần bổ sung thêm thông tin'}
                {ratingScore === 1 && 'Nội dung chưa đầy đủ'}
              </p>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">Nhận xét (Tùy chọn)</label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Để lại lời cảm ơn hoặc đóng góp cho người đăng..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalDoc(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  {submittingRating ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
