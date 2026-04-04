// src/components/SeasonalBanner.jsx
//
// ─── HOW TO UPDATE THIS BANNER SEASONALLY ────────────────────────────────────
//
//  1. IMAGES — Replace the two image paths below:
//       LEFT_IMAGE  — appears on the left side, slides in from the left
//       RIGHT_IMAGE — appears on the right side, slides in from the right
//
//     Option A: Use a public URL (hosted image):
//       const LEFT_IMAGE  = 'https://example.com/avurudu-left.png';
//       const RIGHT_IMAGE = 'https://example.com/avurudu-right.png';
//
//     Option B: Place image files inside  shop-frontend/public/seasonal/
//       then use:  const LEFT_IMAGE  = '/seasonal/avurudu-left.png';
//                  const RIGHT_IMAGE = '/seasonal/avurudu-right.png';
//
//     Recommended image size: 300×400 px, PNG with transparent background.
//
//  2. TEXT — Change SEASONAL_TEXT below to your new season message.
//
//  3. FONT — Change SEASONAL_FONT to any Google Font name you want.
//     The component auto-loads it from Google Fonts — no extra install needed.
//
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════
//   ✏️  EDIT THESE THREE THINGS WHEN SEASON CHANGES
// ══════════════════════════════════════════════════════════════════
const LEFT_IMAGE  = '/seasonal/left.png';   // ← change this
const RIGHT_IMAGE = '/seasonal/right.png';  // ← change this

const SEASONAL_TEXT = 'සුබ අලුත් අවුරුද්දක් වේවා..! මේ උත්සව සමයේ විශේෂ වට්ටම්';
const SEASONAL_FONT = 'Noto Serif Sinhala'; // Dearana-style serif Sinhala font
// ══════════════════════════════════════════════════════════════════

import { useEffect } from 'react';

export default function SeasonalBanner({ user, lang }) {
  // Dynamically load the seasonal font from Google Fonts
  useEffect(() => {
    const id   = 'seasonal-font-link';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id    = id;
    link.rel   = 'stylesheet';
    const encoded = encodeURIComponent(SEASONAL_FONT);
    link.href  = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }, []);

  return (
    <>
      {/* Inject keyframe animations via a <style> tag */}
      <style>{`

      @font-face {
      font-family: 'topic';
      src: url('/fonts/topic.ttf') format('truetype');
                   }

        @keyframes slideInLeft {
          0%   { transform: translateX(-120%) scale(0.85); opacity: 0; }
          60%  { transform: translateX(8%)    scale(1.03); opacity: 1; }
          80%  { transform: translateX(-4%)   scale(0.99); }
          100% { transform: translateX(0%)    scale(1);    opacity: 1; }
        }
        @keyframes slideInRight {
          0%   { transform: translateX(120%)  scale(0.85); opacity: 0; }
          60%  { transform: translateX(-8%)   scale(1.03); opacity: 1; }
          80%  { transform: translateX(4%)    scale(0.99); }
          100% { transform: translateX(0%)    scale(1);    opacity: 1; }
        }
        @keyframes floatLeft {
          0%,100% { transform: translateX(0px)  translateY(0px)  rotate(-1deg); }
          25%     { transform: translateX(-6px) translateY(-8px) rotate(-2deg); }
          50%     { transform: translateX(-3px) translateY(-14px) rotate(-1.5deg); }
          75%     { transform: translateX(-8px) translateY(-6px) rotate(-0.5deg); }
        }
        @keyframes floatRight {
          0%,100% { transform: translateX(0px)  translateY(0px)  rotate(1deg); }
          25%     { transform: translateX(6px)  translateY(-8px) rotate(2deg); }
          50%     { transform: translateX(3px)  translateY(-14px) rotate(1.5deg); }
          75%     { transform: translateX(8px)  translateY(-6px) rotate(0.5deg); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 1; }
        }
        @keyframes textGlow {
          0%,100% { text-shadow: 0 0 12px rgba(255,220,100,0.6), 0 2px 8px rgba(0,0,0,0.3); }
          50%     { text-shadow: 0 0 24px rgba(255,220,100,1),   0 2px 8px rgba(0,0,0,0.3); }
        }
        .seasonal-img-left {
          animation:
            slideInLeft 1.1s cubic-bezier(0.22,1,0.36,1) both,
            floatLeft   5s ease-in-out 1.2s infinite;
        }
        .seasonal-img-right {
          animation:
            slideInRight 1.1s cubic-bezier(0.22,1,0.36,1) 0.15s both,
            floatRight   5s ease-in-out 1.4s infinite;
        }
        .seasonal-text {
          animation: textGlow 2.8s ease-in-out infinite;
          font-family: '${SEASONAL_FONT}', 'Noto Sans Sinhala', serif;
        }
        .seasonal-shimmer {
          animation: shimmer 2.5s ease-in-out infinite;
        }

        @keyframes slowFloat {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-6px); }
}

.seasonal-move {
  display: inline-block;
  animation: slowFloat 5s ease-in-out infinite;
}
      `}</style>

      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white overflow-hidden relative">

        {/* Decorative sparkles */}
        <span className="seasonal-shimmer absolute top-3 left-1/4 text-yellow-200 text-lg select-none pointer-events-none">✦</span>
        <span className="seasonal-shimmer absolute bottom-4 left-1/3 text-yellow-100 text-sm select-none pointer-events-none" style={{animationDelay:'0.8s'}}>✦</span>
        <span className="seasonal-shimmer absolute top-5 right-1/3 text-yellow-200 text-base select-none pointer-events-none" style={{animationDelay:'1.4s'}}>✦</span>
        <span className="seasonal-shimmer absolute bottom-3 right-1/4 text-yellow-100 text-sm select-none pointer-events-none" style={{animationDelay:'0.4s'}}>✦</span>

        {/* Three-column layout: image | text | image */}
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-0">

          {/* LEFT IMAGE */}
          <div className="hidden sm:flex items-end justify-center flex-shrink-0 w-36 md:w-48 h-44 md:h-52 overflow-visible relative">
            <img
              src={LEFT_IMAGE}
              alt="seasonal decoration"
              className="seasonal-img-left h-full w-auto object-contain object-bottom drop-shadow-xl"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* CENTER TEXT */}
          <div className="flex-1 py-10 px-4 text-center">
           <h1
             className="text-3xl md:text-4xl font-bold mb-2 drop-shadow"
              style={{ fontFamily: lang === 'si' ? 'topic' : 'inherit' }}
            >
               {lang === 'si' ? 'දිසානායක සිටි සෙන්ටර්' : 'Welcome to Our Shop'}
                </h1>
            <p className="text-orange-100 text-lg mt-1">
              {lang === 'si' ? 'නගරය - ගමට' : 'Browse categories and order with ease'}
            </p>
            {user && (
              <p className="mt-2 text-orange-200 text-sm">
                {lang === 'si' ? `ආයුබෝවන්, ${user.phone}` : `Welcome back, ${user.phone}`}
              </p>
            )}

            {/* ── Seasonal message ── */}
            <div className="mt-4 border-t border-orange-400/50 pt-4">
              <p className="seasonal-text seasonal-move text-yellow-100 text-lg md:text-xl font-semibold leading-relaxed">
                {SEASONAL_TEXT}
              </p>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden sm:flex items-end justify-center flex-shrink-0 w-36 md:w-48 h-44 md:h-52 overflow-visible relative">
            <img
              src={RIGHT_IMAGE}
              alt="seasonal decoration"
              className="seasonal-img-right h-full w-auto object-contain object-bottom drop-shadow-xl"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Mobile: show images below text as a small strip */}
        <div className="sm:hidden flex justify-between items-end px-10 pb-0 -mt-4 overflow-hidden h-24">
          <img src={LEFT_IMAGE}  alt="" className="seasonal-img-left  h-full w-auto object-contain object-bottom drop-shadow"
            onError={e => { e.target.style.display = 'none'; }}/>
          <img src={RIGHT_IMAGE} alt="" className="seasonal-img-right h-full w-auto object-contain object-bottom drop-shadow"
            onError={e => { e.target.style.display = 'none'; }}/>
        </div>

      </div>
    </>
  );
}
