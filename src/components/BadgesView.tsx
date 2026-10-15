import React, { useState } from 'react';
import { Badge, UserProfile } from '../types';
import { ALL_BADGES } from '../data/badgesData';
import { sound } from '../utils/audio';
import { Award, Lock, Sparkles, CheckCircle2, ChevronRight, X, Coins, Zap } from 'lucide-react';

interface BadgesViewProps {
  user: UserProfile;
  onClose: () => void;
}

export const BadgesView: React.FC<BadgesViewProps> = ({ user, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Lencana', icon: '🏆' },
    { id: 'subject', label: 'Mata Pelajaran', icon: '📚' },
    { id: 'quiz', label: 'Kuis & Bintang', icon: '⭐' },
    { id: 'level', label: 'Tingkatan Level', icon: '🎓' },
    { id: 'streak', label: 'Disiplin & Waktu', icon: '🔥' },
  ];

  const filteredBadges = ALL_BADGES.filter((b) => {
    if (activeCategory === 'all') return true;
    return b.category === activeCategory;
  });

  const unlockedCount = ALL_BADGES.filter((b) => user.unlockedBadges.includes(b.id)).length;
  const progressPercent = Math.round((unlockedCount / ALL_BADGES.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-[#F5B52E] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner">
              🏅
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-kids tracking-wide">
                Koleksi Lencana Prestasi
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

        {/* Progress Tracker Card */}
        <div className="p-4 sm:p-6 pb-2">
          <div className="bg-[#FFD16A]/20 border-2 border-[#FFD16A] rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD16A] flex items-center justify-center text-2xl">
                🌟
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 font-kids">
                  Kemajuan Koleksi: {unlockedCount} / {ALL_BADGES.length} Lencana
                </h4>
                <p className="text-xs text-slate-600">
                  {unlockedCount === ALL_BADGES.length
                    ? 'Luar biasa! Semua lencana telah kamu buka!'
                    : `Masih ada ${ALL_BADGES.length - unlockedCount} lencana rahasia menunggu!`}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48">
              <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300">
                <div
                  className="h-full bg-gradient-to-r from-[#FFD16A] via-[#F5B52E] to-[#4F7D32] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#4F7D32] text-right block mt-1">
                {progressPercent}% Terkumpul
              </span>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playPop();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#4F7D32] text-white shadow-md shadow-[#4F7D32]/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-[#4F7D32]/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="px-4 sm:px-6 pb-6 max-h-[380px] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredBadges.map((badge) => {
              const isUnlocked = user.unlockedBadges.includes(badge.id);
              const currentProgress = user.badgeProgress[badge.id] || 0;

              return (
                <div
                  key={badge.id}
                  onClick={() => {
                    sound.playPop();
                    setSelectedBadge(badge);
                  }}
                  className={`p-3.5 rounded-3xl border-2 cursor-pointer transition transform hover:-translate-y-0.5 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-[#4F7D32]/5 to-[#FFD16A]/10 border-[#4F7D32]/40 shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-[#F5B52E] to-[#FFD16A] border border-[#F5B52E] animate-bounce-gentle'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate font-kids">
                          {badge.title}
                        </h4>
                        {isUnlocked && (
                          <CheckCircle2 className="w-4 h-4 text-[#4F7D32] flex-shrink-0 ml-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {badge.description}
                      </p>

                      {/* Progress / Status */}
                      <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                        {isUnlocked ? (
                          <span className="text-[#4F7D32] bg-[#4F7D32]/10 px-2 py-0.5 rounded-full border border-[#4F7D32]/30">
                            Terbuka! 🎉
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Progres: {currentProgress} / {badge.maxProgress}
                          </span>
                        )}
                        <span className="text-[#D9361E] flex items-center gap-0.5">
                          +{badge.rewardCoins} 🪙
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Badge Detail Modal */}
        {selectedBadge && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-[#F5B52E] text-center animate-fadeIn shadow-2xl relative">
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#F5B52E] to-[#FFD16A] border-2 border-[#F5B52E] flex items-center justify-center text-4xl shadow-lg my-2">
                {user.unlockedBadges.includes(selectedBadge.id) ? (
                  selectedBadge.icon
                ) : (
                  <Lock className="w-8 h-8 text-amber-900" />
                )}
              </div>

              <h3 className="text-lg font-bold font-kids text-slate-800 mt-2">
                {selectedBadge.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {selectedBadge.description}
              </p>

              <div className="my-4 p-3 bg-[#4F7D32]/10 rounded-2xl border border-[#4F7D32]/30 flex items-center justify-around text-xs font-bold">
                <div className="flex items-center gap-1.5 text-[#4F7D32]">
                  <Zap className="w-4 h-4 fill-[#4F7D32]" />
                  <span>+{selectedBadge.rewardXp} XP</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#D9361E]">
                  <Coins className="w-4 h-4 fill-[#D9361E]" />
                  <span>+{selectedBadge.rewardCoins} Koin</span>
                </div>
              </div>

              <div className="text-xs font-bold">
                {user.unlockedBadges.includes(selectedBadge.id) ? (
                  <span className="text-[#4F7D32] bg-[#4F7D32]/15 px-3 py-1.5 rounded-full inline-block">
                    ✅ Telah Dimenangkan!
                  </span>
                ) : (
                  <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full inline-block">
                    🔒 Belum Terbuka
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
