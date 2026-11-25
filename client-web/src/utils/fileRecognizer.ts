import { createWorker } from 'tesseract.js';

export interface RecognizedFileResult {
  type: 'image' | 'text' | 'document' | 'unknown';
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string;
  extractedText: string;
  previewUrl?: string;
  confidence?: number;
  status: 'idle' | 'processing' | 'success' | 'warning' | 'error';
  message: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function detectFileType(file: File): 'image' | 'text' | 'document' | 'unknown' {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (
    file.type.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'].includes(ext)
  ) {
    return 'image';
  }

  if (
    file.type.startsWith('text/') ||
    [
      '.txt',
      '.md',
      '.json',
      '.csv',
      '.log',
      '.js',
      '.ts',
      '.html',
      '.css',
      '.py',
      '.sql',
      '.xml',
    ].includes(ext)
  ) {
    return 'text';
  }

  if (['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls'].includes(ext)) {
    return 'document';
  }

  return 'unknown';
}

/**
 * Đọc nội dung file text thuần (txt, md, json, csv, code...)
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve((reader.result as string) || '');
    };
    reader.onerror = () => {
      reject(new Error('Không thể đọc tệp văn bản.'));
    };
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Nhận dạng ký tự và chữ viết từ hình ảnh qua OCR Tesseract
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number, stepText: string) => void,
): Promise<{ text: string; confidence: number }> {
  try {
    onProgress?.(10, 'Đang khởi tạo công cụ nhận dạng chữ (OCR)...');

    // Khởi tạo Tesseract worker (hỗ trợ cả tiếng Việt và tiếng Anh)
    let worker;
    try {
      worker = await createWorker(['vie', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.min(99, Math.round((m.progress || 0) * 80) + 15);
            onProgress?.(pct, `Đang nhận dạng chữ viết (${pct}%)...`);
          } else if (m.status === 'loading tesseract core') {
            onProgress?.(20, 'Đang nạp lõi xử lý hình ảnh...');
          } else if (m.status === 'loading language traineddata') {
            onProgress?.(35, 'Đang tải bộ từ điển tiếng Việt & tiếng Anh...');
          }
        },
      });
    } catch {
      // Fallback về 'eng' nếu vie gặp sự cố kết nối
      onProgress?.(25, 'Đang nạp bộ nhận dạng cơ bản...');
      worker = await createWorker('eng', 1);
    }

    onProgress?.(70, 'Đang phân tích và trích xuất chữ viết...');
    const result = await worker.recognize(file);
    await worker.terminate();

    const rawText = result.data?.text || '';
    const cleanText = rawText.trim();
    const confidence = Math.round(result.data?.confidence || 0);

    return {
      text: cleanText,
      confidence,
    };
  } catch (err) {
    console.warn('Lỗi nhận dạng ảnh OCR:', err);
    throw new Error('Không thể nhận dạng chữ trong ảnh. Vui lòng thử lại với ảnh rõ nét hơn.');
  }
}
