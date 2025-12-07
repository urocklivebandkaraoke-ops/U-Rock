
import React from 'react';
import { QueueEntry, Song } from '../types';
import { Mic, Clock, Sparkles, Disc, MessageSquare } from 'lucide-react';

interface QueuePageProps {
  queue: QueueEntry[];
  nowPlayingEntry: QueueEntry | null;
  songs: Song[];
}

export const QueuePage: React.FC<QueuePageProps> = ({ queue, nowPlayingEntry, songs }) => {
  // Filter for waiting items
  const waitingQueue = queue.filter(q => q.status === 'waiting');
  
  const getSong = (id: string) => songs.find(s => s.id === id);
  const nowPlayingSong = nowPlayingEntry ? getSong(nowPlayingEntry.songId) : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 max-w-4xl mx-auto w-full">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes pulse-border-orange {
          0%, 100% { border-color: rgba(248, 147, 29, 0.5); box-shadow: 0 0 15px rgba(248, 147, 29, 0.2); }
          50% { border-color: rgba(248, 147, 29, 1); box-shadow: 0 0 25px rgba(248, 147, 29, 0.4); }
        }
        .animate-pulse-border-orange {
          animation: pulse-border-orange 3s infinite;
        }
        @keyframes pulse-border-indigo {
          0%, 100% { border-color: rgba(99, 102, 241, 0.5); box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
          50% { border-color: rgba(99, 102, 241, 1); box-shadow: 0 0 25px rgba(99, 102, 241, 0.4); }
        }
        .animate-pulse-border-indigo {
          animation: pulse-border-indigo 3s infinite;
        }
      `}</style>

      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Singer Queue</h2>
        <p className="text-slate-400 text-sm">Check who's on stage and who's coming up next!</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20 px-1 pt-2 custom-scrollbar">
        
        {/* NOW ON STAGE SECTION */}
        {nowPlayingEntry && nowPlayingSong ? (
           <div className="relative p-6 rounded-2xl bg-brand-900/20 border-2 border-brand-500 animate-pulse-border-indigo animate-slide-in">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-2 z-10">
                <Disc className="w-3 h-3 animate-spin-slow" /> Now On Stage
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                 <div className="w-24 h-24 rounded-full border-4 border-brand-500 shadow-2xl overflow-hidden shrink-0">
                    {nowPlayingEntry.photo ? (
                      <img src={nowPlayingEntry.photo} alt={nowPlayingEntry.singerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Mic className="w-10 h-10 text-brand-400" />
                      </div>
                    )}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-bold text-white truncate mb-1">{nowPlayingEntry.singerName}</h3>
                    <p className="text-xl text-brand-300 font-medium truncate mb-1">{nowPlayingSong.title}</p>
                    <p className="text-slate-400">{nowPlayingSong.artist}</p>
                 </div>
              </div>
           </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/30 text-center text-slate-500">
             The stage is currently empty.
          </div>
        )}

        {/* WAITING LIST SECTION */}
        <div className="space-y-3">
          {waitingQueue.length === 0 ? (
            <div className="text-center py-10 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 animate-slide-in">
              <Mic className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">Queue is empty. Be the next star!</p>
            </div>
          ) : (
            waitingQueue.map((entry, index) => {
              const song = getSong(entry.songId);
              if (!song) return null;
              
              // Highlight the top-most item (index 0) as "Up Next"
              const isUpNext = index === 0;

              return (
                <div
                  key={entry.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className={`relative p-4 rounded-2xl border transition-all animate-slide-in group ${
                    isUpNext
                      ? 'bg-slate-800 border-accent-500 animate-pulse-border-orange mt-8' // Added top margin for separation
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {isUpNext && (
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 z-10">
                      <Sparkles className="w-3 h-3" /> Up Next
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                       <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-inner shrink-0 overflow-hidden border-2 ${
                         isUpNext 
                           ? 'border-accent-500' 
                           : 'border-slate-600'
                       }`}>
                         {entry.photo ? (
                           <img src={entry.photo} alt={entry.singerName} className="w-full h-full object-cover" />
                         ) : (
                           <div className={`w-full h-full flex items-center justify-center ${
                               isUpNext ? 'bg-accent-500 text-white' : 'bg-slate-700 text-slate-400'
                           }`}>
                               {index + 1}
                           </div>
                         )}
                       </div>

                       <div className="min-w-0 flex-1">
                          <h3 className={`font-bold truncate leading-tight transition-colors ${
                              isUpNext ? 'text-2xl text-white' : 'text-xl text-white group-hover:text-accent-300'
                          }`}>
                              {entry.singerName}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 mt-1">
                              <p className={`font-medium truncate ${
                                  isUpNext ? 'text-slate-300 text-lg' : 'text-slate-300 text-base'
                              }`}>
                                  {song.title}
                              </p>
                              <span className="hidden sm:block text-slate-600">•</span>
                              <p className="text-slate-400 text-sm truncate">{song.artist}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="text-slate-600 text-xs font-mono bg-slate-900/50 px-2 py-1 rounded-md shrink-0 border border-slate-800 hidden sm:block">
                      <div className="flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
