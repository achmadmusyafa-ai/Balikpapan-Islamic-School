import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { loginWithGoogle, logoutStudent, syncUserProfileToCloud } from '../lib/firebase';
import { sound } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import {
  LogIn,
  LogOut,
  UserCheck,
  School,
  X,
  Sparkles,
  CloudCheck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface StudentAuthModalProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile;
  onProfileUpdate: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  currentUser,
  userProfile,
  onProfileUpdate,
  onClose,
}) => {
  const [studentName, setStudentName] = useState(userProfile.name);
  const [schoolName, setSchoolName] = useState(userProfile.school || 'SDIT Balikpapan Islamic School');
  const [grade, setGrade] = useState(userProfile.grade || 3);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    sound.playPop();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        sound.playFanfare();
        fireCelebrationConfetti();
        // Update user profile with Google display name if available
        const newName = user.displayName || studentName;
        onProfileUpdate({ name: newName });
        // Sync profile immediately to cloud
        await syncUserProfileToCloud(
          {
            ...userProfile,
            name: newName,
          },
          user.uid
        );
      }
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      const errorCode = (err as { code?: string })?.code || '';
      const errorMsg = (err as { message?: string })?.message || '';

      if (errorCode.includes('unauthorized-domain') || errorMsg.includes('unauthorized-domain')) {
        setErrorMessage(
          'Domain belum didaftarkan di Firebase Console. Tambahkan "balikpapan-islamic-school.vercel.app" di menu Firebase Authentication > Settings > Authorized domains.'
        );
      } else if (errorCode.includes('popup-closed-by-user')) {
        setErrorMessage('Jendela login ditutup sebelum selesai. Silakan coba lagi.');
      } else {
        setErrorMessage('Gagal masuk dengan Google. Pastikan koneksi internet stabil dan jendela pop-up diizinkan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    sound.playPop();
    setIsLoading(true);
    try {
      await logoutStudent();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    sound.playPop();
    const updated = {
      name: studentName.trim() || 'Siswa BIS',
      school: schoolName.trim() || 'SDIT Balikpapan Islamic School',
      grade: Number(grade),
    };
    onProfileUpdate(updated);

    if (currentUser) {
      await syncUserProfileToCloud(
        {
          ...userProfile,
          ...updated,
        },
        currentUser.uid
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-[#F5B52E] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-inner">
              <img
                src="/school-logo.png"
                alt="Logo BIS"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://bis.sch.id/storage/uploads/footer/LOGO-6A0AD9E758BB5.png';
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold font-kids tracking-wide">
                Akun Siswa - Game Edu Bis
              </h2>
              <p className="text-xs text-[#FFD16A] font-medium">
                SDIT Balikpapan Islamic School
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Status Box */}
          {currentUser ? (
            <div className="p-4 bg-[#4F7D32]/10 rounded-2xl border-2 border-[#4F7D32]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#4F7D32] text-white flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-kids text-[#4F7D32]">
                      Tersambung ke Cloud!
                    </h4>
                    <p className="text-xs text-slate-600">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <button
                  disabled={isLoading}
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#D9361E]/40 hover:bg-[#D9361E]/10 text-[#D9361E] font-bold text-xs flex items-center gap-1 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
              <p className="text-[11px] text-[#4F7D32] font-semibold mt-2 flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5 text-[#4F7D32] flex-shrink-0" />
                <span>Skor, koin, level, dan avatar kamu tersinkron otomatis ke Firebase Firestore.</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-[#FFD16A]/20 rounded-2xl border-2 border-[#FFD16A]">
                <h4 className="text-sm font-bold font-kids text-slate-800 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F5B52E]" />
                  <span>Masuk untuk Sinkronisasi Cloud</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masuk dengan akun Google agar bintang, avatar, dan peringkatmu tidak hilang saat membuka game dari HP atau perangkat lain!
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-[#D9361E]/10 rounded-xl border border-[#D9361E]/30 text-xs text-[#D9361E] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#D9361E] flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 shadow-sm flex items-center justify-center gap-3 transition transform active:scale-98 text-slate-800 font-bold text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
              </button>
            </div>
          )}

          {/* Student Profile Info Inputs */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Biodata Siswa SDIT BIS
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Panggilan Siswa:
              </label>
              <input
                type="text"
                value={studentName}
                maxLength={50}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Muhammad Farhan"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#4F7D32] focus:outline-none text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Sekolah:
                </label>
                <input
                  type="text"
                  value={schoolName}
                  maxLength={60}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="SDIT Balikpapan Islamic School"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#4F7D32] focus:outline-none text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kelas SD:
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#4F7D32] focus:outline-none text-sm font-bold text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      Kelas {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="px-4 py-2 rounded-2xl text-slate-600 hover:bg-slate-200 font-bold text-xs sm:text-sm"
          >
            Tutup
          </button>
          <button
            onClick={handleSaveProfile}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FFD16A]" />
            <span>Simpan Biodata</span>
          </button>
        </div>
      </div>
    </div>
  );
};
