import React from 'react';
import { UserProfile } from '../types';
import { getLevelInfo } from '../utils/storage';
import { AvatarDisplay } from './AvatarDisplay';
import { sound } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Trophy,
  Award,
  Bell,
  Volume2,
  VolumeX,
  Download,
  WifiOff,
  Flame,
  Coins,
  Star,
  Sparkles,
  User as UserIcon,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { AppAccount } from '../types';

interface NavbarProps {
  user: UserProfile;
  currentUser?: { email?: string | null; displayName?: string | null } | null;
  activeAccount?: AppAccount | null;
  onLogout?: () => void;
  onOpenAvatar: () => void;
  onOpenLeaderboard: () => void;
  onOpenBadges: () => void;
  onOpenReminder: () => void;
  onOpenAuth: () => void;
  onOpenTeacher: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentUser,
  activeAccount,
  onLogout,
  onOpenAvatar,
  onOpenLeaderboard,
  onOpenBadges,
  onOpenReminder,
  onOpenAuth,
  onOpenTeacher,
  onToggleSound,
  isMuted,
}) => {
  const levelInfo = getLevelInfo(user.currentXp);
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#4F7D32]/20 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Child Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              sound.playPop();
              onOpenAvatar();
            }}
            className="relative group p-0.5 rounded-2xl border-2 border-[#F5B52E] bg-[#FFD16A]/20 shadow-sm hover:scale-105 transition active:scale-95 cursor-pointer"
            title="Klik untuk Kustomisasi Avatar!"
          >
            <AvatarDisplay avatar={user.avatar} size="sm" showPet={false} />
            <span className="absolute -bottom-1 -right-1 bg-[#D9361E] text-white rounded-full p-0.5 shadow-sm group-hover:rotate-12 transition">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* School Logo & Game Title */}
          <div className="flex items-center gap-2">
            <img
              src="/school-logo.png"
              alt="Logo SDIT Balikpapan Islamic School"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm flex-shrink-0"
              onError={(e) => {
                // fallback to remote if local fails
                (e.currentTarget as HTMLImageElement).src =
                  'https://bis.sch.id/storage/uploads/footer/LOGO-6A0AD9E758BB5.png';
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold font-kids text-[#4F7D32] tracking-wide whitespace-nowrap">
                  Game Edu Bis
                </h1>
                {activeAccount?.role === 'siswa' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#4F7D32] text-white shadow-xs">
                    🎒 Kelas {user.grade}
                  </span>
                ) : activeAccount?.role === 'guru' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D9361E] text-white shadow-xs">
                    👨‍🏫 Guru BIS
                  </span>
                ) : (
                  <span className="hidden lg:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F7D32]/10 text-[#4F7D32] border border-[#4F7D32]/30">
                    SDIT Balikpapan Islamic School
                  </span>
                )}
              </div>
              {/* Level Title Tag */}
              <span className="text-[11px] font-bold text-[#D9361E] block leading-tight">
                {activeAccount ? `${activeAccount.fullName} • ${levelInfo.title}` : levelInfo.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Level & XP Progression Bar */}
        <div className="hidden md:flex flex-col items-center flex-1 max-w-xs mx-4">
          <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-600 mb-0.5">
            <span className="text-[#4F7D32]">Level {levelInfo.level}</span>
            <span className="text-slate-500">
              {levelInfo.xpIntoLevel} / {levelInfo.xpRequiredForNext} XP
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#FFD16A] via-[#F5B52E] to-[#4F7D32] rounded-full transition-all duration-300"
              style={{ width: `${levelInfo.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Right Action Icons: Badges, Leaderboard, Reminder, Sound, PWA */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline Badge if disconnected */}
          {!isOnline && (
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold"
              title="Mode Offline Aktif - Game & Kuis Tetap Berjalan!"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline Aktif</span>
            </div>
          )}

          {/* Coins Pill */}
          <div className="flex items-center gap-1 bg-[#FFD16A]/20 px-2.5 py-1 rounded-2xl border border-[#FFD16A] text-slate-800 text-xs font-black font-kids">
            <Coins className="w-4 h-4 text-[#F5B52E] fill-[#F5B52E]" />
            <span>{user.coins}</span>
          </div>

          {/* Stars Pill */}
          <div className="flex items-center gap-1 bg-[#FFD16A]/20 px-2.5 py-1 rounded-2xl border border-[#FFD16A] text-slate-800 text-xs font-black font-kids">
            <Star className="w-4 h-4 text-[#F5B52E] fill-[#F5B52E]" />
            <span>{user.totalStars}</span>
          </div>

          {/* Badges Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenBadges();
            }}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-[#FFD16A]/30 hover:text-[#D9361E] text-slate-700 transition active:scale-95"
            title="Lencana Prestasi"
          >
            <Award className="w-5 h-5 text-[#F5B52E]" />
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenLeaderboard();
            }}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-[#4F7D32]/15 hover:text-[#4F7D32] text-slate-700 transition active:scale-95"
            title="Papan Peringkat"
          >
            <Trophy className="w-5 h-5 text-[#4F7D32]" />
          </button>

          {/* Student Account / Login Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenAuth();
            }}
            className={`p-2 rounded-2xl flex items-center gap-1.5 transition active:scale-95 ${
              currentUser
                ? 'bg-[#4F7D32]/10 text-[#4F7D32] hover:bg-[#4F7D32]/20 border border-[#4F7D32]/40'
                : 'bg-slate-100 text-[#4F7D32] hover:bg-[#4F7D32]/10 border border-[#4F7D32]/20'
            }`}
            title={activeAccount ? `Profil: ${activeAccount.fullName}` : (currentUser ? `Akun: ${currentUser.email}` : 'Masuk Akun Siswa')}
          >
            <UserIcon className="w-5 h-5 text-[#4F7D32]" />
            <span className="hidden sm:inline-block text-xs font-bold truncate max-w-[90px]">
              {activeAccount ? activeAccount.fullName.split(' ')[0] : (currentUser ? 'Akun Aktif' : 'Masuk')}
            </span>
          </button>

          {/* Teacher Mode Button (Only for Guru or shows restricted for students) */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenTeacher();
            }}
            className={`p-2 rounded-2xl border flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
              activeAccount?.role === 'guru'
                ? 'bg-[#D9361E] hover:bg-[#B92812] text-white border-[#D9361E]'
                : 'bg-slate-100 text-slate-600 hover:bg-[#D9361E]/10 border-slate-200'
            }`}
            title={activeAccount?.role === 'guru' ? 'Ruang Guru (Kelola Soal & Kuis)' : 'Ruang Guru (Khusus Guru / Butuh PIN)'}
          >
            <GraduationCap className={`w-5 h-5 ${activeAccount?.role === 'guru' ? 'text-[#FFD16A]' : 'text-slate-500'}`} />
            <span className="hidden md:inline-block text-xs font-bold font-kids">
              Ruang Guru
            </span>
          </button>

          {/* Ganti Akun / Logout Button */}
          {activeAccount && onLogout && (
            <button
              onClick={() => {
                sound.playPop();
                if (window.confirm(`Apakah ${activeAccount.fullName} ingin keluar / ganti akun?`)) {
                  onLogout();
                }
              }}
              className="p-2 rounded-2xl bg-red-50 hover:bg-red-100 text-[#D9361E] border border-red-200 transition active:scale-95 flex items-center gap-1"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4 text-[#D9361E]" />
              <span className="hidden xl:inline text-[11px] font-bold">Keluar</span>
            </button>
          )}

          {/* Daily Reminder Bell */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenReminder();
            }}
            className="relative p-2 rounded-2xl bg-slate-100 hover:bg-[#FFD16A]/30 hover:text-[#D9361E] text-slate-700 transition active:scale-95"
            title="Pengingat Belajar Harian"
          >
            <Bell className="w-5 h-5 text-[#F5B52E]" />
            {user.reminderSettings.enabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F7D32] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition active:scale-95"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-slate-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#4F7D32]" />
            )}
          </button>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={() => {
                sound.playPop();
                install();
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#FFD16A]" />
              <span>Pasang Aplikasi</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <Download className="w-3.5 h-3.5 text-[#4F7D32]" />
              <span>Pasang di iOS</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile XP Progress Bar */}
      <div className="md:hidden px-3 pb-2 pt-0.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
          <span className="text-[#4F7D32]">Level {levelInfo.level}</span>
          <span>
            {levelInfo.xpIntoLevel} / {levelInfo.xpRequiredForNext} XP
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-[#FFD16A] via-[#F5B52E] to-[#4F7D32] rounded-full transition-all duration-300"
            style={{ width: `${levelInfo.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-[#4F7D32]">
            <h3 className="text-lg font-bold font-kids text-[#4F7D32]">
              Pasang Game Edu Bis di iPhone / iPad 📱
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              1. Tekan tombol <strong>Bagikan (Share)</strong> di bar Safari bawah.<br />
              2. Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.<br />
              3. Aplikasi siap dibuka kapan saja bahkan tanpa kuota internet!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-2xl bg-[#4F7D32] hover:bg-[#3B5F25] py-2.5 text-xs font-bold text-white shadow"
            >
              Mengerti!
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
