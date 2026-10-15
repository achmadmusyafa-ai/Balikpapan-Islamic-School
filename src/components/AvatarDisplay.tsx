import React from 'react';
import { AvatarConfig } from '../types';

interface AvatarDisplayProps {
  avatar: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPet?: boolean;
  className?: string;
  animate?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  size = 'md',
  showPet = true,
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    xl: 'w-44 h-44',
  };

  // Background gradients
  const bgStyles: Record<AvatarConfig['backgroundStyle'], { fill1: string; fill2: string }> = {
    clouds: { fill1: '#60A5FA', fill2: '#93C5FD' },
    stars: { fill1: '#312E81', fill2: '#4F46E5' },
    sunshine: { fill1: '#F59E0B', fill2: '#FDE047' },
    rainbow: { fill1: '#EC4899', fill2: '#8B5CF6' },
    forest: { fill1: '#059669', fill2: '#34D399' },
  };

  const currentBg = bgStyles[avatar.backgroundStyle] || bgStyles.clouds;

  return (
    <div
      className={`relative inline-block rounded-3xl overflow-hidden shadow-inner ${sizeMap[size]} ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full ${animate ? 'transition-transform duration-300 hover:scale-105' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`avatar-bg-${avatar.backgroundStyle}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentBg.fill1} />
            <stop offset="100%" stopColor={currentBg.fill2} />
          </linearGradient>

          {/* Outfit Gradients */}
          <linearGradient id="sd-merah" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          <linearGradient id="pramuka-cokelat" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="superhero-suit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="gold-crown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Background Canvas */}
        <rect width="200" height="200" rx="36" fill={`url(#avatar-bg-${avatar.backgroundStyle})`} />

        {/* Background decorative elements */}
        {avatar.backgroundStyle === 'clouds' && (
          <g fill="#ffffff" opacity="0.45">
            <ellipse cx="40" cy="50" rx="25" ry="12" />
            <ellipse cx="60" cy="45" rx="16" ry="14" />
            <ellipse cx="160" cy="70" rx="22" ry="10" />
          </g>
        )}
        {avatar.backgroundStyle === 'stars' && (
          <g fill="#FDE047" opacity="0.75">
            <polygon points="40,30 43,38 52,38 45,43 48,51 40,46 32,51 35,43 28,38 37,38" transform="scale(0.7) translate(10,10)" />
            <polygon points="150,40 153,48 162,48 155,53 158,61 150,56 142,61 145,53 138,48 147,48" transform="scale(0.6) translate(80,10)" />
            <circle cx="80" cy="30" r="2" fill="#fff" />
            <circle cx="170" cy="80" r="2.5" fill="#fff" />
          </g>
        )}
        {avatar.backgroundStyle === 'sunshine' && (
          <g fill="#ffffff" opacity="0.25">
            <circle cx="100" cy="100" r="85" stroke="#ffffff" strokeWidth="4" strokeDasharray="10 8" fill="none" />
          </g>
        )}

        {/* Superhero Cape if superhero */}
        {avatar.outfit === 'superhero' && (
          <path d="M50 140 C30 180, 20 200, 30 200 L170 200 C180 200, 170 180, 150 140 Z" fill="#DC2626" />
        )}

        {/* Body Base & Outfits */}
        <g id="body-and-clothes">
          {/* Default Neck */}
          <rect x="90" y="125" width="20" height="22" rx="4" fill={avatar.skinTone} />

          {/* OUTFITS */}
          {avatar.outfit === 'seragam_sd' && (
            <g id="outfit-sd">
              {/* White Shirt Body */}
              <path d="M55 140 C65 130, 80 130, 100 130 C120 130, 135 130, 145 140 L158 200 L42 200 Z" fill="#F8FAFC" />
              {/* Red Collar / Kerah Merah SD */}
              <polygon points="76,134 100,158 100,134" fill="url(#sd-merah)" />
              <polygon points="124,134 100,158 100,134" fill="url(#sd-merah)" />
              {/* Red Dasi SD */}
              <polygon points="96,155 104,155 107,185 100,195 93,185" fill="url(#sd-merah)" />
              {/* Badge OSIS on left chest */}
              <rect x="68" y="160" width="12" height="15" rx="2" fill="#991B1B" />
              <rect x="70" y="162" width="8" height="6" fill="#F8FAFC" />
            </g>
          )}

          {avatar.outfit === 'pramuka' && (
            <g id="outfit-pramuka">
              <path d="M55 140 C65 130, 80 130, 100 130 C120 130, 135 130, 145 140 L158 200 L42 200 Z" fill="url(#pramuka-cokelat)" />
              {/* Setangan Leher Pramuka (Merah Putih) */}
              <polygon points="72,135 100,165 100,135" fill="#DC2626" />
              <polygon points="128,135 100,165 100,135" fill="#F8FAFC" />
              {/* Ring Hasduk */}
              <rect x="94" y="156" width="12" height="9" rx="3" fill="#D97706" />
              {/* Pocket */}
              <rect x="66" y="165" width="18" height="20" rx="3" fill="#78350F" />
            </g>
          )}

          {avatar.outfit === 'superhero' && (
            <g id="outfit-superhero">
              <path d="M55 140 C65 130, 80 130, 100 130 C120 130, 135 130, 145 140 L158 200 L42 200 Z" fill="url(#superhero-suit)" />
              {/* Yellow Star Emblem */}
              <circle cx="100" cy="165" r="16" fill="#F59E0B" />
              <polygon points="100,153 103,161 112,161 105,166 108,174 100,169 92,174 95,166 88,161 97,161" fill="#FEF08A" />
              <rect x="75" y="188" width="50" height="12" rx="3" fill="#F59E0B" />
            </g>
          )}

          {avatar.outfit === 'dokter' && (
            <g id="outfit-dokter">
              <path d="M55 140 C65 130, 80 130, 100 130 C120 130, 135 130, 145 140 L158 200 L42 200 Z" fill="#F1F5F9" />
              {/* Inner blue scrub */}
              <polygon points="85,135 100,165 115,135" fill="#0EA5E9" />
              {/* Stethoscope */}
              <path d="M85 140 C85 180, 115 180, 115 140" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <circle cx="100" cy="180" r="7" fill="#94A3B8" stroke="#334155" strokeWidth="2" />
            </g>
          )}

          {avatar.outfit === 'astronot' && (
            <g id="outfit-astronot">
              <path d="M55 140 C65 130, 80 130, 100 130 C120 130, 135 130, 145 140 L158 200 L42 200 Z" fill="#E2E8F0" />
              <rect x="78" y="152" width="44" height="30" rx="6" fill="#3B82F6" />
              <circle cx="92" cy="167" r="4" fill="#22C55E" />
              <circle cx="108" cy="167" r="4" fill="#EF4444" />
            </g>
          )}

          {avatar.outfit === 'petualang' && (
            <g id="outfit-petualang">
              <path d="M55 140 C65 130, 80 130, 100 130 C120 130, 135 130, 145 140 L158 200 L42 200 Z" fill="#D97706" />
              <polygon points="85,135 100,158 115,135" fill="#FDE68A" />
              <rect x="66" y="160" width="18" height="18" rx="2" fill="#B45309" />
              <rect x="116" y="160" width="18" height="18" rx="2" fill="#B45309" />
            </g>
          )}
        </g>

        {/* Head Base */}
        <g id="head-group">
          {/* Ears */}
          <ellipse cx="62" cy="98" rx="8" ry="12" fill={avatar.skinTone} />
          <ellipse cx="138" cy="98" rx="8" ry="12" fill={avatar.skinTone} />

          {/* Face Circle */}
          <ellipse cx="100" cy="95" rx="42" ry="44" fill={avatar.skinTone} />

          {/* Cheerful Blush / Pipi Merah Merona */}
          <ellipse cx="78" cy="106" rx="8" ry="5" fill="#FB7185" opacity="0.45" />
          <ellipse cx="122" cy="106" rx="8" ry="5" fill="#FB7185" opacity="0.45" />

          {/* EYES & EXPRESSION */}
          {avatar.expression === 'happy' && (
            <g id="expr-happy">
              {/* Happy Arched Eyes */}
              <circle cx="82" cy="92" r="5" fill="#1E293B" />
              <circle cx="84" cy="90" r="1.8" fill="#ffffff" />
              <circle cx="118" cy="92" r="5" fill="#1E293B" />
              <circle cx="120" cy="90" r="1.8" fill="#ffffff" />
              {/* Big Smile with tongue */}
              <path d="M85 108 Q100 126 115 108" fill="#BE123C" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              <path d="M92 115 Q100 122 108 115" fill="#F43F5E" />
            </g>
          )}

          {avatar.expression === 'wink' && (
            <g id="expr-wink">
              {/* Open sparkling left eye */}
              <circle cx="82" cy="92" r="5.5" fill="#1E293B" />
              <circle cx="84" cy="90" r="2" fill="#ffffff" />
              {/* Winking right eye */}
              <path d="M112 94 Q119 86 125 94" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
              {/* Playful smile */}
              <path d="M86 109 Q100 122 114 109" fill="none" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}

          {avatar.expression === 'starry' && (
            <g id="expr-starry">
              {/* Starry Eyes */}
              <polygon points="82,85 84,90 89,90 85,93 87,98 82,95 77,98 79,93 75,90 80,90" fill="#F59E0B" />
              <polygon points="118,85 120,90 125,90 121,93 123,98 118,95 113,98 115,93 111,90 116,90" fill="#F59E0B" />
              {/* Open Joyous Smile */}
              <path d="M84 106 Q100 128 116 106" fill="#BE123C" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              <path d="M90 114 Q100 124 110 114" fill="#FDA4AF" />
            </g>
          )}

          {avatar.expression === 'cool' && (
            <g id="expr-cool">
              {/* Dark Cool Sunglasses */}
              <rect x="68" y="86" width="28" height="16" rx="5" fill="#0F172A" />
              <rect x="104" y="86" width="28" height="16" rx="5" fill="#0F172A" />
              <rect x="94" y="90" width="12" height="4" fill="#0F172A" />
              {/* Glasses Shine */}
              <line x1="72" y1="88" x2="84" y2="98" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="108" y1="88" x2="120" y2="98" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              {/* Smirk Smile */}
              <path d="M92 112 Q105 118 116 110" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {avatar.expression === 'glasses' && (
            <g id="expr-glasses">
              {/* Eyes */}
              <circle cx="82" cy="92" r="4.5" fill="#1E293B" />
              <circle cx="118" cy="92" r="4.5" fill="#1E293B" />
              {/* Red Round Glasses */}
              <circle cx="82" cy="92" r="14" fill="none" stroke="#DC2626" strokeWidth="3" />
              <circle cx="118" cy="92" r="14" fill="none" stroke="#DC2626" strokeWidth="3" />
              <line x1="96" y1="92" x2="104" y2="92" stroke="#DC2626" strokeWidth="3" />
              {/* Gentle smile */}
              <path d="M88 110 Q100 120 112 110" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {/* Eyebrows */}
          <path d="M74 81 Q82 76 90 81" fill="none" stroke={avatar.hairColor} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M110 81 Q118 76 126 81" fill="none" stroke={avatar.hairColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* HAIRSTYLES */}
          {avatar.hairStyle === 'short' && (
            <path
              d="M58 85 C58 50, 70 42, 100 42 C130 42, 142 50, 142 85 C142 90, 138 90, 134 82 C126 62, 120 74, 100 66 C85 75, 75 64, 66 82 C62 90, 58 90, 58 85 Z"
              fill={avatar.hairColor}
            />
          )}

          {avatar.hairStyle === 'spiky' && (
            <path
              d="M56 85 L64 62 L74 68 L86 46 L98 62 L112 44 L124 64 L136 58 L144 85 C144 92, 135 84, 130 78 C115 72, 110 76, 100 70 C88 78, 80 72, 70 78 Z"
              fill={avatar.hairColor}
            />
          )}

          {avatar.hairStyle === 'curly' && (
            <g fill={avatar.hairColor}>
              <circle cx="64" cy="74" r="14" />
              <circle cx="78" cy="56" r="14" />
              <circle cx="100" cy="50" r="15" />
              <circle cx="122" cy="56" r="14" />
              <circle cx="136" cy="74" r="14" />
              <circle cx="62" cy="90" r="10" />
              <circle cx="138" cy="90" r="10" />
            </g>
          )}

          {avatar.hairStyle === 'pigtails' && (
            <g fill={avatar.hairColor}>
              {/* Main hair cap */}
              <path d="M58 85 C58 52, 72 44, 100 44 C128 44, 142 52, 142 85 C136 70, 124 65, 100 68 C76 65, 64 70, 58 85 Z" />
              {/* Left Pigtail */}
              <ellipse cx="45" cy="85" rx="14" ry="22" transform="rotate(-15 45 85)" />
              <circle cx="56" cy="72" r="5" fill="#F43F5E" /> {/* Bow tie */}
              {/* Right Pigtail */}
              <ellipse cx="155" cy="85" rx="14" ry="22" transform="rotate(15 155 85)" />
              <circle cx="144" cy="72" r="5" fill="#F43F5E" /> {/* Bow tie */}
            </g>
          )}

          {avatar.hairStyle === 'wavy' && (
            <g fill={avatar.hairColor}>
              <path d="M56 95 C56 48, 72 42, 100 42 C128 42, 144 48, 144 95 C144 115, 134 110, 138 90 C138 72, 126 62, 100 66 C74 62, 62 72, 62 90 C66 110, 56 115, 56 95 Z" />
              <path d="M54 90 C50 110, 58 130, 64 135 C68 130, 62 110, 62 95 Z" />
              <path d="M146 90 C150 110, 142 130, 136 135 C132 130, 138 110, 138 95 Z" />
            </g>
          )}

          {avatar.hairStyle === 'hijab' && (
            <g id="hijab-group">
              {/* Outer Hood */}
              <path
                d="M52 95 C52 46, 68 36, 100 36 C132 36, 148 46, 148 95 C148 138, 138 152, 125 155 C115 150, 100 152, 85 150 C72 152, 52 138, 52 95 Z"
                fill="#4F46E5"
              />
              {/* Inner Inner Face Trim */}
              <ellipse cx="100" cy="98" rx="34" ry="38" fill={avatar.skinTone} />
              {/* Hijab Inner Cap */}
              <path d="M68 82 C74 72, 86 68, 100 68 C114 68, 126 72, 132 82 C124 74, 112 72, 100 72 C88 72, 76 74, 68 82 Z" fill="#6366F1" />
            </g>
          )}

          {/* ACCESSORIES */}
          {avatar.accessory === 'topi_sd' && (
            <g id="acc-topi-sd" transform="translate(0, -6)">
              {/* Red elementary school hat */}
              <path d="M58 66 C60 40, 80 34, 100 34 C120 34, 140 40, 142 66 Z" fill="#DC2626" />
              {/* Red Visor */}
              <path d="M48 66 C70 60, 130 60, 152 66 C145 74, 55 74, 48 66 Z" fill="#B91C1C" />
              {/* Small White Front Emblem */}
              <circle cx="100" cy="50" r="5" fill="#FFFFFF" />
            </g>
          )}

          {avatar.accessory === 'bando_bunga' && (
            <g id="acc-bando" transform="translate(0, 2)">
              <path d="M58 75 C66 48, 134 48, 142 75" fill="none" stroke="#F43F5E" strokeWidth="5" strokeLinecap="round" />
              {/* Cute Flower */}
              <g transform="translate(132, 60)">
                <circle cx="0" cy="-6" r="4" fill="#FDE047" />
                <circle cx="6" cy="0" r="4" fill="#FDE047" />
                <circle cx="0" cy="6" r="4" fill="#FDE047" />
                <circle cx="-6" cy="0" r="4" fill="#FDE047" />
                <circle cx="0" cy="0" r="4" fill="#FB7185" />
              </g>
            </g>
          )}

          {avatar.accessory === 'mahkota' && (
            <g id="acc-mahkota" transform="translate(0, -8)">
              <polygon points="68,58 75,34 88,48 100,28 112,48 125,34 132,58" fill="url(#gold-crown)" stroke="#B45309" strokeWidth="2" />
              <circle cx="100" cy="46" r="3.5" fill="#EF4444" />
              <circle cx="82" cy="50" r="2.5" fill="#3B82F6" />
              <circle cx="118" cy="50" r="2.5" fill="#10B981" />
            </g>
          )}

          {avatar.accessory === 'topi_wisuda' && (
            <g id="acc-wisuda" transform="translate(0, -10)">
              <polygon points="100,28 145,42 100,56 55,42" fill="#1E1B4B" />
              <rect x="80" y="52" width="40" height="12" rx="3" fill="#312E81" />
              <circle cx="100" cy="42" r="3" fill="#F59E0B" />
              <path d="M100 42 Q125 50 130 65" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {avatar.accessory === 'kacamata_bintang' && (
            <g id="acc-star-glasses" transform="translate(0, 2)">
              <polygon points="82,82 85,89 92,89 87,93 89,100 82,96 75,100 77,93 72,89 79,89" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              <polygon points="118,82 121,89 128,89 123,93 125,100 118,96 111,100 113,93 108,89 115,89" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              <line x1="92" y1="90" x2="108" y2="90" stroke="#F59E0B" strokeWidth="3" />
            </g>
          )}
        </g>

        {/* PET COMPANIONS */}
        {showPet && avatar.pet !== 'none' && (
          <g id="pet-companion" transform="translate(138, 138) scale(0.85)">
            {avatar.pet === 'kucing' && (
              <g id="pet-kucing">
                {/* Orange Ginger Cat */}
                <circle cx="28" cy="28" r="18" fill="#F97316" />
                {/* Ears */}
                <polygon points="14,16 20,4 26,14" fill="#EA580C" />
                <polygon points="30,14 36,4 42,16" fill="#EA580C" />
                {/* Eyes & Whiskers */}
                <circle cx="22" cy="26" r="2.5" fill="#1C1917" />
                <circle cx="34" cy="26" r="2.5" fill="#1C1917" />
                <polygon points="28,29 26,31 30,31" fill="#FDA4AF" />
                <line x1="12" y1="30" x2="20" y2="30" stroke="#1C1917" strokeWidth="1.5" />
                <line x1="36" y1="30" x2="44" y2="30" stroke="#1C1917" strokeWidth="1.5" />
              </g>
            )}

            {avatar.pet === 'robot' && (
              <g id="pet-robot">
                <rect x="10" y="10" width="34" height="30" rx="8" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                <circle cx="27" cy="4" r="3" fill="#F59E0B" />
                <line x1="27" y1="4" x2="27" y2="10" stroke="#0284C7" strokeWidth="2" />
                {/* Glowing cyan eyes */}
                <rect x="16" y="20" width="8" height="6" rx="2" fill="#FEF08A" />
                <rect x="30" y="20" width="8" height="6" rx="2" fill="#FEF08A" />
                <line x1="20" y1="32" x2="34" y2="32" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}

            {avatar.pet === 'kelinci' && (
              <g id="pet-kelinci">
                {/* Bunny ears */}
                <ellipse cx="20" cy="12" rx="5" ry="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <ellipse cx="20" cy="12" rx="2.5" ry="8" fill="#FDA4AF" />
                <ellipse cx="36" cy="12" rx="5" ry="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <ellipse cx="36" cy="12" rx="2.5" ry="8" fill="#FDA4AF" />
                {/* Face */}
                <circle cx="28" cy="28" r="16" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="22" cy="26" r="2" fill="#1E293B" />
                <circle cx="34" cy="26" r="2" fill="#1E293B" />
                <circle cx="28" cy="30" r="2" fill="#F43F5E" />
              </g>
            )}

            {avatar.pet === 'burung_hantu' && (
              <g id="pet-owl">
                <ellipse cx="28" cy="28" rx="16" ry="18" fill="#78350F" />
                {/* Big wise eyes */}
                <circle cx="20" cy="24" r="7" fill="#FEF08A" stroke="#451A03" strokeWidth="1.5" />
                <circle cx="20" cy="24" r="3" fill="#1C1917" />
                <circle cx="36" cy="24" r="7" fill="#FEF08A" stroke="#451A03" strokeWidth="1.5" />
                <circle cx="36" cy="24" r="3" fill="#1C1917" />
                {/* Beak */}
                <polygon points="28,28 25,33 31,33" fill="#F59E0B" />
              </g>
            )}

            {avatar.pet === 'naga' && (
              <g id="pet-naga">
                <circle cx="28" cy="28" r="17" fill="#10B981" />
                {/* Tiny horns */}
                <polygon points="18,16 22,6 24,16" fill="#F59E0B" />
                <polygon points="32,16 34,6 38,16" fill="#F59E0B" />
                <circle cx="22" cy="26" r="2.5" fill="#064E3B" />
                <circle cx="34" cy="26" r="2.5" fill="#064E3B" />
                {/* Flame puff */}
                <circle cx="28" cy="33" r="3" fill="#EF4444" />
                <path d="M25 33 Q28 40 31 33" fill="#F59E0B" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
