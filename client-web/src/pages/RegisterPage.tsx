import { AlertCircle, GraduationCap, Lock, Mail, Phone, User } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/auth-context';
import { ClassItem, CourseItem, FacultyItem, MajorItem, SchoolItem } from '../types/auth';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Cascading Academic selections
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [faculties, setFaculties] = useState<FacultyItem[]>([]);
  const [majors, setMajors] = useState<MajorItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | undefined>(undefined);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | undefined>(undefined);
  const [selectedMajorId, setSelectedMajorId] = useState<number | undefined>(undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load initial schools
  useEffect(() => {
    authApi.getSchools().then((data) => {
      setSchools(data);
      if (data.length > 0) {
        setSelectedSchoolId(data[0].id);
      }
    });
  }, []);

  // When school changes, load faculties & courses
  useEffect(() => {
    if (!selectedSchoolId) return;
    authApi.getFaculties(selectedSchoolId).then((data) => {
      setFaculties(data);
      setSelectedFacultyId(data[0]?.id);
    });
    authApi.getCourses(selectedSchoolId).then((data) => {
      setCourses(data);
      setSelectedCourseId(data[0]?.id);
    });
  }, [selectedSchoolId]);

  // When faculty changes, load majors
  useEffect(() => {
    if (!selectedFacultyId) {
      setMajors([]);
      setSelectedMajorId(undefined);
      return;
    }
    authApi.getMajors(selectedFacultyId).then((data) => {
      setMajors(data);
      setSelectedMajorId(data[0]?.id);
    });
  }, [selectedFacultyId]);

  // When major or course changes, load classes
  useEffect(() => {
    if (!selectedMajorId && !selectedCourseId) {
      setClasses([]);
      setSelectedClassId(undefined);
      return;
    }
    authApi.getClasses({ majorId: selectedMajorId, courseId: selectedCourseId }).then((data) => {
      setClasses(data);
      setSelectedClassId(data[0]?.id);
    });
  }, [selectedMajorId, selectedCourseId]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  // Password strength check
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError(
        'Mật khẩu chưa đạt yêu cầu bảo mật (tối thiểu 8 ký tự, gồm hoa, thường, số, ký tự đặc biệt).',
      );
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        studentCode: studentCode.trim() || undefined,
        password,
        phone: phone.trim() || undefined,
        schoolId: selectedSchoolId,
        facultyId: selectedFacultyId,
        majorId: selectedMajorId,
        courseId: selectedCourseId,
        classId: selectedClassId,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Đăng ký tài khoản Sinh viên
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Tự động phân luồng vào cộng đồng Trường, Khoa, Ngành, Khóa và Lớp của bạn
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Họ và tên *</label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-xs outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mã sinh viên (MSSV)
              </label>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="2351220089"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Email sinh viên *
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten_mssv@dau.edu.vn"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-xs outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0905123456"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-xs outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cascading Dropdowns */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="mb-2 text-xs font-bold text-blue-900">
              Chọn không gian học tập (Cộng đồng trường học):
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">Trường</label>
                <select
                  value={selectedSchoolId ?? ''}
                  onChange={(e) => setSelectedSchoolId(Number(e.target.value) || undefined)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">Khoa</label>
                <select
                  value={selectedFacultyId ?? ''}
                  onChange={(e) => setSelectedFacultyId(Number(e.target.value) || undefined)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Ngành học
                </label>
                <select
                  value={selectedMajorId ?? ''}
                  onChange={(e) => setSelectedMajorId(Number(e.target.value) || undefined)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none"
                >
                  {majors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">Khóa</label>
                <select
                  value={selectedCourseId ?? ''}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value) || undefined)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                  Lớp sinh hoạt
                </label>
                <select
                  value={selectedClassId ?? ''}
                  onChange={(e) => setSelectedClassId(Number(e.target.value) || undefined)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-blue-700 outline-none"
                >
                  {classes.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.code} — {cl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Password with strength indicator */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Mật khẩu *</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-xs outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            {password && (
              <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                <span className={hasMinLength ? 'text-emerald-600' : 'text-slate-400'}>
                  {hasMinLength ? '✓' : '•'} Ít nhất 8 ký tự
                </span>
                <span className={hasUpper ? 'text-emerald-600' : 'text-slate-400'}>
                  {hasUpper ? '✓' : '•'} 1 chữ cái in hoa
                </span>
                <span className={hasNumber ? 'text-emerald-600' : 'text-slate-400'}>
                  {hasNumber ? '✓' : '•'} 1 chữ số
                </span>
                <span className={hasSpecial ? 'text-emerald-600' : 'text-slate-400'}>
                  {hasSpecial ? '✓' : '•'} 1 ký tự đặc biệt (@, #...)
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng ký'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản sinh viên?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
