import React, { useState } from 'react';
import { AppAccount } from '../types';
import {
  loginWithCredentials,
  registerNewAccount,
  DEFAULT_ACCOUNTS,
  BIS_SCHOOL_NAME,
} from '../utils/accounts';
import { sound } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import {
  GraduationCap,
  Sparkles,
  Lock,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (account: AppAccount) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGrade, setRegGrade] = useState<number>(1);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTeacherCode, setRegTeacherCode] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = loginWithCredentials(loginIdentifier, loginPassword, role);
    if (!result.success || !result.account) {
      sound.playWrong();
      setErrorMessage(result.message);
      return;
    }

    sound.playFanfare();
    fireCelebrationConfetti();
    setSuccessMessage(result.message);
    setTimeout(() => {
      onLoginSuccess(result.account!);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPop();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      sound.playWrong();
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dibuat!');
      return;
    }

    const result = registerNewAccount({
      fullName: regFullName,
      username: regUsername,
      password: regPassword,
      role,
      grade: role === 'siswa' ? regGrade : undefined,
      school: BIS_SCHOOL_NAME,
      teacherCode: role === 'guru' ? regTeacherCode : undefined,
    });

    if (!result.success || !result.account) {
      sound.playWrong();
      setErrorMessage(result.message);
      return;
    }

    sound.playFanfare();
    fireCelebrationConfetti();
    setSuccessMessage(result.message);
    setTimeout(() => {
      onLoginSuccess(result.account!);
    }, 800);
  };

  // Quick Demo Login helper
  const handleQuickDemo = (demoAccount: AppAccount) => {
    sound.playPop();
    setRole(demoAccount.role);
    setLoginIdentifier(demoAccount.username);
    setLoginPassword(demoAccount.password);
    setActiveTab('login');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4F7D32]/15 via-[#F8FAF6] to-[#FFD16A]/20 flex flex-col items-center justify-center p-3 sm:p-6 selection:bg-[#FFD16A]">
      {/* Container Box */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#F5B52E] overflow-hidden transition-all animate-fadeIn">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] p-6 text-white text-center relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#FFD16A]/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#4F7D32]/30 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border-2 border-[#FFD16A] mb-3">
              <img
                src="/school-logo.png"
                alt="Logo SDIT Balikpapan Islamic School"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://bis.sch.id/storage/uploads/footer/LOGO-6A0AD9E758BB5.png';
                }}
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-kids tracking-wide text-white drop-shadow-sm">
              Game Edu Bis
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#FFD16A] mt-0.5 tracking-wide">
              SDIT Balikpapan Islamic School
            </p>
            <p className="text-[11px] text-white/90 mt-1 font-medium max-w-xs">
              Portal Masuk Resmi & Pembelajaran Interaktif Terbatas per Kelas
            </p>
          </div>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="flex border-b-2 border-slate-100 bg-slate-50/80">
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold font-kids transition flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-[#4F7D32] border-b-2 border-[#4F7D32] shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Masuk ke Akun</span>
          </button>
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold font-kids transition flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-[#4F7D32] border-b-2 border-[#4F7D32] shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Daftar Akun Baru</span>
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          {/* Role Switcher: Siswa vs Guru */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Pilih Peran Anda:</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setRole('siswa');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold font-kids transition flex items-center justify-center gap-1.5 ${
                  role === 'siswa'
                    ? 'bg-[#4F7D32] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🎒</span>
                <span>Siswa SD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setRole('guru');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold font-kids transition flex items-center justify-center gap-1.5 ${
                  role === 'guru'
                    ? 'bg-[#D9361E] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👨‍🏫</span>
                <span>Guru / Ustadz</span>
              </button>
            </div>
          </div>

          {/* Alert Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-[#D9361E] flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Alert Success Message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4F7D32] flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: FORM MASUK (LOGIN) */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {role === 'siswa' ? 'Nama Lengkap / Panggilan Siswa' : 'Nama Lengkap Guru / Username'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={role === 'siswa' ? 'Contoh: Alif Pratama atau alif' : 'Contoh: fatimah'}
                    className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#4F7D32] focus:bg-white text-slate-800 font-semibold transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="w-full px-4 py-2.5 pl-10 pr-10 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#4F7D32] focus:bg-white text-slate-800 font-semibold transition"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Informational Grade Constraint Badge */}
              <div className="p-3 bg-[#4F7D32]/5 border border-[#4F7D32]/20 rounded-2xl flex items-start gap-2 text-[11px] text-[#4F7D32]">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#4F7D32]" />
                <span>
                  <strong>Akses Terbatas:</strong> Siswa yang masuk hanya dapat membuka dan mengerjakan kuis untuk tingkat kelas yang telah terdaftar.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:brightness-105 active:scale-98 text-white font-black font-kids text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 border border-[#FFD16A]/50"
              >
                <span>Masuk ke Game Edu Bis</span>
                <ArrowRight className="w-4 h-4 text-[#FFD16A]" />
              </button>

              {/* Quick Demo Accounts Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[11px] font-bold text-slate-500 mb-2 text-center">
                  ⚡ Coba Akun Siap Pakai (Klik untuk Isi Otomatis):
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {DEFAULT_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickDemo(acc)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border ${
                        acc.role === 'guru'
                          ? 'bg-[#D9361E]/10 border-[#D9361E]/30 text-[#D9361E] hover:bg-[#D9361E]/20'
                          : 'bg-[#4F7D32]/10 border-[#4F7D32]/30 text-[#4F7D32] hover:bg-[#4F7D32]/20'
                      }`}
                      title={`Username: ${acc.username} | Sandi: ${acc.password}`}
                    >
                      {acc.role === 'guru' ? '👨‍🏫 ' : '🎒 '}
                      {acc.fullName} {acc.grade ? `(Kls ${acc.grade})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: FORM DAFTAR AKUN BARU (REGISTER) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa / Guru:
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#4F7D32] focus:bg-white text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pengguna (Username untuk Login):
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="Contoh: farhan (huruf kecil)"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#4F7D32] focus:bg-white text-slate-800 font-semibold"
                />
              </div>

              {/* Class Grade Selector for Students */}
              {role === 'siswa' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Tingkat Kelas:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((gradeNum) => (
                      <button
                        key={gradeNum}
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setRegGrade(gradeNum);
                        }}
                        className={`py-2 rounded-xl text-xs font-black font-kids transition border-2 ${
                          regGrade === gradeNum
                            ? 'bg-[#4F7D32] text-white border-[#4F7D32] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#4F7D32]/40'
                        }`}
                      >
                        Kelas {gradeNum}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    * Siswa yang terdaftar di <strong>Kelas {regGrade}</strong> hanya dapat mengakses kuis khusus Kelas {regGrade}.
                  </p>
                </div>
              )}

              {/* Teacher Security Code */}
              {role === 'guru' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Keamanan Pendaftaran Guru:
                  </label>
                  <input
                    type="password"
                    required
                    value={regTeacherCode}
                    onChange={(e) => setRegTeacherCode(e.target.value)}
                    placeholder="Masukkan kode guru (bawaan: 1234 atau GURUBIS)"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#D9361E] focus:bg-white text-slate-800 font-semibold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Buat Kata Sandi:
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 3 karakter"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#4F7D32] focus:bg-white text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ulangi Kata Sandi:
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#4F7D32] focus:bg-white text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:brightness-105 active:scale-98 text-white font-black font-kids text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 border border-[#FFD16A]/50 mt-2"
              >
                <span>Daftar Akun & Langsung Masuk</span>
                <Sparkles className="w-4 h-4 text-[#FFD16A]" />
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100/80 text-center border-t border-slate-200">
          <p className="text-[11px] font-bold text-slate-500">
            SDIT Balikpapan Islamic School • Game Edu Bis
          </p>
        </div>
      </div>
    </div>
  );
};
