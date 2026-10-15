import React, { useState } from 'react';
import { UserProfile, DailyMission } from '../types';
import { sound } from '../utils/audio';
import {
  checkNotificationSupport,
  requestNotificationPermission,
  sendDailyReminderNotification,
} from '../utils/notifications';
import {
  Bell,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  Volume2,
  Award,
  Zap,
} from 'lucide-react';

interface DailyReminderModalProps {
  user: UserProfile;
  onUpdateSettings: (newSettings: UserProfile['reminderSettings'], updatedBadges?: string[]) => void;
  onClose: () => void;
}

export const DailyReminderModal: React.FC<DailyReminderModalProps> = ({
  user,
  onUpdateSettings,
  onClose,
}) => {
  const [reminderTime, setReminderTime] = useState(user.reminderSettings.reminderTime || '16:00');
  const [isEnabled, setIsEnabled] = useState(user.reminderSettings.enabled);
  const [soundEnabled, setSoundEnabled] = useState(user.reminderSettings.soundEnabled);
  const [testSent, setTestSent] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const predefinedTimes = [
    { label: 'Siang (13:00)', value: '13:00', desc: 'Selesai makan siang' },
    { label: 'Sore (16:00)', value: '16:00', desc: 'Waktu santai sore' },
    { label: 'Malam (19:00)', value: '19:00', desc: 'Belajar setelah makan malam' },
    { label: 'Malam Ceria (20:00)', value: '20:00', desc: 'Ulang pelajaran hari ini' },
  ];

  const handleRequestPermission = async () => {
    sound.playPop();
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionState('granted');
      setIsEnabled(true);
      sound.playFanfare();
      sendDailyReminderNotification(
        'Selamat! Notifikasi belajar Game Edu Bis sudah aktif. Kami siap mengingatkanmu belajar setiap hari! 🎒✨'
      );
    }
  };

  const handleTestNotification = () => {
    sound.playPop();
    setTestSent(true);
    sendDailyReminderNotification(
      'Hai Juara SDIT BIS! Ini adalah contoh pengingat kuis harian. Ayo belajar 5 menit dan raih bintang emasmu hari ini! ⭐'
    );
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleSave = () => {
    sound.playPop();
    const newSettings = {
      enabled: isEnabled,
      reminderTime,
      hasBrowserPermission: permissionState === 'granted',
      soundEnabled,
    };

    // Unlock "reminder_hero" badge if enabled
    const updatedBadges = [...user.unlockedBadges];
    if (isEnabled && !updatedBadges.includes('reminder_hero')) {
      updatedBadges.push('reminder_hero');
      sound.playFanfare();
    }

    onUpdateSettings(newSettings, updatedBadges);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-[#F5B52E] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner animate-wiggle">
              ⏰
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-kids tracking-wide">
                Pengingat Belajar Harian
              </h2>
              <p className="text-xs sm:text-sm text-[#FFD16A] font-medium">
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[460px] overflow-y-auto">
          {/* Daily Streak Status Card */}
          <div className="bg-[#FFD16A]/20 rounded-2xl p-4 border-2 border-[#FFD16A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9361E]/15 flex items-center justify-center text-2xl shadow-inner">
                🔥
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#D9361E] uppercase">
                  Streak Belajar Siswa
                </span>
                <h4 className="text-base font-black text-slate-800 font-kids">
                  {user.streakDays} Hari Berturut-turut!
                </h4>
                <p className="text-xs text-slate-500">
                  Konsisten belajar tiap hari untuk meraih lencana Anak Rajin!
                </p>
              </div>
            </div>
          </div>

          {/* Daily Missions Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4F7D32]" />
              <span>Misi Harian Hari Ini</span>
            </h4>
            <div className="space-y-2">
              {user.dailyMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between transition ${
                    mission.completed
                      ? 'bg-[#4F7D32]/10 border-[#4F7D32]/40'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        mission.completed ? 'bg-[#4F7D32] text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {mission.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{mission.currentCount}/{mission.targetCount}</span>
                      )}
                    </div>
                    <div>
                      <h5
                        className={`text-xs sm:text-sm font-bold font-kids ${
                          mission.completed ? 'text-[#4F7D32] line-through' : 'text-slate-800'
                        }`}
                      >
                        {mission.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold text-[#D9361E]">
                    +{mission.rewardCoins} 🪙
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alarm Reminder Time Selection */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#F5B52E]" />
                <span>Aktifkan Notifikasi Harian</span>
              </label>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => {
                  sound.playPop();
                  setIsEnabled(e.target.checked);
                }}
                className="w-5 h-5 accent-[#4F7D32] rounded cursor-pointer"
              />
            </div>

            {isEnabled && (
              <div className="space-y-3 bg-[#4F7D32]/5 p-4 rounded-2xl border border-[#4F7D32]/20 animate-fadeIn">
                <span className="text-xs font-semibold text-slate-600 block">
                  Pilih Waktu Pengingat Ideal:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedTimes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => {
                        sound.playPop();
                        setReminderTime(t.value);
                      }}
                      className={`p-2.5 rounded-xl border-2 text-left transition ${
                        reminderTime === t.value
                          ? 'border-[#4F7D32] bg-white shadow-sm font-bold'
                          : 'border-slate-200 bg-white/70 hover:border-[#4F7D32]/30'
                      }`}
                    >
                      <span className="text-xs text-[#4F7D32] block font-kids">{t.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Time Input */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-600 font-medium">Atau jam khusus:</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border-2 border-slate-200 bg-white text-xs font-bold text-[#4F7D32] focus:border-[#4F7D32]"
                  />
                </div>

                {/* Browser Notification Permission Banner */}
                {permissionState !== 'granted' ? (
                  <div className="mt-3 p-3 bg-[#FFD16A]/30 rounded-xl border border-[#FFD16A] flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-xs text-slate-800 font-medium text-center sm:text-left">
                      Beri izin browser agar notifikasi bisa muncul di layar:
                    </span>
                    <button
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 rounded-xl bg-[#4F7D32] hover:bg-[#3B5F25] text-white font-bold text-xs whitespace-nowrap shadow-sm transition active:scale-95"
                    >
                      Izinkan Sekarang 🔔
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-[#4F7D32] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-[#4F7D32]" />
                      Izin notifikasi aktif!
                    </span>
                    <button
                      onClick={handleTestNotification}
                      className="px-3 py-1.5 rounded-xl bg-[#FFD16A]/30 hover:bg-[#FFD16A]/50 text-slate-800 border border-[#FFD16A] font-bold text-xs transition"
                    >
                      {testSent ? 'Terkirim! 🚀' : 'Uji Coba Notifikasi 🔔'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="px-4 py-2 rounded-2xl text-slate-600 hover:bg-slate-200 font-bold text-xs sm:text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FFD16A]" />
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
