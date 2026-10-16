import React, { useState } from 'react';
import { QuizChapter, QuizQuestion, SubjectCategory } from '../types';
import { sound } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { saveCustomChapterToCloud, deleteCustomChapterFromCloud } from '../lib/firebase';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Lock,
  Unlock,
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Layers,
  Save,
  AlertCircle,
  Eye,
} from 'lucide-react';

import { getSavedAccounts } from '../utils/accounts';

interface TeacherDashboardModalProps {
  chapters: QuizChapter[];
  onUpdateChapters: (updated: QuizChapter[]) => void;
  currentUserEmail?: string | null;
  activeRole?: 'siswa' | 'guru';
  activeAccountName?: string;
  onClose: () => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  chapters,
  onUpdateChapters,
  currentUserEmail,
  activeRole,
  activeAccountName,
  onClose,
}) => {
  // Check if current user is admin/teacher by email, role, or PIN
  const isAutoTeacher = currentUserEmail === 'achmadmusyafa88@gmail.com' || activeRole === 'guru';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isAutoTeacher);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Sub-tabs in Ruang Guru
  const [dashboardTab, setDashboardTab] = useState<'bankSoal' | 'daftarSiswa'>('bankSoal');

  // Management State
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // New Chapter Form State
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDesc, setNewChapterDesc] = useState('');
  const [newChapterCategory, setNewChapterCategory] = useState<SubjectCategory>('matematika');
  const [newChapterIcon, setNewChapterIcon] = useState('📝');
  const [newChapterGrade, setNewChapterGrade] = useState<'semua' | '1' | '2' | '3' | '4' | '5' | '6' | 'rendah' | 'tinggi'>('semua');

  // Question Form State
  const [qQuestion, setQQuestion] = useState('');
  const [qEmoji, setQEmoji] = useState('💡');
  const [qOption0, setQOption0] = useState('');
  const [qOption1, setQOption1] = useState('');
  const [qOption2, setQOption2] = useState('');
  const [qOption3, setQOption3] = useState('');
  const [qCorrectIndex, setQCorrectIndex] = useState<number>(0);
  const [qHint, setQHint] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qFunFact, setQFunFact] = useState('');
  const [qGradeLevel, setQGradeLevel] = useState<'semua' | 'rendah' | 'tinggi' | '1' | '2' | '3' | '4' | '5' | '6'>('1');

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  const handleVerifyPin = () => {
    sound.playPop();
    // Default PIN: 1234
    if (pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError(null);
      sound.playFanfare();
    } else {
      setPinError('PIN salah! PIN bawaan guru adalah 1234');
      sound.playWrong();
    }
  };

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) {
      alert('Mohon isi judul materi kuis!');
      return;
    }
    sound.playPop();
    setIsSaving(true);

    const newId = `custom_${Date.now()}`;
    const targetGrades =
      newChapterGrade === 'semua'
        ? [1, 2, 3, 4, 5, 6]
        : newChapterGrade === 'rendah'
        ? [1, 2, 3]
        : newChapterGrade === 'tinggi'
        ? [4, 5, 6]
        : [Number(newChapterGrade)];

    const newChapter: QuizChapter = {
      id: newId,
      category: newChapterCategory,
      title: newChapterTitle.trim(),
      description: newChapterDesc.trim() || 'Materi kuis tambahan dari Bapak/Ibu Guru',
      icon: newChapterIcon || '📝',
      themeColor: 'indigo',
      badgeColor: 'bg-indigo-500',
      gradeLevel: newChapterGrade,
      targetGrades,
      requiredLevel: 1,
      questions: [],
    };

    const updated = [newChapter, ...chapters];
    onUpdateChapters(updated);
    setSelectedChapterId(newId);
    setIsAddingChapter(false);

    // Sync to Cloud Firestore
    try {
      await saveCustomChapterToCloud(newChapter);
      setFeedbackMsg('Bab kuis baru berhasil dibuat dan disimpan ke cloud!');
      sound.playFanfare();
    } catch {
      setFeedbackMsg('Bab tersimpan secara lokal.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleOpenAddQuestion = () => {
    sound.playPop();
    setEditingQuestionId(null);
    setQQuestion('');
    setQEmoji('💡');
    setQOption0('');
    setQOption1('');
    setQOption2('');
    setQOption3('');
    setQCorrectIndex(0);
    setQHint('');
    setQExplanation('');
    setQFunFact('');
    setQGradeLevel(selectedChapter.gradeLevel === 'tinggi' ? 'tinggi' : 'rendah');
    setIsAddingQuestion(true);
  };

  const handleOpenEditQuestion = (q: QuizQuestion) => {
    sound.playPop();
    setEditingQuestionId(q.id);
    setQQuestion(q.question);
    setQEmoji(q.illustrationEmoji || '💡');
    setQOption0(q.options[0] || '');
    setQOption1(q.options[1] || '');
    setQOption2(q.options[2] || '');
    setQOption3(q.options[3] || '');
    setQCorrectIndex(q.correctIndex || 0);
    setQHint(q.hint || '');
    setQExplanation(q.explanation || '');
    setQFunFact(q.funFact || '');
    setQGradeLevel(q.gradeLevel || 'rendah');
    setIsAddingQuestion(true);
  };

  const handleSaveQuestion = async () => {
    if (!qQuestion.trim() || !qOption0.trim() || !qOption1.trim()) {
      alert('Mohon isi teks pertanyaan dan minimal 2 pilihan jawaban!');
      return;
    }
    sound.playPop();
    setIsSaving(true);

    const questionObj: QuizQuestion = {
      id: editingQuestionId || `q_${Date.now()}`,
      category: selectedChapter.category,
      gradeLevel: qGradeLevel,
      question: qQuestion.trim(),
      illustrationEmoji: qEmoji || '💡',
      options: [qOption0.trim(), qOption1.trim(), qOption2.trim() || 'Pilihan C', qOption3.trim() || 'Pilihan D'],
      correctIndex: qCorrectIndex,
      hint: qHint.trim() || undefined,
      explanation: qExplanation.trim() || `Kunci jawaban yang benar adalah pilihan ${['A', 'B', 'C', 'D'][qCorrectIndex]}.`,
      funFact: qFunFact.trim() || undefined,
    };

    let updatedQuestions: QuizQuestion[];
    if (editingQuestionId) {
      updatedQuestions = selectedChapter.questions.map((q) =>
        q.id === editingQuestionId ? questionObj : q
      );
    } else {
      updatedQuestions = [...selectedChapter.questions, questionObj];
    }

    const updatedChapter: QuizChapter = {
      ...selectedChapter,
      questions: updatedQuestions,
    };

    const updatedAllChapters = chapters.map((c) =>
      c.id === updatedChapter.id ? updatedChapter : c
    );

    onUpdateChapters(updatedAllChapters);
    setIsAddingQuestion(false);

    try {
      await saveCustomChapterToCloud(updatedChapter);
      setFeedbackMsg('Soal kuis berhasil disimpan ke Cloud Firestore!');
      sound.playCorrect();
    } catch {
      setFeedbackMsg('Soal tersimpan di database lokal.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Apakah Bapak/Ibu Guru yakin ingin menghapus soal ini?')) return;
    sound.playPop();
    const updatedQuestions = selectedChapter.questions.filter((q) => q.id !== qId);
    const updatedChapter: QuizChapter = {
      ...selectedChapter,
      questions: updatedQuestions,
    };

    const updatedAllChapters = chapters.map((c) =>
      c.id === updatedChapter.id ? updatedChapter : c
    );
    onUpdateChapters(updatedAllChapters);

    try {
      await saveCustomChapterToCloud(updatedChapter);
    } catch {
      // Ignore
    }
  };

  const handleDeleteChapter = async (chapId: string) => {
    if (!confirm('Apakah Bapak/Ibu yakin ingin menghapus seluruh bab materi kuis ini?')) return;
    sound.playPop();
    const updated = chapters.filter((c) => c.id !== chapId);
    onUpdateChapters(updated);
    if (selectedChapterId === chapId && updated.length > 0) {
      setSelectedChapterId(updated[0].id);
    }
    try {
      await deleteCustomChapterFromCloud(chapId);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-4 border-[#4F7D32] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] p-5 sm:p-6 text-white flex items-center justify-between shadow-md">
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
              <h2 className="text-xl sm:text-2xl font-bold font-kids tracking-wide flex items-center gap-2">
                <span>Ruang Guru • Game Edu Bis</span>
                <span className="text-xs bg-[#FFD16A] text-slate-900 px-2.5 py-0.5 rounded-full font-black">
                  SDIT Balikpapan Islamic School
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Kelola dan ubah bank soal kuis pelajaran SD sesuai kurikulum SDIT Balikpapan Islamic School
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

        {/* FEEDBACK BANNER */}
        {feedbackMsg && (
          <div className="bg-[#4F7D32] text-white px-4 py-2 text-xs sm:text-sm font-bold text-center animate-fadeIn">
            ✅ {feedbackMsg}
          </div>
        )}

        {/* ACCESS GATE: PIN PROTECTION */}
        {!isAuthenticated ? (
          <div className="p-8 text-center max-w-md mx-auto my-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#4F7D32]/10 border-2 border-[#4F7D32]/30 flex items-center justify-center text-3xl text-[#4F7D32]">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold font-kids text-slate-800">
              Akses Khusus Pendidik / Guru SDIT BIS
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan PIN guru untuk membuka halaman kelola soal kuis. (PIN Bawaan Guru: <strong>1234</strong>)
            </p>

            <div className="flex items-center gap-2 max-w-xs mx-auto">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                placeholder="Ketik PIN (1234)"
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 text-center font-black tracking-widest text-lg focus:border-[#4F7D32] focus:outline-none"
              />
              <button
                onClick={handleVerifyPin}
                className="px-5 py-2.5 rounded-2xl bg-[#4F7D32] hover:bg-[#3B5F25] text-white font-bold text-sm shadow transition active:scale-95 whitespace-nowrap"
              >
                Buka
              </button>
            </div>

            {pinError && (
              <p className="text-xs text-[#D9361E] font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{pinError}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Top Sub-tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/70">
              <button
                onClick={() => {
                  sound.playPop();
                  setDashboardTab('bankSoal');
                }}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold font-kids transition flex items-center gap-1.5 border-b-2 ${
                  dashboardTab === 'bankSoal'
                    ? 'border-[#4F7D32] text-[#4F7D32] font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Kelola Bank Soal & Materi ({chapters.length})</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  setDashboardTab('daftarSiswa');
                }}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold font-kids transition flex items-center gap-1.5 border-b-2 ${
                  dashboardTab === 'daftarSiswa'
                    ? 'border-[#4F7D32] text-[#4F7D32] font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>👥</span>
                <span>Data Siswa & Hak Akses Kelas</span>
              </button>
            </div>

            {dashboardTab === 'daftarSiswa' ? (
              <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black font-kids text-slate-800">
                      Daftar Akun Siswa & Pendidik Terdaftar 🏫
                    </h3>
                    <p className="text-xs text-slate-500">
                      Daftar akun di SDIT Balikpapan Islamic School beserta hak akses kelasnya.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getSavedAccounts().map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#4F7D32]/40 transition shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              acc.role === 'guru'
                                ? 'bg-[#D9361E]/10 text-[#D9361E] border border-[#D9361E]/30'
                                : 'bg-[#4F7D32]/10 text-[#4F7D32] border border-[#4F7D32]/30'
                            }`}
                          >
                            {acc.role === 'guru' ? '👨‍🏫 Guru / Pendidik' : `🎒 Siswa Kelas ${acc.grade || 1}`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            @{acc.username}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 font-kids">
                          {acc.fullName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {acc.school}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Sandi: <strong className="font-mono text-slate-800">{acc.password}</strong></span>
                        <span className="text-[10px] text-slate-400">
                          {acc.role === 'siswa' ? `Akses: Kls ${acc.grade || 1}` : 'Akses: Semua'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[520px] overflow-y-auto">
                {/* Left Column: Chapter List */}
                <div className="md:col-span-4 border-r border-slate-200 pr-0 md:pr-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Daftar Bab Kuis ({chapters.length})
                </span>
                <button
                  onClick={() => {
                    sound.playPop();
                    setIsAddingChapter(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#4F7D32]/10 hover:bg-[#4F7D32]/20 text-[#4F7D32] font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bab Baru</span>
                </button>
              </div>

              {/* Add Chapter Form */}
              {isAddingChapter && (
                <div className="p-3 bg-[#4F7D32]/5 rounded-2xl border-2 border-[#4F7D32]/20 space-y-2 animate-fadeIn">
                  <h4 className="text-xs font-bold text-[#4F7D32] font-kids">
                    Tambah Bab Kuis Baru
                  </h4>
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Judul Bab (mis: Pecahan Seru)"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:border-[#4F7D32]"
                  />
                  <input
                    type="text"
                    value={newChapterDesc}
                    onChange={(e) => setNewChapterDesc(e.target.value)}
                    placeholder="Deskripsi singkat"
                    className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#4F7D32]"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={newChapterCategory}
                      onChange={(e) => setNewChapterCategory(e.target.value as SubjectCategory)}
                      className="px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                    >
                      <option value="matematika">Matematika</option>
                      <option value="ipa">IPA / Sains</option>
                      <option value="indonesia">B. Indonesia</option>
                      <option value="ips">IPS Nusantara</option>
                      <option value="inggris">Fun English</option>
                    </select>
                    <select
                      value={newChapterGrade}
                      onChange={(e) => setNewChapterGrade(e.target.value as any)}
                      className="px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                    >
                      <option value="semua">Semua Kelas</option>
                      <option value="1">Khusus Kelas 1</option>
                      <option value="2">Khusus Kelas 2</option>
                      <option value="3">Khusus Kelas 3</option>
                      <option value="4">Khusus Kelas 4</option>
                      <option value="5">Khusus Kelas 5</option>
                      <option value="6">Khusus Kelas 6</option>
                      <option value="rendah">Kelas 1-3 SD</option>
                      <option value="tinggi">Kelas 4-6 SD</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setIsAddingChapter(false)}
                      className="px-2.5 py-1 rounded-xl text-slate-500 font-bold text-xs"
                    >
                      Batal
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={handleCreateChapter}
                      className="px-3 py-1 rounded-xl bg-[#4F7D32] hover:bg-[#3B5F25] text-white font-bold text-xs"
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan Bab'}
                    </button>
                  </div>
                </div>
              )}

              {/* List Chapters */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {chapters.map((chap) => {
                  const isSelected = chap.id === selectedChapterId;
                  return (
                    <div
                      key={chap.id}
                      onClick={() => {
                        sound.playPop();
                        setSelectedChapterId(chap.id);
                        setIsAddingQuestion(false);
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-[#4F7D32] bg-[#4F7D32]/10 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-[#4F7D32]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl flex-shrink-0">{chap.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate font-kids">
                            {chap.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {chap.questions.length} Soal • Kelas {chap.gradeLevel}
                          </span>
                        </div>
                      </div>

                      {chap.id.startsWith('custom_') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(chap.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-[#D9361E] hover:bg-[#D9361E]/10"
                          title="Hapus Bab Kustom"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Questions in Selected Chapter */}
            <div className="md:col-span-8 flex flex-col space-y-4">
              {/* Selected Chapter Header */}
              {selectedChapter && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 bg-[#4F7D32]/10 rounded-2xl">{selectedChapter.icon}</span>
                    <div>
                      <h3 className="text-base font-bold font-kids text-slate-800">
                        {selectedChapter.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {selectedChapter.questions.length} Pertanyaan Aktif
                      </p>
                    </div>
                  </div>

                  {!isAddingQuestion && (
                    <button
                      onClick={handleOpenAddQuestion}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-bold text-xs shadow flex items-center gap-1.5 transition active:scale-95 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 text-[#FFD16A]" />
                      <span>Tambah Soal Baru</span>
                    </button>
                  )}
                </div>
              )}

              {/* Question Editor Form */}
              {isAddingQuestion ? (
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-[#4F7D32]/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-kids text-[#4F7D32] flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#4F7D32]" />
                      <span>{editingQuestionId ? 'Edit Soal Kuis' : 'Buat Soal Pilihan Ganda Baru'}</span>
                    </h4>
                    <button
                      onClick={() => setIsAddingQuestion(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                    >
                      Tutup
                    </button>
                  </div>

                  {/* Question input */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Kalimat Pertanyaan:
                    </label>
                    <textarea
                      rows={2}
                      value={qQuestion}
                      onChange={(e) => setQQuestion(e.target.value)}
                      placeholder="Tulis soal kuis untuk murid..."
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-[#4F7D32] focus:outline-none text-xs font-semibold"
                    />
                  </div>

                  {/* Multiple Choices (A, B, C, D) & Correct Answer Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Pilihan Jawaban (Pilih lingkaran sebagai Kunci Jawaban Benar):
                    </label>
                    <div className="space-y-2">
                      {[
                        { label: 'A', val: qOption0, set: setQOption0, idx: 0 },
                        { label: 'B', val: qOption1, set: setQOption1, idx: 1 },
                        { label: 'C', val: qOption2, set: setQOption2, idx: 2 },
                        { label: 'D', val: qOption3, set: setQOption3, idx: 3 },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQCorrectIndex(item.idx)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                              qCorrectIndex === item.idx
                                ? 'bg-[#4F7D32] text-white shadow-sm ring-2 ring-[#4F7D32]/30'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Jadikan Kunci Jawaban Benar"
                          >
                            {item.label}
                          </button>
                          <input
                            type="text"
                            value={item.val}
                            onChange={(e) => item.set(e.target.value)}
                            placeholder={`Pilihan ${item.label}...`}
                            className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                              qCorrectIndex === item.idx
                                ? 'border-[#4F7D32] bg-[#4F7D32]/10 font-bold'
                                : 'border-slate-200 bg-white'
                            }`}
                          />
                          {qCorrectIndex === item.idx && (
                            <span className="text-[10px] font-bold text-[#4F7D32] flex items-center gap-0.5 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-[#4F7D32]" /> Jawaban Benar
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hint and Explanation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Petunjuk Cilik (Hint):
                      </label>
                      <input
                        type="text"
                        value={qHint}
                        onChange={(e) => setQHint(e.target.value)}
                        placeholder="Contoh: Ingat sifat komutatif..."
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#4F7D32]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Emoji Ilustrasi:
                      </label>
                      <input
                        type="text"
                        value={qEmoji}
                        maxLength={4}
                        onChange={(e) => setQEmoji(e.target.value)}
                        placeholder="Emoji (misal: 🍎 atau 🚀)"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#4F7D32]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Penjelasan & Fakta Menarik (Tahukah Kamu?):
                    </label>
                    <input
                      type="text"
                      value={qExplanation}
                      onChange={(e) => setQExplanation(e.target.value)}
                      placeholder="Penjelasan edukatif saat murid menjawab..."
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white mb-1.5 focus:border-[#4F7D32]"
                    />
                    <input
                      type="text"
                      value={qFunFact}
                      onChange={(e) => setQFunFact(e.target.value)}
                      placeholder="Fakta unik menarik (opsional)..."
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-[#4F7D32]"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => setIsAddingQuestion(false)}
                      className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs"
                    >
                      Batal
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={handleSaveQuestion}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-bold text-xs shadow flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-[#FFD16A]" />
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Soal'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Question List */
                <div className="space-y-2.5">
                  {selectedChapter.questions.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">
                        Belum ada soal di bab ini. Klik tombol <strong>"Tambah Soal Baru"</strong> untuk mulai menulis soal!
                      </p>
                    </div>
                  ) : (
                    selectedChapter.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-[#4F7D32]/40 transition flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#4F7D32]/10 text-[#4F7D32] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                              {q.question}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500 font-medium">
                              <span className="text-[#4F7D32] font-bold bg-[#4F7D32]/10 px-2 py-0.5 rounded-full border border-[#4F7D32]/30">
                                Kunci: {q.options[q.correctIndex]}
                              </span>
                              <span>• {q.options.length} Pilihan</span>
                              {q.illustrationEmoji && <span>• {q.illustrationEmoji}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEditQuestion(q)}
                            className="p-1.5 rounded-xl hover:bg-[#4F7D32]/10 text-slate-400 hover:text-[#4F7D32]"
                            title="Edit Soal"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 rounded-xl hover:bg-[#D9361E]/10 text-slate-400 hover:text-[#D9361E]"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isAuthenticated
              ? '✨ Perubahan soal tersimpan dan disinkronkan ke seluruh murid.'
              : 'Gunakan PIN 1234 untuk masuk.'}
          </span>
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="px-5 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
          >
            Tutup Ruang Guru
          </button>
        </div>
      </div>
    </div>
  );
};
