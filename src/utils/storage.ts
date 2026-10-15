import { UserProfile, DailyMission, AvatarConfig } from '../types';
import { ALL_BADGES } from '../data/badgesData';

const STORAGE_KEY = 'pintar_sd_user_data_v1';

export const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: 'Petualang Cilik 🎒', minLevelPerk: 'Buka Kuis Tingkat Dasar' },
  { level: 2, xpRequired: 250, title: 'Bintang Pembelajar ⭐', minLevelPerk: 'Buka Bab Kuis Master & Kostum Dokter' },
  { level: 3, xpRequired: 600, title: 'Detektif Cilik 🔍', minLevelPerk: 'Buka Mahkota Emas & Pet Kucing' },
  { level: 4, xpRequired: 1100, title: 'Ksatria Pintar 🛡️', minLevelPerk: 'Buka Kostum Superhero & Pet Kelinci' },
  { level: 5, xpRequired: 1700, title: 'Profesor Cilik 🎓', minLevelPerk: 'Buka Topi Wisuda & Pet Burung Hantu' },
  { level: 6, xpRequired: 2400, title: 'Juara Jenius 🏆', minLevelPerk: 'Buka Kostum Astronot & Pet Robot' },
  { level: 7, xpRequired: 3300, title: 'Penyihir Ilmu 🪄', minLevelPerk: 'Buka Pet Naga Mistik Legendaris' },
  { level: 8, xpRequired: 4500, title: 'Legenda SD Raya 👑', minLevelPerk: 'Gelar Kehormatan Juara SD Nusantara' },
];

export function getLevelInfo(totalXp: number) {
  let currentLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel)!;
  const nextThreshold = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1);

  const prevXp = currentThreshold.xpRequired;
  const nextXp = nextThreshold ? nextThreshold.xpRequired : prevXp + 1500;
  const progressXp = totalXp - prevXp;
  const neededXp = nextXp - prevXp;
  const progressPercentage = Math.min(100, Math.max(0, Math.round((progressXp / neededXp) * 100)));

  return {
    level: currentLevel,
    title: currentThreshold.title,
    perk: currentThreshold.minLevelPerk,
    currentXp: totalXp,
    xpIntoLevel: progressXp,
    xpRequiredForNext: neededXp,
    nextThresholdXp: nextXp,
    progressPercentage,
    isMaxLevel: !nextThreshold,
  };
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: '#FCD7B0',
  hairStyle: 'short',
  hairColor: '#1E293B',
  expression: 'happy',
  outfit: 'seragam_sd',
  accessory: 'topi_sd',
  pet: 'none',
  backgroundStyle: 'clouds',
};

export function generateDailyMissions(): DailyMission[] {
  return [
    {
      id: 'mission_quiz_1',
      title: 'Petualangan Pertama',
      description: 'Selesaikan 1 petualangan kuis pelajaran hari ini',
      targetCount: 1,
      currentCount: 0,
      rewardCoins: 25,
      rewardXp: 50,
      completed: false,
      type: 'play_quiz',
    },
    {
      id: 'mission_correct_5',
      title: 'Jawaban Tepat Sasaran',
      description: 'Jawab dengan benar 5 pertanyaan kuis hari ini',
      targetCount: 5,
      currentCount: 0,
      rewardCoins: 30,
      rewardXp: 60,
      completed: false,
      type: 'correct_answers',
    },
    {
      id: 'mission_explore_two',
      title: 'Eksplorasi Ceria',
      description: 'Coba mainkan kuis dari 2 mata pelajaran berbeda',
      targetCount: 2,
      currentCount: 0,
      rewardCoins: 40,
      rewardXp: 80,
      completed: false,
      type: 'explore_subject',
    },
  ];
}

export function getDefaultUserProfile(): UserProfile {
  const todayStr = new Date().toISOString().split('T')[0];
  return {
    name: 'Siswa BIS',
    grade: 3,
    school: 'SDIT Balikpapan Islamic School',
    avatar: DEFAULT_AVATAR,
    level: 1,
    currentXp: 120, // initial boost for a nice feel
    nextLevelXp: 250,
    coins: 60,
    totalStars: 4,
    streakDays: 1,
    lastPlayedDate: todayStr,
    completedQuizIds: {},
    unlockedBadges: [],
    badgeProgress: {},
    dailyMissions: generateDailyMissions(),
    dailyMissionsDate: todayStr,
    reminderSettings: {
      enabled: false,
      reminderTime: '16:00',
      hasBrowserPermission: false,
      soundEnabled: true,
    },
    audioMuted: false,
  };
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultProfile = getDefaultUserProfile();
      saveUserProfile(defaultProfile);
      return defaultProfile;
    }
    const parsed = JSON.parse(raw) as UserProfile;
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if daily missions need refresh for a new day
    if (parsed.dailyMissionsDate !== todayStr) {
      parsed.dailyMissions = generateDailyMissions();
      parsed.dailyMissionsDate = todayStr;

      // Check streak: if yesterday was played, streak increments, else resets
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (parsed.lastPlayedDate === yesterdayStr) {
        // Streak is continuing
      } else if (parsed.lastPlayedDate !== todayStr) {
        // Missed a day
        parsed.streakDays = 1;
      }
    }

    // Ensure school name matches SDIT Balikpapan Islamic School
    if (!parsed.school || parsed.school.includes('SDN') || parsed.school.includes('Pertiwi') || parsed.school.includes('Nusantara')) {
      parsed.school = 'SDIT Balikpapan Islamic School';
    }

    // Recalculate level to ensure data integrity
    const levelInfo = getLevelInfo(parsed.currentXp);
    parsed.level = levelInfo.level;
    parsed.nextLevelXp = levelInfo.nextThresholdXp;

    return parsed;
  } catch (err) {
    console.error('Failed to load user profile from storage', err);
    return getDefaultUserProfile();
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    const levelInfo = getLevelInfo(profile.currentXp);
    profile.level = levelInfo.level;
    profile.nextLevelXp = levelInfo.nextThresholdXp;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile', err);
  }
}
