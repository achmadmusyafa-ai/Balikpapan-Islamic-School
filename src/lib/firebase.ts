import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocFromServer,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, LeaderboardEntry, QuizChapter } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline; offline cache will be used.');
    }
  }
}

// Student Login via Google
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error during Google Sign In', error);
    throw error;
  }
}

// Student Sign Out
export async function logoutStudent(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error during logout', error);
    throw error;
  }
}

// Sync user profile to Firestore
export async function syncUserProfileToCloud(profile: UserProfile, userId: string) {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const dataToSave = {
      userId,
      name: profile.name,
      school: profile.school,
      grade: profile.grade,
      email: auth.currentUser?.email || '',
      level: profile.level,
      currentXp: profile.currentXp,
      coins: profile.coins,
      totalStars: profile.totalStars,
      streakDays: profile.streakDays,
      avatar: profile.avatar,
      unlockedBadges: profile.unlockedBadges,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, dataToSave, { merge: true });

    // Also update public leaderboard entry
    const leaderboardRef = doc(db, 'leaderboard', userId);
    await setDoc(
      leaderboardRef,
      {
        userId,
        name: profile.name,
        school: profile.school,
        level: profile.level,
        totalXp: profile.currentXp,
        starsCount: profile.totalStars,
        badgesCount: profile.unlockedBadges.length,
        avatar: profile.avatar,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Load cloud profile for logged in user
export async function loadUserProfileFromCloud(userId: string): Promise<Partial<UserProfile> | null> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Fetch cloud leaderboard
export async function fetchCloudLeaderboard(): Promise<LeaderboardEntry[]> {
  const path = 'leaderboard';
  try {
    if (!auth.currentUser) return [];
    const q = query(collection(db, 'leaderboard'), orderBy('totalXp', 'desc'), limit(50));
    const snap = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      entries.push({
        id: data.userId || d.id,
        name: data.name || 'Siswa SD',
        school: data.school || 'SD Nusantara',
        level: data.level || 1,
        totalXp: data.totalXp || 0,
        starsCount: data.starsCount || 0,
        badgesCount: data.badgesCount || 0,
        avatar: data.avatar,
        isCurrentUser: data.userId === auth.currentUser?.uid,
      });
    });
    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Save or Update a Custom Chapter created by Teacher
export async function saveCustomChapterToCloud(chapter: QuizChapter): Promise<void> {
  const path = `custom_chapters/${chapter.id}`;
  try {
    const chapterRef = doc(db, 'custom_chapters', chapter.id);
    await setDoc(
      chapterRef,
      {
        ...chapter,
        teacherEmail: auth.currentUser?.email || 'guru@sd.belajar.id',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Delete a Custom Chapter
export async function deleteCustomChapterFromCloud(chapterId: string): Promise<void> {
  const path = `custom_chapters/${chapterId}`;
  try {
    const chapterRef = doc(db, 'custom_chapters', chapterId);
    await deleteDoc(chapterRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

// Fetch all Teacher Custom Chapters
export async function fetchCustomChaptersFromCloud(): Promise<QuizChapter[]> {
  const path = 'custom_chapters';
  try {
    const snap = await getDocs(collection(db, 'custom_chapters'));
    const chapters: QuizChapter[] = [];
    snap.forEach((d) => {
      const data = d.data();
      chapters.push({
        id: data.id || d.id,
        category: data.category || 'matematika',
        title: data.title || 'Materi Kuis Baru',
        description: data.description || '',
        icon: data.icon || '📝',
        themeColor: data.themeColor || 'indigo',
        badgeColor: data.badgeColor || 'bg-indigo-500',
        gradeLevel: data.gradeLevel || 'semua',
        requiredLevel: data.requiredLevel || 1,
        questions: data.questions || [],
      });
    });
    return chapters;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

