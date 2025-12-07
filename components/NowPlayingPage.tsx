import React from 'react';
import { QueueEntry, Song } from '../types';
import { Disc, Music2 } from 'lucide-react';

interface NowPlayingPageProps {
  currentEntry: QueueEntry | null;
  song: Song | undefined;
}

export const NowPlayingPage: React.FC<NowPlayingPageProps> = ({ currentEntry, song }) => {
  if (!currentEntry || !song) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Music2 className="w-24 h-24 mb-4 opacity-20" />
        <p className="text-2xl font-light">Waiting for the next star...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-accent-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
        
        {currentEntry.photo ? (
          <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-accent-500 shadow-2xl shadow-accent-500/50 animate-in zoom-in duration-500">
             <img src={currentEntry.photo} alt={currentEntry.singerName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <Disc className="w-48 h-48 md:w-64 md:h-64 text-slate-200 relative z-10 animate-[spin_8s_linear_infinite]" />
        )}
      </div>

      <div className="space-y-6 max-w-2xl w-full">
        <div>
          <h2 className="text-xl text-accent-400 font-medium tracking-wider uppercase mb-2">Now On Stage</h2>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 break-words">
            {currentEntry.singerName}
          </h1>
        </div>
        
        <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-3xl font-bold text-white mb-2">{song.title}</h3>
          <p className="text-xl text-slate-400">{song.artist}</p>
          {song.isDuet && (
            <span className="inline-block mt-4 px-4 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">
              Duet
            </span>
          )}
        </div>
      </div>
    </div>
  );
};