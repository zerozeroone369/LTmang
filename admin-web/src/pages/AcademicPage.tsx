import { Plus, Trash2 } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getErrorMessage } from '../api/client';
import { ClassItem, CourseItem, FacultyItem, MajorItem, SchoolItem } from '../types/admin';

export function AcademicPage() {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [majors, setMajors] = useState<MajorItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  // Quick add forms
  const [schoolForm, setSchoolForm] = useState({ code: '', name: '' });
  const [facultyForm, setFacultyForm] = useState({ schoolId: '', code: '', name: '' });
  const [majorForm, setMajorForm] = useState({ facultyId: '', code: '', name: '' });
  const [courseForm, setCourseForm] = useState({ schoolId: '', code: '', name: '' });
  const [classForm, setClassForm] = useState({ majorId: '', courseId: '', code: '', name: '' });

  const loadAll = useCallback(async () => {
    try {
      const [s, f, m, co, cl] = await Promise.all([
        adminApi.getSchools(),
        adminApi.getFaculties(),
        adminApi.getMajors(),
        adminApi.getCourses(),
        adminApi.getClasses(),
      ]);
      setSchools(s);
      setFaculties(f);
      setMajors(m);
      setCourses(co);
      setClasses(cl);
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddSchool = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createSchool(schoolForm);
      setSchoolForm({ code: '', name: '' });
      setFeedback({ type: 'success', text: 'Đã thêm Trường học' });
      await loadAll();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  const handleAddFaculty = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createFaculty({
        schoolId: Number(facultyForm.schoolId),
        code: facultyForm.code,
        name: facultyForm.name,
      });
      setFacultyForm({ schoolId: '', code: '', name: '' });
      setFeedback({ type: 'success', text: 'Đã thêm Khoa' });
      await loadAll();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  const handleAddMajor = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createMajor({
        facultyId: Number(majorForm.facultyId),
        code: majorForm.code,
        name: majorForm.name,
      });
      setMajorForm({ facultyId: '', code: '', name: '' });
      setFeedback({ type: 'success', text: 'Đã thêm Ngành học' });
      await loadAll();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  const handleAddCourse = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCourse({
        schoolId: Number(courseForm.schoolId),
        code: courseForm.code,
        name: courseForm.name,
      });
      setCourseForm({ schoolId: '', code: '', name: '' });
      setFeedback({ type: 'success', text: 'Đã thêm Khóa học' });
      await loadAll();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

  const handleAddClass = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createClass({
        majorId: Number(classForm.majorId),
        courseId: Number(classForm.courseId),
        code: classForm.code,
        name: classForm.name,
      });
      setClassForm({ majorId: '', courseId: '', code: '', name: '' });
      setFeedback({ type: 'success', text: 'Đã thêm Lớp học' });
      await loadAll();
    } catch (err) {
      setFeedback({ type: 'error', text: getErrorMessage(err) });
    }
  };

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Schools */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            1. Trường học ({schools.length})
          </h2>
          <form onSubmit={handleAddSchool} className="mb-4 flex gap-2">
            <input
              type="text"
              required
              placeholder="Mã (VD: DAU)"
              value={schoolForm.code}
              onChange={(e) => setSchoolForm((f) => ({ ...f, code: e.target.value }))}
              className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Tên trường..."
              value={schoolForm.name}
              onChange={(e) => setSchoolForm((f) => ({ ...f, name: e.target.value }))}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm
            </button>
          </form>
          <ul className="divide-y divide-slate-100 text-sm">
            {schools.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span>
                  <strong className="text-indigo-700">{s.code}</strong> — {s.name}
                </span>
                <button
                  type="button"
                  onClick={() => adminApi.deleteSchool(s.id).then(loadAll)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Faculties */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="mb-3 text-base font-bold text-slate-900">2. Khoa ({faculties.length})</h2>
          <form onSubmit={handleAddFaculty} className="mb-4 flex flex-wrap gap-2">
            <select
              required
              value={facultyForm.schoolId}
              onChange={(e) => setFacultyForm((f) => ({ ...f, schoolId: e.target.value }))}
              className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs"
            >
              <option value="">Chọn trường</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Mã khoa"
              value={facultyForm.code}
              onChange={(e) => setFacultyForm((f) => ({ ...f, code: e.target.value }))}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Tên khoa..."
              value={facultyForm.name}
              onChange={(e) => setFacultyForm((f) => ({ ...f, name: e.target.value }))}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm
            </button>
          </form>
          <ul className="divide-y divide-slate-100 text-sm">
            {faculties.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2">
                <span>
                  <strong className="text-indigo-700">{f.code}</strong> — {f.name}{' '}
                  <span className="text-xs text-slate-400">({f.school?.code})</span>
                </span>
                <button
                  type="button"
                  onClick={() => adminApi.deleteFaculty(f.id).then(loadAll)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Majors */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            3. Ngành học ({majors.length})
          </h2>
          <form onSubmit={handleAddMajor} className="mb-4 flex flex-wrap gap-2">
            <select
              required
              value={majorForm.facultyId}
              onChange={(e) => setMajorForm((f) => ({ ...f, facultyId: e.target.value }))}
              className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs"
            >
              <option value="">Chọn khoa</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} - {f.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Mã ngành"
              value={majorForm.code}
              onChange={(e) => setMajorForm((f) => ({ ...f, code: e.target.value }))}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Tên ngành..."
              value={majorForm.name}
              onChange={(e) => setMajorForm((f) => ({ ...f, name: e.target.value }))}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm
            </button>
          </form>
          <ul className="divide-y divide-slate-100 text-sm">
            {majors.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <span>
                  <strong className="text-indigo-700">{m.code}</strong> — {m.name}
                </span>
                <button
                  type="button"
                  onClick={() => adminApi.deleteMajor(m.id).then(loadAll)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Courses */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="mb-3 text-base font-bold text-slate-900">
            4. Khóa học ({courses.length})
          </h2>
          <form onSubmit={handleAddCourse} className="mb-4 flex flex-wrap gap-2">
            <select
              required
              value={courseForm.schoolId}
              onChange={(e) => setCourseForm((f) => ({ ...f, schoolId: e.target.value }))}
              className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs"
            >
              <option value="">Chọn trường</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Mã khóa (K23)"
              value={courseForm.code}
              onChange={(e) => setCourseForm((f) => ({ ...f, code: e.target.value }))}
              className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Tên khóa..."
              value={courseForm.name}
              onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm
            </button>
          </form>
          <ul className="divide-y divide-slate-100 text-sm">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>
                  <strong className="text-indigo-700">{c.code}</strong> — {c.name}
                </span>
                <button
                  type="button"
                  onClick={() => adminApi.deleteCourse(c.id).then(loadAll)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Classes */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <h2 className="mb-3 text-base font-bold text-slate-900">
          5. Lớp sinh hoạt ({classes.length})
        </h2>
        <form onSubmit={handleAddClass} className="mb-4 flex flex-wrap gap-2">
          <select
            required
            value={classForm.majorId}
            onChange={(e) => setClassForm((f) => ({ ...f, majorId: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
          >
            <option value="">Chọn ngành</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>
          <select
            required
            value={classForm.courseId}
            onChange={(e) => setClassForm((f) => ({ ...f, courseId: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
          >
            <option value="">Chọn khóa</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="Mã lớp (23CT1)"
            value={classForm.code}
            onChange={(e) => setClassForm((f) => ({ ...f, code: e.target.value }))}
            className="w-36 rounded-xl border border-slate-200 px-3 py-2 text-xs"
          />
          <input
            type="text"
            required
            placeholder="Tên lớp..."
            value={classForm.name}
            onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm lớp
          </button>
        </form>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-900">{c.code}</p>
                <p className="text-xs text-slate-500">
                  {c.name} &bull; {c.course?.code}
                </p>
              </div>
              <button
                type="button"
                onClick={() => adminApi.deleteClass(c.id).then(loadAll)}
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
