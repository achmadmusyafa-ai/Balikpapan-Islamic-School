import React from 'react';
import { QuizChapter, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { Star, Lock, Play } from 'lucide-react';

interface SubjectCardProps {
  chapter: QuizChapter;
  user: UserProfile;
  onSelect: (chapter: QuizChapter) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ chapter, user, onSelect }) => {
  const isLocked = user.level < chapter.requiredLevel;
  const completedInfo = user.completedQuizIds[chapter.id];
  const starsEarned = completedInfo?.stars || 0;

  // Background and border styles by category, using BIS colors harmonious accents
  const themeStyles: Record<string, { bgGrad: string; border: string; accent: string; btnGrad: string }> = {
    matematika: {
      bgGrad: 'from-[#4F7D32] to-[#3B5F25]',
      border: 'border-[#4F7D32]/30 hover:border-[#4F7D32]',
      accent: 'text-[#4F7D32] bg-[#4F7D32]/10',
      btnGrad: 'from-[#4F7D32] to-[#3B5F25]',
    },
    ipa: {
      bgGrad: 'from-teal-600 to-emerald-700',
      border: 'border-teal-200 hover:border-teal-500',
      accent: 'text-teal-800 bg-teal-50',
      btnGrad: 'from-teal-600 to-emerald-700',
    },
    indonesia: {
      bgGrad: 'from-[#D9361E] to-[#B92812]',
      border: 'border-[#D9361E]/30 hover:border-[#D9361E]',
      accent: 'text-[#D9361E] bg-[#D9361E]/10',
      btnGrad: 'from-[#D9361E] to-[#B92812]',
    },
    ips: {
      bgGrad: 'from-[#F5B52E] to-[#DF9F20]',
      border: 'border-[#F5B52E]/40 hover:border-[#F5B52E]',
      accent: 'text-amber-900 bg-[#FFD16A]/30',
      btnGrad: 'from-[#F5B52E] to-[#DF9F20]',
    },
    inggris: {
      bgGrad: 'from-[#3B5F25] to-[#2A441A]',
      border: 'border-[#4F7D32]/30 hover:border-[#4F7D32]',
      accent: 'text-[#4F7D32] bg-[#4F7D32]/10',
      btnGrad: 'from-[#3B5F25] to-[#2A441A]',
    },
  };

  const style = themeStyles[chapter.category] || themeStyles.matematika;

  return (
    <div
      onClick={() => {
        if (!isLocked) {
          sound.playPop();
          onSelect(chapter);
        }
      }}
      className={`relative bg-white rounded-3xl p-5 border-2 transition-all duration-300 shadow-md flex flex-col justify-between ${
        style.border
      } ${
        isLocked
          ? 'opacity-70 cursor-not-allowed bg-slate-50/90'
          : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Card Header Banner */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${style.bgGrad} flex items-center justify-center text-3xl shadow-md text-white ${
              !isLocked ? 'animate-bounce-gentle' : ''
            }`}
          >
            {chapter.icon}
          </div>

          {/* Stars or Lock status */}
          <div>
            {isLocked ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                <Lock className="w-3.5 h-3.5" /> Level {chapter.requiredLevel}
              </span>
            ) : (
              <div className="flex items-center gap-1 bg-[#FFD16A]/20 px-2.5 py-1 rounded-full border border-[#FFD16A]/50">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-4 h-4 ${
                      starIdx <= starsEarned
                        ? 'text-[#F5B52E] fill-[#F5B52E]'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-base sm:text-lg font-black text-slate-800 font-kids leading-tight">
          {chapter.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-snug">
          {chapter.description}
        </p>
      </div>

      {/* Card Footer: Questions count and action button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${style.accent}`}>
            {chapter.questions.length} Soal
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#4F7D32]/10 text-[#4F7D32] border border-[#4F7D32]/20">
            {chapter.targetGrades && chapter.targetGrades.length > 0
              ? `Kelas ${chapter.targetGrades.join(', ')}`
              : (chapter.gradeLevel === 'semua' ? 'Semua Kelas' : `Kelas ${chapter.gradeLevel}`)}
          </span>
        </div>

        <button
          disabled={isLocked}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs transition ${
            isLocked
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : `bg-gradient-to-r ${style.btnGrad} text-white shadow-sm hover:opacity-90 active:scale-95`
          }`}
        >
          {isLocked ? (
            <span>Terkunci</span>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{completedInfo ? 'Main Ulang' : 'Mulai Main'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
