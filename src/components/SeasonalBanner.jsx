// src/components/SeasonalBanner.jsx
// Banner content (text + images) is now loaded from the database.
// Admin can update it live from the Admin Dashboard → Banner tab.
import { useEffect, useState } from 'react';
import { bannerApi } from '../services/api.js';

const SEASONAL_FONT    = 'Noto Serif Sinhala';
const FALLBACK_TEXT    = '';
const FALLBACK_LEFT    = '/seasonal/left.png';
const FALLBACK_RIGHT   = '/seasonal/right.png';

export default function SeasonalBanner({ user, lang }) {
  const [text,       setText]       = useState(FALLBACK_TEXT);
  const [leftImage,  setLeftImage]  = useState(FALLBACK_LEFT);
  const [rightImage, setRightImage] = useState(FALLBACK_RIGHT);

  // Load banner config from backend on mount
  useEffect(() => {
    bannerApi.get()
      .then(b => {
        if (b.text)       setText(b.text);
        if (b.leftImage)  setLeftImage(b.leftImage);
        if (b.rightImage) setRightImage(b.rightImage);
      })
      .catch(() => {}); // silently fall back to defaults if API fails
  }, []);

  // Load the seasonal font from Google Fonts
  useEffect(() => {
    const id = 'seasonal-font-link';
    if (document.getElementById(id)) return;
    const link  = document.createElement('link');
    link.id     = id;
    link.rel    = 'stylesheet';
    link.href   = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(SEASONAL_FONT)}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }, []);

  return (
    <>
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
          0%,100% { transform: translateX(0px)  translateY(0px)   rotate(-1deg); }
          25%     { transform: translateX(-6px)  translateY(-8px)  rotate(-2deg); }
          50%     { transform: translateX(-3px)  translateY(-14px) rotate(-1.5deg); }
          75%     { transform: translateX(-8px)  translateY(-6px)  rotate(-0.5deg); }
        }
        @keyframes floatRight {
          0%,100% { transform: translateX(0px) translateY(0px)   rotate(1deg); }
          25%     { transform: translateX(6px)  translateY(-8px)  rotate(2deg); }
          50%     { transform: translateX(3px)  translateY(-14px) rotate(1.5deg); }
          75%     { transform: translateX(8px)  translateY(-6px)  rotate(0.5deg); }
        }
        @keyframes shimmer {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 1; }
        }
        @keyframes textGlow {
          0%,100% { text-shadow: 0 0 12px rgba(255,220,100,0.6), 0 2px 8px rgba(0,0,0,0.3); }
          50%     { text-shadow: 0 0 24px rgba(255,220,100,1),   0 2px 8px rgba(0,0,0,0.3); }
        }
        @keyframes slowFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-6px); }
        }
        .seasonal-img-left  { animation: slideInLeft  1.1s cubic-bezier(0.22,1,0.36,1) both, floatLeft  5s ease-in-out 1.2s infinite; }
        .seasonal-img-right { animation: slideInRight 1.1s cubic-bezier(0.22,1,0.36,1) 0.15s both, floatRight 5s ease-in-out 1.4s infinite; }
        .seasonal-text      { animation: textGlow 2.8s ease-in-out infinite; font-family: '${SEASONAL_FONT}', 'Noto Sans Sinhala', serif; }
        .seasonal-shimmer   { animation: shimmer 2.5s ease-in-out infinite; }
        .seasonal-move      { display: inline-block; animation: slowFloat 5s ease-in-out infinite; }
      `}</style>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white overflow-hidden relative">

        {/* Sparkles */}
        <span className="seasonal-shimmer absolute top-3 left-1/4 text-yellow-200 text-lg select-none pointer-events-none">✦</span>
        <span className="seasonal-shimmer absolute bottom-4 left-1/3 text-yellow-100 text-sm select-none pointer-events-none" style={{animationDelay:'0.8s'}}>✦</span>
        <span className="seasonal-shimmer absolute top-5 right-1/3 text-yellow-200 text-base select-none pointer-events-none" style={{animationDelay:'1.4s'}}>✦</span>
        <span className="seasonal-shimmer absolute bottom-3 right-1/4 text-yellow-100 text-sm select-none pointer-events-none" style={{animationDelay:'0.4s'}}>✦</span>

        <div className="max-w-6xl mx-auto flex items-end justify-between gap-0">

          {/* LEFT IMAGE */}
          <div className="hidden sm:flex items-end justify-center flex-shrink-0 w-36 md:w-48 h-44 md:h-52 overflow-visible relative">
            <img src={leftImage} alt="seasonal decoration"
              className="seasonal-img-left h-full w-auto object-contain object-bottom drop-shadow-xl"
              onError={e => { e.target.style.display = 'none'; }}/>
          </div>

          {/* CENTER TEXT */}
          <div className="flex-1 py-10 px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow"
              style={{ fontFamily: lang === 'si' ? 'topic' : 'inherit' }}>
              {lang === 'si' ? 'දිසානායක සිටි සෙන්ටර්' : 'Welcome to Dissanayaka City Center'}
            </h1>
            <p className="text-orange-100 text-lg mt-1">
              {lang === 'si' ? 'නගරය - ගමට' : 'Browse categories and order with ease'}
            </p>
            {user && (
              <p className="mt-2 text-orange-200 text-sm">
                {lang === 'si' ? 'අමතන්න, 0704283858' : 'Call Us, 0704283858'}
              </p>
            )}
            <div className="mt-4 border-t border-orange-400/50 pt-4">
              <p className="seasonal-text seasonal-move text-yellow-100 text-lg md:text-xl font-semibold leading-relaxed">
                {text}
              </p>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden sm:flex items-end justify-center flex-shrink-0 w-36 md:w-48 h-44 md:h-52 overflow-visible relative">
            <img src={rightImage} alt="seasonal decoration"
              className="seasonal-img-right h-full w-auto object-contain object-bottom drop-shadow-xl"
              onError={e => { e.target.style.display = 'none'; }}/>
          </div>
        </div>

        {/* Mobile image strip */}
        <div className="sm:hidden flex justify-between items-end px-10 pb-0 -mt-4 overflow-hidden h-24">
          <img src={leftImage}  alt="" className="seasonal-img-left  h-full w-auto object-contain object-bottom drop-shadow"
            onError={e => { e.target.style.display = 'none'; }}/>
          <img src={rightImage} alt="" className="seasonal-img-right h-full w-auto object-contain object-bottom drop-shadow"
            onError={e => { e.target.style.display = 'none'; }}/>
        </div>

      </div>
    </>
  );
}