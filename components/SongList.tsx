import React, { useState, useMemo, useEffect } from 'react';
import { Search, Mic2, Users, Music } from 'lucide-react';
import { Song, SortOption } from '../types';

interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export const SongList: React.FC<SongListProps> = ({ songs, onSelectSong }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize sort state from localStorage or default to 'ARTIST'
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const saved = localStorage.getItem('uRockLastSortOption');
    if (saved === 'ARTIST' || saved === 'TITLE' || saved === 'DUET') {
      return saved as SortOption;
    }
    return 'ARTIST';
  });

  // Save sort preference whenever it changes
  useEffect(() => {
    localStorage.setItem('uRockLastSortOption', sortBy);
  }, [sortBy]);

  const filteredAndSortedSongs = useMemo(() => {
    let result = [...songs];

    // Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(lowerTerm) ||
          s.artist.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'ARTIST') return a.artist.localeCompare(b.artist);
      if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
      if (sortBy === 'DUET') {
        // Duets first, then artist
        if (a.isDuet === b.isDuet) return a.artist.localeCompare(b.artist);
        return a.isDuet ? -1 : 1;
      }
      return 0;
    });

    return result;
  }, [songs, searchTerm, sortBy]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 max-w-4xl mx-auto w-full">
      <div className="mb-6 space-y-4">
        <h2 className="text-3xl font-bold text-accent-500">
          Song Library
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search artist or song..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:outline-none text-white placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSortBy('ARTIST')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              sortBy === 'ARTIST'
                ? 'bg-accent-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Sort by Artist
          </button>
          <button
            onClick={() => setSortBy('TITLE')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              sortBy === 'TITLE'
                ? 'bg-accent-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Sort by Title
          </button>
          <button
            onClick={() => setSortBy('DUET')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
              sortBy === 'DUET'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Duets
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredAndSortedSongs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No songs found. Try a different search.</p>
          </div>
        ) : (
          filteredAndSortedSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className="group p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-accent-500/50 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${song.isDuet ? 'bg-cyan-500/10 text-cyan-400' : 'bg-accent-500/10 text-accent-400'}`}>
                  {song.isDuet ? <Users className="w-6 h-6" /> : <Mic2 className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white group-hover:text-accent-400 transition-colors">
                    {song.title}
                  </h3>
                  <p className="text-slate-400">{song.artist}</p>
                </div>
              </div>
              <div className="text-slate-500 text-sm font-medium">
                {song.duration}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};