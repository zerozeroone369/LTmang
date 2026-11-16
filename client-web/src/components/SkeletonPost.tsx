import React from 'react';

export const SkeletonPost: React.FC = () => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 bg-slate-200 rounded-md" />
            <div className="w-20 h-2.5 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="w-24 h-6 bg-slate-100 rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 pt-1">
        <div className="w-3/4 h-4 bg-slate-200 rounded-md" />
        <div className="w-full h-3 bg-slate-100 rounded-md" />
        <div className="w-5/6 h-3 bg-slate-100 rounded-md" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
        <div className="w-16 h-7 bg-slate-100 rounded-xl" />
        <div className="w-20 h-7 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
};
