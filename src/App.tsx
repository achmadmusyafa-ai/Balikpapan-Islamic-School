import React, { useState, useEffect } from 'react';
import { QuizChapter, UserProfile, AvatarConfig, SubjectCategory, AppAccount } from './types';
import { QUIZ_CHAPTERS } from './data/quizData';
import { ALL_BADGES } from './data/badgesData';
import {
  loadUserProfile,
  saveUserProfile,
  getLevelInfo,
  generateDailyMissions,
} from './utils/storage';
import { sound } from './utils/audio';
import { fireCelebrationConfetti } from './utils/confetti';
import { sendDailyReminderNotification } from './utils/notifications';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  testConnection,
  syncUserProfileToCloud,
  loadUserProfileFromCloud,
  fetchCustomChaptersFromCloud,
} from './lib/firebase';
import {
  getActiveSession,
  clearActiveSession,
  isChapterAccessibleForGrade,
} from './utils/accounts';
import { LoginPortal } from './components/LoginPortal';
import { StudentAuthModal } from './components/StudentAuthModal';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { Navbar } from './components/Navbar';
import { AvatarDisplay } from './components/AvatarDisplay';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { SubjectCard } from './components/SubjectCard';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResultsModal } from './components/QuizResultsModal';
import { BadgesView } from './components/BadgesView';
import { LeaderboardView } from './components/LeaderboardView';
import { DailyReminderModal } from './components/DailyReminderModal';
import { LevelUpModal } from './components/LevelUpModal';
import {
  Sparkles,
  Trophy,
  Award,
  Bell,
  WifiOff,
  Flame,
  Star,
  Coins,
  Compass,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Calendar,
  Layers,
  Heart,
  Smile,
  CloudCheck,
  User as UserIcon,
  Lock,
} from 'lucide-react';

export default function App() {
  const [activeAccount, setActiveAccount] = useState<AppAccount | null>(() => getActiveSession());
  const [user, setUser] = useState<UserProfile>(() => {
    const base = loadUserProfile();
    const session = getActiveSession();
    if (session) {
      base.name = session.fullName;
      if (session.grade) base.grade = session.grade;
      base.role = session.role;
    }
    return base;
  });

  const [activeChapter, setActiveChapter] = useState<QuizChapter | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('semua');

  // Chapters state (Default + Custom chapters created by teacher)
  const [chapters, setChapters] = useState<QuizChapter[]>(() => {
    try {
      const local = localStorage.getItem('pintar_sd_custom_chapters');
      if (local) {
        const parsed = JSON.parse(local);
        return [...parsed, ...QUIZ_CHAPTERS];
      }
    } catch {
      // Ignore
    }
    return QUIZ_CHAPTERS;
  });

  // Teacher dashboard state
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);

  // Firebase auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Modals state
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [levelUpState, setLevelUpState] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{
    chapterId: string;
    score: number;
    stars: number;
    xpEarned: number;
    coinsEarned: number;
    correctCount: number;
    totalQuestions: number;
    streakMax: number;
  } | null>(null);

  const isOnline = useOnlineStatus();

  // Test Firebase connection, listen to Auth state, and load teacher chapters
  useEffect(() => {
    testConnection();

    // Fetch cloud chapters from Firestore
    fetchCustomChaptersFromCloud()
      .then((cloudChaps) => {
        if (cloudChaps && cloudChaps.length > 0) {
          setChapters((prev) => {
            const customIds = new Set(cloudChaps.map((c) => c.id));
            const existingWithoutCloud = prev.filter((c) => !customIds.has(c.id));
            return [...cloudChaps, ...existingWithoutCloud];
          });
        }
      })
      .catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        // Load cloud profile if exists, else sync current local profile
        const cloudData = await loadUserProfileFromCloud(fbUser.uid);
        if (cloudData) {
          setUser((prev) => ({
            ...prev,
            name: cloudData.name || prev.name,
            school: cloudData.school || prev.school,
            level: cloudData.level || prev.level,
            currentXp: Math.max(cloudData.currentXp || 0, prev.currentXp),
            coins: Math.max(cloudData.coins || 0, prev.coins),
            totalStars: Math.max(cloudData.totalStars || 0, prev.totalStars),
            avatar: cloudData.avatar || prev.avatar,
            unlockedBadges: Array.from(
              new Set([...(cloudData.unlockedBadges || []), ...prev.unlockedBadges])
            ),
          }));
        } else {
          // Push current local profile to cloud
          syncUserProfileToCloud(user, fbUser.uid);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateChapters = (updated: QuizChapter[]) => {
    setChapters(updated);
    try {
      const customOnly = updated.filter((c) => c.id.startsWith('custom_'));
      localStorage.setItem('pintar_sd_custom_chapters', JSON.stringify(customOnly));
    } catch {
      // Ignore
    }
  };

  const handleLoginSuccess = (account: AppAccount) => {
    setActiveAccount(account);
    setUser((prev) => ({
      ...prev,
      name: account.fullName,
      grade: account.grade || prev.grade,
      role: account.role,
    }));
    if (account.role === 'siswa' && account.grade) {
      setGradeFilter(String(account.grade));
    } else {
      setGradeFilter('semua');
    }
  };

  const handleLogout = () => {
    sound.playPop();
    clearActiveSession();
    setActiveAccount(null);
  };

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    saveUserProfile(user);
    if (currentUser) {
      syncUserProfileToCloud(user, currentUser.uid);
    }
  }, [user, currentUser]);

  // Audio mute sync
  useEffect(() => {
    sound.setMuted(user.audioMuted);
  }, [user.audioMuted]);

  // Toggle sound
  const handleToggleSound = () => {
    const nextMuted = !user.audioMuted;
    sound.setMuted(nextMuted);
    setUser((prev) => ({ ...prev, audioMuted: nextMuted }));
    if (!nextMuted) sound.playPop();
  };

  // Check and unlock badges based on condition
  const evaluateBadges = (updatedUser: UserProfile, result?: typeof quizResult) => {
    const unlocked = [...updatedUser.unlockedBadges];
    const progress = { ...updatedUser.badgeProgress };
    let newCoins = updatedUser.coins;
    let newXp = updatedUser.currentXp;
    let newBadgeUnlocked = false;

    // 1. Perfect score
    if (result && result.stars === 3 && !unlocked.includes('perfect_score')) {
      unlocked.push('perfect_score');
      progress['perfect_score'] = 1;
      newCoins += 50;
      newXp += 100;
      newBadgeUnlocked = true;
    }

    // 2. Math star
    const mathPlayed = Object.keys(updatedUser.completedQuizIds).filter((id) =>
      id.startsWith('matematika')
    ).length;
    progress['math_star'] = mathPlayed;
    if (mathPlayed >= 2 && !unlocked.includes('math_star')) {
      unlocked.push('math_star');
      newCoins += 40;
      newXp += 80;
      newBadgeUnlocked = true;
    }

    // 3. Science explorer
    const ipaPlayed = Object.keys(updatedUser.completedQuizIds).filter((id) =>
      id.startsWith('ipa')
    ).length;
    progress['science_explorer'] = ipaPlayed;
    if (ipaPlayed >= 2 && !unlocked.includes('science_explorer')) {
      unlocked.push('science_explorer');
      newCoins += 40;
      newXp += 80;
      newBadgeUnlocked = true;
    }

    // 4. Language expert
    const indoPlayed = Object.keys(updatedUser.completedQuizIds).filter((id) =>
      id.startsWith('indonesia')
    ).length;
    progress['language_expert'] = indoPlayed;
    if (indoPlayed >= 1 && !unlocked.includes('language_expert')) {
      unlocked.push('language_expert');
      newCoins += 40;
      newXp += 80;
      newBadgeUnlocked = true;
    }

    // 5. Nusantara ambassador
    const ipsPlayed = Object.keys(updatedUser.completedQuizIds).filter((id) =>
      id.startsWith('ips')
    ).length;
    progress['nusantara_ambassador'] = ipsPlayed;
    if (ipsPlayed >= 1 && !unlocked.includes('nusantara_ambassador')) {
      unlocked.push('nusantara_ambassador');
      newCoins += 35;
      newXp += 75;
      newBadgeUnlocked = true;
    }

    // 6. English champ
    const engPlayed = Object.keys(updatedUser.completedQuizIds).filter((id) =>
      id.startsWith('inggris')
    ).length;
    progress['english_champ'] = engPlayed;
    if (engPlayed >= 1 && !unlocked.includes('english_champ')) {
      unlocked.push('english_champ');
      newCoins += 35;
      newXp += 75;
      newBadgeUnlocked = true;
    }

    // 7. Streak 3 days
    progress['streak_3_days'] = updatedUser.streakDays;
    if (updatedUser.streakDays >= 3 && !unlocked.includes('streak_3_days')) {
      unlocked.push('streak_3_days');
      newCoins += 75;
      newXp += 150;
      newBadgeUnlocked = true;
    }

    // 8. Total Stars Collector
    progress['star_collector_10'] = updatedUser.totalStars;
    if (updatedUser.totalStars >= 10 && !unlocked.includes('star_collector_10')) {
      unlocked.push('star_collector_10');
      newCoins += 60;
      newXp += 120;
      newBadgeUnlocked = true;
    }
    progress['star_collector_20'] = updatedUser.totalStars;
    if (updatedUser.totalStars >= 20 && !unlocked.includes('star_collector_20')) {
      unlocked.push('star_collector_20');
      newCoins += 120;
      newXp += 250;
      newBadgeUnlocked = true;
    }

    // 9. Level achievements
    progress['reach_level_3'] = updatedUser.level;
    if (updatedUser.level >= 3 && !unlocked.includes('reach_level_3')) {
      unlocked.push('reach_level_3');
      newCoins += 80;
      newXp += 150;
      newBadgeUnlocked = true;
    }
    progress['reach_level_5'] = updatedUser.level;
    if (updatedUser.level >= 5 && !unlocked.includes('reach_level_5')) {
      unlocked.push('reach_level_5');
      newCoins += 150;
      newXp += 300;
      newBadgeUnlocked = true;
    }

    // 10. Quiz master 5 times played
    const totalQuizzesPlayed = Object.values(updatedUser.completedQuizIds).reduce(
      (acc, curr) => acc + curr.timesPlayed,
      0
    );
    progress['quiz_master_5'] = totalQuizzesPlayed;
    if (totalQuizzesPlayed >= 5 && !unlocked.includes('quiz_master_5')) {
      unlocked.push('quiz_master_5');
      newCoins += 50;
      newXp += 100;
      newBadgeUnlocked = true;
    }

    // 11. All subjects explorer
    const subjectsCovered = new Set(
      Object.keys(updatedUser.completedQuizIds).map((id) => id.split('_')[0])
    ).size;
    progress['all_subjects_explorer'] = subjectsCovered;
    if (subjectsCovered >= 5 && !unlocked.includes('all_subjects_explorer')) {
      unlocked.push('all_subjects_explorer');
      newCoins += 100;
      newXp += 200;
      newBadgeUnlocked = true;
    }

    // 12. Streak combo 5
    if (result && result.streakMax >= 5 && !unlocked.includes('streak_combo_5')) {
      unlocked.push('streak_combo_5');
      progress['streak_combo_5'] = result.streakMax;
      newCoins += 60;
      newXp += 120;
      newBadgeUnlocked = true;
    }

    if (newBadgeUnlocked) {
      sound.playFanfare();
      fireCelebrationConfetti();
    }

    return {
      ...updatedUser,
      unlockedBadges: unlocked,
      badgeProgress: progress,
      coins: newCoins,
      currentXp: newXp,
    };
  };

  // Handle quiz completion
  const handleQuizFinish = (result: {
    chapterId: string;
    score: number;
    stars: number;
    xpEarned: number;
    coinsEarned: number;
    correctCount: number;
    totalQuestions: number;
    streakMax: number;
  }) => {
    setActiveChapter(null);
    setQuizResult(result);

    setUser((prev) => {
      const prevCompleted = prev.completedQuizIds[result.chapterId];
      const previousStars = prevCompleted ? prevCompleted.stars : 0;
      const additionalStars = Math.max(0, result.stars - previousStars);

      const oldLevelInfo = getLevelInfo(prev.currentXp);
      const newTotalXp = prev.currentXp + result.xpEarned;
      const newLevelInfo = getLevelInfo(newTotalXp);

      // Check level up
      if (newLevelInfo.level > oldLevelInfo.level) {
        setLevelUpState(newLevelInfo.level);
      }

      // Update completed quizzes
      const updatedCompleted = {
        ...prev.completedQuizIds,
        [result.chapterId]: {
          highScore: Math.max(prevCompleted?.highScore || 0, result.score),
          stars: Math.max(prevCompleted?.stars || 0, result.stars),
          timesPlayed: (prevCompleted?.timesPlayed || 0) + 1,
        },
      };

      // Update daily missions
      const updatedMissions = prev.dailyMissions.map((m) => {
        if (m.type === 'play_quiz' && !m.completed) {
          const nextVal = m.currentCount + 1;
          return {
            ...m,
            currentCount: nextVal,
            completed: nextVal >= m.targetCount,
          };
        }
        if (m.type === 'correct_answers' && !m.completed) {
          const nextVal = m.currentCount + result.correctCount;
          return {
            ...m,
            currentCount: nextVal,
            completed: nextVal >= m.targetCount,
          };
        }
        if (m.type === 'explore_subject' && !m.completed) {
          const count = Object.keys(updatedCompleted).length;
          return {
            ...m,
            currentCount: count,
            completed: count >= m.targetCount,
          };
        }
        return m;
      });

      const updatedProfile: UserProfile = {
        ...prev,
        currentXp: newTotalXp,
        level: newLevelInfo.level,
        nextLevelXp: newLevelInfo.nextThresholdXp,
        coins: prev.coins + result.coinsEarned,
        totalStars: prev.totalStars + additionalStars,
        completedQuizIds: updatedCompleted,
        dailyMissions: updatedMissions,
        lastPlayedDate: new Date().toISOString().split('T')[0],
      };

      return evaluateBadges(updatedProfile, result);
    });
  };

  // Filter chapters with STRICT Grade Access Control
  const filteredChapters = chapters.filter((chap) => {
    // 1. Subject Category Filter
    if (selectedSubjectFilter !== 'all' && chap.category !== selectedSubjectFilter) {
      return false;
    }

    // 2. Role & Class Access Control:
    // If logged in as SISWA, STRICTLY restrict to their class
    if (activeAccount?.role === 'siswa') {
      const studentGrade = activeAccount.grade || user.grade || 1;
      return isChapterAccessibleForGrade(chap, studentGrade);
    }

    // 3. If GURU, can view all classes or filter by specific class
    if (gradeFilter === 'semua') return true;
    if (gradeFilter === 'rendah') {
      return (
        isChapterAccessibleForGrade(chap, 1) ||
        isChapterAccessibleForGrade(chap, 2) ||
        isChapterAccessibleForGrade(chap, 3)
      );
    }
    if (gradeFilter === 'tinggi') {
      return (
        isChapterAccessibleForGrade(chap, 4) ||
        isChapterAccessibleForGrade(chap, 5) ||
        isChapterAccessibleForGrade(chap, 6)
      );
    }
    const numG = Number(gradeFilter);
    if (numG >= 1 && numG <= 6) {
      return isChapterAccessibleForGrade(chap, numG);
    }
    return true;
  });

  const subjectTabs = [
    { id: 'all', label: 'Semua Pelajaran', icon: '🌟' },
    { id: 'matematika', label: 'Matematika', icon: '🔢' },
    { id: 'ipa', label: 'IPA / Sains', icon: '🌱' },
    { id: 'indonesia', label: 'Bahasa Indonesia', icon: '📚' },
    { id: 'ips', label: 'Ragam Nusantara', icon: '🇮🇩' },
    { id: 'pai', label: 'Pendidikan Agama Islam', icon: '🕌' },
    { id: 'inggris', label: 'Fun English', icon: '🇬🇧' },
  ];

  const levelInfo = getLevelInfo(user.currentXp);

  // If not logged in, show official Login Portal
  if (!activeAccount) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAF6] flex flex-col selection:bg-[#FFD16A]">
      {/* Top Navbar */}
      <Navbar
        user={user}
        currentUser={currentUser}
        activeAccount={activeAccount}
        onLogout={handleLogout}
        onOpenAvatar={() => setIsAvatarOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenReminder={() => setIsReminderOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTeacher={() => {
          if (activeAccount?.role === 'siswa') {
            alert(
              'Akses Dibatasi: Menu Ruang Guru hanya diperuntukkan bagi Bapak/Ibu Guru SDIT Balikpapan Islamic School.'
            );
            return;
          }
          setIsTeacherOpen(true);
        }}
        onToggleSound={handleToggleSound}
        isMuted={user.audioMuted}
      />

      {/* Main View Area */}
      {activeChapter ? (
        <QuizPlayer
          chapter={activeChapter}
          user={user}
          onFinish={handleQuizFinish}
          onExit={() => setActiveChapter(null)}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
          {/* Offline Banner alert if user is disconnected */}
          {!isOnline && (
            <div className="bg-[#D9361E] text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-5 h-5 flex-shrink-0 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold">
                  Mode Offline Aktif! Seluruh kuis, suara, avatar, dan skor tetap tersimpan dan bisa dimainkan tanpa internet. 🚀
                </span>
              </div>
              <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full font-bold">
                100% Offline
              </span>
            </div>
          )}

          {/* Hero Welcome Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] text-white p-5 sm:p-8 shadow-xl overflow-hidden">
            {/* Background floating playful shapes */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD16A]/15 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#F5B52E]/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left text column */}
              <div className="text-center md:text-left space-y-2.5 max-w-xl">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white border border-white/20">
                    <img
                      src="/school-logo.png"
                      alt="Logo BIS"
                      className="w-5 h-5 object-contain drop-shadow"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://bis.sch.id/storage/uploads/footer/LOGO-6A0AD9E758BB5.png';
                      }}
                    />
                    <span>Game Edu Bis • SDIT Balikpapan Islamic School</span>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-[#D9361E]/80 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black tracking-wide text-[#FFD16A] border border-[#FFD16A]/30">
                    <Flame className="w-4 h-4 text-[#FFD16A] fill-[#FFD16A]" />
                    <span>Streak: {user.streakDays} Hari 🔥</span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playPop();
                      setIsAuthOpen(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                      currentUser
                        ? 'bg-[#FFD16A] text-[#4F7D32] font-black hover:bg-[#F5B52E]'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <CloudCheck className="w-3.5 h-3.5" />
                    <span>{currentUser ? 'Cloud Sync Aktif' : 'Masuk Akun Siswa'}</span>
                  </button>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold font-kids leading-tight tracking-wide">
                  Halo, {activeAccount?.role === 'guru' ? `Ustadz/ah ${user.name}` : user.name}!{' '}
                  {activeAccount?.role === 'guru' ? '👨‍🏫' : '🎒'}
                </h2>

                <p className="text-xs sm:text-base text-emerald-50 font-medium leading-relaxed">
                  {activeAccount?.role === 'siswa' ? (
                    <>
                      Selamat datang di <strong>Game Edu Bis</strong>! Anda terdaftar sebagai siswa{' '}
                      <span className="bg-[#FFD16A] text-slate-900 px-2 py-0.5 rounded-lg font-black">
                        Kelas {user.grade} SDIT Balikpapan Islamic School
                      </span>
                      . Akses materi dan kuis dibatasi otomatis sesuai kurikulum kelas Anda!
                    </>
                  ) : (
                    <>
                      Selamat datang di <strong>Game Edu Bis</strong>! Anda masuk sebagai{' '}
                      <span className="bg-[#FFD16A] text-slate-900 px-2 py-0.5 rounded-lg font-black">
                        Guru / Pendidik SDIT Balikpapan Islamic School
                      </span>{' '}
                      dengan akses penuh ke seluruh Kelas 1-6 dan pengelolaan bank soal kuis.
                    </>
                  )}
                </p>

                {/* Quick Action buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setIsAvatarOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-[#FFD16A] hover:bg-[#F5B52E] text-slate-900 font-black text-xs sm:text-sm shadow-md transition transform active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#D9361E]" />
                    Kustomisasi Avatar
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      setIsBadgesOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm transition transform active:scale-95 flex items-center gap-2 border border-white/20"
                  >
                    <Award className="w-4 h-4 text-[#FFD16A]" />
                    Lencana ({user.unlockedBadges.length}/{ALL_BADGES.length})
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      setIsLeaderboardOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm transition transform active:scale-95 flex items-center gap-2 border border-white/20"
                  >
                    <Trophy className="w-4 h-4 text-[#FFD16A]" />
                    Papan Juara
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      if (activeAccount?.role === 'siswa') {
                        alert(
                          'Akses Dibatasi: Menu Ruang Guru hanya diperuntukkan bagi Bapak/Ibu Guru SDIT Balikpapan Islamic School.'
                        );
                        return;
                      }
                      setIsTeacherOpen(true);
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95 flex items-center gap-2 border ${
                      activeAccount?.role === 'guru'
                        ? 'bg-[#D9361E] hover:bg-[#B92812] text-white border-[#FFD16A]/40'
                        : 'bg-white/20 hover:bg-white/30 text-white/80 border-white/20'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-[#FFD16A]" />
                    <span>Ruang Guru</span>
                  </button>
                </div>
              </div>

              {/* Right Avatar Card */}
              <div
                onClick={() => {
                  sound.playPop();
                  setIsAvatarOpen(true);
                }}
                className="group p-3 bg-white/15 backdrop-blur-md rounded-3xl border-2 border-white/30 flex flex-col items-center cursor-pointer transition transform hover:scale-105"
                title="Buka Lemari Avatar"
              >
                <div className="p-2 bg-white rounded-2xl shadow-lg border-2 border-[#F5B52E]">
                  <AvatarDisplay avatar={user.avatar} size="lg" />
                </div>
                <span className="text-xs font-black font-kids text-[#FFD16A] mt-2 flex items-center gap-1 group-hover:text-white">
                  <span>Ubah Gaya</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Daily Quests Mini Banner */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#4F7D32]/20 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFD16A]/30 flex items-center justify-center text-2xl flex-shrink-0">
                🎯
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-kids text-slate-800">
                  Misi Harian Belajar Siswa
                </h3>
                <p className="text-xs text-slate-500">
                  Selesaikan misi harian untuk mendapatkan koin dan bintang emas tambahan!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
              {user.dailyMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`px-3 py-2 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                    mission.completed
                      ? 'bg-[#4F7D32]/10 border-[#4F7D32]/40 text-[#4F7D32]'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-semibold truncate">{mission.title}</span>
                  <span className="font-black font-kids text-[#D9361E] whitespace-nowrap">
                    {mission.completed ? '✅ Selesai' : `${mission.currentCount}/${mission.targetCount}`}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                sound.playPop();
                setIsReminderOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-[#4F7D32]/10 hover:bg-[#4F7D32]/20 text-[#4F7D32] font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition"
            >
              <Bell className="w-3.5 h-3.5 text-[#F5B52E]" />
              <span>Atur Pengingat</span>
            </button>
          </div>

          {/* Subject Filter Tabs & Grade Level Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-black font-kids text-slate-800 tracking-wide">
                  Pilih Petualangan Pelajaran 🎒
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Setiap kuis dilengkapi pembahasan seru & fakta menarik untuk siswa SD.
                </p>
              </div>

              {/* Grade Selector / Access Restriction Badge */}
              {activeAccount?.role === 'siswa' ? (
                <div className="inline-flex items-center gap-2 bg-[#4F7D32]/10 border-2 border-[#4F7D32]/30 px-3.5 py-1.5 rounded-2xl text-xs font-black text-[#4F7D32] self-start sm:self-auto shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-[#4F7D32]" />
                  <span>
                    Akses Terbatas: <strong>Kelas {user.grade} SDIT BIS</strong>
                  </span>
                </div>
              ) : (
                <div className="inline-flex flex-wrap bg-slate-200/80 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto gap-0.5">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setGradeFilter('semua');
                    }}
                    className={`px-2.5 py-1 rounded-xl transition ${
                      gradeFilter === 'semua'
                        ? 'bg-white text-[#4F7D32] shadow-sm font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  {['1', '2', '3', '4', '5', '6'].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        sound.playPop();
                        setGradeFilter(g);
                      }}
                      className={`px-2.5 py-1 rounded-xl transition ${
                        gradeFilter === g
                          ? 'bg-white text-[#4F7D32] shadow-sm font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Kls {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {subjectTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playPop();
                    setSelectedSubjectFilter(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                    selectedSubjectFilter === tab.id
                      ? 'bg-[#4F7D32] text-white shadow-md shadow-[#4F7D32]/30 border-2 border-[#4F7D32]'
                      : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-[#4F7D32]/40 hover:bg-[#4F7D32]/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Quiz Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChapters.map((chapter) => (
              <SubjectCard
                key={chapter.id}
                chapter={chapter}
                user={user}
                onSelect={(chap) => setActiveChapter(chap)}
              />
            ))}
          </div>
        </main>
      )}

      {/* MODALS */}
      {/* 1. Avatar Customizer Modal */}
      {isAvatarOpen && (
        <AvatarCustomizer
          user={user}
          onSave={(newAvatar, updatedFields) => {
            setUser((prev) => ({
              ...prev,
              avatar: newAvatar,
              ...updatedFields,
            }));
          }}
          onClose={() => setIsAvatarOpen(false)}
        />
      )}

      {/* 2. Badges View Modal */}
      {isBadgesOpen && (
        <BadgesView user={user} onClose={() => setIsBadgesOpen(false)} />
      )}

      {/* 3. Leaderboard View Modal */}
      {isLeaderboardOpen && (
        <LeaderboardView user={user} onClose={() => setIsLeaderboardOpen(false)} />
      )}

      {/* 4. Daily Reminder Modal */}
      {isReminderOpen && (
        <DailyReminderModal
          user={user}
          onUpdateSettings={(newSettings, updatedBadges) => {
            setUser((prev) => {
              const updated = {
                ...prev,
                reminderSettings: newSettings,
                unlockedBadges: updatedBadges || prev.unlockedBadges,
              };
              return updated;
            });
          }}
          onClose={() => setIsReminderOpen(false)}
        />
      )}

      {/* 5. Level Up Modal */}
      {levelUpState !== null && (
        <LevelUpModal
          newLevel={levelUpState}
          onClose={() => setLevelUpState(null)}
        />
      )}

      {/* 6. Quiz Results Modal */}
      {quizResult && (
        <QuizResultsModal
          result={quizResult}
          onPlayAgain={() => {
            const foundChap = chapters.find((c) => c.id === quizResult.chapterId);
            setQuizResult(null);
            if (foundChap) setActiveChapter(foundChap);
          }}
          onHome={() => setQuizResult(null)}
        />
      )}

      {/* 7. Student Auth & Profile Modal */}
      {isAuthOpen && (
        <StudentAuthModal
          currentUser={currentUser}
          userProfile={user}
          onProfileUpdate={(updated) => {
            setUser((prev) => ({
              ...prev,
              ...updated,
            }));
          }}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* 8. Teacher Dashboard Modal */}
      {isTeacherOpen && (
        <TeacherDashboardModal
          chapters={chapters}
          onUpdateChapters={handleUpdateChapters}
          currentUserEmail={currentUser?.email}
          activeRole={activeAccount?.role}
          activeAccountName={activeAccount?.fullName}
          onClose={() => setIsTeacherOpen(false)}
        />
      )}
    </div>
  );
}
