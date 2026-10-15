import React, { useEffect } from 'react';
import { Star, Award, Sparkles, RefreshCw, Home, Zap, Coins } from 'lucide-react';
import { sound } from '../utils/audio';

interface QuizResultsModalProps {
  result: {
    chapterId: string;
    score: number;
    stars: number;
    xpEarned: number;
    coinsEarned: number;
    correctCount: number;
    totalQuestions: number;
    streakMax: number;
  };
  onPlayAgain: () => void;
  onHome: () => void;
}

export const QuizResultsModal: React.FC<QuizResultsModalProps> = ({
  result,
  onPlayAgain,
  onHome,
}) => {
  useEffect(() => {
    sound.playFanfare();
  }, []);

  const percentage = Math.round((result.correctCount / result.totalQuestions) * 100);

  let title = 'Kerja Bagus! 👍';
  let message = 'Terus berlatih ya, siswa SDIT BIS pasti berprestasi!';
  if (result.stars === 3) {
    title = 'Luar Biasa Jenius! 🌟👑';
    message = 'Nilai sempurna! Bintang kebanggaan SDIT Balikpapan Islamic School!';
  } else if (result.stars === 2) {
    title = 'Hebat Sekali! 🎉';
    message = 'Hampir sempurna! Sedikit lagi menuju 3 bintang emas!';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#F5B52E] text-center relative overflow-hidden">
        {/* Glow circle background */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FFD16A]/40 rounded-full blur-2xl -z-0" />

        {/* Stars Podium */}
        <div className="relative z-10 flex items-center justify-center gap-3 my-2">
          {/* Star 1 */}
          <div
            className={`transition-all duration-500 transform ${
              result.stars >= 1 ? 'scale-110 rotate-[-8deg]' : 'opacity-30 scale-90'
            }`}
          >
            <Star
              className={`w-12 h-12 ${
                result.stars >= 1
                  ? 'text-[#F5B52E] fill-[#F5B52E] drop-shadow-md'
                  : 'text-slate-300 fill-slate-200'
              }`}
            />
          </div>

          {/* Star 2 (Middle, Highest) */}
          <div
            className={`transition-all duration-500 transform -translate-y-2 ${
              result.stars >= 2 ? 'scale-125' : 'opacity-30 scale-90'
            }`}
          >
            <Star
              className={`w-16 h-16 ${
                result.stars >= 2
                  ? 'text-[#F5B52E] fill-[#F5B52E] drop-shadow-lg animate-pulse-glow'
                  : 'text-slate-300 fill-slate-200'
              }`}
            />
          </div>

          {/* Star 3 */}
          <div
            className={`transition-all duration-500 transform ${
              result.stars >= 3 ? 'scale-110 rotate-[8deg]' : 'opacity-30 scale-90'
            }`}
          >
            <Star
              className={`w-12 h-12 ${
                result.stars >= 3
                  ? 'text-[#F5B52E] fill-[#F5B52E] drop-shadow-md'
                  : 'text-slate-300 fill-slate-200'
              }`}
            />
          </div>
        </div>

        {/* Headings */}
        <div className="relative z-10 mt-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-kids tracking-wide">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {message}
          </p>
        </div>

        {/* Score & Rewards Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-3 my-5">
          {/* Accuracy & Score */}
          <div className="bg-[#4F7D32]/10 p-3.5 rounded-2xl border-2 border-[#4F7D32]/30 flex flex-col items-center">
            <span className="text-[11px] font-bold text-[#4F7D32] uppercase">Ketepatan</span>
            <span className="text-2xl font-black text-[#4F7D32] font-kids">
              {percentage}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {result.correctCount} dari {result.totalQuestions} Soal
            </span>
          </div>

          {/* Points */}
          <div className="bg-[#FFD16A]/20 p-3.5 rounded-2xl border-2 border-[#FFD16A] flex flex-col items-center">
            <span className="text-[11px] font-bold text-slate-800 uppercase">Skor Kuis</span>
            <span className="text-2xl font-black text-[#F5B52E] font-kids">
              {result.score}
            </span>
            <span className="text-[10px] text-[#D9361E] font-bold">
              Streak: {result.streakMax}x 🔥
            </span>
          </div>

          {/* XP Gained */}
          <div className="bg-[#4F7D32]/10 p-3.5 rounded-2xl border-2 border-[#4F7D32]/25 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-[#4F7D32] fill-[#4F7D32]" />
            <div className="text-left">
              <span className="block text-[10px] font-bold text-[#4F7D32] uppercase">Dapat XP</span>
              <span className="text-lg font-black text-[#4F7D32] font-kids">+{result.xpEarned} XP</span>
            </div>
          </div>

          {/* Coins Gained */}
          <div className="bg-[#D9361E]/10 p-3.5 rounded-2xl border-2 border-[#D9361E]/25 flex items-center justify-center gap-2">
            <Coins className="w-5 h-5 text-[#D9361E] fill-[#D9361E]" />
            <div className="text-left">
              <span className="block text-[10px] font-bold text-[#D9361E] uppercase">Dapat Koin</span>
              <span className="text-lg font-black text-[#D9361E] font-kids">+{result.coinsEarned}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => {
              sound.playPop();
              onPlayAgain();
            }}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Main Lagi
          </button>
          <button
            onClick={() => {
              sound.playPop();
              onHome();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-bold text-sm shadow-md shadow-[#4F7D32]/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Home className="w-4 h-4 text-[#FFD16A]" />
            Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
