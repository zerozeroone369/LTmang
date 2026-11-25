import React, { useRef, useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  X,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  Paperclip,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, getErrorMessage } from '../api/client';
import {
  detectFileType,
  extractTextFromFile,
  extractTextFromImage,
  formatFileSize,
  RecognizedFileResult,
} from '../utils/fileRecognizer';

interface ContentFileDropzoneProps {
  onInsertContent: (text: string, mode: 'append' | 'replace') => void;
  mediaUrls: string[];
  onAddMediaUrl: (url: string) => void;
  onRemoveMediaUrl: (url: string) => void;
}

export const ContentFileDropzone: React.FC<ContentFileDropzoneProps> = ({
  onInsertContent,
  mediaUrls,
  onAddMediaUrl,
  onRemoveMediaUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<RecognizedFileResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processSelectedFile(e.target.files[0]);
      // Reset input value to allow re-selecting same file if needed
      e.target.value = '';
    }
  };

  const processSelectedFile = async (file: File) => {
    const fileType = detectFileType(file);
    const sizeStr = formatFileSize(file.size);

    setRecognizing(true);
    setProgressPercent(10);
    setProgressMessage(`Đang phân tích tệp ${file.name} (${sizeStr})...`);

    const resultTemplate: RecognizedFileResult = {
      type: fileType,
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: sizeStr,
      mimeType: file.type || 'application/octet-stream',
      extractedText: '',
      status: 'processing',
      message: 'Đang nhận dạng...',
    };
    setCurrentResult(resultTemplate);

    try {
      if (fileType === 'image') {
        // Tạo URL preview ảnh tạm thời phía client
        const previewUrl = URL.createObjectURL(file);
        resultTemplate.previewUrl = previewUrl;

        // 1. Upload ảnh lên backend để có thể đính kèm vào bài viết
        try {
          setProgressMessage('Đang tải ảnh lên hệ thống...');
          setProgressPercent(25);
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await apiClient.post('/posts/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data?.data?.url) {
            onAddMediaUrl(uploadRes.data.data.url);
          }
        } catch (uploadErr) {
          console.warn('Không thể upload ảnh lên server (dùng offline preview):', uploadErr);
        }

        // 2. Nhận dạng chữ OCR từ ảnh
        setProgressPercent(40);
        setProgressMessage('Đang quét OCR nhận dạng chữ viết trong hình ảnh...');
        const { text, confidence } = await extractTextFromImage(file, (pct, step) => {
          setProgressPercent(pct);
          setProgressMessage(step);
        });

        resultTemplate.extractedText = text;
        resultTemplate.confidence = confidence;
        resultTemplate.status = 'success';

        if (text.length > 0) {
          resultTemplate.message = `Đã nhận dạng thành công ${text.split(/\s+/).length} từ từ hình ảnh (Độ tin cậy: ${confidence}%).`;
          toast.success('Nhận dạng chữ trong ảnh thành công!', {
            description: `Trích xuất được ${text.split(/\s+/).length} từ. Bạn có thể chèn vào nội dung bài viết.`,
          });
          // Tự động chèn nếu nội dung đang trống
          onInsertContent(text, 'append');
        } else {
          resultTemplate.message =
            'Ảnh đã được đính kèm. Không tìm thấy văn bản rõ ràng trong ảnh.';
          toast.info('Đã đính kèm ảnh thành công', {
            description: 'Ảnh không chứa văn bản hoặc chữ mờ, đã lưu ảnh vào danh sách đính kèm.',
          });
        }
      } else if (fileType === 'text') {
        // Đọc file text trực tiếp
        setProgressPercent(50);
        setProgressMessage('Đang đọc nội dung văn bản...');
        const text = await extractTextFromFile(file);

        resultTemplate.extractedText = text;
        resultTemplate.status = 'success';
        resultTemplate.message = `Đã trích xuất ${text.length} ký tự từ tệp văn bản.`;

        toast.success('Đã nhận dạng nội dung tệp văn bản!', {
          description: `Đã nạp ${text.length} ký tự từ ${file.name}.`,
        });

        // Tự động chèn vào nội dung
        onInsertContent(text, 'append');
      } else {
        // File khác (pdf, docx, ...)
        setProgressPercent(80);
        resultTemplate.status = 'warning';
        resultTemplate.message = `Đã nhận diện tệp tài liệu ${file.name}. Khuyến nghị dùng file TXT, ảnh hoặc dán nội dung trực tiếp.`;
        toast.info(`Đã nhận diện tệp: ${file.name}`);
      }

      setProgressPercent(100);
      setCurrentResult({ ...resultTemplate });
    } catch (err) {
      console.error('Lỗi khi xử lý file:', err);
      const errMsg = getErrorMessage(err);
      resultTemplate.status = 'error';
      resultTemplate.message = errMsg;
      setCurrentResult({ ...resultTemplate });
      toast.error('Nhận dạng tệp không thành công', { description: errMsg });
    } finally {
      setRecognizing(false);
    }
  };

  const handleCopyText = async () => {
    if (!currentResult?.extractedText) return;
    try {
      await navigator.clipboard.writeText(currentResult.extractedText);
      setCopied(true);
      toast.success('Đã sao chép nội dung nhận dạng vào Clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép vào bộ nhớ đệm');
    }
  };

  return (
    <div className="space-y-3">
      {/* Nút bấm & Vùng Kéo thả / Đính kèm */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-3.5 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01]'
            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-indigo-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.txt,.md,.json,.csv,.log,.pdf,.docx,.doc"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            {recognizing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Nhận dạng nội dung thông minh</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                AI / OCR
              </span>
            </div>
            <div className="text-slate-500 text-[11px] truncate">
              Kéo thả hoặc chọn tệp chữ viết (.txt, .md) hoặc hình ảnh (.png, .jpg) để trích xuất tự
              động
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={recognizing}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer text-xs"
          >
            <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chọn tệp hoặc ảnh</span>
          </button>
        </div>
      </div>

      {/* Tiến trình nhận dạng chữ OCR */}
      {recognizing && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              {progressMessage || 'Đang nhận dạng tệp...'}
            </span>
            <span className="font-bold text-indigo-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-indigo-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Hộp kết quả nhận dạng nội dung */}
      {currentResult && currentResult.status !== 'processing' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                {currentResult.type === 'image' ? (
                  <ImageIcon className="w-4 h-4" />
                ) : currentResult.type === 'text' ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <FileCheck className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2 truncate">
                  <span>{currentResult.fileName}</span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {currentResult.fileSizeFormatted}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  {currentResult.status === 'success' ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đã nhận dạng
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {currentResult.message}
                    </span>
                  )}
                  {currentResult.confidence !== undefined && (
                    <span className="text-slate-400">
                      • Độ khớp OCR: {currentResult.confidence}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentResult(null)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Đóng kết quả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nếu có ảnh preview */}
          {currentResult.previewUrl && (
            <div className="relative group max-w-xs overflow-hidden rounded-xl border border-slate-200">
              <img
                src={currentResult.previewUrl}
                alt="Preview nhận dạng"
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                Ảnh đã đính kèm vào bài viết
              </div>
            </div>
          )}

          {/* Đoạn văn bản trích xuất được */}
          {currentResult.extractedText ? (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                <span>Nội dung chữ viết nhận dạng được:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copied ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div className="max-h-28 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed select-all">
                {currentResult.extractedText}
              </div>

              {/* Nút hành động đưa vào nội dung */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onInsertContent(currentResult.extractedText, 'append')}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Chèn thêm vào nội dung
                </button>
                <button
                  type="button"
                  onClick={() => onInsertContent(currentResult.extractedText, 'replace')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Thay thế toàn bộ nội dung
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {currentResult.message || 'Không có đoạn văn bản trích xuất nào.'}
            </p>
          )}
        </div>
      )}

      {/* Hiển thị danh sách ảnh / tệp đã đính kèm vào bài viết */}
      {mediaUrls.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tệp ảnh đính kèm bài viết ({mediaUrls.length}):</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {mediaUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl border border-slate-200 overflow-hidden shadow-xs bg-slate-100 w-24 h-24"
              >
                <img
                  src={url.startsWith('http') ? url : `http://localhost:4000${url}`}
                  alt={`Đính kèm ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback nếu ảnh không tải được
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveMediaUrl(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Xóa ảnh đính kèm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
