import { Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getErrorMessage } from '../api/client';
import { AdminLogItem, SystemSettingItem } from '../types/admin';

export function LogsSettingsPage() {
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [settings, setSettings] = useState<SystemSettingItem[]>([]);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    Promise.all([adminApi.listLogs({ page: 1, limit: 25 }), adminApi.listSettings()])
      .then(([logsRes, settingsRes]) => {
        setLogs(logsRes.data);
        setSettings(settingsRes);
        const initial: Record<string, string> = {};
        settingsRes.forEach((s) => {
          initial[s.key] = s.value;
        });
        setDraftValues(initial);
      })
      .catch((err) => setFeedback({ type: 'error', text: getErrorMessage(err) }))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = Object.entries(draftValues).map(([key, value]) => ({ key, value }));
      const updated = await adminApi.updateSettings(payload);
      setSettings(updated);
      const logsRes = await adminApi.listLogs({ page: 1, limit: 25 });
      setLogs(logsRes.data);
      setFeedback({ type: 'success', text: 'Đã lưu cấu hình hệ thống' });
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        Đang tải nhật ký và cấu hình...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-semibold">
            &times;
          </button>
        </div>
      )}

      {/* System Settings */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cấu hình Hệ thống (SystemSettings)
            </h2>
            <p className="text-xs text-slate-500">
              Tham số vận hành toàn hệ thống (bảo mật đăng nhập, giới hạn upload...)
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {settings.map((item) => (
              <div key={item.key} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700">
                  {item.key}
                </label>
                {item.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                )}
                <input
                  type="text"
                  value={draftValues[item.key] ?? ''}
                  onChange={(e) =>
                    setDraftValues((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Admin Logs */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Lịch sử thao tác Quản trị (AdminLogs)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Thời gian</th>
                <th className="px-5 py-3">Quản trị viên</th>
                <th className="px-5 py-3">Hành động</th>
                <th className="px-5 py-3">Đối tượng</th>
                <th className="px-5 py-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-5 py-3 text-xs font-semibold text-slate-800">
                    {log.admin.fullName}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-indigo-700">
                    {log.action}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-600">
                    {log.targetType} {log.targetId ? `#${log.targetId}` : ''}
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 font-mono text-xs text-slate-500">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
