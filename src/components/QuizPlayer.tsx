import React, { useState, useEffect } from 'react';
import { QuizChapter, QuizQuestion, UserProfile } from '../types';
import { sound } from '../utils/audio';
import { fireStarSparkle, fireCelebrationConfetti } from '../utils/confetti';
import {
  Heart,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Lightbulb,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface QuizPlayerProps {
  chapter: QuizChapter;
  user: UserProfile;
  onFinish: (result: {
    chapterId: string;
    score: number;
    stars: number;
    xpEarned: number;
    coinsEarned: number;
    correctCount: number;
    totalQuestions: number;
    streakMax: number;
  }) => void;
  onExit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  chapter,
  user,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [comboText, setComboText] = useState<string | null>(null);

  const currentQ: QuizQuestion = chapter.questions[currentIndex];
  const totalQ = chapter.questions.length;
  const progressPercent = Math.round(((currentIndex) / totalQ) * 100);

  // Lifeline 50:50 - eliminates 2 wrong options
  const handleUseFiftyFifty = () => {
    if (fiftyFiftyUsed || isAnswered) return;
    sound.playPop();
    setFiftyFiftyUsed(true);

    const wrongIndices = currentQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentQ.correctIndex);

    // Pick 2 random wrong options to hide
    const shuffledWrong = [...wrongIndices].sort(() => 0.5 - Math.random());
    setHiddenOptions(shuffledWrong.slice(0, 2));
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;

    if (isCorrect) {
      sound.playCorrect();
      fireStarSparkle(0.5, 0.4);

      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      // Streak praise text
      if (newStreak === 2) setComboText('Bagus Sekali! 🌟');
      else if (newStreak === 3) setComboText('Hebat Banget! 🔥');
      else if (newStreak >= 4) setComboText('Luar Biasa Jenius! ⚡🚀');

      const streakBonus = (newStreak - 1) * 15;
      const questionPoints = 100 + streakBonus;
      setScore((prev) => prev + questionPoints);
      setCorrectCount((prev) => prev + 1);
    } else {
      sound.playWrong();
      setComboText(null);
      setCurrentStreak(0);
      setHearts((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextQuestion = () => {
    sound.playPop();
    setComboText(null);
    setShowHint(false);
    setHiddenOptions([]);
    setIsAnswered(false);
    setSelectedOption(null);

    // If hearts reach 0 or last question reached, finish quiz
    if (currentIndex + 1 >= totalQ || (hearts <= 1 && selectedOption !== currentQ.correctIndex)) {
      finalizeQuiz();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finalizeQuiz = () => {
    // Calculate stars: 3 stars for 90%+, 2 stars for 60%+, 1 star for 30%+
    const percent = Math.round((correctCount / totalQ) * 100);
    let stars = 1;
    if (percent >= 80) stars = 3;
    else if (percent >= 50) stars = 2;

    const baseCoins = correctCount * 8 + stars * 10;
    const baseXp = correctCount * 30 + stars * 25;

    if (stars === 3) {
      fireCelebrationConfetti();
    }

    onFinish({
      chapterId: chapter.id,
      score: score,
      stars: stars,
      xpEarned: baseXp,
      coinsEarned: baseCoins,
      correctCount: correctCount,
      totalQuestions: totalQ,
      streakMax: maxStreak,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4F7D32]/10 via-[#F8FAF6] to-[#FFD16A]/10 flex flex-col items-center justify-between p-3 sm:p-6 pb-12">
      {/* Top Header Bar */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border-2 border-[#4F7D32]/20 p-3 sm:p-4 flex items-center justify-between gap-3">
        {/* Exit Button */}
        <button
          onClick={() => {
            sound.playPop();
            onExit();
          }}
          className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-[#D9361E]/10 hover:text-[#D9361E] text-slate-600 flex items-center justify-center transition active:scale-95"
          title="Keluar Kuis"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar in the center */}
        <div className="flex-1 mx-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
            <span>
              Soal {currentIndex + 1} dari {totalQ}
            </span>
            <span className="text-[#4F7D32]">{chapter.title}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#FFD16A] via-[#F5B52E] to-[#4F7D32] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Hearts & Streak Status */}
        <div className="flex items-center gap-3">
          {/* Hearts */}
          <div className="flex items-center gap-0.5 bg-[#D9361E]/10 px-2.5 py-1.5 rounded-2xl border border-[#D9361E]/30">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-5 h-5 transition-transform ${
                  h <= hearts
                    ? 'text-[#D9361E] fill-[#D9361E] scale-100'
                    : 'text-slate-300 fill-slate-200 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Streak Flame */}
          {currentStreak > 1 && (
            <div className="flex items-center gap-1 bg-[#FFD16A]/30 px-2.5 py-1.5 rounded-2xl border border-[#F5B52E] animate-bounce-gentle">
              <Flame className="w-4 h-4 text-[#D9361E] fill-[#D9361E]" />
              <span className="text-xs font-black text-[#D9361E] font-kids">
                {currentStreak}x
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="w-full max-w-2xl my-4 flex-1 flex flex-col justify-center">
        {/* Combo Bubble notification */}
        {comboText && (
          <div className="self-center mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#F5B52E] to-[#D9361E] text-white font-extrabold text-xs sm:text-sm font-kids shadow-lg animate-wiggle">
            {comboText}
          </div>
        )}

        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-4 border-[#4F7D32]/30 relative overflow-hidden">
          {/* Decorative Corner Shape */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4F7D32]/5 rounded-bl-full -z-0 opacity-60" />

          {/* Question Meta & Illustration */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-5">
            {currentQ.illustrationEmoji && (
              <div className="w-20 h-20 rounded-3xl bg-[#4F7D32]/10 border-2 border-[#4F7D32]/25 flex items-center justify-center text-4xl shadow-inner flex-shrink-0 animate-bounce-gentle">
                {currentQ.illustrationEmoji}
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFD16A]/30 text-slate-800 border border-[#FFD16A] mb-2">
                Poin Kuis: {score} 🌟
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug font-kids">
                {currentQ.question}
              </h2>
            </div>
          </div>

          {/* Lifeline Aids: 50:50 and Hint Buttons */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400">Pilih Jawaban Benar:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUseFiftyFifty}
                disabled={fiftyFiftyUsed || isAnswered}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  fiftyFiftyUsed
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#FFD16A]/30 text-[#D9361E] hover:bg-[#FFD16A]/50 border border-[#FFD16A] active:scale-95'
                }`}
                title="Hapus 2 pilihan salah"
              >
                <Sparkles className="w-3.5 h-3.5" />
                50:50 {fiftyFiftyUsed && '(Terpakai)'}
              </button>

              {currentQ.hint && (
                <button
                  onClick={() => {
                    sound.playPop();
                    setShowHint(!showHint);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#4F7D32]/10 text-[#4F7D32] hover:bg-[#4F7D32]/20 border border-[#4F7D32]/30 transition active:scale-95"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Petunjuk
                </button>
              )}
            </div>
          </div>

          {/* Hint Card if revealed */}
          {showHint && currentQ.hint && (
            <div className="mb-4 p-3 bg-[#FFD16A]/20 rounded-2xl border-2 border-[#FFD16A] flex items-start gap-2 text-xs sm:text-sm text-slate-800 animate-fadeIn">
              <Lightbulb className="w-4 h-4 text-[#F5B52E] mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-[#4F7D32]">Petunjuk Guru SDIT BIS:</strong> {currentQ.hint}
              </div>
            </div>
          )}

          {/* Multiple Choice Option Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option, idx) => {
              if (hiddenOptions.includes(idx)) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center opacity-40 text-xs font-medium text-slate-400"
                  >
                    (Dieliminasi 50:50)
                  </div>
                );
              }

              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let btnStyle =
                'border-slate-200 bg-white hover:border-[#4F7D32] hover:bg-[#4F7D32]/5 text-slate-800';
              let badgeStyle = 'bg-slate-100 text-slate-600';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-[#4F7D32] bg-[#4F7D32]/10 text-[#4F7D32] font-bold shadow-md';
                  badgeStyle = 'bg-[#4F7D32] text-white';
                } else if (isSelected) {
                  btnStyle = 'border-[#D9361E] bg-[#D9361E]/10 text-[#D9361E] font-bold';
                  badgeStyle = 'bg-[#D9361E] text-white';
                } else {
                  btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border-3 text-left flex items-center gap-3 transition transform active:scale-98 cursor-pointer ${btnStyle}`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${badgeStyle}`}
                  >
                    {letters[idx]}
                  </span>
                  <span className="text-sm sm:text-base font-semibold leading-snug">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Educational Explanation Box (Shows right after answering) */}
          {isAnswered && (
            <div className="mt-5 p-4 rounded-2xl bg-[#4F7D32]/5 border-2 border-[#4F7D32]/25 text-slate-800 animate-fadeIn">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">
                  {selectedOption === currentQ.correctIndex ? '🎉' : '💡'}
                </span>
                <h4 className="text-sm font-bold font-kids text-[#4F7D32]">
                  {selectedOption === currentQ.correctIndex
                    ? 'Jawabanmu Tepat Sekali!'
                    : 'Penjelasan & Kunci Jawaban:'}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentQ.explanation}
              </p>
              {currentQ.funFact && (
                <div className="mt-2 pt-2 border-t border-[#4F7D32]/20 flex items-start gap-1.5 text-xs text-slate-800 font-medium">
                  <span className="text-[#D9361E] font-bold">Tahukah Kamu?</span>
                  <span>{currentQ.funFact}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="w-full max-w-2xl flex items-center justify-end">
        {isAnswered && (
          <button
            onClick={handleNextQuestion}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-extrabold text-base shadow-lg shadow-[#4F7D32]/30 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <span>
              {currentIndex + 1 >= totalQ || hearts <= 0
                ? 'Lihat Hasil Kuis 🏆'
                : 'Lanjut Soal Berikutnya ➡️'}
            </span>
            <ArrowRight className="w-5 h-5 text-[#FFD16A]" />
          </button>
        )}
      </div>
    </div>
  );
};
