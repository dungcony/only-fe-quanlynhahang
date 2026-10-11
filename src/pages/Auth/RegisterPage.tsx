import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/authApi';
import type { ErrorResponse } from '@/utils/apiTypes';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // xử lý gửi yêu cầu đăng ký tài khoản
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // kiểm tra xác nhận mật khẩu khớp
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    // kiểm tra độ mạnh mật khẩu (bắt buộc gồm cả chữ và số, tối thiểu 8 ký tự)
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu 8 ký tự');
      return;
    }
    if (!passwordPattern.test(password)) {
      setErrorMessage('Mật khẩu phải chứa ít nhất một chữ cái và một chữ số');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.register({
        full_name: fullName,
        email,
        phone: phone ? phone : undefined,
        password,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorData = err as ErrorResponse;
      if (errorData?.error?.fields && errorData.error.fields.length > 0) {
        const fieldDetails = errorData.error.fields.map((f) => f.message).join('. ');
        setErrorMessage(fieldDetails);
      } else if (errorData?.error?.message) {
        setErrorMessage(errorData.error.message);
      } else {
        setErrorMessage('Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-balance">Đăng ký thành công!</h2>
          <p className="text-sm text-slate-600 mt-2 text-pretty">
            Tài khoản của bạn đã được khởi tạo. Vui lòng kiểm tra hộp thư email để xác thực tài khoản trước khi đăng nhập.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition"
            >
              Tiến hành Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition"
        >
          <ArrowLeft className="size-4" />
          <span>Về trang chủ</span>
        </Link>

        <div className="text-center mb-6">
          <div className="size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="size-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-balance">Tạo tài khoản mới</h2>
          <p className="text-sm text-slate-500 mt-1 text-pretty">
            Đăng ký tài khoản khách hàng để đặt bàn và tích điểm ưu đãi.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <span className="text-pretty">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <User className="size-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="size-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vidu@restaurant.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Số điện thoại (tùy chọn)
            </label>
            <div className="relative">
              <Phone className="size-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu (tối thiểu 8 ký tự, có chữ và số)
            </label>
            <div className="relative">
              <Lock className="size-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="size-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <UserPlus className="size-4" />
                <span>Đăng ký ngay</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-amber-600 hover:text-amber-700 transition">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

