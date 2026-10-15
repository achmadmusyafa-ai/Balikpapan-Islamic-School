import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, UserProfile } from '../types';
import { INITIAL_LEADERBOARD } from '../data/leaderboardData';
import { fetchCloudLeaderboard } from '../lib/firebase';
import { AvatarDisplay } from './AvatarDisplay';
import { sound } from '../utils/audio';
import { Trophy, Medal, Crown, Star, Award, X, Sparkles, School, Cloud } from 'lucide-react';

interface LeaderboardViewProps {
  user: UserProfile;
  onClose: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user, onClose }) => {
  const [cloudEntries, setCloudEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchCloudLeaderboard().then((entries) => {
      if (entries.length > 0) {
        setCloudEntries(entries);
      }
    }).catch(() => {});
  }, []);

  // Build combined list containing real user and peers, sorted by XP
  const currentUserEntry: LeaderboardEntry = {
    id: 'current_user',
    name: user.name + ' (Kamu)',
    school: user.school || 'SDIT Balikpapan Islamic School',
    level: user.level,
    totalXp: user.currentXp,
    starsCount: user.totalStars,
    badgesCount: user.unlockedBadges.length,
    avatar: user.avatar,
    isCurrentUser: true,
  };

  const baseList = cloudEntries.length > 0 ? cloudEntries : INITIAL_LEADERBOARD;
  // Replace current user in list if already exists, else push
  const filteredPeers = baseList.filter((e) => !e.isCurrentUser && e.name !== user.name + ' (Kamu)');

  const allEntries: LeaderboardEntry[] = [...filteredPeers, currentUserEntry]
    .sort((a, b) => b.totalXp - a.totalXp)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const userRankIndex = allEntries.findIndex((e) => e.isCurrentUser);
  const userRank = userRankIndex + 1;
  const nextTargetEntry = userRankIndex > 0 ? allEntries[userRankIndex - 1] : null;
  const pointsToOvertake = nextTargetEntry ? nextTargetEntry.totalXp - user.currentXp + 10 : 0;

  const topThree = allEntries.slice(0, 3);
  const restEntries = allEntries.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-[#F5B52E] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner">
              🏆
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-kids tracking-wide">
                Papan Juara • Game Edu Bis
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

        {/* User Rank Summary Banner */}
        <div className="p-4 sm:p-6 pb-2">
          <div className="bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] rounded-3xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-white/20 rounded-2xl">
                <AvatarDisplay avatar={user.avatar} size="sm" showPet={false} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#FFD16A] uppercase tracking-wider block">
                  Status Prestasi Kamu
                </span>
                <h4 className="text-base font-bold font-kids text-white">
                  Peringkat ke-#{userRank} Sekolah! 🚀
                </h4>
              </div>
            </div>

            <div className="text-center sm:text-right">
              {nextTargetEntry ? (
                <div className="bg-white/20 px-3.5 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur-sm">
                  Tinggal <strong className="text-[#FFD16A]">{pointsToOvertake} XP</strong> lagi untuk menyalip{' '}
                  <strong>{nextTargetEntry.name.replace(' (Kamu)', '')}</strong>!
                </div>
              ) : (
                <div className="bg-[#FFD16A] text-slate-900 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow">
                  👑 Kamu memegang Posisi Nomor #1! Pertahankan juaramu!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Podium for Top 3 */}
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-end justify-center gap-2 sm:gap-4 pt-4 pb-2 border-b border-slate-200">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center flex-1 max-w-[130px]">
                <span className="text-lg">🥈</span>
                <div className="p-1 bg-slate-200 rounded-2xl border-2 border-[#4F7D32]/40 shadow-sm">
                  <AvatarDisplay avatar={topThree[1].avatar} size="md" showPet={false} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 text-center truncate w-full mt-1.5 font-kids">
                  {topThree[1].name}
                </h5>
                <span className="text-[10px] text-slate-500 font-semibold">{topThree[1].totalXp} XP</span>
                <div className="w-full h-16 bg-gradient-to-t from-[#4F7D32]/80 to-[#4F7D32]/50 text-white rounded-t-2xl flex items-center justify-center font-black font-kids mt-2 shadow-inner">
                  #2
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {topThree[0] && (
              <div className="flex flex-col items-center flex-1 max-w-[150px] -mt-6">
                <Crown className="w-8 h-8 text-[#F5B52E] fill-[#F5B52E] animate-bounce-gentle drop-shadow-md" />
                <div className="p-1.5 bg-[#FFD16A]/40 rounded-3xl border-3 border-[#F5B52E] shadow-lg ring-4 ring-[#FFD16A]/40">
                  <AvatarDisplay avatar={topThree[0].avatar} size="lg" showPet={false} />
                </div>
                <h5 className="text-sm font-black text-[#4F7D32] text-center truncate w-full mt-1.5 font-kids">
                  {topThree[0].name}
                </h5>
                <span className="text-xs text-slate-900 font-bold bg-[#FFD16A] px-2.5 py-0.5 rounded-full mt-0.5">
                  {topThree[0].totalXp} XP 🌟
                </span>
                <div className="w-full h-24 bg-gradient-to-t from-[#F5B52E] to-[#FFD16A] rounded-t-2xl flex items-center justify-center font-black text-2xl text-slate-900 font-kids mt-2 shadow-md">
                  #1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center flex-1 max-w-[130px]">
                <span className="text-lg">🥉</span>
                <div className="p-1 bg-[#D9361E]/10 rounded-2xl border-2 border-[#D9361E]/40 shadow-sm">
                  <AvatarDisplay avatar={topThree[2].avatar} size="md" showPet={false} />
                </div>
                <h5 className="text-xs font-bold text-slate-800 text-center truncate w-full mt-1.5 font-kids">
                  {topThree[2].name}
                </h5>
                <span className="text-[10px] text-slate-500 font-semibold">{topThree[2].totalXp} XP</span>
                <div className="w-full h-12 bg-gradient-to-t from-[#D9361E]/80 to-[#D9361E]/50 text-white rounded-t-2xl flex items-center justify-center font-black font-kids mt-2 shadow-inner">
                  #3
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List of remaining ranks */}
        <div className="px-4 sm:px-6 pb-6 max-h-[260px] overflow-y-auto space-y-2">
          {restEntries.map((entry) => {
            const isUser = entry.isCurrentUser;
            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 transition ${
                  isUser
                    ? 'border-[#4F7D32] bg-[#4F7D32]/10 shadow-md ring-2 ring-[#4F7D32]/20'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs font-kids ${
                      isUser
                        ? 'bg-[#4F7D32] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{entry.rank}
                  </span>

                  <AvatarDisplay avatar={entry.avatar} size="sm" showPet={false} />

                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 font-kids">
                      <span>{entry.name}</span>
                      {isUser && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#4F7D32] text-white">
                          Kamu
                        </span>
                      )}
                    </h5>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <School className="w-3 h-3 text-[#4F7D32]" />
                      <span>{entry.school}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-[#4F7D32] font-kids block">
                    {entry.totalXp} XP
                  </span>
                  <span className="text-[10px] text-[#D9361E] font-bold">
                    {entry.starsCount} ⭐ • {entry.badgesCount} 🏅
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
