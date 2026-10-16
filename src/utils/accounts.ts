import { AppAccount, QuizChapter } from '../types';

export const BIS_SCHOOL_NAME = 'SDIT Balikpapan Islamic School';
export const TEACHER_SECURITY_CODE = 'GURUBIS'; // atau PIN '1234'
const ACCOUNTS_STORAGE_KEY = 'bis_school_accounts_v2';
const ACTIVE_SESSION_STORAGE_KEY = 'bis_active_session_v2';

// Akun bawaan sekolah untuk kemudahan pengujian dan penggunaan langsung
export const DEFAULT_ACCOUNTS: AppAccount[] = [
  {
    id: 'siswa_k1_alif',
    fullName: 'Alif Pratama',
    username: 'alif',
    password: '123',
    role: 'siswa',
    grade: 1,
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'siswa_k2_zahra',
    fullName: 'Zahra Aulia',
    username: 'zahra',
    password: '123',
    role: 'siswa',
    grade: 2,
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'siswa_k3_rayhan',
    fullName: 'Muhammad Rayhan',
    username: 'rayhan',
    password: '123',
    role: 'siswa',
    grade: 3,
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'siswa_k4_aisyah',
    fullName: 'Aisyah Humaira',
    username: 'aisyah',
    password: '123',
    role: 'siswa',
    grade: 4,
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'siswa_k5_fathan',
    fullName: 'Fathan Alfarizi',
    username: 'fathan',
    password: '123',
    role: 'siswa',
    grade: 5,
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'siswa_k6_naura',
    fullName: 'Naura Salsabila',
    username: 'naura',
    password: '123',
    role: 'siswa',
    grade: 6,
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'guru_fatimah',
    fullName: 'Ustadzah Fatimah',
    username: 'fatimah',
    password: 'guru123',
    role: 'guru',
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'guru_ahmad',
    fullName: 'Ustadz Ahmad',
    username: 'ahmad',
    password: 'guru123',
    role: 'guru',
    school: BIS_SCHOOL_NAME,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// Ambil seluruh akun tersimpan (gabungan bawaan + akun baru yang didaftarkan)
export function getSavedAccounts(): AppAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed: AppAccount[] = JSON.parse(raw);
    // Pastikan akun default tetap ada jika belum terdaftar
    const existingUsernames = new Set(parsed.map((a) => a.username.toLowerCase()));
    let needsUpdate = false;
    for (const def of DEFAULT_ACCOUNTS) {
      if (!existingUsernames.has(def.username.toLowerCase())) {
        parsed.push(def);
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

// Simpan akun baru
export function saveAccount(account: AppAccount): void {
  const accounts = getSavedAccounts();
  const existingIdx = accounts.findIndex(
    (a) => a.id === account.id || a.username.toLowerCase() === account.username.toLowerCase()
  );
  if (existingIdx >= 0) {
    accounts[existingIdx] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

// Validasi dan Registrasi Akun Baru
export function registerNewAccount(params: {
  fullName: string;
  username: string;
  password: string;
  role: 'siswa' | 'guru';
  grade?: number;
  school?: string;
  teacherCode?: string;
}): { success: boolean; message: string; account?: AppAccount } {
  const trimmedFull = params.fullName.trim();
  const trimmedUser = params.username.trim().toLowerCase();
  const trimmedPass = params.password.trim();

  if (!trimmedFull || trimmedFull.length < 3) {
    return { success: false, message: 'Nama lengkap minimal 3 karakter!' };
  }
  if (!trimmedUser || trimmedUser.length < 3) {
    return { success: false, message: 'Nama pengguna minimal 3 karakter tanpa spasi!' };
  }
  if (!trimmedPass || trimmedPass.length < 3) {
    return { success: false, message: 'Kata sandi minimal 3 karakter demi keamanan!' };
  }

  // Cek apakah username sudah dipakai
  const accounts = getSavedAccounts();
  const duplicate = accounts.find(
    (a) =>
      a.username.toLowerCase() === trimmedUser ||
      a.fullName.toLowerCase() === trimmedFull.toLowerCase()
  );
  if (duplicate) {
    return {
      success: false,
      message: `Nama "${trimmedFull}" atau username "${trimmedUser}" sudah terdaftar. Silakan gunakan nama lain atau langsung Masuk!`,
    };
  }

  // Verifikasi khusus guru
  if (params.role === 'guru') {
    const code = (params.teacherCode || '').trim().toUpperCase();
    if (code !== TEACHER_SECURITY_CODE && code !== '1234') {
      return {
        success: false,
        message: 'Kode Keamanan Guru salah! Hubungi staf sekolah untuk kode pendaftaran guru.',
      };
    }
  }

  // Verifikasi siswa
  let assignedGrade = 1;
  if (params.role === 'siswa') {
    assignedGrade = params.grade && params.grade >= 1 && params.grade <= 6 ? params.grade : 1;
  }

  const newAccount: AppAccount = {
    id: `${params.role}_${Date.now()}`,
    fullName: trimmedFull,
    username: trimmedUser,
    password: trimmedPass,
    role: params.role,
    grade: params.role === 'siswa' ? assignedGrade : undefined,
    school: params.school?.trim() || BIS_SCHOOL_NAME,
    createdAt: new Date().toISOString(),
  };

  saveAccount(newAccount);
  setActiveSession(newAccount);

  return {
    success: true,
    message: `Pendaftaran berhasil! Selamat datang di Game Edu Bis, ${newAccount.fullName}!`,
    account: newAccount,
  };
}

// Proses Login dengan Nama/Username dan Password
export function loginWithCredentials(
  nameOrUsername: string,
  passwordInput: string,
  targetRole?: 'siswa' | 'guru'
): { success: boolean; message: string; account?: AppAccount } {
  const query = nameOrUsername.trim().toLowerCase();
  const pass = passwordInput.trim();

  if (!query) {
    return { success: false, message: 'Silakan ketik nama atau nama pengguna!' };
  }
  if (!pass) {
    return { success: false, message: 'Silakan ketik kata sandi / password!' };
  }

  const accounts = getSavedAccounts();
  // Cari berdasarkan username persis atau nama lengkap
  const match = accounts.find((a) => {
    const uMatch = a.username.toLowerCase() === query;
    const nMatch = a.fullName.toLowerCase() === query;
    return uMatch || nMatch;
  });

  if (!match) {
    return {
      success: false,
      message: `Nama/pengguna "${nameOrUsername}" belum terdaftar. Silakan pilih tab "Daftar Akun Baru".`,
    };
  }

  if (targetRole && match.role !== targetRole) {
    return {
      success: false,
      message: `Akun "${match.fullName}" terdaftar sebagai ${match.role.toUpperCase()}, bukan ${targetRole.toUpperCase()}. Silakan ganti pilihan peran di atas.`,
    };
  }

  if (match.password !== pass) {
    return {
      success: false,
      message: 'Kata sandi / password salah! Silakan coba lagi.',
    };
  }

  // Set sesi aktif
  setActiveSession(match);

  return {
    success: true,
    message: `Berhasil masuk! Selamat belajar, ${match.fullName}!`,
    account: match,
  };
}

// Sesi aktif tersimpan di browser
export function getActiveSession(): AppAccount | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveSession(account: AppAccount | null): void {
  try {
    if (!account) {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(account));
    }
  } catch {
    // Ignore storage quota
  }
}

export function clearActiveSession(): void {
  setActiveSession(null);
}

// Pemeriksaan akses bab/materi berdasarkan tingkat kelas siswa
export function isChapterAccessibleForGrade(chapter: QuizChapter, studentGrade: number): boolean {
  // Jika bab diatur untuk "semua" kelas
  if (chapter.gradeLevel === 'semua') {
    return true;
  }

  // Jika bab menentukan targetGrades secara spesifik
  if (chapter.targetGrades && chapter.targetGrades.length > 0) {
    return chapter.targetGrades.includes(studentGrade);
  }

  // Jika gradeLevel bertipe string angka '1'..'6'
  if (chapter.gradeLevel === String(studentGrade)) {
    return true;
  }

  // Backward compatibility untuk 'rendah' (kelas 1-3) dan 'tinggi' (kelas 4-6)
  if (chapter.gradeLevel === 'rendah') {
    return studentGrade <= 3;
  }

  if (chapter.gradeLevel === 'tinggi') {
    return studentGrade >= 4;
  }

  return false;
}
