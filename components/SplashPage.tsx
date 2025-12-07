import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

interface SplashPageProps {
  onComplete: () => void;
}

export const SplashPage: React.FC<SplashPageProps> = ({ onComplete }) => {
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 500); // Wait for fade out
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Image or Fallback */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {!imgError ? (
          <img 
            src="/splash-bg.png" 
            alt="U Rock Live Band Karaoke" 
            className="w-full h-full object-cover"
            loading="eager"
            onError={() => setImgError(true)}
          />
        ) : (
          // Fallback Gradient if image fails
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black">
             {/* Decorative lights for fallback */}
             <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-pulse"></div>
             <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
          </div>
        )}
        
        {/* Gradient overlay to make the button pop at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Button Container - Fixed at bottom area */}
      <div className={`absolute bottom-16 md:bottom-24 z-10 w-full max-w-xs px-6 transition-all duration-1000 transform ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <button
          onClick={handleStart}
          className="group w-full py-4 bg-accent-500 hover:bg-accent-400 text-white text-xl font-bold rounded-full shadow-[0_0_20px_rgba(248,147,29,0.5)] hover:shadow-[0_0_30px_rgba(248,147,29,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border-2 border-white/20 backdrop-blur-sm"
        >
          <span>Get Started</span>
          <Play className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};