import { Construction } from 'lucide-react';

interface PlaceholderProps {
  moduleName: string;
  moduleOwner: string;
  description: string;
}

export function PlaceholderModulePage({ moduleName, moduleOwner, description }: PlaceholderProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-2xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Construction className="h-7 w-7" />
      </div>
      <span className="mt-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
        Phụ trách: {moduleOwner}
      </span>
      <h2 className="mt-2 text-lg font-bold text-slate-900">{moduleName}</h2>
      <p className="mt-1 max-w-md text-xs text-slate-500">{description}</p>
      <div className="mt-5 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
        Sẵn sàng tích hợp: Backend API & Auth Header đã được Tú Anh cấu hình chuẩn hóa trong{' '}
        <code className="text-blue-600">src/api/client.ts</code>.
      </div>
    </div>
  );
}
