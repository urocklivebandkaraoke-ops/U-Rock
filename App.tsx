
import React, { useState } from 'react';
import { 
  Music, 
  ListMusic, 
  Settings, 
  Disc, 
  Menu,
  Mic,
  Heart,
  ExternalLink,
  X,
  FilePlus,
  Lightbulb
} from 'lucide-react';

import { MOCK_SONGS, VENMO_URL, CASHAPP_URL, PAYPAL_URL, STRIPE_URL, GOOGLE_REVIEW_URL } from './constants';
import { Song, QueueEntry, RequestEntry, ViewState } from './types';

import { SongList } from './components/SongList';
import { SubmitPage } from './components/SubmitPage';
import { QueuePage } from './components/QueuePage';
import { HostPage } from './components/HostPage';
import { SongRequestForm } from './components/SongRequestForm';
import { SplashPage } from './components/SplashPage';
import { URockLogo } from './components/URockLogo';

const App: React.FC = () => {
  // Global State
  const [showSplash, setShowSplash] = useState(true);
  const [songs] = useState<Song[]>(MOCK_SONGS);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [requests, setRequests] = useState<RequestEntry[]>([]);
  const [view, setView] = useState<ViewState>('SONG_LIST');
  
  // Transient State
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Helper to find now playing
  const nowPlayingEntry = queue.find(q => q.status === 'now_playing') || null;

  // Handlers
  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setView('SUBMIT_SONG');
  };

  const handleSubmitSong = (singerName: string, photo?: string, comments?: string) => {
    if (!selectedSong) return;
    const newEntry: QueueEntry = {
      id: Date.now().toString(),
      songId: selectedSong.id,
      singerName,
      photo,
      comments,
      timestamp: Date.now(),
      status: 'waiting'
    };
    setQueue(prev => [...prev, newEntry]);
    setSelectedSong(null);
    setView('QUEUE');
  };

  const handleAddRequest = (songTitle: string, artist: string, requesterName: string) => {
    const newRequest: RequestEntry = {
      id: Date.now().toString(),
      songTitle,
      artist,
      requesterName,
      timestamp: Date.now()
    };
    setRequests(prev => [...prev, newRequest]);
  };

  const handleRemoveRequest = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleHostReorder = (newQueue: QueueEntry[]) => {
    setQueue(newQueue);
  };

  const handleMoveToNowPlaying = (entry: QueueEntry) => {
    setQueue(prev => {
      // Set current playing to history
      const updated = prev.map(q => 
        q.status === 'now_playing' ? { ...q, status: 'history' } as QueueEntry : q
      );
      // Set new song to now_playing
      return updated.map(q => 
        q.id === entry.id ? { ...q, status: 'now_playing' } : q
      );
    });
  };

  const handleRemoveFromQueue = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const handleClearQueue = () => {
    setQueue([]);
    setRequests([]); // Optionally clear requests too, or keep them? Usually new show = clear everything.
  };

  const handleSaveHistory = () => {
    const historyData = {
      date: new Date().toISOString(),
      queue: queue,
      futureRequests: requests
    };
    
    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `u-rock-live-session-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Nav Button Component
  const NavButton = ({ target, icon: Icon, label, mobileOnly = false }: any) => (
    <button
      onClick={() => setView(target)}
      className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors ${
        view === target ? 'text-accent-400' : 'text-slate-400 hover:text-slate-200'
      } ${mobileOnly ? 'md:hidden' : ''}`}
    >
      <Icon className={`w-6 h-6 mb-1 ${view === target ? 'stroke-2' : 'stroke-1'}`} />
      {label}
    </button>
  );

  return (
    <>
      {showSplash && <SplashPage onComplete={() => setShowSplash(false)} />}
      
      <div className={`flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Top Bar */}
        <header className="h-16 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-4 md:px-8 z-20 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('SONG_LIST')}>
            {logoError ? (
               <URockLogo className="w-10 h-10" />
            ) : (
               <img 
                 src="/logo.png" 
                 alt="Logo" 
                 className="w-10 h-10 object-contain" 
                 onError={() => setLogoError(true)}
               />
            )}
            <h1 className="text-xl font-bold text-brand-500 hidden sm:block">
              U Rock Live Band Karaoke
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Desktop Nav */}
             <div className="hidden md:flex items-center gap-6 mr-6">
                <button onClick={() => setView('SONG_LIST')} className={`text-sm font-medium ${view === 'SONG_LIST' ? 'text-accent-400' : 'text-slate-400 hover:text-white'}`}>Library</button>
                <button onClick={() => setView('QUEUE')} className={`text-sm font-medium ${view === 'QUEUE' ? 'text-accent-400' : 'text-slate-400 hover:text-white'}`}>Queue</button>
             </div>
             
             <button
              onClick={() => setIsSupportOpen(true)}
              className="p-2 rounded-full bg-slate-800 text-pink-500 hover:bg-pink-500/10 hover:text-pink-400 transition-colors animate-pulse"
              title="Support & Review"
             >
               <Heart className="w-5 h-5 fill-current" />
             </button>

             <button 
               onClick={() => setIsRequestOpen(!isRequestOpen)}
               className={`p-2 rounded-full transition-colors relative ${isRequestOpen ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
               title="Request a Future Song"
             >
                <FilePlus className="w-5 h-5" />
             </button>

             <button 
               onClick={() => setView('HOST_LOGIN')}
               className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
             >
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative flex">
          <div className="flex-1 overflow-y-auto w-full">
            {view === 'SONG_LIST' && <SongList songs={songs} onSelectSong={handleSelectSong} />}
            {view === 'SUBMIT_SONG' && (
              <SubmitPage 
                song={selectedSong} 
                onBack={() => setView('SONG_LIST')} 
                onSubmit={handleSubmitSong} 
              />
            )}
            {view === 'QUEUE' && (
              <QueuePage 
                queue={queue} 
                nowPlayingEntry={nowPlayingEntry}
                songs={songs} 
              />
            )}
            {view === 'HOST_LOGIN' || view === 'HOST_DASHBOARD' ? (
               <HostPage 
                 queue={queue}
                 requests={requests}
                 songs={songs} 
                 onReorder={handleHostReorder}
                 onMoveToNowPlaying={handleMoveToNowPlaying}
                 onRemove={handleRemoveFromQueue}
                 onRemoveRequest={handleRemoveRequest}
                 onClearQueue={handleClearQueue}
                 onSaveHistory={handleSaveHistory}
                 onExit={() => setView('SONG_LIST')}
               />
            ) : null}
          </div>

          {/* Floating Request Widget */}
          {isRequestOpen && (
             <div className="absolute inset-0 md:inset-auto md:right-4 md:bottom-4 md:w-[400px] z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 pointer-events-none">
               <div className="relative h-full w-full pointer-events-auto">
                 <button 
                   onClick={() => setIsRequestOpen(false)}
                   className="absolute top-2 right-2 z-10 p-1 bg-slate-700 rounded-full text-white md:hidden"
                 >
                   ✕
                 </button>
                 <SongRequestForm onSubmit={handleAddRequest} />
               </div>
             </div>
          )}

          {/* Support Modal */}
          {isSupportOpen && (
            <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart className="text-pink-500 fill-current" /> Support the Band
                  </h2>
                  <button onClick={() => setIsSupportOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-slate-300">Enjoying the show? Help us out by leaving a review, or a tip. Thank you for your support!</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Review Us</h3>
                    <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-white text-slate-900 hover:bg-slate-200 rounded-xl transition-colors font-bold w-full">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" /></svg>
                      Review on Google
                    </a>
                  </div>

                  <div className="pt-2 border-t border-slate-700">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 mt-4">Send a Tip</h3>
                    <div className="space-y-3">
                      <a href={VENMO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#008CFF] text-white hover:bg-[#0074D4] rounded-xl transition-colors font-bold shadow-sm">
                        <span>Venmo</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <a href={CASHAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#00D632] text-white hover:bg-[#00B82B] rounded-xl transition-colors font-bold shadow-sm">
                        <span>CashApp</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#003087] text-white hover:bg-[#00266D] rounded-xl transition-colors font-bold shadow-sm">
                        <span>PayPal</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <a href={STRIPE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#635BFF] text-white hover:bg-[#5249D6] rounded-xl transition-colors font-bold shadow-sm">
                        <span>Stripe</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 z-20 safe-area-bottom">
          <NavButton target="SONG_LIST" icon={ListMusic} label="Songs" />
          <NavButton target="QUEUE" icon={Menu} label="Queue" />
        </nav>
      </div>
    </>
  );
};

export default App;
