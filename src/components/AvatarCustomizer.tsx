import React, { useState } from 'react';
import { AvatarConfig, UserProfile } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { sound } from '../utils/audio';
import { Sparkles, Lock, Check, Shirt, Smile, User, Palette, PawPrint, X } from 'lucide-react';

interface AvatarCustomizerProps {
  user: UserProfile;
  onSave: (newAvatar: AvatarConfig, updatedProfile: Partial<UserProfile>) => void;
  onClose: () => void;
}

type TabKey = 'face' | 'hair' | 'outfit' | 'accessory' | 'pet' | 'background';

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  user,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('outfit');
  const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>({ ...user.avatar });

  const skinTones = [
    { label: 'Cerah', hex: '#FFE0BD' },
    { label: 'Kuning Langsat', hex: '#FCD7B0' },
    { label: 'Sawo Matang', hex: '#F3C59D' },
    { label: 'Eksotis', hex: '#E0AC69' },
    { label: 'Manis', hex: '#D6945A' },
  ];

  const hairColors = [
    { label: 'Hitam', hex: '#1E293B' },
    { label: 'Cokelat Gelap', hex: '#451A03' },
    { label: 'Cokelat Madu', hex: '#78350F' },
    { label: 'Biru Tengah Malam', hex: '#1E1B4B' },
  ];

  const hairStyles: { id: AvatarConfig['hairStyle']; label: string; icon: string }[] = [
    { id: 'short', label: 'Pendek Rapi', icon: '👦' },
    { id: 'pigtails', label: 'Kuncir Dua', icon: '👧' },
    { id: 'curly', label: 'Keriting Keren', icon: '🧑‍🦱' },
    { id: 'spiky', label: 'Mohawk Seru', icon: '⚡' },
    { id: 'hijab', label: 'Jilbab Anggun', icon: '🧕' },
    { id: 'wavy', label: 'Ombak Cantik', icon: '🧒' },
  ];

  const expressions: { id: AvatarConfig['expression']; label: string; icon: string }[] = [
    { id: 'happy', label: 'Gembira', icon: '😄' },
    { id: 'wink', label: 'Kedip Mata', icon: '😉' },
    { id: 'starry', label: 'Bintang Terang', icon: '🤩' },
    { id: 'cool', label: 'Keren Banget', icon: '😎' },
    { id: 'glasses', label: 'Kacamata Belajar', icon: '🤓' },
  ];

  const outfits: { id: AvatarConfig['outfit']; label: string; minLevel: number; icon: string }[] = [
    { id: 'seragam_sd', label: 'Seragam Merah Putih SD', minLevel: 1, icon: '🎒' },
    { id: 'pramuka', label: 'Seragam Pramuka', minLevel: 1, icon: '🏕️' },
    { id: 'dokter', label: 'Jas Dokter Cilik', minLevel: 2, icon: '🩺' },
    { id: 'petualang', label: 'Petualang Rimba', minLevel: 3, icon: '🧭' },
    { id: 'superhero', label: 'Kostum Superhero Bintang', minLevel: 4, icon: '🦸' },
    { id: 'astronot', label: 'Baju Astronot Luar Angkasa', minLevel: 6, icon: '🚀' },
  ];

  const accessories: { id: AvatarConfig['accessory']; label: string; minLevel: number; icon: string }[] = [
    { id: 'none', label: 'Tanpa Aksesoris', minLevel: 1, icon: '❌' },
    { id: 'topi_sd', label: 'Topi Merah SD', minLevel: 1, icon: '🧢' },
    { id: 'bando_bunga', label: 'Bando Pita Bunga', minLevel: 1, icon: '🌸' },
    { id: 'kacamata_bintang', label: 'Kacamata Bintang Seru', minLevel: 2, icon: '👓' },
    { id: 'mahkota', label: 'Mahkota Emas Juara', minLevel: 3, icon: '👑' },
    { id: 'topi_wisuda', label: 'Topi Sarjana Cilik', minLevel: 5, icon: '🎓' },
  ];

  const pets: { id: AvatarConfig['pet']; label: string; minLevel: number; icon: string }[] = [
    { id: 'none', label: 'Tanpa Peliharaan', minLevel: 1, icon: '❌' },
    { id: 'kucing', label: 'Kucing Oyen Manja', minLevel: 2, icon: '🐱' },
    { id: 'kelinci', label: 'Kelinci Putih Gemoy', minLevel: 3, icon: '🐰' },
    { id: 'burung_hantu', label: 'Burung Hantu Bijak', minLevel: 4, icon: '🦉' },
    { id: 'robot', label: 'Robot Mini Cerdas', minLevel: 5, icon: '🤖' },
    { id: 'naga', label: 'Naga Hijau Ceria', minLevel: 7, icon: '🐲' },
  ];

  const backgrounds: { id: AvatarConfig['backgroundStyle']; label: string; icon: string }[] = [
    { id: 'clouds', label: 'Awan Langit Biru', icon: '☁️' },
    { id: 'rainbow', label: 'Pelangi Bahagia', icon: '🌈' },
    { id: 'sunshine', label: 'Matahari Pagi Ceria', icon: '☀️' },
    { id: 'stars', label: 'Bintang Antariksa', icon: '✨' },
    { id: 'forest', label: 'Hutan Tropis Asri', icon: '🌲' },
  ];

  const handleApply = () => {
    sound.playPop();
    // Check if avatar has pet or accessories to award badge
    const updatedBadges = [...user.unlockedBadges];
    if (draftAvatar.pet !== 'none' && !updatedBadges.includes('pet_lover')) {
      updatedBadges.push('pet_lover');
    }
    if (draftAvatar.outfit !== 'seragam_sd' && !updatedBadges.includes('avatar_fashionista')) {
      updatedBadges.push('avatar_fashionista');
    }

    onSave(draftAvatar, {
      unlockedBadges: updatedBadges,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-[#F5B52E] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F7D32] via-[#3B5F25] to-[#D9361E] p-4 sm:p-6 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
              🎨
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-kids tracking-wide">
                Kamar Ganti & Avatar Siswa
              </h2>
              <p className="text-xs sm:text-sm text-[#FFD16A] font-medium">
                SDIT Balikpapan Islamic School
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Live Avatar Preview & Level Perk Info */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#4F7D32]/5 rounded-3xl p-5 border-2 border-[#4F7D32]/20">
            <span className="text-xs font-bold text-[#4F7D32] uppercase tracking-wider mb-2">
              Pratinjau Langsung
            </span>
            <div className="p-3 bg-white rounded-3xl shadow-md border-2 border-[#F5B52E]">
              <AvatarDisplay avatar={draftAvatar} size="xl" />
            </div>

            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFD16A] text-slate-900 border border-[#F5B52E]">
                Level Kamu: {user.level} ⭐
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Naikkan level dengan menjawab kuis untuk membuka lebih banyak kostum & hewan peliharaan ajaib!
              </p>
            </div>
          </div>

          {/* Right Column: Customization Tabs and Options */}
          <div className="md:col-span-7 flex flex-col">
            {/* Category Tab Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab('outfit');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeTab === 'outfit'
                    ? 'bg-[#4F7D32] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#4F7D32]/10'
                }`}
              >
                <Shirt className="w-4 h-4" /> Baju
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab('hair');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeTab === 'hair'
                    ? 'bg-[#4F7D32] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#4F7D32]/10'
                }`}
              >
                <Palette className="w-4 h-4" /> Rambut
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab('face');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeTab === 'face'
                    ? 'bg-[#4F7D32] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#4F7D32]/10'
                }`}
              >
                <Smile className="w-4 h-4" /> Wajah
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab('accessory');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeTab === 'accessory'
                    ? 'bg-[#4F7D32] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#4F7D32]/10'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Aksesoris
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab('pet');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeTab === 'pet'
                    ? 'bg-[#4F7D32] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#4F7D32]/10'
                }`}
              >
                <PawPrint className="w-4 h-4" /> Teman Hewan
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  setActiveTab('background');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeTab === 'background'
                    ? 'bg-[#4F7D32] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-[#4F7D32]/10'
                }`}
              >
                <User className="w-4 h-4" /> Latar
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="mt-4 flex-1 max-h-[300px] overflow-y-auto pr-1">
              {/* OUTFIT TAB */}
              {activeTab === 'outfit' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Pilih Pakaian Karakter
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {outfits.map((item) => {
                      const isLocked = user.level < item.minLevel;
                      const isSelected = draftAvatar.outfit === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={isLocked}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, outfit: item.id });
                          }}
                          className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'border-[#4F7D32] bg-[#4F7D32]/10 shadow-sm'
                              : isLocked
                              ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 bg-white hover:border-[#4F7D32]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">
                                {item.label}
                              </p>
                              {isLocked ? (
                                <span className="text-[10px] font-semibold text-[#D9361E] flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> Buka di Level {item.minLevel}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#4F7D32] font-medium">
                                  Tersedia
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#4F7D32] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* HAIR TAB */}
              {activeTab === 'hair' && (
                <div className="space-y-4">
                  {/* Hair Style */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Gaya Rambut
                    </span>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {hairStyles.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, hairStyle: item.id });
                          }}
                          className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                            draftAvatar.hairStyle === item.id
                              ? 'border-[#4F7D32] bg-[#4F7D32]/10 shadow-sm font-bold'
                              : 'border-slate-200 bg-white hover:border-[#4F7D32]/40'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-[11px] text-slate-700 text-center leading-tight">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Warna Rambut
                    </span>
                    <div className="flex items-center gap-3 mt-1.5">
                      {hairColors.map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, hairColor: col.hex });
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition border-2 ${
                            draftAvatar.hairColor === col.hex
                              ? 'border-[#4F7D32] scale-110 shadow-md ring-2 ring-[#4F7D32]/30'
                              : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.label}
                        >
                          {draftAvatar.hairColor === col.hex && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FACE TAB */}
              {activeTab === 'face' && (
                <div className="space-y-4">
                  {/* Skin Tone */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Warna Kulit
                    </span>
                    <div className="flex items-center gap-3 mt-1.5">
                      {skinTones.map((st) => (
                        <button
                          key={st.hex}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, skinTone: st.hex });
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition border-2 ${
                            draftAvatar.skinTone === st.hex
                              ? 'border-[#4F7D32] scale-110 shadow-md ring-2 ring-[#4F7D32]/30'
                              : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: st.hex }}
                          title={st.label}
                        >
                          {draftAvatar.skinTone === st.hex && (
                            <Check className="w-5 h-5 text-slate-800" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expressions */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Ekspresi Senyuman
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {expressions.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, expression: exp.id });
                          }}
                          className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 transition text-left ${
                            draftAvatar.expression === exp.id
                              ? 'border-[#4F7D32] bg-[#4F7D32]/10 font-bold'
                              : 'border-slate-200 bg-white hover:border-[#4F7D32]/40'
                          }`}
                        >
                          <span className="text-2xl">{exp.icon}</span>
                          <span className="text-xs text-slate-800">{exp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACCESSORIES TAB */}
              {activeTab === 'accessory' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Topi & Hiasan Kepala
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {accessories.map((item) => {
                      const isLocked = user.level < item.minLevel;
                      const isSelected = draftAvatar.accessory === item.id;
                      return (
                        <button
                          key={item.id}
                          disabled={isLocked}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, accessory: item.id });
                          }}
                          className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'border-[#4F7D32] bg-[#4F7D32]/10 shadow-sm'
                              : isLocked
                              ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 bg-white hover:border-[#4F7D32]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">
                                {item.label}
                              </p>
                              {isLocked ? (
                                <span className="text-[10px] font-semibold text-[#D9361E] flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> Level {item.minLevel}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#4F7D32] font-medium">
                                  Tersedia
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#4F7D32] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PET TAB */}
              {activeTab === 'pet' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Teman Belajar (Pet Companion)
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {pets.map((pet) => {
                      const isLocked = user.level < pet.minLevel;
                      const isSelected = draftAvatar.pet === pet.id;
                      return (
                        <button
                          key={pet.id}
                          disabled={isLocked}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, pet: pet.id });
                          }}
                          className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'border-[#4F7D32] bg-[#4F7D32]/10 shadow-sm'
                              : isLocked
                              ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 bg-white hover:border-[#4F7D32]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{pet.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-tight">
                                {pet.label}
                              </p>
                              {isLocked ? (
                                <span className="text-[10px] font-semibold text-[#D9361E] flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> Buka di Level {pet.minLevel}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#4F7D32] font-medium">
                                  Tersedia
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#4F7D32] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BACKGROUND TAB */}
              {activeTab === 'background' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Latar Belakang Karakter
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {backgrounds.map((bg) => {
                      const isSelected = draftAvatar.backgroundStyle === bg.id;
                      return (
                        <button
                          key={bg.id}
                          onClick={() => {
                            sound.playPop();
                            setDraftAvatar({ ...draftAvatar, backgroundStyle: bg.id });
                          }}
                          className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'border-[#4F7D32] bg-[#4F7D32]/10 shadow-sm font-bold'
                              : 'border-slate-200 bg-white hover:border-[#4F7D32]/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{bg.icon}</span>
                            <span className="text-xs text-slate-800">{bg.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#4F7D32] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  sound.playPop();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold text-sm transition"
              >
                Batal
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#4F7D32] to-[#3B5F25] hover:from-[#3B5F25] hover:to-[#2A441A] text-white font-bold text-sm shadow-md shadow-[#4F7D32]/30 flex items-center gap-2 transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#FFD16A]" />
                Simpan Penampilan Baru!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
