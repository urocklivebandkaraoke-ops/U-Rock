import React, { useState } from 'react';
import { Send, FilePlus, CheckCircle } from 'lucide-react';

interface SongRequestFormProps {
  onSubmit: (title: string, artist: string, requester: string) => void;
}

export const SongRequestForm: React.FC<SongRequestFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [requester, setRequester] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    onSubmit(title, artist, requester);
    setSubmitted(true);
    
    // Reset after a delay
    setTimeout(() => {
      setTitle('');
      setArtist('');
      setRequester('');
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-800 border-l border-slate-700 w-full max-w-md mx-auto md:mx-0 md:h-[600px] md:rounded-2xl md:border md:shadow-2xl">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
        <p className="text-slate-400">The band will see your request for future shows.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-accent-400 hover:text-accent-300 text-sm font-medium"
        >
          Make another request
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 w-full max-w-md mx-auto md:mx-0 md:h-[600px] md:rounded-2xl md:border md:shadow-2xl overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-brand-500 rounded-full">
           <FilePlus className="w-5 h-5 text-white" />
        </div>
        <div>
           <h3 className="font-bold text-white">Future Song Request</h3>
           <p className="text-xs text-slate-400">
             Help us build our setlist!
           </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-slate-300 mb-6 text-sm">
          Is there a song you love that we don't know? Tell us about it, and we might learn it for next time!
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Song Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bohemian Rhapsody"
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Artist / Band</label>
            <input 
              type="text" 
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Queen"
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name (Optional)</label>
            <input 
              type="text" 
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              placeholder="Who's asking?"
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder-slate-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Send className="w-4 h-4" />
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};