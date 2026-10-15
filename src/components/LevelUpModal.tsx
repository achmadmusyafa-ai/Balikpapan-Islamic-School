import React, { useEffect } from 'react';
import { sound } from '../utils/audio';
import { fireCelebrationConfetti } from '../utils/confetti';
import { getLevelInfo } from '../utils/storage';
import { Sparkles, Trophy, Crown, ArrowRight } from 'lucide-react';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
  useEffect(() => {
    sound.playFanfare();
    fireCelebrationConfetti();
  }, []);

  const info = getLevelInfo(newLevel * 300); // Approximate helper info

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#F5B52E] text-center relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#FFD16A]/50 rounded-full blur-xl" />

        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#F5B52E] to-[#FFD16A] border-4 border-[#F5B52E] flex items-center justify-center text-5xl shadow-xl animate-bounce-gentle">
            👑
          </div>

          <span className="inline-block mt-3 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFD16A] text-slate-900 border border-[#F5B52E]">
            Hore! Naik Level! 🎉
          </span>

          <h2 className="text-3xl font-black font-kids text-slate-800 mt-2">
            LEVEL {newLevel}!
          </h2>

          <p className="text-sm font-bold text-[#4F7D32] mt-1 font-kids">
            Gelar Baru: {info.title}
          </p>

          {/* Reward Box */}
          <div className="my-5 p-4 bg-[#4F7D32]/10 rounded-2xl border-2 border-[#4F7D32]/30 text-left">
            <span className="text-[11px] font-bold text-[#4F7D32] uppercase block mb-1">
              Hadiah Terbuka:
            </span>
            <p className="text-xs text-slate-700 font-medium">
              ✨ {info.perk || 'Membuka item avatar baru & bab kuis seru!'}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-extrabold text-sm shadow-lg shadow-[#4F7D32]/40 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>Klaim & Lanjut Petualangan!</span>
            <ArrowRight className="w-4 h-4 text-[#FFD16A]" />
          </button>
        </div>
      </div>
    </div>
  );
};
