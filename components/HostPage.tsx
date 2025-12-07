import React, { useState } from 'react';
import { QueueEntry, RequestEntry, Song } from '../types';
import { ArrowUp, ArrowDown, LogOut, Music, Save, RefreshCw, Disc, FileText, XCircle, ArrowLeft, History, MessageSquare, UserPlus, Check, Square, Mic2 } from 'lucide-react';
import { HOST_PASSWORD } from '../constants';

interface HostPageProps {
  queue: QueueEntry[];
  requests: RequestEntry[];
  songs: Song[];
  onReorder: (newQueue: QueueEntry[]) => void;
  onMoveToNowPlaying: (entry: QueueEntry) => void;
  onRemove: (entryId: string) => void;
  onRemoveRequest: (requestId: string) => void;
  onClearQueue: () => void;
  onSaveHistory: () => void;
  onExit: () => void;
}

type HostView = 'DASHBOARD' | 'REQUESTS';
type DashboardTab = 'UPCOMING' | 'PAST';

export const HostPage: React.FC<HostPageProps> = ({ 
  queue, 
  requests,
  songs, 
  onReorder, 
  onMoveToNowPlaying, 
  onRemove,
  onRemoveRequest,
  onClearQueue,
  onSaveHistory,
  onExit
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<HostView>('DASHBOARD');
  const [activeTab, setActiveTab] = useState<DashboardTab>('UPCOMING');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const waitingQueue = queue.filter(q => q.status === 'waiting');
  const historyQueue = queue.filter(q => q.status === 'history').reverse(); // Newest history first
  const nowPlayingEntry = queue.find(q => q.status === 'now_playing');

  // Identify singers who have sung before (history) or are currently singing
  const seenSingers = new Set(
    queue
      .filter(q => q.status === 'history' || q.status === 'now_playing')
      .map(q => q.singerName.toLowerCase().trim())
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === HOST_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newWaiting = [...waitingQueue];
    const item = newWaiting[index];
    
    if (direction === 'up' && index > 0) {
      newWaiting[index] = newWaiting[index - 1];
      newWaiting[index - 1] = item;
    } else if (direction === 'down' && index < newWaiting.length - 1) {
      newWaiting[index] = newWaiting[index + 1];
      newWaiting[index + 1] = item;
    }

    const otherItems = queue.filter(q => q.status !== 'waiting');
    const updatedQueue = [...otherItems, ...newWaiting];

    // Use View Transitions API if supported for smooth animation
    if ('startViewTransition' in document) {
        (document as any).startViewTransition(() => {
            onReorder(updatedQueue);
        });
    } else {
        onReorder(updatedQueue);
    }
  };

  const getSong = (id: string) => songs.find(s => s.id === id);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Host Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter host password"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-colors"
            >
              Access Controls
            </button>
            <button
              type="button"
              onClick={onExit}
              className="w-full py-2 text-slate-400 hover:text-white"
            >
              Back to App
            </button>
          </form>
        </div>
      </div>
    );
  }

  const nowPlayingSong = nowPlayingEntry ? getSong(nowPlayingEntry.songId) : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 max-w-4xl mx-auto w-full relative">
      <style>{`
        ::view-transition-group(root) {
          animation-duration: 0.6s;
        }
      `}</style>
      
      {/* Header with Controls */}
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4 shrink-0">
        <h2 className="text-2xl font-bold text-white">
          {currentView === 'DASHBOARD' ? 'Host Dashboard' : 'Future Requests'}
        </h2>
        
        <div className="flex items-center gap-2">
          {currentView === 'DASHBOARD' ? (
            <>
              <button 
                onClick={() => setCurrentView('REQUESTS')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
                title="View Requests"
              >
                <FileText className="w-5 h-5" />
                {requests.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full"></span>
                )}
              </button>
              <div className="w-px h-6 bg-slate-800 mx-1"></div>
              <button 
                onClick={onSaveHistory}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Save Show History"
              >
                <Save className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Reset Queue"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-800 mx-1"></div>
            </>
          ) : (
            <button 
              onClick={() => setCurrentView('DASHBOARD')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Queue
            </button>
          )}
          
          <button 
            onClick={onExit} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Exit Host Mode"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        
        {/* DASHBOARD VIEW */}
        {currentView === 'DASHBOARD' && (
          <div className="flex flex-col h-full">
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4 shrink-0">
               <button 
                 onClick={() => setActiveTab('UPCOMING')}
                 className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${
                   activeTab === 'UPCOMING' 
                     ? 'bg-brand-600 text-white shadow-lg' 
                     : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Upcoming ({waitingQueue.length})
               </button>
               <button 
                 onClick={() => setActiveTab('PAST')}
                 className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all ${
                   activeTab === 'PAST' 
                     ? 'bg-brand-600 text-white shadow-lg' 
                     : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                 }`}
               >
                 Past ({historyQueue.length})
               </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 pb-4">
              
              {/* UPCOMING TAB CONTENT */}
              {activeTab === 'UPCOMING' && (
                <div className="space-y-4">
                  
                   {/* Now Playing Section (Restored) */}
                  {nowPlayingEntry && nowPlayingSong && (
                    <div className="bg-slate-800/50 p-4 rounded-xl border-2 border-brand-500/50 relative overflow-hidden group shrink-0">
                      <div className="absolute top-0 right-0 p-1 px-3 bg-brand-600 text-white text-[10px] font-bold rounded-bl-lg shadow-lg uppercase tracking-wider">
                        On Stage
                      </div>
                      <div className="absolute inset-0 bg-brand-500/5 animate-pulse pointer-events-none"></div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 rounded-full border-2 border-brand-500 shadow-xl overflow-hidden shrink-0">
                          {nowPlayingEntry.photo ? (
                            <img src={nowPlayingEntry.photo} alt={nowPlayingEntry.singerName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                              <Disc className="w-8 h-8 text-brand-400 animate-spin-slow" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white truncate">{nowPlayingEntry.singerName}</h3>
                          <p className="text-base text-accent-300 truncate font-medium">{nowPlayingSong.title}</p>
                          <p className="text-slate-400 text-xs">{nowPlayingSong.artist}</p>
                          {nowPlayingEntry.comments && (
                            <div className="mt-2 flex items-start gap-2 text-yellow-200 text-sm bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                              <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                              <span className="italic">"{nowPlayingEntry.comments}"</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Waiting List */}
                  <div className="space-y-2">
                    {waitingQueue.length === 0 ? (
                      <div className="text-slate-600 text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                        Upcoming queue is empty.
                      </div>
                    ) : (
                      waitingQueue.map((entry, index) => {
                        const song = getSong(entry.songId);
                        const isRepeat = seenSingers.has(entry.singerName.toLowerCase().trim());
                        
                        return (
                          <div 
                            key={entry.id}
                            style={{ viewTransitionName: `item-${entry.id}` } as any}
                            className={`p-3 relative rounded-lg flex items-center border transition-all duration-200 group gap-3 ${
                              isRepeat 
                                ? 'bg-yellow-500/10 border-yellow-500/50 hover:border-yellow-400' 
                                : 'bg-green-500/10 border-green-500/50 hover:border-green-400'
                            }`}
                          >
                            {/* Checkbox (Play) Action */}
                            <button
                              onClick={() => onMoveToNowPlaying(entry)}
                              className="w-8 h-8 shrink-0 rounded border-2 border-slate-500 flex items-center justify-center hover:bg-brand-500 hover:border-brand-500 hover:text-white transition-colors group-hover:scale-105"
                              title="Play (Move to Now Playing)"
                            >
                                <Check className="w-5 h-5 opacity-0 hover:opacity-100" />
                            </button>

                            <div className="flex-1 min-w-0 mr-12"> {/* mr-12 for arrows space */}
                                <div className="min-w-0 flex-1">
                                    <p className={`font-bold text-base transition-colors truncate ${
                                        isRepeat ? 'text-yellow-200' : 'text-white'
                                    }`}>{entry.singerName}</p>
                                    <div className="whitespace-normal break-words">
                                        <p className="text-sm text-slate-300 font-medium leading-tight mb-0.5">{song?.title}</p>
                                        {/* Artist name removed */}
                                    </div>
                                    {entry.comments && (
                                      <div className="mt-2 text-xs text-slate-300 bg-black/20 p-2 rounded border border-slate-700/50 whitespace-normal break-words flex items-start gap-1.5">
                                        <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                                        <span className="italic">"{entry.comments}"</span>
                                      </div>
                                    )}
                                </div>
                            </div>

                            {/* Reorder Arrows - Top Right Absolute */}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button 
                                  onClick={() => moveItem(index, 'up')}
                                  disabled={index === 0}
                                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-sm border border-slate-600 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => moveItem(index, 'down')}
                                  disabled={index === waitingQueue.length - 1}
                                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-sm border border-slate-600 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* PAST TAB CONTENT */}
              {activeTab === 'PAST' && (
                <div className="space-y-2">
                   {historyQueue.length === 0 ? (
                      <div className="text-slate-600 text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
                        No history yet.
                      </div>
                    ) : (
                      historyQueue.map((entry) => {
                        const song = getSong(entry.songId);
                        return (
                          <div key={entry.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-800 flex items-center gap-3 opacity-70">
                             <div className="min-w-0">
                                <p className="font-bold text-slate-400">{entry.singerName}</p>
                                <p className="text-sm text-slate-500">{song?.title} - {song?.artist}</p>
                                <p className="text-xs text-slate-600 mt-1">
                                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                          </div>
                        )
                      })
                   )}
                </div>
              )}
              
            </div>
          </div>
        )}

        {/* FUTURE REQUESTS VIEW */}
        {currentView === 'REQUESTS' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="bg-slate-800/30 rounded-xl border border-slate-800 p-4 mb-4">
               <p className="text-slate-400 text-sm">
                 These are songs users have requested for future shows. They are saved when you download the show history.
               </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {requests.length === 0 ? (
                 <div className="text-slate-600 text-center py-20 border border-dashed border-slate-800 rounded-xl">
                   No future requests yet.
                 </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-slate-600">
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-white text-lg truncate">{req.songTitle}</p>
                      <p className="text-slate-400">{req.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-accent-500/10 text-accent-400 rounded-full border border-accent-500/20">
                          Requested by {req.requesterName || 'Anonymous'}
                        </span>
                        <span className="text-xs text-slate-600">
                          {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemoveRequest(req.id)}
                      className="p-3 bg-slate-700/50 hover:bg-brand-900/30 text-slate-500 hover:text-brand-400 rounded-xl transition-colors"
                      title="Remove Request"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Reset Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Reset Queue?</h3>
            <p className="text-slate-400 mb-6">
              This will remove all singers from the waiting list and now playing. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-slate-700 text-slate-200 rounded-xl font-medium hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearQueue();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};