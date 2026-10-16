export type SubjectCategory = 'matematika' | 'ipa' | 'indonesia' | 'ips' | 'inggris' | 'pai';

export type UserRole = 'siswa' | 'guru';

export interface AppAccount {
  id: string;
  fullName: string;
  username: string;
  password: string; // kata sandi
  role: UserRole;
  grade?: number; // 1 | 2 | 3 | 4 | 5 | 6 (jika siswa)
  school: string;
  avatarSeed?: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  category: SubjectCategory;
  gradeLevel: 'semua' | 'rendah' | 'tinggi' | '1' | '2' | '3' | '4' | '5' | '6';
  targetGrades?: number[]; // [1], [2], [1, 2, 3], etc.
  question: string;
  illustrationEmoji?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  funFact?: string;
  hint?: string;
}

export interface QuizChapter {
  id: string;
  category: SubjectCategory;
  title: string;
  description: string;
  icon: string;
  themeColor: string; // Tailwind color name or hex
  badgeColor: string;
  gradeLevel: 'semua' | 'rendah' | 'tinggi' | '1' | '2' | '3' | '4' | '5' | '6';
  targetGrades?: number[]; // e.g. [1] for Kelas 1, [2] for Kelas 2, etc.
  questions: QuizQuestion[];
  requiredLevel: number;
}

export interface AvatarConfig {
  skinTone: string; // hex
  hairStyle: 'short' | 'curly' | 'pigtails' | 'spiky' | 'hijab' | 'wavy';
  hairColor: string; // hex
  expression: 'happy' | 'wink' | 'starry' | 'cool' | 'glasses';
  outfit: 'seragam_sd' | 'pramuka' | 'superhero' | 'dokter' | 'astronot' | 'petualang';
  accessory: 'none' | 'topi_sd' | 'bando_bunga' | 'mahkota' | 'topi_wisuda' | 'kacamata_bintang';
  pet: 'none' | 'kucing' | 'robot' | 'kelinci' | 'burung_hantu' | 'naga';
  backgroundStyle: 'clouds' | 'stars' | 'sunshine' | 'rainbow' | 'forest';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'quiz' | 'streak' | 'level' | 'avatar' | 'subject';
  maxProgress: number;
  rewardCoins: number;
  rewardXp: number;
  unlockedAt?: string | null;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  rewardXp: number;
  completed: boolean;
  type: 'play_quiz' | 'correct_answers' | 'perfect_quiz' | 'explore_subject';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  school: string;
  avatar: AvatarConfig;
  level: number;
  totalXp: number;
  starsCount: number;
  badgesCount: number;
  isCurrentUser?: boolean;
  rank?: number;
}

export interface UserProfile {
  name: string;
  grade: number; // 1 to 6
  role?: UserRole;
  school: string;
  avatar: AvatarConfig;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  coins: number;
  totalStars: number;
  streakDays: number;
  lastPlayedDate: string;
  completedQuizIds: Record<string, { highScore: number; stars: number; timesPlayed: number }>;
  unlockedBadges: string[];
  badgeProgress: Record<string, number>;
  dailyMissions: DailyMission[];
  dailyMissionsDate: string;
  reminderSettings: {
    enabled: boolean;
    reminderTime: string; // "16:00"
    hasBrowserPermission: boolean;
    soundEnabled: boolean;
  };
  audioMuted: boolean;
}
